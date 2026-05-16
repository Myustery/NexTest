//! 管理员 - 数据统计 API

use std::sync::Arc;

use axum::{
    extract::State,
    routing::get,
    Json, Router,
};
use serde::Serialize;

use crate::AppState;

/// 构建数据统计路由
pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/overview", get(get_overview))
        .route("/users", get(get_user_stats))
        .route("/usage", get(get_usage_stats))
        .route("/devices", get(get_device_stats))
}

/// 概览统计
#[derive(Debug, Serialize)]
struct OverviewStats {
    total_users: i64,
    today_active_users: i64,
    total_sessions: i64,
    total_devices: i64,
}

/// 用户统计
#[derive(Debug, Serialize)]
struct UserStats {
    new_users_today: i64,
    new_users_week: i64,
    new_users_month: i64,
    growth_rate: f64,
}

/// 使用统计
#[derive(Debug, Serialize)]
struct UsageStats {
    total_sessions: i64,
    avg_sessions_per_user: f64,
    peak_concurrent: i64,
}

/// 设备统计
#[derive(Debug, Serialize)]
struct DeviceStats {
    windows: i64,
    macos: i64,
    linux: i64,
    web: i64,
}

/// 错误响应
#[derive(Debug, Serialize)]
struct ErrorResponse {
    error: String,
}

/// 获取概览统计
async fn get_overview(
    State(_state): State<Arc<AppState>>,
) -> Result<Json<OverviewStats>, (StatusCode, Json<ErrorResponse>)> {
    Ok(Json(OverviewStats {
        total_users: 0,
        today_active_users: 0,
        total_sessions: 0,
        total_devices: 0,
    }))
}

/// 获取用户统计
async fn get_user_stats(
    State(_state): State<Arc<AppState>>,
) -> Result<Json<UserStats>, (StatusCode, Json<ErrorResponse>)> {
    Ok(Json(UserStats {
        new_users_today: 0,
        new_users_week: 0,
        new_users_month: 0,
        growth_rate: 0.0,
    }))
}

/// 获取使用统计
async fn get_usage_stats(
    State(_state): State<Arc<AppState>>,
) -> Result<Json<UsageStats>, (StatusCode, Json<ErrorResponse>)> {
    Ok(Json(UsageStats {
        total_sessions: 0,
        avg_sessions_per_user: 0.0,
        peak_concurrent: 0,
    }))
}

/// 获取设备统计
async fn get_device_stats(
    State(_state): State<Arc<AppState>>,
) -> Result<Json<DeviceStats>, (StatusCode, Json<ErrorResponse>)> {
    Ok(Json(DeviceStats {
        windows: 0,
        macos: 0,
        linux: 0,
        web: 0,
    }))
}

use axum::http::StatusCode;