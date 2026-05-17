//! PTY 进程管理模块
//!
//! 支持多种连接类型：本地终端、SSH、Telnet、串口

use anyhow::Result;
use std::collections::HashMap;
use std::io::{Read, Write};
use std::sync::{Arc, Mutex};

/// 连接类型
#[derive(Debug, Clone, PartialEq)]
pub enum ConnectionType {
    Local,
    Ssh,
    Telnet,
    Serial,
}

/// PTY 进程信息
#[derive(Debug, Clone)]
pub struct PtyProcess {
    pub id: u32,
    pub session_id: String,
    pub shell: String,
    pub connection_type: ConnectionType,
    pub running: bool,
}

/// 连接后端 trait
pub trait ConnectionBackend: Send {
    fn read(&mut self, buf: &mut [u8]) -> std::io::Result<usize>;
    fn write(&mut self, data: &[u8]) -> std::io::Result<()>;
    fn resize(&mut self, rows: u16, cols: u16) -> Result<()>;
    fn is_alive(&self) -> bool;
}

/// PTY 会话
struct PtySession {
    process: PtyProcess,
    backend: Box<dyn ConnectionBackend>,
}

/// PTY 管理器
pub struct PtyManager {
    sessions: Arc<Mutex<HashMap<String, PtySession>>>,
    next_id: Arc<Mutex<u32>>,
}

impl PtyManager {
    pub fn new() -> Self {
        Self {
            sessions: Arc::new(Mutex::new(HashMap::new())),
            next_id: Arc::new(Mutex::new(1)),
        }
    }

    fn next_pid(&self) -> u32 {
        let mut id = self.next_id.lock().unwrap();
        *id += 1;
        *id
    }

    /// 创建本地终端
    pub fn spawn_local(&self, session_id: String, shell: &str) -> Result<u32> {
        use portable_pty::{native_pty_system, CommandBuilder, PtySize};

        let pty_system = native_pty_system();
        let pair = pty_system
            .openpty(PtySize {
                rows: 30,
                cols: 120,
                pixel_width: 0,
                pixel_height: 0,
            })
            .map_err(|e| anyhow::anyhow!("创建 PTY 失败: {}", e))?;

        let shell_cmd = self.get_shell_command(shell);
        let mut cmd = CommandBuilder::new(&shell_cmd);
        
        if shell == "powershell" || shell == "pwsh" {
            cmd.arg("-NoLogo");
        }

        pair.slave
            .spawn_command(cmd)
            .map_err(|e| anyhow::anyhow!("启动 Shell 失败: {}", e))?;

        let writer = pair
            .master
            .take_writer()
            .map_err(|e| anyhow::anyhow!("获取写入器失败: {}", e))?;

        let reader = pair
            .master
            .try_clone_reader()
            .map_err(|e| anyhow::anyhow!("获取读取器失败: {}", e))?;

        let master = Arc::new(Mutex::new(pair.master));
        let pid = self.next_pid();

        let process = PtyProcess {
            id: pid,
            session_id: session_id.clone(),
            shell: shell.to_string(),
            connection_type: ConnectionType::Local,
            running: true,
        };

        let backend = Box::new(LocalBackend {
            master,
            writer,
            reader,
        });

        let session = PtySession { process, backend };
        let mut sessions = self.sessions.lock().map_err(|_| anyhow::anyhow!("锁获取失败"))?;
        sessions.insert(session_id, session);

        tracing::info!("创建本地 PTY 进程: {} (PID: {})", shell, pid);
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
        let tcp = std::net::TcpStream::connect((host, port))
            .map_err(|e| anyhow::anyhow!("连接失败: {}", e))?;

        let mut sess = ssh2::Session::new()
            .map_err(|e| anyhow::anyhow!("创建 SSH 会话失败: {}", e))?;
        
        sess.set_tcp_stream(tcp);
        sess.handshake()
            .map_err(|e| anyhow::anyhow!("SSH 握手失败: {}", e))?;

        if let Some(key) = key_path {
            sess.userauth_pubkey_file(
                username,
                None,
                std::path::Path::new(key),
                key_passphrase,
            )
            .map_err(|e| anyhow::anyhow!("密钥认证失败: {}", e))?;
        } else if let Some(pwd) = password {
            sess.userauth_password(username, pwd)
                .map_err(|e| anyhow::anyhow!("密码认证失败: {}", e))?;
        } else {
            return Err(anyhow::anyhow!("需要密码或密钥"));
        }

        if !sess.authenticated() {
            return Err(anyhow::anyhow!("SSH 认证失败"));
        }

        let mut channel = sess
            .channel_session()
            .map_err(|e| anyhow::anyhow!("创建通道失败: {}", e))?;

        channel
            .request_pty("xterm", None, Some((120, 30, 0, 0)))
            .map_err(|e| anyhow::anyhow!("请求 PTY 失败: {}", e))?;

        channel.shell().map_err(|e| anyhow::anyhow!("启动 Shell 失败: {}", e))?;

        let pid = self.next_pid();
        let process = PtyProcess {
            id: pid,
            session_id: session_id.clone(),
            shell: "ssh".to_string(),
            connection_type: ConnectionType::Ssh,
            running: true,
        };

        let backend = Box::new(SshBackend {
            session: sess,
            channel,
        });

        let session = PtySession { process, backend };
        let mut sessions = self.sessions.lock().map_err(|_| anyhow::anyhow!("锁获取失败"))?;
        sessions.insert(session_id, session);

        tracing::info!("创建 SSH 连接: {}@{}:{} (PID: {})", username, host, port, pid);
        Ok(pid)
    }

    /// 创建 Telnet 连接
    pub fn spawn_telnet(&self, session_id: String, host: &str, port: u16) -> Result<u32> {
        let stream = std::net::TcpStream::connect((host, port))
            .map_err(|e| anyhow::anyhow!("连接失败: {}", e))?;
        
        stream.set_nonblocking(false)
            .map_err(|e| anyhow::anyhow!("设置阻塞模式失败: {}", e))?;

        let pid = self.next_pid();
        let process = PtyProcess {
            id: pid,
            session_id: session_id.clone(),
            shell: "telnet".to_string(),
            connection_type: ConnectionType::Telnet,
            running: true,
        };

        let backend = Box::new(TelnetBackend { stream });

        let session = PtySession { process, backend };
        let mut sessions = self.sessions.lock().map_err(|_| anyhow::anyhow!("锁获取失败"))?;
        sessions.insert(session_id, session);

        tracing::info!("创建 Telnet 连接: {}:{} (PID: {})", host, port, pid);
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
        use serialport::SerialPort;

        let parity = match parity.to_lowercase().as_str() {
            "odd" => serialport::Parity::Odd,
            "even" => serialport::Parity::Even,
            _ => serialport::Parity::None,
        };

        let stop_bits = match stop_bits {
            2.0 => serialport::StopBits::Two,
            _ => serialport::StopBits::One,
        };

        let flow_control = match flow_control.to_lowercase().as_str() {
            "hardware" => serialport::FlowControl::Hardware,
            "software" => serialport::FlowControl::Software,
            _ => serialport::FlowControl::None,
        };

        let data_bits = match data_bits {
            5 => serialport::DataBits::Five,
            6 => serialport::DataBits::Six,
            7 => serialport::DataBits::Seven,
            _ => serialport::DataBits::Eight,
        };

        let port = serialport::new(port, baud_rate)
            .data_bits(data_bits)
            .parity(parity)
            .stop_bits(stop_bits)
            .flow_control(flow_control)
            .timeout(std::time::Duration::from_millis(100))
            .open()
            .map_err(|e| anyhow::anyhow!("打开串口失败: {}", e))?;

        let pid = self.next_pid();
        let process = PtyProcess {
            id: pid,
            session_id: session_id.clone(),
            shell: "serial".to_string(),
            connection_type: ConnectionType::Serial,
            running: true,
        };

        let backend = Box::new(SerialBackend { port });

        let session = PtySession { process, backend };
        let mut sessions = self.sessions.lock().map_err(|_| anyhow::anyhow!("锁获取失败"))?;
        sessions.insert(session_id.clone(), session);

        tracing::info!("创建串口连接: {} @ {} baud (PID: {})", session_id, baud_rate, pid);
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
        let mut sessions = self.sessions.lock().map_err(|_| anyhow::anyhow!("锁获取失败"))?;
        if let Some(session) = sessions.get_mut(session_id) {
            session.backend.write(data)?;
            tracing::debug!("写入数据: {} bytes", data.len());
        }
        Ok(())
    }

    pub fn read(&self, session_id: &str) -> Result<Vec<u8>> {
        let mut sessions = self.sessions.lock().map_err(|_| anyhow::anyhow!("锁获取失败"))?;
        if let Some(session) = sessions.get_mut(session_id) {
            let mut buf = vec![0u8; 4096];
            match session.backend.read(&mut buf) {
                Ok(0) => Ok(Vec::new()),
                Ok(n) => {
                    buf.truncate(n);
                    tracing::debug!("读取数据: {} bytes", n);
                    Ok(buf)
                }
                Err(e) if e.kind() == std::io::ErrorKind::WouldBlock => Ok(Vec::new()),
                Err(e) if e.kind() == std::io::ErrorKind::TimedOut => Ok(Vec::new()),
                Err(e) => Err(anyhow::anyhow!("读取失败: {}", e)),
            }
        } else {
            Ok(Vec::new())
        }
    }

    pub fn resize(&self, session_id: &str, rows: u16, cols: u16) -> Result<()> {
        let mut sessions = self.sessions.lock().map_err(|_| anyhow::anyhow!("锁获取失败"))?;
        if let Some(session) = sessions.get_mut(session_id) {
            session.backend.resize(rows, cols)?;
            tracing::debug!("调整大小: {}x{}", cols, rows);
        }
        Ok(())
    }

    pub fn kill(&self, pid: u32) -> Result<()> {
        let mut sessions = self.sessions.lock().map_err(|_| anyhow::anyhow!("锁获取失败"))?;
        if let Some(session_id) = sessions
            .iter()
            .find(|(_, s)| s.process.id == pid)
            .map(|(id, _)| id.clone())
        {
            sessions.remove(&session_id);
            tracing::info!("终止进程: PID {}", pid);
        }
        Ok(())
    }

    pub fn kill_session(&self, session_id: &str) -> Result<()> {
        let mut sessions = self.sessions.lock().map_err(|_| anyhow::anyhow!("锁获取失败"))?;
        sessions.remove(session_id);
        tracing::info!("终止会话: {}", session_id);
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
}

/// SSH 后端
struct SshBackend {
    session: ssh2::Session,
    channel: ssh2::Channel,
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
}
