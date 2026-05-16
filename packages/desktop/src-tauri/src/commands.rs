//! Tauri 命令模块
//!
//! 提供给前端调用的命令

use serde::{Deserialize, Serialize};
use tauri::State;

use crate::AppState;

/// 会话信息
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionInfo {
    /// 会话 ID
    pub id: String,
    /// 会话名称
    pub name: String,
    /// Shell 类型
    pub shell: String,
    /// 创建时间
    pub created_at: i64,
}

/// PTY 进程信息
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PtyProcessInfo {
    /// 进程 ID
    pub id: u32,
    /// 会话 ID
    pub session_id: String,
    /// Shell 类型
    pub shell: String,
    /// 是否运行中
    pub running: bool,
}

/// 创建会话
///
/// # 参数
/// - `name`: 会话名称
/// - `shell`: Shell 类型（默认 cmd）
///
/// # 返回
/// 新创建的会话信息
#[tauri::command]
pub async fn create_session(
    state: State<'_, AppState>,
    name: String,
    shell: Option<String>,
) -> Result<SessionInfo, String> {
    let shell = shell.unwrap_or_else(|| "cmd".to_string());

    tracing::info!("创建会话: {} ({})", name, shell);

    let session_id = uuid::Uuid::new_v4().to_string();

    // 创建 PTY 进程
    let pty_manager = state.pty_manager.read().await;
    let pid = pty_manager
        .spawn(session_id.clone(), &shell)
        .map_err(|e| e.to_string())?;

    let session = SessionInfo {
        id: session_id,
        name,
        shell,
        created_at: chrono::Utc::now().timestamp(),
    };

    tracing::info!("会话创建成功: {} (PID: {})", session.id, pid);

    Ok(session)
}

/// 关闭会话
///
/// # 参数
/// - `session_id`: 会话 ID
#[tauri::command]
pub async fn close_session(
    state: State<'_, AppState>,
    session_id: String,
) -> Result<(), String> {
    tracing::info!("关闭会话: {}", session_id);

    // 终止会话的所有进程
    let pty_manager = state.pty_manager.read().await;
    pty_manager
        .kill_session(&session_id)
        .map_err(|e| e.to_string())?;

    Ok(())
}

/// 执行命令
///
/// # 参数
/// - `session_id`: 会话 ID
/// - `command`: 要执行的命令
///
/// # 返回
/// 命令输出
#[tauri::command]
pub async fn execute_command(
    _state: State<'_, AppState>,
    session_id: String,
    command: String,
) -> Result<String, String> {
    tracing::info!("执行命令 [{}]: {}", session_id, command);

    // TODO: 通过 PTY 发送命令并获取输出
    Ok(format!("执行: {}", command))
}

/// 获取会话列表
///
/// # 返回
/// 所有会话列表
#[tauri::command]
pub async fn get_sessions() -> Result<Vec<SessionInfo>, String> {
    tracing::info!("获取会话列表");

    // TODO: 从本地数据库获取
    Ok(Vec::new())
}

/// 获取 PTY 进程列表
///
/// # 返回
/// 所有 PTY 进程列表
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