//! Tauri 命令模块
//!
//! 提供给前端调用的命令

use serde::{Deserialize, Serialize};
use tauri::State;
use uuid::Uuid;

/// 会话信息
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionInfo {
    /// 会话 ID
    pub id: String,
    /// 会话名称
    pub name: String,
    /// 创建时间
    pub created_at: i64,
}

/// 创建会话
/// 
/// # 参数
/// - `name`: 会话名称
/// 
/// # 返回
/// 新创建的会话信息
#[tauri::command]
pub async fn create_session(name: String) -> Result<SessionInfo, String> {
    tracing::info!("创建会话: {}", name);

    let session = SessionInfo {
        id: Uuid::new_v4().to_string(),
        name,
        created_at: chrono::Utc::now().timestamp(),
    };

    // TODO: 保存到本地数据库

    Ok(session)
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
    session_id: String,
    command: String,
) -> Result<String, String> {
    tracing::info!("执行命令 [{}]: {}", session_id, command);

    // TODO: 通过 PTY 执行命令

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