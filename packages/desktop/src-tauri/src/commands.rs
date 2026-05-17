//! Tauri 命令模块

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
    tracing::info!("创建会话: {} ({})", config.name, config.protocol);

    let session_id = uuid::Uuid::new_v4().to_string();
    let shell = match config.protocol.as_str() {
        "local" => config.shell.clone().unwrap_or_else(|| "powershell".to_string()),
        "ssh" => "ssh".to_string(),
        "telnet" => "telnet".to_string(),
        "serial" => "serial".to_string(),
        _ => "unknown".to_string(),
    };

    let pty_manager = state.pty_manager.read().await;

    match config.protocol.as_str() {
        "local" => {
            let shell_type = config.shell.clone().unwrap_or_else(|| "powershell".to_string());
            let pid = pty_manager
                .spawn_local(session_id.clone(), &shell_type)
                .map_err(|e| e.to_string())?;
            tracing::info!("本地会话创建成功: {} (PID: {})", session_id, pid);
        }
        "ssh" => {
            let host = config.host.as_ref().ok_or("缺少主机地址")?;
            let port = config.port.unwrap_or(22);
            let username = config.username.as_ref().ok_or("缺少用户名")?;
            
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
                .map_err(|e| e.to_string())?;
            
            tracing::info!("SSH 会话创建成功: {}@{}:{} (PID: {})", username, host, port, pid);
        }
        "telnet" => {
            let host = config.host.as_ref().ok_or("缺少主机地址")?;
            let port = config.port.unwrap_or(23);
            
            let pid = pty_manager
                .spawn_telnet(session_id.clone(), host, port)
                .map_err(|e| e.to_string())?;
            
            tracing::info!("Telnet 会话创建成功: {}:{} (PID: {})", host, port, pid);
        }
        "serial" => {
            let port = config.serial_port.as_ref().ok_or("缺少串口号")?;
            let baud_rate = config.baud_rate.unwrap_or(115200);
            let data_bits = config.data_bits.unwrap_or(8);
            let parity = config.parity.as_deref().unwrap_or("none");
            let stop_bits = config.stop_bits.unwrap_or(1.0);
            let flow_control = config.flow_control.as_deref().unwrap_or("none");
            
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
                .map_err(|e| e.to_string())?;
            
            tracing::info!("串口会话创建成功: {} @ {} (PID: {})", port, baud_rate, pid);
        }
        _ => {
            return Err(format!("不支持的协议: {}", config.protocol));
        }
    }

    let session = SessionInfo {
        id: session_id,
        name: config.name,
        shell,
        protocol: config.protocol,
        created_at: chrono::Utc::now().timestamp(),
        status: "connected".to_string(),
    };

    tracing::info!("会话创建成功: {}", session.id);
    Ok(session)
}

/// 关闭会话
#[tauri::command]
pub async fn close_session(
    state: State<'_, AppState>,
    session_id: String,
) -> Result<(), String> {
    tracing::info!("关闭会话: {}", session_id);
    let pty_manager = state.pty_manager.read().await;
    pty_manager
        .kill_session(&session_id)
        .map_err(|e| e.to_string())?;
    Ok(())
}

/// 执行命令
#[tauri::command]
pub async fn execute_command(
    state: State<'_, AppState>,
    session_id: String,
    command: String,
) -> Result<String, String> {
    tracing::info!("执行命令 [{}]: {}", session_id, command);
    let full_command = format!("{}\n", command);
    let pty_manager = state.pty_manager.read().await;
    pty_manager
        .write(&session_id, full_command.as_bytes())
        .map_err(|e| e.to_string())?;
    Ok(format!("已发送: {}", command.trim()))
}

/// 写入 PTY 数据
#[tauri::command]
pub async fn write_pty(
    state: State<'_, AppState>,
    session_id: String,
    data: String,
) -> Result<(), String> {
    let pty_manager = state.pty_manager.read().await;
    pty_manager
        .write(&session_id, data.as_bytes())
        .map_err(|e| e.to_string())?;
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
        .map_err(|e| e.to_string())?;
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
    let pty_manager = state.pty_manager.read().await;
    pty_manager
        .resize(&session_id, rows, cols)
        .map_err(|e| e.to_string())?;
    Ok(())
}

/// 获取会话列表
#[tauri::command]
pub async fn get_sessions() -> Result<Vec<SavedSession>, String> {
    tracing::info!("获取会话列表");
    db::get_saved_sessions().map_err(|e| e.to_string())
}

/// 获取 PTY 进程列表
#[tauri::command]
pub async fn get_pty_processes(
    state: State<'_, AppState>,
) -> Result<Vec<PtyProcessInfo>, String> {
    let pty_manager = state.pty_manager.read().await;
    let processes = pty_manager.get_all().map_err(|e| e.to_string())?;
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
    tracing::info!("获取串口列表");
    
    let ports = serialport::available_ports()
        .map_err(|e| e.to_string())?;
    
    Ok(ports
        .into_iter()
        .map(|p| p.port_name)
        .collect())
}

/// 保存会话到数据库
#[tauri::command]
pub fn save_session(session: SavedSession) -> Result<(), String> {
    db::save_session(&session).map_err(|e| e.to_string())
}

/// 从数据库删除会话
#[tauri::command]
pub fn delete_session(id: String) -> Result<(), String> {
    db::delete_saved_session(&id).map_err(|e| e.to_string())
}

/// 更新会话
#[tauri::command]
pub fn update_session(id: String, last_used_at: i64) -> Result<(), String> {
    db::update_last_used(&id, last_used_at).map_err(|e| e.to_string())
}
