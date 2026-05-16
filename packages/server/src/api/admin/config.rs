//! 管理员 - 系统配置 API

use std::sync::Arc;

use axum::{
    extract::State,
    http::StatusCode,
    routing::get,
    Json, Router,
};
use serde::{Deserialize, Serialize};

use crate::AppState;

/// 构建系统配置路由
pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", get(get_config))
}

/// 系统配置
#[derive(Debug, Serialize, Deserialize)]
struct SystemConfig {
    system_name: String,
    check_update_frequency: String,
    max_upload_size: String,
}

/// 错误响应
#[derive(Debug, Serialize)]
struct ErrorResponse {
    error: String,
}

/// 获取系统配置
async fn get_config(
    State(_state): State<Arc<AppState>>,
) -> Result<Json<SystemConfig>, (StatusCode, Json<ErrorResponse>)> {
    Ok(Json(SystemConfig {
        system_name: "NexTest".to_string(),
        check_update_frequency: "daily".to_string(),
        max_upload_size: "104857600".to_string(),
    }))
}

/// 更新系统配置
async fn update_config(
    State(_state): State<Arc<AppState>>,
    Json(_config): Json<SystemConfig>,
) -> Result<StatusCode, (StatusCode, Json<ErrorResponse>)> {
    Ok(StatusCode::OK)
}