//! 会话 API 模块

use axum::{
    extract::{Path, State},
    routing::{delete, get, patch, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::AppState;

/// 构建会话路由
pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", get(list_sessions).post(create_session))
        .route("/:id", get(get_session).patch(update_session).delete(delete_session))
}

/// 会话响应
#[derive(Debug, Serialize)]
struct SessionResponse {
    id: Uuid,
    name: String,
    folder_id: Option<Uuid>,
}

/// 创建会话请求
#[derive(Debug, Deserialize)]
struct CreateSessionRequest {
    name: String,
    folder_id: Option<Uuid>,
}

/// 更新会话请求
#[derive(Debug, Deserialize)]
struct UpdateSessionRequest {
    name: Option<String>,
    folder_id: Option<Uuid>,
}

/// 获取会话列表
async fn list_sessions(
    State(_state): State<Arc<AppState>>,
) -> Result<Json<Vec<SessionResponse>>, StatusCode> {
    // TODO: 从数据库获取会话列表
    Ok(Json(Vec::new()))
}

/// 创建会话
async fn create_session(
    State(_state): State<Arc<AppState>>,
    Json(_request): Json<CreateSessionRequest>,
) -> Result<Json<SessionResponse>, StatusCode> {
    // TODO: 创建会话
    Err(StatusCode::NOT_IMPLEMENTED)
}

/// 获取单个会话
async fn get_session(
    State(_state): State<Arc<AppState>>,
    Path(_id): Path<Uuid>,
) -> Result<Json<SessionResponse>, StatusCode> {
    // TODO: 获取会话详情
    Err(StatusCode::NOT_IMPLEMENTED)
}

/// 更新会话
async fn update_session(
    State(_state): State<Arc<AppState>>,
    Path(_id): Path<Uuid>,
    Json(_request): Json<UpdateSessionRequest>,
) -> Result<Json<SessionResponse>, StatusCode> {
    // TODO: 更新会话
    Err(StatusCode::NOT_IMPLEMENTED)
}

/// 删除会话
async fn delete_session(
    State(_state): State<Arc<AppState>>,
    Path(_id): Path<Uuid>,
) -> Result<StatusCode, StatusCode> {
    // TODO: 删除会话
    Ok(StatusCode::NO_CONTENT)
}

use axum::http::StatusCode;
use std::sync::Arc;