//! 认证 API 模块

use axum::{
    extract::State,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};

use crate::AppState;

/// 构建认证路由
pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/register", post(register))
        .route("/login", post(login))
        .route("/logout", post(logout))
        .route("/me", get(get_current_user))
}

/// 注册请求
#[derive(Debug, Deserialize)]
struct RegisterRequest {
    email: String,
    employee_id: String,
    password: String,
    name: String,
}

/// 登录请求
#[derive(Debug, Deserialize)]
struct LoginRequest {
    email: String,
    password: String,
}

/// 用户信息响应
#[derive(Debug, Serialize)]
struct UserResponse {
    id: String,
    email: String,
    employee_id: String,
    name: String,
}

/// 登录响应
#[derive(Debug, Serialize)]
struct LoginResponse {
    token: String,
    user: UserResponse,
}

/// 用户注册
#[tracing::instrument(skip(state))]
async fn register(
    State(state): State<Arc<AppState>>,
    Json(request): Json<RegisterRequest>,
) -> Result<Json<UserResponse>, StatusCode> {
    tracing::info!("用户注册: {}", request.email);

    // TODO: 实现注册逻辑
    // 1. 验证邮箱和工号唯一性
    // 2. 密码哈希
    // 3. 创建用户

    Err(StatusCode::NOT_IMPLEMENTED)
}

/// 用户登录
#[tracing::instrument(skip(state))]
async fn login(
    State(state): State<Arc<AppState>>,
    Json(request): Json<LoginRequest>,
) -> Result<Json<LoginResponse>, StatusCode> {
    tracing::info!("用户登录: {}", request.email);

    // TODO: 实现登录逻辑
    // 1. 验证邮箱和密码
    // 2. 生成 JWT Token

    Err(StatusCode::NOT_IMPLEMENTED)
}

/// 用户登出
async fn logout() -> Result<StatusCode, StatusCode> {
    // TODO: 实现 Token 失效逻辑
    Ok(StatusCode::OK)
}

/// 获取当前用户信息
async fn get_current_user() -> Result<Json<UserResponse>, StatusCode> {
    // TODO: 从 Token 获取用户信息
    Err(StatusCode::NOT_IMPLEMENTED)
}

use axum::http::StatusCode;