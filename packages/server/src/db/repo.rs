//! 数据库操作模块

use anyhow::Result;
use chrono::{DateTime, Utc};
use sqlx::SqlitePool;
use uuid::Uuid;

/// 用户数据库操作
pub struct UserRepo;

impl UserRepo {
    /// 创建用户
    pub async fn create(
        pool: &SqlitePool,
        email: &str,
        employee_id: &str,
        password_hash: &str,
        name: &str,
    ) -> Result<()> {
        let id = Uuid::new_v4();
        let now = Utc::now().timestamp();

        sqlx::query(
            r#"
            INSERT INTO users (id, email, employee_id, password_hash, name, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(id.to_string())
        .bind(email)
        .bind(employee_id)
        .bind(password_hash)
        .bind(name)
        .bind(now)
        .bind(now)
        .execute(pool)
        .await?;

        Ok(())
    }

    /// 根据邮箱查找用户
    pub async fn find_by_email(pool: &SqlitePool, email: &str) -> Result<Option<(String, String, String, String, String)>> {
        let row = sqlx::query_as::<_, (String, String, String, String, String)>(
            "SELECT id, email, employee_id, password_hash, name FROM users WHERE email = ?",
        )
        .bind(email)
        .fetch_optional(pool)
        .await?;

        Ok(row)
    }

    /// 根据工号查找用户
    pub async fn find_by_employee_id(pool: &SqlitePool, employee_id: &str) -> Result<Option<String>> {
        let row: Option<(String,)> = sqlx::query_as(
            "SELECT id FROM users WHERE employee_id = ?",
        )
        .bind(employee_id)
        .fetch_optional(pool)
        .await?;

        Ok(row.map(|r| r.0))
    }
}

/// 会话数据库操作
pub struct SessionRepo;

impl SessionRepo {
    /// 创建会话
    pub async fn create(
        pool: &SqlitePool,
        user_id: Uuid,
        name: &str,
        folder_id: Option<Uuid>,
    ) -> Result<()> {
        let id = Uuid::new_v4();
        let now = Utc::now().timestamp();

        sqlx::query(
            r#"
            INSERT INTO sessions (id, name, folder_id, user_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(id.to_string())
        .bind(name)
        .bind(folder_id.map(|f| f.to_string()))
        .bind(user_id.to_string())
        .bind(now)
        .bind(now)
        .execute(pool)
        .await?;

        Ok(())
    }

    /// 删除会话
    pub async fn delete(pool: &SqlitePool, id: Uuid) -> Result<()> {
        sqlx::query("DELETE FROM sessions WHERE id = ?")
            .bind(id.to_string())
            .execute(pool)
            .await?;
        Ok(())
    }
}

/// 文件夹数据库操作
pub struct FolderRepo;

impl FolderRepo {
    /// 创建文件夹
    pub async fn create(
        pool: &SqlitePool,
        name: &str,
        parent_id: Option<Uuid>,
        order: i32,
    ) -> Result<()> {
        let id = Uuid::new_v4();

        sqlx::query(
            r#"
            INSERT INTO folders (id, name, parent_id, "order")
            VALUES (?, ?, ?, ?)
            "#,
        )
        .bind(id.to_string())
        .bind(name)
        .bind(parent_id.map(|p| p.to_string()))
        .bind(order)
        .execute(pool)
        .await?;

        Ok(())
    }

    /// 删除文件夹
    pub async fn delete(pool: &SqlitePool, id: Uuid) -> Result<()> {
        sqlx::query("DELETE FROM folders WHERE id = ?")
            .bind(id.to_string())
            .execute(pool)
            .await?;
        Ok(())
    }
}