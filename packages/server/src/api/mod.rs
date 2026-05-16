//! API 路由模块

use std::sync::Arc;

use axum::Router;

use super::AppState;

pub mod auth;
pub mod session;
pub mod share;
pub mod version;
pub mod admin;

/// 构建 API 路由
pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .nest("/auth", auth::routes())
        .nest("/sessions", session::routes())
        .nest("/shares", share::routes())
        .nest("/version", version::routes())
        .nest("/admin", admin::routes())
}