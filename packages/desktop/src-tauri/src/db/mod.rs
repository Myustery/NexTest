//! 数据库模块
//!
//! 使用 SQLite 存储会话配置

use anyhow::Result;
use once_cell::sync::OnceCell;
use rusqlite::{Connection, params};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::Mutex;

/// 保存的会话配置
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SavedSession {
    pub id: String,
    pub name: String,
    pub protocol: String,
    pub shell: Option<String>,
    pub host: Option<String>,
    pub port: Option<u16>,
    pub username: Option<String>,
    pub serial_port: Option<String>,
    pub baud_rate: Option<u32>,
    pub created_at: i64,
    pub last_used_at: i64,
}

/// 全局数据库连接
static DB: OnceCell<Mutex<Connection>> = OnceCell::new();

/// 获取数据库路径
fn get_db_path() -> PathBuf {
    let exe_dir = std::env::current_exe()
        .unwrap_or_else(|_| PathBuf::from("."))
        .parent()
        .map(|p| p.to_path_buf())
        .unwrap_or_else(|| PathBuf::from("."));
    exe_dir.join("nextest.db")
}

/// 初始化数据库
pub fn init_db() -> Result<()> {
    let db_path = get_db_path();
    tracing::info!("数据库路径: {}", db_path.display());
    
    let conn = Connection::open(&db_path)?;
    
    conn.execute(
        r#"
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            protocol TEXT NOT NULL,
            shell TEXT,
            host TEXT,
            port INTEGER,
            username TEXT,
            serial_port TEXT,
            baud_rate INTEGER,
            created_at INTEGER NOT NULL,
            last_used_at INTEGER NOT NULL
        )
        "#,
        [],
    )?;

    DB.set(Mutex::new(conn))
        .map_err(|_| anyhow::anyhow!("数据库已初始化"))?;

    tracing::info!("数据库初始化完成");
    Ok(())
}

/// 获取数据库连接
fn get_conn() -> Result<std::sync::MutexGuard<'static, Connection>> {
    DB.get()
        .ok_or_else(|| anyhow::anyhow!("数据库未初始化"))?
        .lock()
        .map_err(|_| anyhow::anyhow!("数据库锁获取失败"))
}

/// 保存会话
pub fn save_session(session: &SavedSession) -> Result<()> {
    let conn = get_conn()?;
    
    conn.execute(
        r#"
        INSERT OR REPLACE INTO sessions (
            id, name, protocol, shell, host, port, username,
            serial_port, baud_rate, created_at, last_used_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)
        "#,
        params![
            session.id,
            session.name,
            session.protocol,
            session.shell,
            session.host,
            session.port.map(|p| p as i64),
            session.username,
            session.serial_port,
            session.baud_rate.map(|b| b as i64),
            session.created_at,
            session.last_used_at,
        ],
    )?;

    tracing::info!("会话已保存: {}", session.id);
    Ok(())
}

/// 获取所有保存的会话
pub fn get_saved_sessions() -> Result<Vec<SavedSession>> {
    let conn = get_conn()?;
    
    let mut stmt = conn.prepare(
        "SELECT id, name, protocol, shell, host, port, username, serial_port, baud_rate, created_at, last_used_at FROM sessions ORDER BY last_used_at DESC"
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(SavedSession {
            id: row.get(0)?,
            name: row.get(1)?,
            protocol: row.get(2)?,
            shell: row.get(3)?,
            host: row.get(4)?,
            port: row.get::<_, Option<i64>>(5)?.map(|p| p as u16),
            username: row.get(6)?,
            serial_port: row.get(7)?,
            baud_rate: row.get::<_, Option<i64>>(8)?.map(|b| b as u32),
            created_at: row.get(9)?,
            last_used_at: row.get(10)?,
        })
    })?;

    let mut sessions = Vec::new();
    for row in rows {
        sessions.push(row?);
    }

    Ok(sessions)
}

/// 删除会话
pub fn delete_saved_session(id: &str) -> Result<()> {
    let conn = get_conn()?;
    
    conn.execute("DELETE FROM sessions WHERE id = ?1", params![id])?;

    tracing::info!("会话已删除: {}", id);
    Ok(())
}

/// 更新会话最后使用时间
pub fn update_last_used(id: &str, last_used_at: i64) -> Result<()> {
    let conn = get_conn()?;
    
    conn.execute(
        "UPDATE sessions SET last_used_at = ?1 WHERE id = ?2",
        params![last_used_at, id],
    )?;

    Ok(())
}
