//! NexTest 核心库
//!
//! 提供数据模型、业务逻辑和同步引擎等核心功能

pub mod models;
pub mod session;
pub mod command;
pub mod sync;

/// 应用名称常量
pub const APP_NAME: &str = "NexTest";

/// 应用版本
pub const APP_VERSION: &str = env!("CARGO_PKG_VERSION");