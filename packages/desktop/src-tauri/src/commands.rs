//! Tauri 命令模块
//!
//! 提供前端调用的所有 Tauri 命令

use serde::{Deserialize, Serialize};
use tauri::State;

use crate::AppState;
use crate::db::{self, SavedSession};

/// 会话配置
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionConfig {
    pub name: String,
    pub protocol: String,
    pub shell: Option<String>,
    pub host: Option<String>,
    pub port: Option<u16>,
    pub username: Option<String>,
    pub password: Option<String>,
    pub key_path: Option<String>,
    pub key_passphrase: Option<String>,
    pub serial_port: Option<String>,
    pub baud_rate: Option<u32>,
    pub data_bits: Option<u8>,
    pub parity: Option<String>,
    pub stop_bits: Option<f32>,
    pub flow_control: Option<String>,
}

/// 会话信息
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionInfo {
    pub id: String,
    pub name: String,
    pub shell: String,
    pub protocol: String,
    pub created_at: i64,
    pub status: String,
}

/// PTY 进程信息
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PtyProcessInfo {
    pub id: u32,
    pub session_id: String,
    pub shell: String,
    pub running: bool,
}

/// 创建会话
#[tauri::command]
pub async fn create_session(
    state: State<'_, AppState>,
    config: SessionConfig,
) -> Result<SessionInfo, String> {
    let request_id = uuid::Uuid::new_v4().to_string()[..8].to_string();
    tracing::info!(
        "[{}] [create_session] 开始创建会话 | name={} | protocol={}",
        request_id, config.name, config.protocol
    );
    tracing::debug!("[{}] [create_session] 完整配置: {:?}", request_id, config);

    let session_id = uuid::Uuid::new_v4().to_string();
    let shell = match config.protocol.as_str() {
        "local" => config.shell.clone().unwrap_or_else(|| "powershell".to_string()),
        "ssh" => "ssh".to_string(),
        "telnet" => "telnet".to_string(),
        "serial" => "serial".to_string(),
        _ => "unknown".to_string(),
    };
    tracing::debug!(
        "[{}] [create_session] 解析 Shell 类型 | protocol={} | shell={}",
        request_id, config.protocol, shell
    );

    let pty_manager = state.pty_manager.read().await;

    match config.protocol.as_str() {
        "local" => {
            let shell_type = config.shell.clone().unwrap_or_else(|| "powershell".to_string());
            tracing::info!(
                "[{}] [create_session] 创建本地终端 | shell={}",
                request_id, shell_type
            );
            
            let pid = pty_manager
                .spawn_local(session_id.clone(), &shell_type)
                .map_err(|e| {
                    tracing::error!("[{}] [create_session] 创建本地终端失败: {}", request_id, e);
                    format!("创建本地终端失败: {}", e)
                })?;
            tracing::info!(
                "[{}] [create_session] 本地终端创建成功 | session_id={} | pid={}",
                request_id, session_id, pid
            );
        }
        "ssh" => {
            let host = config.host.as_ref().ok_or_else(|| {
                tracing::error!("[{}] [create_session] 缺少主机地址", request_id);
                "缺少主机地址".to_string()
            })?;
            let port = config.port.unwrap_or(22);
            let username = config.username.as_ref().ok_or_else(|| {
                tracing::error!("[{}] [create_session] 缺少用户名", request_id);
                "缺少用户名".to_string()
            })?;
            
            tracing::info!(
                "[{}] [create_session] 创建 SSH 连接 | host={}:{} | user={} | auth={}",
                request_id, host, port, username,
                if config.key_path.is_some() { "key" } else { "password" }
            );
            
            let pid = pty_manager
                .spawn_ssh(
                    session_id.clone(),
                    host,
                    port,
                    username,
                    config.password.as_deref(),
                    config.key_path.as_deref(),
                    config.key_passphrase.as_deref(),
                )
                .map_err(|e| {
                    tracing::error!("[{}] [create_session] SSH 连接失败: {}", request_id, e);
                    format!("SSH 连接失败: {}", e)
                })?;
            
            tracing::info!(
                "[{}] [create_session] SSH 连接创建成功 | session_id={} | pid={} | {}@{}:{}",
                request_id, session_id, pid, username, host, port
            );
        }
        "telnet" => {
            let host = config.host.as_ref().ok_or_else(|| {
                tracing::error!("[{}] [create_session] 缺少主机地址", request_id);
                "缺少主机地址".to_string()
            })?;
            let port = config.port.unwrap_or(23);
            
            tracing::info!(
                "[{}] [create_session] 创建 Telnet 连接 | host={}:{}",
                request_id, host, port
            );
            
            let pid = pty_manager
                .spawn_telnet(session_id.clone(), host, port)
                .map_err(|e| {
                    tracing::error!("[{}] [create_session] Telnet 连接失败: {}", request_id, e);
                    format!("Telnet 连接失败: {}", e)
                })?;
            
            tracing::info!(
                "[{}] [create_session] Telnet 连接创建成功 | session_id={} | pid={} | {}:{}",
                request_id, session_id, pid, host, port
            );
        }
        "serial" => {
            let port = config.serial_port.as_ref().ok_or_else(|| {
                tracing::error!("[{}] [create_session] 缺少串口号", request_id);
                "缺少串口号".to_string()
            })?;
            let baud_rate = config.baud_rate.unwrap_or(115200);
            let data_bits = config.data_bits.unwrap_or(8);
            let parity = config.parity.as_deref().unwrap_or("none");
            let stop_bits = config.stop_bits.unwrap_or(1.0);
            let flow_control = config.flow_control.as_deref().unwrap_or("none");
            
            tracing::info!(
                "[{}] [create_session] 创建串口连接 | port={} | baud={} | {}-{}-{}-{}",
                request_id, port, baud_rate, data_bits, parity, stop_bits, flow_control
            );
            
            let pid = pty_manager
                .spawn_serial(
                    session_id.clone(),
                    port,
                    baud_rate,
                    data_bits,
                    parity,
                    stop_bits,
                    flow_control,
                )
                .map_err(|e| {
                    tracing::error!("[{}] [create_session] 串口连接失败: {}", request_id, e);
                    format!("串口连接失败: {}", e)
                })?;
            
            tracing::info!(
                "[{}] [create_session] 串口连接创建成功 | session_id={} | pid={} | {} @ {}",
                request_id, session_id, pid, port, baud_rate
            );
        }
        _ => {
            tracing::error!("[{}] [create_session] 不支持的协议: {}", request_id, config.protocol);
            return Err(format!("不支持的协议: {}", config.protocol));
        }
    }

    let session = SessionInfo {
        id: session_id.clone(),
        name: config.name.clone(),
        shell,
        protocol: config.protocol.clone(),
        created_at: chrono::Utc::now().timestamp(),
        status: "connected".to_string(),
    };

    tracing::info!(
        "[{}] [create_session] 会话创建完成 | id={} | name={} | protocol={}",
        request_id, session.id, session.name, session.protocol
    );
    Ok(session)
}

/// 关闭会话
#[tauri::command]
pub async fn close_session(
    state: State<'_, AppState>,
    session_id: String,
) -> Result<(), String> {
    let request_id = uuid::Uuid::new_v4().to_string()[..8].to_string();
    tracing::info!(
        "[{}] [close_session] 开始关闭会话 | session_id={}",
        request_id, session_id
    );
    
    let pty_manager = state.pty_manager.read().await;
    pty_manager
        .kill_session(&session_id)
        .map_err(|e| {
            tracing::error!("[{}] [close_session] 关闭会话失败: {}", request_id, e);
            format!("关闭会话失败: {}", e)
        })?;
    
    tracing::info!(
        "[{}] [close_session] 会话已关闭 | session_id={}",
        request_id, session_id
    );
    Ok(())
}

/// 执行命令
#[tauri::command]
pub async fn execute_command(
    state: State<'_, AppState>,
    session_id: String,
    command: String,
) -> Result<String, String> {
    let request_id = uuid::Uuid::new_v4().to_string()[..8].to_string();
    tracing::info!(
        "[{}] [execute_command] 执行命令 | session_id={} | command={}",
        request_id, session_id, command
    );
    
    let full_command = format!("{}\n", command);
    let pty_manager = state.pty_manager.read().await;
    pty_manager
        .write(&session_id, full_command.as_bytes())
        .map_err(|e| {
            tracing::error!("[{}] [execute_command] 发送命令失败: {}", request_id, e);
            format!("发送命令失败: {}", e)
        })?;
    
    tracing::debug!(
        "[{}] [execute_command] 命令已发送 | session_id={}",
        request_id, session_id
    );
    Ok(format!("已发送: {}", command.trim()))
}

/// 写入 PTY 数据
#[tauri::command]
pub async fn write_pty(
    state: State<'_, AppState>,
    session_id: String,
    data: String,
) -> Result<(), String> {
    let request_id = uuid::Uuid::new_v4().to_string()[..8].to_string();
    tracing::trace!(
        "[{}] [write_pty] 写入数据 | session_id={} | len={} bytes",
        request_id, session_id, data.len()
    );
    
    let pty_manager = state.pty_manager.read().await;
    pty_manager
        .write(&session_id, data.as_bytes())
        .map_err(|e| {
            tracing::error!("[{}] [write_pty] 写入失败: {}", request_id, e);
            format!("写入失败: {}", e)
        })?;
    Ok(())
}

/// 读取 PTY 数据
#[tauri::command]
pub async fn read_pty(
    state: State<'_, AppState>,
    session_id: String,
) -> Result<String, String> {
    let pty_manager = state.pty_manager.read().await;
    let data = pty_manager
        .read(&session_id)
        .map_err(|e| {
            tracing::error!("[read_pty] 读取失败: {}", e);
            format!("读取失败: {}", e)
        })?;
    Ok(String::from_utf8_lossy(&data).to_string())
}

/// 调整 PTY 大小
#[tauri::command]
pub async fn resize_pty(
    state: State<'_, AppState>,
    session_id: String,
    rows: u16,
    cols: u16,
) -> Result<(), String> {
    tracing::debug!("[resize_pty] 调整大小 | session_id={} | {}x{}", session_id, cols, rows);
    
    let pty_manager = state.pty_manager.read().await;
    pty_manager
        .resize(&session_id, rows, cols)
        .map_err(|e| {
            tracing::error!("[resize_pty] 调整大小失败: {}", e);
            format!("调整大小失败: {}", e)
        })?;
    Ok(())
}

/// 获取会话列表
#[tauri::command]
pub async fn get_sessions() -> Result<Vec<SavedSession>, String> {
    tracing::debug!("[get_sessions] 获取会话列表");
    db::get_saved_sessions().map_err(|e| {
        tracing::error!("[get_sessions] 获取会话列表失败: {}", e);
        format!("获取会话列表失败: {}", e)
    })
}

/// 获取 PTY 进程列表
#[tauri::command]
pub async fn get_pty_processes(
    state: State<'_, AppState>,
) -> Result<Vec<PtyProcessInfo>, String> {
    tracing::debug!("[get_pty_processes] 获取 PTY 进程列表");
    
    let pty_manager = state.pty_manager.read().await;
    let processes = pty_manager.get_all().map_err(|e| {
        tracing::error!("[get_pty_processes] 获取进程列表失败: {}", e);
        format!("获取进程列表失败: {}", e)
    })?;
    
    Ok(processes
        .into_iter()
        .map(|p| PtyProcessInfo {
            id: p.id,
            session_id: p.session_id,
            shell: p.shell,
            running: p.running,
        })
        .collect())
}

/// 获取可用串口列表
#[tauri::command]
pub async fn get_serial_ports() -> Result<Vec<String>, String> {
    tracing::debug!("[get_serial_ports] 获取串口列表");
    
    let ports = serialport::available_ports()
        .map_err(|e| {
            tracing::error!("[get_serial_ports] 获取串口列表失败: {}", e);
            format!("获取串口列表失败: {}", e)
        })?;
    
    let port_names: Vec<String> = ports.into_iter().map(|p| p.port_name).collect();
    tracing::info!("[get_serial_ports] 发现 {} 个串口: {:?}", port_names.len(), port_names);
    Ok(port_names)
}

/// 保存会话到数据库
#[tauri::command]
pub fn save_session(session: SavedSession) -> Result<(), String> {
    tracing::info!(
        "[save_session] 保存会话 | id={} | name={} | protocol={}",
        session.id, session.name, session.protocol
    );
    
    db::save_session(&session).map_err(|e| {
        tracing::error!("[save_session] 保存会话失败: {}", e);
        format!("保存会话失败: {}", e)
    })
}

/// 从数据库删除会话
#[tauri::command]
pub fn delete_session(id: String) -> Result<(), String> {
    tracing::info!("[delete_session] 删除会话 | id={}", id);
    
    db::delete_saved_session(&id).map_err(|e| {
        tracing::error!("[delete_session] 删除会话失败: {}", e);
        format!("删除会话失败: {}", e)
    })
}

/// 更新会话
#[tauri::command]
pub fn update_session(id: String, last_used_at: i64) -> Result<(), String> {
    tracing::debug!("[update_session] 更新会话 | id={} | last_used={}", id, last_used_at);
    
    db::update_last_used(&id, last_used_at).map_err(|e| {
        tracing::error!("[update_session] 更新会话失败: {}", e);
        format!("更新会话失败: {}", e)
    })
}
