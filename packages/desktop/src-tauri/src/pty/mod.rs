//! PTY 进程管理模块
//!
//! 支持多种连接类型：本地终端、SSH、Telnet、串口

use anyhow::Result;
use std::collections::HashMap;
use std::io::{Read, Write};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};

/// 连接类型
#[derive(Debug, Clone, PartialEq)]
pub enum ConnectionType {
    Local,
    Ssh,
    Telnet,
    Serial,
}

impl std::fmt::Display for ConnectionType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ConnectionType::Local => write!(f, "本地终端"),
            ConnectionType::Ssh => write!(f, "SSH"),
            ConnectionType::Telnet => write!(f, "Telnet"),
            ConnectionType::Serial => write!(f, "串口"),
        }
    }
}

/// PTY 进程信息
#[derive(Debug, Clone)]
pub struct PtyProcess {
    pub id: u32,
    pub session_id: String,
    pub shell: String,
    pub connection_type: ConnectionType,
    pub running: bool,
    pub created_at: Instant,
}

/// 连接后端 trait
pub trait ConnectionBackend: Send {
    fn read(&mut self, buf: &mut [u8]) -> std::io::Result<usize>;
    fn write(&mut self, data: &[u8]) -> std::io::Result<()>;
    fn resize(&mut self, rows: u16, cols: u16) -> Result<()>;
    fn is_alive(&self) -> bool;
    fn set_nonblocking(&mut self, nonblocking: bool) -> std::io::Result<()>;
}

/// PTY 会话
struct PtySession {
    process: PtyProcess,
    backend: Box<dyn ConnectionBackend>,
    total_bytes_read: u64,
    total_bytes_written: u64,
}

/// PTY 管理器
pub struct PtyManager {
    sessions: Arc<Mutex<HashMap<String, PtySession>>>,
    next_id: Arc<Mutex<u32>>,
}

impl PtyManager {
    pub fn new() -> Self {
        tracing::info!("[PtyManager] 初始化 PTY 管理器");
        Self {
            sessions: Arc::new(Mutex::new(HashMap::new())),
            next_id: Arc::new(Mutex::new(1)),
        }
    }

    fn next_pid(&self) -> u32 {
        let mut id = self.next_id.lock().unwrap();
        *id += 1;
        tracing::debug!("[PtyManager] 分配新 PID: {}", *id);
        *id
    }

    /// 创建本地终端
    pub fn spawn_local(&self, session_id: String, shell: &str) -> Result<u32> {
        let start = Instant::now();
        tracing::info!(
            "[PtyManager] 开始创建本地终端 | session_id={} | shell={}",
            session_id, shell
        );

        use portable_pty::{native_pty_system, CommandBuilder, PtySize};

        let pty_system = native_pty_system();
        tracing::debug!("[PtyManager] 已获取原生 PTY 系统");

        let pair = pty_system
            .openpty(PtySize {
                rows: 30,
                cols: 120,
                pixel_width: 0,
                pixel_height: 0,
            })
            .map_err(|e| {
                tracing::error!("[PtyManager] 创建 PTY 失败: {}", e);
                anyhow::anyhow!("创建 PTY 失败: {}", e)
            })?;
        tracing::debug!("[PtyManager] PTY 对已创建");

        let shell_cmd = self.get_shell_command(shell);
        tracing::debug!("[PtyManager] Shell 命令: {}", shell_cmd);
        
        let mut cmd = CommandBuilder::new(&shell_cmd);
        
        if shell == "powershell" || shell == "pwsh" {
            cmd.arg("-NoLogo");
            tracing::debug!("[PtyManager] 添加 -NoLogo 参数");
        }

        pair.slave
            .spawn_command(cmd)
            .map_err(|e| {
                tracing::error!("[PtyManager] 启动 Shell 失败: {}", e);
                anyhow::anyhow!("启动 Shell 失败: {}", e)
            })?;
        tracing::info!("[PtyManager] Shell 进程已启动");

        let writer = pair
            .master
            .take_writer()
            .map_err(|e| {
                tracing::error!("[PtyManager] 获取写入器失败: {}", e);
                anyhow::anyhow!("获取写入器失败: {}", e)
            })?;

        let reader = pair
            .master
            .try_clone_reader()
            .map_err(|e| {
                tracing::error!("[PtyManager] 获取读取器失败: {}", e);
                anyhow::anyhow!("获取读取器失败: {}", e)
            })?;
        tracing::debug!("[PtyManager] 读取器和写入器已准备就绪");

        let master = Arc::new(Mutex::new(pair.master));
        let pid = self.next_pid();

        let process = PtyProcess {
            id: pid,
            session_id: session_id.clone(),
            shell: shell.to_string(),
            connection_type: ConnectionType::Local,
            running: true,
            created_at: Instant::now(),
        };

        let backend = Box::new(LocalBackend {
            master,
            writer,
            reader,
        });

        let session = PtySession { 
            process, 
            backend,
            total_bytes_read: 0,
            total_bytes_written: 0,
        };
        
        let mut sessions = self.sessions.lock().map_err(|_| {
            tracing::error!("[PtyManager] 获取会话锁失败");
            anyhow::anyhow!("锁获取失败")
        })?;
        sessions.insert(session_id.clone(), session);

        let elapsed = start.elapsed();
        tracing::info!(
            "[PtyManager] 本地终端创建成功 | session_id={} | pid={} | 耗时={:?}",
            session_id, pid, elapsed
        );
        Ok(pid)
    }

    /// 创建 SSH 连接
    pub fn spawn_ssh(
        &self,
        session_id: String,
        host: &str,
        port: u16,
        username: &str,
        password: Option<&str>,
        key_path: Option<&str>,
        key_passphrase: Option<&str>,
    ) -> Result<u32> {
        let start = Instant::now();
        tracing::info!(
            "[PtyManager] 开始创建 SSH 连接 | session_id={} | host={}:{} | user={}",
            session_id, host, port, username
        );

        // TCP 连接
        tracing::debug!("[PtyManager] 正在连接 TCP...");
        let tcp = std::net::TcpStream::connect((host, port))
            .map_err(|e| {
                tracing::error!("[PtyManager] TCP 连接失败: {} | {}:{}", e, host, port);
                anyhow::anyhow!("连接失败: {}", e)
            })?;
        tracing::info!("[PtyManager] TCP 连接成功 | {}:{}", host, port);

        // 设置非阻塞
        tcp.set_nonblocking(false)
            .map_err(|e| {
                tracing::error!("[PtyManager] 设置阻塞模式失败: {}", e);
                anyhow::anyhow!("设置阻塞模式失败: {}", e)
            })?;

        // 创建 SSH 会话
        tracing::debug!("[PtyManager] 正在创建 SSH 会话...");
        let mut sess = ssh2::Session::new()
            .map_err(|e| {
                tracing::error!("[PtyManager] 创建 SSH 会话失败: {}", e);
                anyhow::anyhow!("创建 SSH 会话失败: {}", e)
            })?;
        
        sess.set_tcp_stream(tcp);
        
        // SSH 握手
        tracing::debug!("[PtyManager] 正在进行 SSH 握手...");
        sess.handshake()
            .map_err(|e| {
                tracing::error!("[PtyManager] SSH 握手失败: {}", e);
                anyhow::anyhow!("SSH 握手失败: {}", e)
            })?;
        tracing::info!("[PtyManager] SSH 握手成功");

        // 认证
        tracing::debug!("[PtyManager] 开始认证...");
        if let Some(key) = key_path {
            tracing::debug!("[PtyManager] 使用密钥认证 | key_path={}", key);
            sess.userauth_pubkey_file(
                username,
                None,
                std::path::Path::new(key),
                key_passphrase,
            )
            .map_err(|e| {
                tracing::error!("[PtyManager] 密钥认证失败: {}", e);
                anyhow::anyhow!("密钥认证失败: {}", e)
            })?;
        } else if let Some(pwd) = password {
            tracing::debug!("[PtyManager] 使用密码认证");
            sess.userauth_password(username, pwd)
                .map_err(|e| {
                    tracing::error!("[PtyManager] 密码认证失败: {}", e);
                    anyhow::anyhow!("密码认证失败: {}", e)
                })?;
        } else {
            tracing::error!("[PtyManager] 未提供认证凭证");
            return Err(anyhow::anyhow!("需要密码或密钥"));
        }

        if !sess.authenticated() {
            tracing::error!("[PtyManager] SSH 认证失败 - 未通过验证");
            return Err(anyhow::anyhow!("SSH 认证失败"));
        }
        tracing::info!("[PtyManager] SSH 认证成功 | user={}", username);

        // 创建通道
        tracing::debug!("[PtyManager] 正在创建 SSH 通道...");
        let mut channel = sess
            .channel_session()
            .map_err(|e| {
                tracing::error!("[PtyManager] 创建通道失败: {}", e);
                anyhow::anyhow!("创建通道失败: {}", e)
            })?;
        tracing::debug!("[PtyManager] SSH 通道已创建");

        // 请求 PTY
        tracing::debug!("[PtyManager] 正在请求 PTY...");
        channel
            .request_pty("xterm", None, Some((120, 30, 0, 0)))
            .map_err(|e| {
                tracing::error!("[PtyManager] 请求 PTY 失败: {}", e);
                anyhow::anyhow!("请求 PTY 失败: {}", e)
            })?;
        tracing::debug!("[PtyManager] PTY 已请求");

        // 启动 Shell
        tracing::debug!("[PtyManager] 正在启动远程 Shell...");
        channel.shell().map_err(|e| {
            tracing::error!("[PtyManager] 启动 Shell 失败: {}", e);
            anyhow::anyhow!("启动 Shell 失败: {}", e)
        })?;
        tracing::info!("[PtyManager] 远程 Shell 已启动");

        let pid = self.next_pid();
        let process = PtyProcess {
            id: pid,
            session_id: session_id.clone(),
            shell: "ssh".to_string(),
            connection_type: ConnectionType::Ssh,
            running: true,
            created_at: Instant::now(),
        };

        let backend = Box::new(SshBackend {
            session: sess,
            channel,
            nonblocking: false,
        });

        let session = PtySession { 
            process, 
            backend,
            total_bytes_read: 0,
            total_bytes_written: 0,
        };
        
        let mut sessions = self.sessions.lock().map_err(|_| {
            tracing::error!("[PtyManager] 获取会话锁失败");
            anyhow::anyhow!("锁获取失败")
        })?;
        sessions.insert(session_id.clone(), session);

        let elapsed = start.elapsed();
        tracing::info!(
            "[PtyManager] SSH 连接创建成功 | session_id={} | pid={} | 耗时={:?}",
            session_id, pid, elapsed
        );
        Ok(pid)
    }

    /// 创建 Telnet 连接
    pub fn spawn_telnet(&self, session_id: String, host: &str, port: u16) -> Result<u32> {
        let start = Instant::now();
        tracing::info!(
            "[PtyManager] 开始创建 Telnet 连接 | session_id={} | host={}:{}",
            session_id, host, port
        );

        tracing::debug!("[PtyManager] 正在连接 TCP...");
        let stream = std::net::TcpStream::connect((host, port))
            .map_err(|e| {
                tracing::error!("[PtyManager] TCP 连接失败: {} | {}:{}", e, host, port);
                anyhow::anyhow!("连接失败: {}", e)
            })?;
        tracing::info!("[PtyManager] TCP 连接成功 | {}:{}", host, port);
        
        stream.set_nonblocking(true)
            .map_err(|e| {
                tracing::error!("[PtyManager] 设置非阻塞模式失败: {}", e);
                anyhow::anyhow!("设置非阻塞模式失败: {}", e)
            })?;
        tracing::debug!("[PtyManager] 已设置非阻塞模式");

        let pid = self.next_pid();
        let process = PtyProcess {
            id: pid,
            session_id: session_id.clone(),
            shell: "telnet".to_string(),
            connection_type: ConnectionType::Telnet,
            running: true,
            created_at: Instant::now(),
        };

        let backend = Box::new(TelnetBackend { stream });

        let session = PtySession { 
            process, 
            backend,
            total_bytes_read: 0,
            total_bytes_written: 0,
        };
        
        let mut sessions = self.sessions.lock().map_err(|_| {
            tracing::error!("[PtyManager] 获取会话锁失败");
            anyhow::anyhow!("锁获取失败")
        })?;
        sessions.insert(session_id.clone(), session);

        let elapsed = start.elapsed();
        tracing::info!(
            "[PtyManager] Telnet 连接创建成功 | session_id={} | pid={} | 耗时={:?}",
            session_id, pid, elapsed
        );
        Ok(pid)
    }

    /// 创建串口连接
    pub fn spawn_serial(
        &self,
        session_id: String,
        port: &str,
        baud_rate: u32,
        data_bits: u8,
        parity: &str,
        stop_bits: f32,
        flow_control: &str,
    ) -> Result<u32> {
        let start = Instant::now();
        tracing::info!(
            "[PtyManager] 开始创建串口连接 | session_id={} | port={} | baud={}",
            session_id, port, baud_rate
        );
        tracing::debug!(
            "[PtyManager] 串口参数 | data_bits={} | parity={} | stop_bits={} | flow_control={}",
            data_bits, parity, stop_bits, flow_control
        );

        let parity_val = match parity.to_lowercase().as_str() {
            "odd" => serialport::Parity::Odd,
            "even" => serialport::Parity::Even,
            _ => serialport::Parity::None,
        };

        let stop_bits_val = match stop_bits {
            2.0 => serialport::StopBits::Two,
            _ => serialport::StopBits::One,
        };

        let flow_control_val = match flow_control.to_lowercase().as_str() {
            "hardware" => serialport::FlowControl::Hardware,
            "software" => serialport::FlowControl::Software,
            _ => serialport::FlowControl::None,
        };

        let data_bits_val = match data_bits {
            5 => serialport::DataBits::Five,
            6 => serialport::DataBits::Six,
            7 => serialport::DataBits::Seven,
            _ => serialport::DataBits::Eight,
        };

        tracing::debug!("[PtyManager] 正在打开串口...");
        let serial_port = serialport::new(port, baud_rate)
            .data_bits(data_bits_val)
            .parity(parity_val)
            .stop_bits(stop_bits_val)
            .flow_control(flow_control_val)
            .timeout(Duration::from_millis(100))
            .open()
            .map_err(|e| {
                tracing::error!("[PtyManager] 打开串口失败: {} | {}", port, e);
                anyhow::anyhow!("打开串口失败: {}", e)
            })?;
        tracing::info!("[PtyManager] 串口已打开 | {}", port);

        let pid = self.next_pid();
        let process = PtyProcess {
            id: pid,
            session_id: session_id.clone(),
            shell: "serial".to_string(),
            connection_type: ConnectionType::Serial,
            running: true,
            created_at: Instant::now(),
        };

        let backend = Box::new(SerialBackend { port: serial_port });

        let session = PtySession { 
            process, 
            backend,
            total_bytes_read: 0,
            total_bytes_written: 0,
        };
        
        let mut sessions = self.sessions.lock().map_err(|_| {
            tracing::error!("[PtyManager] 获取会话锁失败");
            anyhow::anyhow!("锁获取失败")
        })?;
        sessions.insert(session_id.clone(), session);

        let elapsed = start.elapsed();
        tracing::info!(
            "[PtyManager] 串口连接创建成功 | session_id={} | pid={} | 耗时={:?}",
            session_id, pid, elapsed
        );
        Ok(pid)
    }

    fn get_shell_command(&self, shell: &str) -> String {
        #[cfg(target_os = "windows")]
        {
            match shell {
                "cmd" => "cmd.exe".to_string(),
                "powershell" => "powershell.exe".to_string(),
                "pwsh" => "pwsh.exe".to_string(),
                "bash" => "bash.exe".to_string(),
                "wsl" => "wsl.exe".to_string(),
                _ => shell.to_string(),
            }
        }

        #[cfg(not(target_os = "windows"))]
        {
            match shell {
                "bash" => "/bin/bash".to_string(),
                "zsh" => "/bin/zsh".to_string(),
                "fish" => "/usr/bin/fish".to_string(),
                _ => shell.to_string(),
            }
        }
    }

    pub fn write(&self, session_id: &str, data: &[u8]) -> Result<()> {
        let trace_id = uuid::Uuid::new_v4().to_string()[..8].to_string();
        tracing::trace!(
            "[{}] [PtyManager.write] 开始写入 | session_id={} | len={} bytes",
            trace_id, session_id, data.len()
        );
        
        let mut sessions = self.sessions.lock().map_err(|_| {
            tracing::error!("[{}] [PtyManager.write] 获取会话锁失败", trace_id);
            anyhow::anyhow!("锁获取失败")
        })?;
        
        if let Some(session) = sessions.get_mut(session_id) {
            session.backend.write(data)?;
            session.total_bytes_written += data.len() as u64;
            tracing::debug!(
                "[{}] [PtyManager.write] 写入成功 | session_id={} | len={} bytes | total={}",
                trace_id, session_id, data.len(), session.total_bytes_written
            );
        } else {
            tracing::warn!(
                "[{}] [PtyManager.write] 会话不存在 | session_id={}",
                trace_id, session_id
            );
        }
        Ok(())
    }

    pub fn read(&self, session_id: &str) -> Result<Vec<u8>> {
        let trace_id = uuid::Uuid::new_v4().to_string()[..8].to_string();
        
        let mut sessions = self.sessions.lock().map_err(|_| {
            tracing::error!("[{}] [PtyManager.read] 获取会话锁失败", trace_id);
            anyhow::anyhow!("锁获取失败")
        })?;
        
        if let Some(session) = sessions.get_mut(session_id) {
            // 首次读取时设置非阻塞
            if !session.process.running {
                tracing::debug!(
                    "[{}] [PtyManager.read] 首次读取，设置非阻塞模式 | session_id={}",
                    trace_id, session_id
                );
                session.backend.set_nonblocking(true)?;
                session.process.running = true;
            }
            
            let mut buf = vec![0u8; 8192];
            match session.backend.read(&mut buf) {
                Ok(0) => {
                    tracing::trace!(
                        "[{}] [PtyManager.read] 无数据 | session_id={}",
                        trace_id, session_id
                    );
                    Ok(Vec::new())
                }
                Ok(n) => {
                    buf.truncate(n);
                    session.total_bytes_read += n as u64;
                    tracing::debug!(
                        "[{}] [PtyManager.read] 读取成功 | session_id={} | len={} bytes | total={}",
                        trace_id, session_id, n, session.total_bytes_read
                    );
                    // 记录读取的内容（前 100 字节）
                    if tracing::level_enabled!(tracing::Level::TRACE) {
                        let preview = String::from_utf8_lossy(&buf[..n.min(100)]);
                        tracing::trace!("[{}] [PtyManager.read] 数据预览: {:?}", trace_id, preview);
                    }
                    Ok(buf)
                }
                Err(e) if e.kind() == std::io::ErrorKind::WouldBlock => {
                    tracing::trace!(
                        "[{}] [PtyManager.read] 阻塞中，稍后重试 | session_id={}",
                        trace_id, session_id
                    );
                    Ok(Vec::new())
                }
                Err(e) if e.kind() == std::io::ErrorKind::TimedOut => {
                    tracing::trace!(
                        "[{}] [PtyManager.read] 超时 | session_id={}",
                        trace_id, session_id
                    );
                    Ok(Vec::new())
                }
                Err(e) => {
                    tracing::error!(
                        "[{}] [PtyManager.read] 读取失败 | session_id={} | error={}",
                        trace_id, session_id, e
                    );
                    Err(anyhow::anyhow!("读取失败: {}", e))
                }
            }
        } else {
            tracing::trace!(
                "[{}] [PtyManager.read] 会话不存在 | session_id={}",
                trace_id, session_id
            );
            Ok(Vec::new())
        }
    }

    pub fn resize(&self, session_id: &str, rows: u16, cols: u16) -> Result<()> {
        tracing::debug!(
            "[PtyManager.resize] 调整终端大小 | session_id={} | {}x{}",
            session_id, cols, rows
        );
        
        let mut sessions = self.sessions.lock().map_err(|_| {
            tracing::error!("[PtyManager.resize] 获取会话锁失败");
            anyhow::anyhow!("锁获取失败")
        })?;
        
        if let Some(session) = sessions.get_mut(session_id) {
            session.backend.resize(rows, cols)?;
            tracing::info!(
                "[PtyManager.resize] 终端大小已调整 | session_id={} | {}x{}",
                session_id, cols, rows
            );
        } else {
            tracing::warn!("[PtyManager.resize] 会话不存在 | session_id={}", session_id);
        }
        Ok(())
    }

    pub fn kill(&self, pid: u32) -> Result<()> {
        tracing::info!("[PtyManager.kill] 终止进程 | pid={}", pid);
        
        let mut sessions = self.sessions.lock().map_err(|_| {
            tracing::error!("[PtyManager.kill] 获取会话锁失败");
            anyhow::anyhow!("锁获取失败")
        })?;
        
        if let Some(session_id) = sessions
            .iter()
            .find(|(_, s)| s.process.id == pid)
            .map(|(id, _)| id.clone())
        {
            if let Some(session) = sessions.remove(&session_id) {
                tracing::info!(
                    "[PtyManager.kill] 进程已终止 | pid={} | session_id={} | type={} | 运行时长={:?}",
                    pid,
                    session_id,
                    session.process.connection_type,
                    session.process.created_at.elapsed()
                );
            }
        } else {
            tracing::warn!("[PtyManager.kill] 进程不存在 | pid={}", pid);
        }
        Ok(())
    }

    pub fn kill_session(&self, session_id: &str) -> Result<()> {
        tracing::info!("[PtyManager.kill_session] 终止会话 | session_id={}", session_id);
        
        let mut sessions = self.sessions.lock().map_err(|_| {
            tracing::error!("[PtyManager.kill_session] 获取会话锁失败");
            anyhow::anyhow!("锁获取失败")
        })?;
        
        if let Some(session) = sessions.remove(session_id) {
            tracing::info!(
                "[PtyManager.kill_session] 会话已终止 | session_id={} | type={} | pid={} | 运行时长={:?}",
                session_id,
                session.process.connection_type,
                session.process.id,
                session.process.created_at.elapsed()
            );
        } else {
            tracing::warn!("[PtyManager.kill_session] 会话不存在 | session_id={}", session_id);
        }
        Ok(())
    }

    pub fn get_all(&self) -> Result<Vec<PtyProcess>> {
        let sessions = self.sessions.lock().map_err(|_| anyhow::anyhow!("锁获取失败"))?;
        Ok(sessions.values().map(|s| s.process.clone()).collect())
    }

    pub fn get(&self, pid: u32) -> Result<Option<PtyProcess>> {
        let sessions = self.sessions.lock().map_err(|_| anyhow::anyhow!("锁获取失败"))?;
        Ok(sessions
            .values()
            .find(|s| s.process.id == pid)
            .map(|s| s.process.clone()))
    }
}

impl Default for PtyManager {
    fn default() -> Self {
        Self::new()
    }
}

/// 本地终端后端
struct LocalBackend {
    master: Arc<Mutex<Box<dyn portable_pty::MasterPty + Send>>>,
    writer: Box<dyn Write + Send>,
    reader: Box<dyn Read + Send>,
}

impl ConnectionBackend for LocalBackend {
    fn read(&mut self, buf: &mut [u8]) -> std::io::Result<usize> {
        self.reader.read(buf)
    }

    fn write(&mut self, data: &[u8]) -> std::io::Result<()> {
        self.writer.write_all(data)?;
        self.writer.flush()
    }

    fn resize(&mut self, rows: u16, cols: u16) -> Result<()> {
        let master = self.master.lock().map_err(|_| anyhow::anyhow!("锁获取失败"))?;
        master.resize(portable_pty::PtySize {
            rows,
            cols,
            pixel_width: 0,
            pixel_height: 0,
        }).map_err(|e| anyhow::anyhow!("调整大小失败: {}", e))
    }

    fn is_alive(&self) -> bool {
        true
    }

    fn set_nonblocking(&mut self, _nonblocking: bool) -> std::io::Result<()> {
        // 本地终端不需要设置非阻塞
        Ok(())
    }
}

/// SSH 后端
struct SshBackend {
    session: ssh2::Session,
    channel: ssh2::Channel,
    nonblocking: bool,
}

impl ConnectionBackend for SshBackend {
    fn read(&mut self, buf: &mut [u8]) -> std::io::Result<usize> {
        self.channel.read(buf)
    }

    fn write(&mut self, data: &[u8]) -> std::io::Result<()> {
        self.channel.write_all(data)
    }

    fn resize(&mut self, rows: u16, cols: u16) -> Result<()> {
        self.channel
            .request_pty_size(cols as u32, rows as u32, None, None)
            .map_err(|e| anyhow::anyhow!("调整 PTY 大小失败: {}", e))
    }

    fn is_alive(&self) -> bool {
        !self.channel.eof()
    }

    fn set_nonblocking(&mut self, nonblocking: bool) -> std::io::Result<()> {
        if self.nonblocking != nonblocking {
            tracing::debug!("[SshBackend] 设置非阻塞模式: {}", nonblocking);
            self.session.set_nonblocking(nonblocking)?;
            self.nonblocking = nonblocking;
        }
        Ok(())
    }
}

/// Telnet 后端
struct TelnetBackend {
    stream: std::net::TcpStream,
}

impl ConnectionBackend for TelnetBackend {
    fn read(&mut self, buf: &mut [u8]) -> std::io::Result<usize> {
        self.stream.read(buf)
    }

    fn write(&mut self, data: &[u8]) -> std::io::Result<()> {
        self.stream.write_all(data)
    }

    fn resize(&mut self, _rows: u16, _cols: u16) -> Result<()> {
        Ok(())
    }

    fn is_alive(&self) -> bool {
        true
    }

    fn set_nonblocking(&mut self, _nonblocking: bool) -> std::io::Result<()> {
        // 已在创建时设置
        Ok(())
    }
}

/// 串口后端
struct SerialBackend {
    port: Box<dyn serialport::SerialPort>,
}

impl ConnectionBackend for SerialBackend {
    fn read(&mut self, buf: &mut [u8]) -> std::io::Result<usize> {
        self.port.read(buf)
    }

    fn write(&mut self, data: &[u8]) -> std::io::Result<()> {
        self.port.write_all(data)
    }

    fn resize(&mut self, _rows: u16, _cols: u16) -> Result<()> {
        Ok(())
    }

    fn is_alive(&self) -> bool {
        true
    }

    fn set_nonblocking(&mut self, _nonblocking: bool) -> std::io::Result<()> {
        // 串口已设置超时
        Ok(())
    }
}
