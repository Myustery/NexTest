//! 管理员 API 模块

pub mod users;
pub mod versions;
pub mod stats;
pub mod config;
pub mod announcements;

use axum::Router;
use std::sync::Arc;

use crate::AppState;

/// 构建管理员路由
pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .nest("/users", users::routes())
        .nest("/versions", versions::routes())
        .nest("/stats", stats::routes())
        .nest("/config", config::routes())
        .nest("/announcements", announcements::routes())
}