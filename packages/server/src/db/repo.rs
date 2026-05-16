//! 数据库操作模块

use anyhow::Result;
use chrono::{DateTime, Utc};
use sqlx::SqlitePool;
use uuid::Uuid;

use nextest_core::models::*;

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
    ) -> Result<User> {
        let id = Uuid::new_v4();
        let now = Utc::now();

        sqlx::query!(
            r#"
            INSERT INTO users (id, email, employee_id, password_hash, name, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            "#,
            id.to_string(),
            email,
            employee_id,
            password_hash,
            name,
            now.timestamp(),
            now.timestamp(),
        )
        .execute(pool)
        .await?;

        Ok(User {
            id,
            email: email.to_string(),
            employee_id: employee_id.to_string(),
            password_hash: password_hash.to_string(),
            name: name.to_string(),
            created_at: now,
            updated_at: now,
        })
    }

    /// 根据邮箱查找用户
    pub async fn find_by_email(pool: &SqlitePool, email: &str) -> Result<Option<User>> {
        let row = sqlx::query!(
            r#"
            SELECT id, email, employee_id, password_hash, name, created_at, updated_at
            FROM users
            WHERE email = ?
            "#,
            email
        )
        .fetch_optional(pool)
        .await?;

        Ok(row.map(|r| User {
            id: Uuid::parse_str(&r.id).unwrap(),
            email: r.email,
            employee_id: r.employee_id,
            password_hash: r.password_hash,
            name: r.name,
            created_at: DateTime::from_timestamp(r.created_at, 0).unwrap_or_default(),
            updated_at: DateTime::from_timestamp(r.updated_at, 0).unwrap_or_default(),
        }))
    }

    /// 根据工号查找用户
    pub async fn find_by_employee_id(pool: &SqlitePool, employee_id: &str) -> Result<Option<User>> {
        let row = sqlx::query!(
            r#"
            SELECT id, email, employee_id, password_hash, name, created_at, updated_at
            FROM users
            WHERE employee_id = ?
            "#,
            employee_id
        )
        .fetch_optional(pool)
        .await?;

        Ok(row.map(|r| User {
            id: Uuid::parse_str(&r.id).unwrap(),
            email: r.email,
            employee_id: r.employee_id,
            password_hash: r.password_hash,
            name: r.name,
            created_at: DateTime::from_timestamp(r.created_at, 0).unwrap_or_default(),
            updated_at: DateTime::from_timestamp(r.updated_at, 0).unwrap_or_default(),
        }))
    }

    /// 根据 ID 查找用户
    pub async fn find_by_id(pool: &SqlitePool, id: Uuid) -> Result<Option<User>> {
        let row = sqlx::query!(
            r#"
            SELECT id, email, employee_id, password_hash, name, created_at, updated_at
            FROM users
            WHERE id = ?
            "#,
            id.to_string()
        )
        .fetch_optional(pool)
        .await?;

        Ok(row.map(|r| User {
            id: Uuid::parse_str(&r.id).unwrap(),
            email: r.email,
            employee_id: r.employee_id,
            password_hash: r.password_hash,
            name: r.name,
            created_at: DateTime::from_timestamp(r.created_at, 0).unwrap_or_default(),
            updated_at: DateTime::from_timestamp(r.updated_at, 0).unwrap_or_default(),
        }))
    }

    /// 更新用户信息
    pub async fn update(
        pool: &SqlitePool,
        id: Uuid,
        employee_id: Option<&str>,
        password_hash: Option<&str>,
        name: Option<&str>,
    ) -> Result<()> {
        let now = Utc::now().timestamp();

        if let Some(eid) = employee_id {
            sqlx::query!(
                "UPDATE users SET employee_id = ?, updated_at = ? WHERE id = ?",
                eid,
                now,
                id.to_string()
            )
            .execute(pool)
            .await?;
        }

        if let Some(ph) = password_hash {
            sqlx::query!(
                "UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?",
                ph,
                now,
                id.to_string()
            )
            .execute(pool)
            .await?;
        }

        if let Some(n) = name {
            sqlx::query!(
                "UPDATE users SET name = ?, updated_at = ? WHERE id = ?",
                n,
                now,
                id.to_string()
            )
            .execute(pool)
            .await?;
        }

        Ok(())
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
    ) -> Result<Session> {
        let id = Uuid::new_v4();
        let now = Utc::now();

        sqlx::query!(
            r#"
            INSERT INTO sessions (id, name, folder_id, user_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            "#,
            id.to_string(),
            name,
            folder_id.map(|f| f.to_string()),
            user_id.to_string(),
            now.timestamp(),
            now.timestamp(),
        )
        .execute(pool)
        .await?;

        Ok(Session {
            id,
            name: name.to_string(),
            folder_id,
            created_at: now,
            updated_at: now,
        })
    }

    /// 获取用户的所有会话
    pub async fn find_by_user(pool: &SqlitePool, user_id: Uuid) -> Result<Vec<Session>> {
        let rows = sqlx::query!(
            r#"
            SELECT id, name, folder_id, created_at, updated_at
            FROM sessions
            WHERE user_id = ?
            ORDER BY created_at DESC
            "#,
            user_id.to_string()
        )
        .fetch_all(pool)
        .await?;

        Ok(rows
            .into_iter()
            .map(|r| Session {
                id: Uuid::parse_str(&r.id).unwrap(),
                name: r.name,
                folder_id: r.folder_id.and_then(|f| Uuid::parse_str(&f).ok()),
                created_at: DateTime::from_timestamp(r.created_at, 0).unwrap_or_default(),
                updated_at: DateTime::from_timestamp(r.updated_at, 0).unwrap_or_default(),
            })
            .collect())
    }

    /// 根据 ID 获取会话
    pub async fn find_by_id(pool: &SqlitePool, id: Uuid) -> Result<Option<Session>> {
        let row = sqlx::query!(
            r#"
            SELECT id, name, folder_id, created_at, updated_at
            FROM sessions
            WHERE id = ?
            "#,
            id.to_string()
        )
        .fetch_optional(pool)
        .await?;

        Ok(row.map(|r| Session {
            id: Uuid::parse_str(&r.id).unwrap(),
            name: r.name,
            folder_id: r.folder_id.and_then(|f| Uuid::parse_str(&f).ok()),
            created_at: DateTime::from_timestamp(r.created_at, 0).unwrap_or_default(),
            updated_at: DateTime::from_timestamp(r.updated_at, 0).unwrap_or_default(),
        }))
    }

    /// 更新会话
    pub async fn update(
        pool: &SqlitePool,
        id: Uuid,
        name: Option<&str>,
        folder_id: Option<Option<Uuid>>,
    ) -> Result<()> {
        let now = Utc::now().timestamp();

        if let Some(n) = name {
            sqlx::query!(
                "UPDATE sessions SET name = ?, updated_at = ? WHERE id = ?",
                n,
                now,
                id.to_string()
            )
            .execute(pool)
            .await?;
        }

        if let Some(fid) = folder_id {
            sqlx::query!(
                "UPDATE sessions SET folder_id = ?, updated_at = ? WHERE id = ?",
                fid.map(|f| f.to_string()),
                now,
                id.to_string()
            )
            .execute(pool)
            .await?;
        }

        Ok(())
    }

    /// 删除会话
    pub async fn delete(pool: &SqlitePool, id: Uuid) -> Result<()> {
        sqlx::query!("DELETE FROM sessions WHERE id = ?", id.to_string())
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
    ) -> Result<Folder> {
        let id = Uuid::new_v4();

        sqlx::query!(
            r#"
            INSERT INTO folders (id, name, parent_id, "order")
            VALUES (?, ?, ?, ?)
            "#,
            id.to_string(),
            name,
            parent_id.map(|p| p.to_string()),
            order
        )
        .execute(pool)
        .await?;

        Ok(Folder {
            id,
            name: name.to_string(),
            parent_id,
            order,
        })
    }

    /// 获取所有文件夹
    pub async fn find_all(pool: &SqlitePool) -> Result<Vec<Folder>> {
        let rows = sqlx::query!(
            r#"
            SELECT id, name, parent_id, "order"
            FROM folders
            ORDER BY "order" ASC
            "#
        )
        .fetch_all(pool)
        .await?;

        Ok(rows
            .into_iter()
            .map(|r| Folder {
                id: Uuid::parse_str(&r.id).unwrap(),
                name: r.name,
                parent_id: r.parent_id.and_then(|p| Uuid::parse_str(&p).ok()),
                order: r.order,
            })
            .collect())
    }

    /// 更新文件夹
    pub async fn update(
        pool: &SqlitePool,
        id: Uuid,
        name: Option<&str>,
        parent_id: Option<Option<Uuid>>,
        order: Option<i32>,
    ) -> Result<()> {
        if let Some(n) = name {
            sqlx::query!(
                "UPDATE folders SET name = ? WHERE id = ?",
                n,
                id.to_string()
            )
            .execute(pool)
            .await?;
        }

        if let Some(pid) = parent_id {
            sqlx::query!(
                "UPDATE folders SET parent_id = ? WHERE id = ?",
                pid.map(|p| p.to_string()),
                id.to_string()
            )
            .execute(pool)
            .await?;
        }

        if let Some(o) = order {
            sqlx::query!(
                "UPDATE folders SET \"order\" = ? WHERE id = ?",
                o,
                id.to_string()
            )
            .execute(pool)
            .await?;
        }

        Ok(())
    }

    /// 删除文件夹
    pub async fn delete(pool: &SqlitePool, id: Uuid) -> Result<()> {
        sqlx::query!("DELETE FROM folders WHERE id = ?", id.to_string())
            .execute(pool)
            .await?;
        Ok(())
    }
}