//! 管理员 - 公告管理 API

use std::sync::Arc;

use axum::{
    extract::{Path, State},
    http::StatusCode,
    routing::{delete, get, patch, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};

use crate::AppState;

/// 构建公告管理路由
pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", get(list_announcements).post(create_announcement))
        .route("/:id", patch(update_announcement).delete(delete_announcement))
}

/// 公告信息
#[derive(Debug, Serialize)]
struct AnnouncementInfo {
    id: String,
    title: String,
    content: String,
    #[serde(rename = "type")]
    announcement_type: String,
    published: bool,
    created_at: i64,
}

/// 创建公告请求
#[derive(Debug, Deserialize)]
struct CreateAnnouncementRequest {
    title: String,
    content: String,
    #[serde(rename = "type")]
    announcement_type: String,
}

/// 更新公告请求
#[derive(Debug, Deserialize)]
struct UpdateAnnouncementRequest {
    title: Option<String>,
    content: Option<String>,
    #[serde(rename = "type")]
    announcement_type: Option<String>,
    published: Option<bool>,
}

/// 错误响应
#[derive(Debug, Serialize)]
struct ErrorResponse {
    error: String,
}

/// 获取公告列表
async fn list_announcements(
    State(_state): State<Arc<AppState>>,
) -> Result<Json<Vec<AnnouncementInfo>>, (StatusCode, Json<ErrorResponse>)> {
    Ok(Json(Vec::new()))
}

/// 创建公告
async fn create_announcement(
    State(_state): State<Arc<AppState>>,
    Json(_request): Json<CreateAnnouncementRequest>,
) -> Result<Json<AnnouncementInfo>, (StatusCode, Json<ErrorResponse>)> {
    Err((
        StatusCode::NOT_IMPLEMENTED,
        Json(ErrorResponse {
            error: "暂未实现".to_string(),
        }),
    ))
}

/// 更新公告
async fn update_announcement(
    State(_state): State<Arc<AppState>>,
    Path(_id): Path<String>,
    Json(_request): Json<UpdateAnnouncementRequest>,
) -> Result<StatusCode, (StatusCode, Json<ErrorResponse>)> {
    Ok(StatusCode::OK)
}

/// 删除公告
async fn delete_announcement(
    State(_state): State<Arc<AppState>>,
    Path(_id): Path<String>,
) -> Result<StatusCode, (StatusCode, Json<ErrorResponse>)> {
    Ok(StatusCode::NO_CONTENT)
}