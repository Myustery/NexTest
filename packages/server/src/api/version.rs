//! 版本 API 模块

use axum::{
    extract::State,
    routing::get,
    Json, Router,
};
use serde::{Deserialize, Serialize};

use crate::AppState;

/// 构建版本路由
pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/check", get(check_version))
        .route("/download/:version", get(download_version))
        .route("/diff/:from/:to", get(get_diff))
}

/// 版本检查请求
#[derive(Debug, Deserialize)]
struct CheckVersionRequest {
    current_version: String,
    platform: String,
}

/// 版本检查响应
#[derive(Debug, Serialize)]
struct CheckVersionResponse {
    has_update: bool,
    latest_version: Option<VersionInfo>,
}

/// 版本信息
#[derive(Debug, Serialize)]
struct VersionInfo {
    version: String,
    changelog: String,
    download_url: String,
    size: u64,
}

/// 检查版本更新
async fn check_version(
    State(_state): State<Arc<AppState>>,
) -> Result<Json<CheckVersionResponse>, StatusCode> {
    // TODO: 检查版本
    Ok(Json(CheckVersionResponse {
        has_update: false,
        latest_version: None,
    }))
}

/// 下载版本
async fn download_version() -> Result<StatusCode, StatusCode> {
    // TODO: 下载版本
    Err(StatusCode::NOT_IMPLEMENTED)
}

/// 获取增量更新包
async fn get_diff() -> Result<StatusCode, StatusCode> {
    // TODO: 获取增量更新
    Err(StatusCode::NOT_IMPLEMENTED)
}

use axum::http::StatusCode;
use std::sync::Arc;