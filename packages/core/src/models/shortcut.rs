//! 快捷键数据模型

use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// 快捷键实体
/// 
/// 存储用户自定义快捷键配置
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Shortcut {
    /// 快捷键唯一标识符
    pub id: Uuid,
    
    /// 快捷键组合（如 "Ctrl+Shift+T"）
    pub key: String,
    
    /// 关联的动作
    pub action: ShortcutAction,
    
    /// 是否启用
    pub enabled: bool,
}

/// 快捷键动作
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum ShortcutAction {
    /// 新建会话
    NewSession,
    
    /// 关闭当前会话
    CloseSession,
    
    /// 切换到下一个会话
    NextSession,
    
    /// 切换到上一个会话
    PrevSession,
    
    /// 分屏（水平）
    SplitHorizontal,
    
    /// 分屏（垂直）
    SplitVertical,
    
    /// 关闭分屏
    CloseSplit,
    
    /// 切换全屏
    ToggleFullscreen,
    
    /// 打开设置
    OpenSettings,
    
    /// 搜索终端
    SearchTerminal,
    
    /// 清空终端
    ClearTerminal,
    
    /// 新建命令编辑页签
    NewCommandEditor,
    
    /// 执行命令
    ExecuteCommand,
    
    /// 停止命令执行
    StopCommand,
}

impl Shortcut {
    /// 创建新快捷键
    /// 
    /// # 参数
    /// - `key`: 快捷键组合
    /// - `action`: 关联的动作
    /// 
    /// # 返回
    /// 新创建的快捷键实例
    pub fn new(key: String, action: ShortcutAction) -> Self {
        Self {
            id: Uuid::new_v4(),
            key,
            action,
            enabled: true,
        }
    }
}

/// 快捷键更新请求
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateShortcutRequest {
    /// 快捷键组合
    pub key: Option<String>,
    
    /// 是否启用
    pub enabled: Option<bool>,
}

/// 默认快捷键配置
impl Shortcut {
    /// 获取默认快捷键列表
    pub fn defaults() -> Vec<Self> {
        vec![
            Self::new(String::from("Ctrl+Shift+T"), ShortcutAction::NewSession),
            Self::new(String::from("Ctrl+W"), ShortcutAction::CloseSession),
            Self::new(String::from("Ctrl+Tab"), ShortcutAction::NextSession),
            Self::new(String::from("Ctrl+Shift+Tab"), ShortcutAction::PrevSession),
            Self::new(String::from("Ctrl+\\"), ShortcutAction::SplitHorizontal),
            Self::new(String::from("Ctrl+Shift+\\"), ShortcutAction::SplitVertical),
            Self::new(String::from("F11"), ShortcutAction::ToggleFullscreen),
            Self::new(String::from("Ctrl+,"), ShortcutAction::OpenSettings),
            Self::new(String::from("Ctrl+F"), ShortcutAction::SearchTerminal),
            Self::new(String::from("Ctrl+L"), ShortcutAction::ClearTerminal),
            Self::new(String::from("Ctrl+Enter"), ShortcutAction::ExecuteCommand),
            Self::new(String::from("Ctrl+C"), ShortcutAction::StopCommand),
        ]
    }
}