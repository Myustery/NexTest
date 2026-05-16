//! 主题数据模型

use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// 主题实体
/// 
/// 用于存储用户界面主题配置
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Theme {
    /// 主题唯一标识符
    pub id: Uuid,
    
    /// 主题名称
    pub name: String,
    
    /// 颜色方案
    pub colors: ColorScheme,
    
    /// 字体配置
    pub font: FontConfig,
    
    /// 背景配置
    pub background: BackgroundConfig,
}

/// 颜色方案
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ColorScheme {
    /// 前景色
    pub foreground: String,
    
    /// 背景色
    pub background: String,
    
    /// 光标颜色
    pub cursor: String,
    
    /// 选中背景色
    pub selection: String,
    
    /// ANSI 颜色（0-15）
    pub ansi: [String; 16],
}

/// 字体配置
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FontConfig {
    /// 字体族
    pub family: String,
    
    /// 字体大小
    pub size: u16,
    
    /// 字体粗细
    pub weight: Option<String>,
    
    /// 行高
    pub line_height: Option<f32>,
}

/// 背景配置
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackgroundConfig {
    /// 背景类型
    pub bg_type: BackgroundType,
    
    /// 背景图片路径（当类型为 Image 时使用）
    pub image_path: Option<String>,
    
    /// 背景透明度（0.0 - 1.0）
    pub opacity: f32,
}

/// 背景类型
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum BackgroundType {
    /// 纯色背景
    Solid,
    
    /// 图片背景
    Image,
    
    /// 渐变背景
    Gradient,
}

impl Theme {
    /// 创建默认主题
    pub fn default_theme() -> Self {
        Self {
            id: Uuid::new_v4(),
            name: String::from("默认主题"),
            colors: ColorScheme::default(),
            font: FontConfig::default(),
            background: BackgroundConfig::default(),
        }
    }
}

impl Default for ColorScheme {
    fn default() -> Self {
        Self {
            foreground: String::from("#cccccc"),
            background: String::from("#1e1e1e"),
            cursor: String::from("#ffffff"),
            selection: String::from("#264f78"),
            ansi: [
                String::from("#000000"), // 黑色
                String::from("#cd0000"), // 红色
                String::from("#00cd00"), // 绿色
                String::from("#cdcd00"), // 黄色
                String::from("#0000ee"), // 蓝色
                String::from("#cd00cd"), // 洋红
                String::from("#00cdcd"), // 青色
                String::from("#e5e5e5"), // 白色
                String::from("#7f7f7f"), // 亮黑
                String::from("#ff0000"), // 亮红
                String::from("#00ff00"), // 亮绿
                String::from("#ffff00"), // 亮黄
                String::from("#5c5cff"), // 亮蓝
                String::from("#ff00ff"), // 亮洋红
                String::from("#00ffff"), // 亮青
                String::from("#ffffff"), // 亮白
            ],
        }
    }
}

impl Default for FontConfig {
    fn default() -> Self {
        Self {
            family: String::from("Consolas, 'Courier New', monospace"),
            size: 14,
            weight: None,
            line_height: Some(1.2),
        }
    }
}

impl Default for BackgroundConfig {
    fn default() -> Self {
        Self {
            bg_type: BackgroundType::Solid,
            image_path: None,
            opacity: 1.0,
        }
    }
}