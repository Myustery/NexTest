//! 命令工具数据模型

use serde::{Deserialize, Serialize};
use uuid::Uuid;

use super::command_editor::SyntaxType;

/// 命令工具实体
/// 
/// 位于工具侧边栏中，支持 command 和 python 两种语法
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommandTool {
    /// 工具唯一标识符
    pub id: Uuid,
    
    /// 工具名称
    pub name: String,
    
    /// 工具图标（图标名称或图标路径）
    pub icon: String,
    
    /// 语法类型
    pub syntax: SyntaxType,
    
    /// 工具内容
    pub content: String,
    
    /// 执行失败时是否继续执行下一条
    pub continue_on_failure: bool,
}

impl CommandTool {
    /// 创建新命令工具
    /// 
    /// # 参数
    /// - `name`: 工具名称
    /// - `syntax`: 语法类型
    /// 
    /// # 返回
    /// 新创建的命令工具实例
    pub fn new(name: String, syntax: SyntaxType) -> Self {
        Self {
            id: Uuid::new_v4(),
            name,
            icon: String::from("terminal"),
            syntax,
            content: String::new(),
            continue_on_failure: true,
        }
    }
}

/// 命令工具创建请求
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateCommandToolRequest {
    /// 工具名称
    pub name: String,
    
    /// 语法类型
    #[serde(default)]
    pub syntax: SyntaxType,
}

/// 命令工具更新请求
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateCommandToolRequest {
    /// 工具名称
    pub name: Option<String>,
    
    /// 工具图标
    pub icon: Option<String>,
    
    /// 语法类型
    pub syntax: Option<SyntaxType>,
    
    /// 工具内容
    pub content: Option<String>,
    
    /// 执行失败时是否继续执行
    pub continue_on_failure: Option<bool>,
}