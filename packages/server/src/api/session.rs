//! 会话 API 模块

use std::sync::Arc;

use axum::{
    extract::{Path, State},
    http::StatusCode,
    routing::{delete, get, patch, post},
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
        .route(
            "/:id",
            get(get_session).patch(update_session).delete(delete_session),
        )
        // 文件夹路由
        .route("/folders", get(list_folders).post(create_folder))
        .route(
            "/folders/:id",
            patch(update_folder).delete(delete_folder),
        )
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

/// 文件夹响应
#[derive(Debug, Serialize)]
struct FolderResponse {
    id: String,
    name: String,
    parent_id: Option<String>,
    order: i32,
}

/// 创建会话请求
#[derive(Debug, Deserialize)]
struct CreateSessionRequest {
    name: String,
    folder_id: Option<String>,
}

/// 更新会话请求
#[derive(Debug, Deserialize)]
struct UpdateSessionRequest {
    name: Option<String>,
    folder_id: Option<String>,
}

/// 创建文件夹请求
#[derive(Debug, Deserialize)]
struct CreateFolderRequest {
    name: String,
    parent_id: Option<String>,
}

/// 更新文件夹请求
#[derive(Debug, Deserialize)]
struct UpdateFolderRequest {
    name: Option<String>,
    parent_id: Option<String>,
    order: Option<i32>,
}

/// 错误响应
#[derive(Debug, Serialize)]
struct ErrorResponse {
    error: String,
}

/// 获取会话列表
async fn list_sessions(
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<SessionResponse>>, (StatusCode, Json<ErrorResponse>)> {
    // TODO: 从 Token 获取用户 ID
    let user_id = Uuid::parse_str("00000000-0000-0000-0000-000000000000").unwrap();

    let sessions = SessionRepo::find_by_user(&state.db_pool, user_id)
        .await
        .map_err(|e| {
            tracing::error!("获取会话列表失败: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    error: "服务器错误".to_string(),
                }),
            )
        })?;

    let response: Vec<SessionResponse> = sessions
        .into_iter()
        .map(|s| SessionResponse {
            id: s.id.to_string(),
            name: s.name,
            folder_id: s.folder_id.map(|f| f.to_string()),
            created_at: s.created_at.timestamp(),
            updated_at: s.updated_at.timestamp(),
        })
        .collect();

    Ok(Json(response))
}

/// 创建会话
async fn create_session(
    State(state): State<Arc<AppState>>,
    Json(request): Json<CreateSessionRequest>,
) -> Result<Json<SessionResponse>, (StatusCode, Json<ErrorResponse>)> {
    // TODO: 从 Token 获取用户 ID
    let user_id = Uuid::parse_str("00000000-0000-0000-0000-000000000000").unwrap();
    let folder_id = request.folder_id.and_then(|f| Uuid::parse_str(&f).ok());

    let session = SessionRepo::create(&state.db_pool, user_id, &request.name, folder_id)
        .await
        .map_err(|e| {
            tracing::error!("创建会话失败: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    error: "服务器错误".to_string(),
                }),
            )
        })?;

    Ok(Json(SessionResponse {
        id: session.id.to_string(),
        name: session.name,
        folder_id: session.folder_id.map(|f| f.to_string()),
        created_at: session.created_at.timestamp(),
        updated_at: session.updated_at.timestamp(),
    }))
}

/// 获取单个会话
async fn get_session(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> Result<Json<SessionResponse>, (StatusCode, Json<ErrorResponse>)> {
    let session_id = Uuid::parse_str(&id).map_err(|_| {
        (
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse {
                error: "无效的会话 ID".to_string(),
            }),
        )
    })?;

    let session = SessionRepo::find_by_id(&state.db_pool, session_id)
        .await
        .map_err(|e| {
            tracing::error!("获取会话失败: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    error: "服务器错误".to_string(),
                }),
            )
        })?
        .ok_or((
            StatusCode::NOT_FOUND,
            Json(ErrorResponse {
                error: "会话不存在".to_string(),
            }),
        ))?;

    Ok(Json(SessionResponse {
        id: session.id.to_string(),
        name: session.name,
        folder_id: session.folder_id.map(|f| f.to_string()),
        created_at: session.created_at.timestamp(),
        updated_at: session.updated_at.timestamp(),
    }))
}

/// 更新会话
async fn update_session(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
    Json(request): Json<UpdateSessionRequest>,
) -> Result<Json<SessionResponse>, (StatusCode, Json<ErrorResponse>)> {
    let session_id = Uuid::parse_str(&id).map_err(|_| {
        (
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse {
                error: "无效的会话 ID".to_string(),
            }),
        )
    })?;

    let folder_id = request
        .folder_id
        .map(|f| Some(Uuid::parse_str(&f).ok()).flatten());

    SessionRepo::update(
        &state.db_pool,
        session_id,
        request.name.as_deref(),
        folder_id,
    )
    .await
    .map_err(|e| {
        tracing::error!("更新会话失败: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: "服务器错误".to_string(),
            }),
        )
    })?;

    let session = SessionRepo::find_by_id(&state.db_pool, session_id)
        .await
        .map_err(|e| {
            tracing::error!("获取会话失败: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    error: "服务器错误".to_string(),
                }),
            )
        })?
        .ok_or((
            StatusCode::NOT_FOUND,
            Json(ErrorResponse {
                error: "会话不存在".to_string(),
            }),
        ))?;

    Ok(Json(SessionResponse {
        id: session.id.to_string(),
        name: session.name,
        folder_id: session.folder_id.map(|f| f.to_string()),
        created_at: session.created_at.timestamp(),
        updated_at: session.updated_at.timestamp(),
    }))
}

/// 删除会话
async fn delete_session(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> Result<StatusCode, (StatusCode, Json<ErrorResponse>)> {
    let session_id = Uuid::parse_str(&id).map_err(|_| {
        (
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse {
                error: "无效的会话 ID".to_string(),
            }),
        )
    })?;

    SessionRepo::delete(&state.db_pool, session_id)
        .await
        .map_err(|e| {
            tracing::error!("删除会话失败: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    error: "服务器错误".to_string(),
                }),
            )
        })?;

    Ok(StatusCode::NO_CONTENT)
}

/// 获取文件夹列表
async fn list_folders(
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<FolderResponse>>, (StatusCode, Json<ErrorResponse>)> {
    let folders = FolderRepo::find_all(&state.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("获取文件夹列表失败: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    error: "服务器错误".to_string(),
                }),
            )
        })?;

    let response: Vec<FolderResponse> = folders
        .into_iter()
        .map(|f| FolderResponse {
            id: f.id.to_string(),
            name: f.name,
            parent_id: f.parent_id.map(|p| p.to_string()),
            order: f.order,
        })
        .collect();

    Ok(Json(response))
}

/// 创建文件夹
async fn create_folder(
    State(state): State<Arc<AppState>>,
    Json(request): Json<CreateFolderRequest>,
) -> Result<Json<FolderResponse>, (StatusCode, Json<ErrorResponse>)> {
    let parent_id = request.parent_id.and_then(|p| Uuid::parse_str(&p).ok());

    let folder = FolderRepo::create(&state.db_pool, &request.name, parent_id, 0)
        .await
        .map_err(|e| {
            tracing::error!("创建文件夹失败: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    error: "服务器错误".to_string(),
                }),
            )
        })?;

    Ok(Json(FolderResponse {
        id: folder.id.to_string(),
        name: folder.name,
        parent_id: folder.parent_id.map(|p| p.to_string()),
        order: folder.order,
    }))
}

/// 更新文件夹
async fn update_folder(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
    Json(request): Json<UpdateFolderRequest>,
) -> Result<StatusCode, (StatusCode, Json<ErrorResponse>)> {
    let folder_id = Uuid::parse_str(&id).map_err(|_| {
        (
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse {
                error: "无效的文件夹 ID".to_string(),
            }),
        )
    })?;

    let parent_id = request
        .parent_id
        .map(|p| Some(Uuid::parse_str(&p).ok()).flatten());

    FolderRepo::update(
        &state.db_pool,
        folder_id,
        request.name.as_deref(),
        parent_id,
        request.order,
    )
    .await
    .map_err(|e| {
        tracing::error!("更新文件夹失败: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: "服务器错误".to_string(),
            }),
        )
    })?;

    Ok(StatusCode::OK)
}

/// 删除文件夹
async fn delete_folder(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> Result<StatusCode, (StatusCode, Json<ErrorResponse>)> {
    let folder_id = Uuid::parse_str(&id).map_err(|_| {
        (
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse {
                error: "无效的文件夹 ID".to_string(),
            }),
        )
    })?;

    FolderRepo::delete(&state.db_pool, folder_id)
        .await
        .map_err(|e| {
            tracing::error!("删除文件夹失败: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    error: "服务器错误".to_string(),
                }),
            )
        })?;

    Ok(StatusCode::NO_CONTENT)
}