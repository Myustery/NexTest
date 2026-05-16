//! 会话数据模型

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// 会话实体
/// 
/// 代表一个终端会话，与 Tab 一对一映射
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Session {
    /// 会话唯一标识符
    pub id: Uuid,
    
    /// 会话名称
    pub name: String,
    
    /// 所属文件夹 ID（可为空，表示根级别）
    pub folder_id: Option<Uuid>,
    
    /// 创建时间
    pub created_at: DateTime<Utc>,
    
    /// 更新时间
    pub updated_at: DateTime<Utc>,
}

impl Session {
    /// 创建新会话
    /// 
    /// # 参数
    /// - `name`: 会话名称
    /// - `folder_id`: 所属文件夹 ID
    /// 
    /// # 返回
    /// 新创建的会话实例
    pub fn new(name: String, folder_id: Option<Uuid>) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            name,
            folder_id,
            created_at: now,
            updated_at: now,
        }
    }
}

/// 会话创建请求
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateSessionRequest {
    /// 会话名称
    pub name: String,
    
    /// 所属文件夹 ID
    pub folder_id: Option<Uuid>,
}

/// 会话更新请求
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateSessionRequest {
    /// 会话名称
    pub name: Option<String>,
    
    /// 所属文件夹 ID
    pub folder_id: Option<Uuid>,
}