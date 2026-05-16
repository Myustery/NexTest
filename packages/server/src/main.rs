//! NexTest 后端服务
//!
//! 基于 Axum 框架实现的 Web 服务，提供 API 和 WebSocket 支持

pub mod api;
pub mod auth;
pub mod db;
pub mod sync;
pub mod ws;

use std::net::SocketAddr;
use std::sync::Arc;

use axum::{
    routing::get,
    Router,
};
use tower_http::cors::CorsLayer;
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

/// 应用名称常量
const APP_NAME: &str = "NexTest";

/// 应用状态
#[derive(Debug, Clone)]
pub struct AppState {
    /// 数据库连接池
    pub db_pool: sqlx::SqlitePool,
}

/// 启动服务器
#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // 初始化日志
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "debug".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    tracing::info!("{} 服务启动中...", APP_NAME);

    // 初始化数据库
    let db_url = std::env::var("DATABASE_URL").unwrap_or_else(|_| "sqlite:nextest.db".into());
    let db_pool = sqlx::sqlite::SqlitePoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await?;

    tracing::info!("数据库连接成功");

    // 运行数据库迁移
    sqlx::migrate!("./migrations")
        .run(&db_pool)
        .await?;

    tracing::info!("数据库迁移完成");

    // 创建应用状态
    let state = Arc::new(AppState { db_pool });

    // 构建路由
    let app = Router::new()
        // 健康检查
        .route("/health", get(health_check))
        // API 路由
        .nest("/api", api::routes())
        // WebSocket 路由
        .route("/ws/sync", get(ws::sync_handler))
        // 中间件
        .layer(CorsLayer::permissive())
        .layer(TraceLayer::new_for_http())
        .with_state(state);

    // 绑定地址
    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    tracing::info!("服务器监听: {}", addr);

    // 启动服务器
    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

/// 健康检查端点
async fn health_check() -> &'static str {
    "OK"
}