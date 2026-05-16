//! 命令编辑页签数据模型

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// 命令语法类型
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum SyntaxType {
    /// 命令模式：逐行发送命令到终端
    Command,
    
    /// Python 模式：调用系统 Python 解释器
    Python,
}

impl Default for SyntaxType {
    fn default() -> Self {
        Self::Command
    }
}

/// 命令编辑页签实体
/// 
/// 每个终端可对应一个或多个命令编辑页签
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommandEditorTab {
    /// 页签唯一标识符
    pub id: Uuid,
    
    /// 页签名称
    pub name: String,
    
    /// 页签内容
    pub content: String,
    
    /// 语法类型
    pub syntax: SyntaxType,
    
    /// 创建时间
    pub created_at: DateTime<Utc>,
}

impl CommandEditorTab {
    /// 创建新命令编辑页签
    /// 
    /// # 参数
    /// - `name`: 页签名称
    /// - `syntax`: 语法类型
    /// 
    /// # 返回
    /// 新创建的命令编辑页签实例
    pub fn new(name: String, syntax: SyntaxType) -> Self {
        Self {
            id: Uuid::new_v4(),
            name,
            content: String::new(),
            syntax,
            created_at: Utc::now(),
        }
    }
}

/// 命令编辑页签创建请求
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateCommandEditorTabRequest {
    /// 页签名称
    pub name: String,
    
    /// 语法类型
    #[serde(default)]
    pub syntax: SyntaxType,
}

/// 命令编辑页签更新请求
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateCommandEditorTabRequest {
    /// 页签名称
    pub name: Option<String>,
    
    /// 页签内容
    pub content: Option<String>,
    
    /// 语法类型
    pub syntax: Option<SyntaxType>,
}