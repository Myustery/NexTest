//! 认证 API 模块

use std::sync::Arc;

use axum::{
    extract::State,
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::auth::{generate_token, hash_password, verify_password, JwtConfig};
use crate::db::UserRepo;
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

/// 错误响应
#[derive(Debug, Serialize)]
struct ErrorResponse {
    error: String,
}

/// 用户注册
#[tracing::instrument(skip(state))]
async fn register(
    State(state): State<Arc<AppState>>,
    Json(request): Json<RegisterRequest>,
) -> Result<Json<UserResponse>, (StatusCode, Json<ErrorResponse>)> {
    tracing::info!("用户注册: {}", request.email);

    // 验证邮箱唯一性
    if UserRepo::find_by_email(&state.db_pool, &request.email)
        .await
        .map_err(|e| {
            tracing::error!("数据库查询失败: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    error: "服务器错误".to_string(),
                }),
            )
        })?
        .is_some()
    {
        return Err((
            StatusCode::CONFLICT,
            Json(ErrorResponse {
                error: "邮箱已被注册".to_string(),
            }),
        ));
    }

    // 验证工号唯一性
    if UserRepo::find_by_employee_id(&state.db_pool, &request.employee_id)
        .await
        .map_err(|e| {
            tracing::error!("数据库查询失败: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    error: "服务器错误".to_string(),
                }),
            )
        })?
        .is_some()
    {
        return Err((
            StatusCode::CONFLICT,
            Json(ErrorResponse {
                error: "工号已被注册".to_string(),
            }),
        ));
    }

    // 哈希密码
    let password_hash = hash_password(&request.password).map_err(|e| {
        tracing::error!("密码哈希失败: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: "服务器错误".to_string(),
            }),
        )
    })?;

    // 创建用户
    UserRepo::create(
        &state.db_pool,
        &request.email,
        &request.employee_id,
        &password_hash,
        &request.name,
    )
    .await
    .map_err(|e| {
        tracing::error!("创建用户失败: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: "服务器错误".to_string(),
            }),
        )
    })?;

    tracing::info!("用户注册成功: {}", request.email);

    Ok(Json(UserResponse {
        id: Uuid::new_v4().to_string(),
        email: request.email,
        employee_id: request.employee_id,
        name: request.name,
    }))
}

/// 用户登录
#[tracing::instrument(skip(state))]
async fn login(
    State(state): State<Arc<AppState>>,
    Json(request): Json<LoginRequest>,
) -> Result<Json<LoginResponse>, (StatusCode, Json<ErrorResponse>)> {
    tracing::info!("用户登录: {}", request.email);

    // 查找用户
    let user = UserRepo::find_by_email(&state.db_pool, &request.email)
        .await
        .map_err(|e| {
            tracing::error!("数据库查询失败: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    error: "服务器错误".to_string(),
                }),
            )
        })?
        .ok_or((
            StatusCode::UNAUTHORIZED,
            Json(ErrorResponse {
                error: "邮箱或密码错误".to_string(),
            }),
        ))?;

    // user: (id, email, employee_id, password_hash, name)
    let (user_id, email, employee_id, password_hash, name) = user;

    // 验证密码
    let valid = verify_password(&request.password, &password_hash).map_err(|e| {
        tracing::error!("密码验证失败: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: "服务器错误".to_string(),
            }),
        )
    })?;

    if !valid {
        return Err((
            StatusCode::UNAUTHORIZED,
            Json(ErrorResponse {
                error: "邮箱或密码错误".to_string(),
            }),
        ));
    }

    // 生成 JWT Token
    let jwt_config = JwtConfig::default();
    let token = generate_token(&user_id, &jwt_config).map_err(|e| {
        tracing::error!("生成 Token 失败: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: "服务器错误".to_string(),
            }),
        )
    })?;

    tracing::info!("用户登录成功: {}", user_id);

    Ok(Json(LoginResponse {
        token,
        user: UserResponse {
            id: user_id,
            email,
            employee_id,
            name,
        },
    }))
}

/// 用户登出
async fn logout() -> Result<StatusCode, StatusCode> {
    Ok(StatusCode::OK)
}

/// 获取当前用户信息
async fn get_current_user() -> Result<Json<UserResponse>, (StatusCode, Json<ErrorResponse>)> {
    Err((
        StatusCode::NOT_IMPLEMENTED,
        Json(ErrorResponse {
            error: "暂未实现".to_string(),
        }),
    ))
}