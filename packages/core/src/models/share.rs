//! 分享数据模型

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// 分享类型
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum ShareType {
    /// 会话分享
    Session,
    
    /// 命令工具分享
    CommandTool,
}

/// 分享实体
/// 
/// 用于分享会话或命令工具给其他用户
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Share {
    /// 分享唯一标识符
    pub id: Uuid,
    
    /// 分享发起者用户 ID
    pub from_user_id: Uuid,
    
    /// 分享接收者用户 ID 列表
    pub to_user_ids: Vec<Uuid>,
    
    /// 分享类型
    pub share_type: ShareType,
    
    /// 分享内容 ID（会话 ID 或命令工具 ID）
    pub content_id: Uuid,
    
    /// 分享内容快照
    pub content_snapshot: serde_json::Value,
    
    /// 是否携带命令编辑页签内容
    pub include_command_editors: bool,
    
    /// 是否允许继续分享
    pub allow_forward: bool,
    
    /// 版本号（用于追踪更新）
    pub version: u64,
    
    /// 创建时间
    pub created_at: DateTime<Utc>,
}

impl Share {
    /// 创建新分享
    /// 
    /// # 参数
    /// - `from_user_id`: 分享发起者用户 ID
    /// - `to_user_ids`: 分享接收者用户 ID 列表
    /// - `share_type`: 分享类型
    /// - `content_id`: 分享内容 ID
    /// - `content_snapshot`: 分享内容快照
    /// 
    /// # 返回
    /// 新创建的分享实例
    pub fn new(
        from_user_id: Uuid,
        to_user_ids: Vec<Uuid>,
        share_type: ShareType,
        content_id: Uuid,
        content_snapshot: serde_json::Value,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            from_user_id,
            to_user_ids,
            share_type,
            content_id,
            content_snapshot,
            include_command_editors: false,
            allow_forward: true,
            version: 1,
            created_at: Utc::now(),
        }
    }
}

/// 分享创建请求
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateShareRequest {
    /// 分享接收者用户 ID 列表
    pub to_user_ids: Vec<Uuid>,
    
    /// 分享类型
    pub share_type: ShareType,
    
    /// 分享内容 ID
    pub content_id: Uuid,
    
    /// 是否携带命令编辑页签内容
    #[serde(default)]
    pub include_command_editors: bool,
    
    /// 是否允许继续分享
    #[serde(default = "default_allow_forward")]
    pub allow_forward: bool,
}

fn default_allow_forward() -> bool {
    true
}