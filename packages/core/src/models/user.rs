//! 用户数据模型

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// 用户实体
/// 
/// 存储用户的基本信息，邮箱作为唯一标识
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    /// 用户唯一标识符
    pub id: Uuid,
    
    /// 用户邮箱（唯一标识，不可修改）
    pub email: String,
    
    /// 工号（唯一，可修改）
    pub employee_id: String,
    
    /// 密码哈希值
    pub password_hash: String,
    
    /// 显示名称
    pub name: String,
    
    /// 创建时间
    pub created_at: DateTime<Utc>,
    
    /// 更新时间
    pub updated_at: DateTime<Utc>,
}

impl User {
    /// 创建新用户
    /// 
    /// # 参数
    /// - `email`: 用户邮箱
    /// - `employee_id`: 工号
    /// - `password_hash`: 密码哈希
    /// - `name`: 显示名称
    /// 
    /// # 返回
    /// 新创建的用户实例
    pub fn new(
        email: String,
        employee_id: String,
        password_hash: String,
        name: String,
    ) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            email,
            employee_id,
            password_hash,
            name,
            created_at: now,
            updated_at: now,
        }
    }
}

/// 用户创建请求
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateUserRequest {
    /// 用户邮箱
    pub email: String,
    
    /// 工号
    pub employee_id: String,
    
    /// 密码（明文，服务端会进行哈希处理）
    pub password: String,
    
    /// 显示名称
    pub name: String,
}

/// 用户更新请求
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateUserRequest {
    /// 工号
    pub employee_id: Option<String>,
    
    /// 密码（明文，服务端会进行哈希处理）
    pub password: Option<String>,
    
    /// 显示名称
    pub name: Option<String>,
}