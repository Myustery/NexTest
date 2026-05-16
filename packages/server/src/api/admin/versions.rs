//! 管理员 - 版本管理 API

use std::sync::Arc;

use axum::{
    extract::{Path, State},
    http::StatusCode,
    routing::{delete, get, patch, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};

use crate::AppState;

/// 构建版本管理路由
pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", get(list_versions).post(create_version))
        .route("/:id", patch(update_version).delete(delete_version))
}

/// 版本信息
#[derive(Debug, Serialize)]
struct VersionInfo {
    id: String,
    version: String,
    platform: String,
    release_date: i64,
    changelog: String,
    size: u64,
    active: bool,
}

/// 创建版本请求
#[derive(Debug, Deserialize)]
struct CreateVersionRequest {
    version: String,
    platform: String,
    changelog: String,
}

/// 更新版本请求
#[derive(Debug, Deserialize)]
struct UpdateVersionRequest {
    changelog: Option<String>,
    active: Option<bool>,
}

/// 错误响应
#[derive(Debug, Serialize)]
struct ErrorResponse {
    error: String,
}

/// 获取版本列表
async fn list_versions(
    State(_state): State<Arc<AppState>>,
) -> Result<Json<Vec<VersionInfo>>, (StatusCode, Json<ErrorResponse>)> {
    Ok(Json(Vec::new()))
}

/// 创建新版本
async fn create_version(
    State(_state): State<Arc<AppState>>,
    Json(_request): Json<CreateVersionRequest>,
) -> Result<Json<VersionInfo>, (StatusCode, Json<ErrorResponse>)> {
    Err((
        StatusCode::NOT_IMPLEMENTED,
        Json(ErrorResponse {
            error: "暂未实现".to_string(),
        }),
    ))
}

/// 更新版本
async fn update_version(
    State(_state): State<Arc<AppState>>,
    Path(_id): Path<String>,
    Json(_request): Json<UpdateVersionRequest>,
) -> Result<StatusCode, (StatusCode, Json<ErrorResponse>)> {
    Ok(StatusCode::OK)
}

/// 删除版本
async fn delete_version(
    State(_state): State<Arc<AppState>>,
    Path(_id): Path<String>,
) -> Result<StatusCode, (StatusCode, Json<ErrorResponse>)> {
    Ok(StatusCode::NO_CONTENT)
}