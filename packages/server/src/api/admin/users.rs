//! 管理员 - 用户管理 API

use std::sync::Arc;

use axum::{
    extract::{Path, State},
    http::StatusCode,
    routing::{delete, get, patch, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};

use crate::AppState;

/// 构建用户管理路由
pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", get(list_users))
        .route("/:id", get(get_user).patch(update_user).delete(delete_user))
        .route("/:id/reset-pwd", post(reset_password))
}

/// 用户列表响应
#[derive(Debug, Serialize)]
struct UserListItem {
    id: String,
    email: String,
    employee_id: String,
    name: String,
    status: String,
    created_at: i64,
}

/// 用户详情响应
#[derive(Debug, Serialize)]
struct UserDetail {
    id: String,
    email: String,
    employee_id: String,
    name: String,
    status: String,
    created_at: i64,
    session_count: i32,
    device_count: i32,
}

/// 更新用户请求
#[derive(Debug, Deserialize)]
struct UpdateUserRequest {
    name: Option<String>,
    status: Option<String>,
}

/// 错误响应
#[derive(Debug, Serialize)]
struct ErrorResponse {
    error: String,
}

/// 获取用户列表
async fn list_users(
    State(_state): State<Arc<AppState>>,
) -> Result<Json<Vec<UserListItem>>, (StatusCode, Json<ErrorResponse>)> {
    // TODO: 从数据库获取用户列表
    Ok(Json(Vec::new()))
}

/// 获取用户详情
async fn get_user(
    State(_state): State<Arc<AppState>>,
    Path(_id): Path<String>,
) -> Result<Json<UserDetail>, (StatusCode, Json<ErrorResponse>)> {
    Err((
        StatusCode::NOT_IMPLEMENTED,
        Json(ErrorResponse {
            error: "暂未实现".to_string(),
        }),
    ))
}

/// 更新用户（禁用/启用/修改信息）
async fn update_user(
    State(_state): State<Arc<AppState>>,
    Path(_id): Path<String>,
    Json(_request): Json<UpdateUserRequest>,
) -> Result<StatusCode, (StatusCode, Json<ErrorResponse>)> {
    Ok(StatusCode::OK)
}

/// 删除用户
async fn delete_user(
    State(_state): State<Arc<AppState>>,
    Path(_id): Path<String>,
) -> Result<StatusCode, (StatusCode, Json<ErrorResponse>)> {
    Ok(StatusCode::NO_CONTENT)
}

/// 重置用户密码
async fn reset_password(
    State(_state): State<Arc<AppState>>,
    Path(_id): Path<String>,
) -> Result<StatusCode, (StatusCode, Json<ErrorResponse>)> {
    Ok(StatusCode::OK)
}