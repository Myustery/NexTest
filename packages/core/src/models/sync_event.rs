//! 同步事件数据模型

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// 同步事件类型
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum SyncEventType {
    /// 创建
    Create,
    
    /// 更新
    Update,
    
    /// 删除
    Delete,
}

/// 同步实体类型
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum SyncEntityType {
    /// 会话
    Session,
    
    /// Tab
    Tab,
    
    /// 命令工具
    CommandTool,
    
    /// 文件夹
    Folder,
}

/// 同步事件实体
/// 
/// 用于记录数据变更，支持多端同步
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncEvent {
    /// 事件唯一标识符
    pub id: Uuid,
    
    /// 用户 ID
    pub user_id: Uuid,
    
    /// 设备 ID
    pub device_id: String,
    
    /// 事件类型
    pub event_type: SyncEventType,
    
    /// 实体类型
    pub entity_type: SyncEntityType,
    
    /// 实体 ID
    pub entity_id: Uuid,
    
    /// 事件负载数据
    pub payload: serde_json::Value,
    
    /// 版本号（用于冲突检测）
    pub version: u64,
    
    /// 事件时间戳
    pub timestamp: DateTime<Utc>,
}

impl SyncEvent {
    /// 创建新同步事件
    /// 
    /// # 参数
    /// - `user_id`: 用户 ID
    /// - `device_id`: 设备 ID
    /// - `event_type`: 事件类型
    /// - `entity_type`: 实体类型
    /// - `entity_id`: 实体 ID
    /// - `payload`: 事件负载
    /// - `version`: 版本号
    /// 
    /// # 返回
    /// 新创建的同步事件实例
    pub fn new(
        user_id: Uuid,
        device_id: String,
        event_type: SyncEventType,
        entity_type: SyncEntityType,
        entity_id: Uuid,
        payload: serde_json::Value,
        version: u64,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            user_id,
            device_id,
            event_type,
            entity_type,
            entity_id,
            payload,
            version,
            timestamp: Utc::now(),
        }
    }
}