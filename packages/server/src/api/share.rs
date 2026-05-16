//! 分享 API 模块

use axum::{
    extract::{Path, State},
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::AppState;

/// 构建分享路由
pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", post(create_share))
        .route("/received", get(list_received_shares))
        .route("/:id/accept", post(accept_share))
        .route("/:id/updates", get(get_share_updates))
}

/// 创建分享请求
#[derive(Debug, Deserialize)]
struct CreateShareRequest {
    to_user_ids: Vec<Uuid>,
    share_type: String,
    content_id: Uuid,
    include_command_editors: bool,
    allow_forward: bool,
}

/// 分享响应
#[derive(Debug, Serialize)]
struct ShareResponse {
    id: Uuid,
    from_user_id: Uuid,
    share_type: String,
    content_id: Uuid,
}

/// 创建分享
async fn create_share(
    State(_state): State<Arc<AppState>>,
    Json(_request): Json<CreateShareRequest>,
) -> Result<Json<ShareResponse>, StatusCode> {
    // TODO: 创建分享
    Err(StatusCode::NOT_IMPLEMENTED)
}

/// 获取收到的分享列表
async fn list_received_shares(
    State(_state): State<Arc<AppState>>,
) -> Result<Json<Vec<ShareResponse>>, StatusCode> {
    // TODO: 获取收到的分享
    Ok(Json(Vec::new()))
}

/// 接受分享
async fn accept_share(
    State(_state): State<Arc<AppState>>,
    Path(_id): Path<Uuid>,
) -> Result<StatusCode, StatusCode> {
    // TODO: 接受分享
    Ok(StatusCode::OK)
}

/// 获取分享更新
async fn get_share_updates(
    State(_state): State<Arc<AppState>>,
    Path(_id): Path<Uuid>,
) -> Result<Json<ShareResponse>, StatusCode> {
    // TODO: 获取分享更新
    Err(StatusCode::NOT_IMPLEMENTED)
}

use axum::http::StatusCode;
use std::sync::Arc;