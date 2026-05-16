//! 数据库模块

pub mod migrations;
pub mod repo;

pub use repo::*;

use anyhow::Result;
use sqlx::SqlitePool;

/// 初始化数据库连接池
/// 
/// # 参数
/// - `database_url`: 数据库连接字符串
/// 
/// # 返回
/// 数据库连接池
pub async fn init_pool(database_url: &str) -> Result<SqlitePool> {
    let pool = SqlitePool::connect(database_url).await?;
    Ok(pool)
}

/// 运行数据库迁移
/// 
/// # 参数
/// - `pool`: 数据库连接池
pub async fn run_migrations(pool: &SqlitePool) -> Result<()> {
    sqlx::migrate!("./migrations").run(pool).await?;
    Ok(())
}