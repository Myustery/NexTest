//! 版本信息数据模型

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

/// 平台类型
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Platform {
    /// Windows
    Windows,
    
    /// macOS
    Macos,
    
    /// Linux
    Linux,
}

/// 更新类型
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum UpdateType {
    /// 全量更新
    Full,
    
    /// 增量更新
    Incremental,
}

/// 版本信息实体
/// 
/// 用于存储应用版本信息，支持自动更新功能
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Version {
    /// 版本号（如 "1.0.0"）
    pub version: String,
    
    /// 发布日期
    pub release_date: DateTime<Utc>,
    
    /// 更新日志
    pub changelog: String,
    
    /// 下载地址
    pub download_url: String,
    
    /// 签名
    pub signature: String,
    
    /// 文件哈希
    pub hash: String,
    
    /// 文件大小（字节）
    pub size: u64,
    
    /// 目标平台
    pub platform: Platform,
    
    /// 更新类型
    pub update_type: UpdateType,
}

impl Version {
    /// 创建新版本信息
    /// 
    /// # 参数
    /// - `version`: 版本号
    /// - `changelog`: 更新日志
    /// - `download_url`: 下载地址
    /// - `platform`: 目标平台
    /// - `size`: 文件大小
    /// 
    /// # 返回
    /// 新创建的版本信息实例
    pub fn new(
        version: String,
        changelog: String,
        download_url: String,
        platform: Platform,
        size: u64,
    ) -> Self {
        Self {
            version,
            release_date: Utc::now(),
            changelog,
            download_url,
            signature: String::new(),
            hash: String::new(),
            size,
            platform,
            update_type: UpdateType::Full,
        }
    }
}

/// 版本检查请求
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CheckVersionRequest {
    /// 当前版本
    pub current_version: String,
    
    /// 目标平台
    pub platform: Platform,
}

/// 版本检查响应
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CheckVersionResponse {
    /// 是否有新版本
    pub has_update: bool,
    
    /// 最新版本信息（如果有更新）
    pub latest_version: Option<Version>,
}