//! 会话 API 模块

use std::sync::Arc;

use axum::{
    extract::State,
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::db::{SessionRepo, FolderRepo};
use crate::AppState;

/// 构建会话路由
pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", get(list_sessions).post(create_session))
        .route("/:id", get(get_session))
}

/// 会话响应
#[derive(Debug, Serialize)]
struct SessionResponse {
    id: String,
    name: String,
    folder_id: Option<String>,
    created_at: i64,
    updated_at: i64,
}

/// 创建会话请求
#[derive(Debug, Deserialize)]
struct CreateSessionRequest {
    name: String,
    folder_id: Option<String>,
}

/// 错误响应
#[derive(Debug, Serialize)]
struct ErrorResponse {
    error: String,
}

/// 获取会话列表
async fn list_sessions() -> Result<Json<Vec<SessionResponse>>, StatusCode> {
    Ok(Json(Vec::new()))
}

/// 创建会话
async fn create_session(
    State(state): State<Arc<AppState>>,
    Json(request): Json<CreateSessionRequest>,
) -> Result<Json<SessionResponse>, StatusCode> {
    let user_id = Uuid::nil();
    let folder_id = request.folder_id.as_ref().and_then(|f| Uuid::parse_str(f).ok());

    SessionRepo::create(&state.db_pool, user_id, &request.name, folder_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(SessionResponse {
        id: Uuid::new_v4().to_string(),
        name: request.name,
        folder_id: request.folder_id,
        created_at: chrono::Utc::now().timestamp(),
        updated_at: chrono::Utc::now().timestamp(),
    }))
}

/// 获取单个会话
async fn get_session() -> Result<Json<SessionResponse>, StatusCode> {
    Err(StatusCode::NOT_IMPLEMENTED)
}