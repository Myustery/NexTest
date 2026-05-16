//! Tab 数据模型

use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Tab 实体
/// 
/// 代表一个终端 Tab，与 Session 一对一映射
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tab {
    /// Tab 唯一标识符
    pub id: Uuid,
    
    /// 关联的会话 ID
    pub session_id: Uuid,
    
    /// Tab 名称
    pub name: String,
    
    /// 终端配置
    pub terminal_config: TerminalConfig,
    
    /// 命令编辑页签列表
    pub command_editors: Vec<CommandEditorTabRef>,
}

/// 终端配置
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TerminalConfig {
    /// 终端类型（如 cmd、powershell、bash 等）
    pub shell_type: String,
    
    /// 字体大小
    pub font_size: u16,
    
    /// 字体族
    pub font_family: String,
}

/// 命令编辑页签引用
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommandEditorTabRef {
    /// 命令编辑页签 ID
    pub id: Uuid,
    
    /// 页签名称
    pub name: String,
}

impl Tab {
    /// 创建新 Tab
    /// 
    /// # 参数
    /// - `session_id`: 关联的会话 ID
    /// - `name`: Tab 名称
    /// 
    /// # 返回
    /// 新创建的 Tab 实例
    pub fn new(session_id: Uuid, name: String) -> Self {
        Self {
            id: Uuid::new_v4(),
            session_id,
            name,
            terminal_config: TerminalConfig::default(),
            command_editors: Vec::new(),
        }
    }
}

impl Default for TerminalConfig {
    fn default() -> Self {
        Self {
            shell_type: String::from("cmd"),
            font_size: 14,
            font_family: String::from("Consolas, 'Courier New', monospace"),
        }
    }
}