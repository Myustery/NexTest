//! WebSocket 模块

use axum::{
    extract::{
        ws::{Message, WebSocket, WebSocketUpgrade},
        State,
    },
    response::Response,
};
use futures_util::{SinkExt, StreamExt};
use std::sync::Arc;

use crate::AppState;

/// WebSocket 同步处理器
pub async fn sync_handler(
    ws: WebSocketUpgrade,
    State(state): State<Arc<AppState>>,
) -> Response {
    ws.on_upgrade(move |socket| handle_socket(socket, state))
}

/// 处理 WebSocket 连接
async fn handle_socket(socket: WebSocket, _state: Arc<AppState>) {
    let (mut sender, mut receiver) = socket.split();

    // 发送欢迎消息
    if sender.send(Message::Text(String::from("连接成功"))).await.is_err() {
        return;
    }

    // 接收消息循环
    while let Some(msg) = receiver.next().await {
        match msg {
            Ok(Message::Text(text)) => {
                tracing::info!("收到消息: {}", text);
                
                // 回显消息
                if sender.send(Message::Text(format!("收到: {}", text))).await.is_err() {
                    break;
                }
            }
            Ok(Message::Binary(data)) => {
                tracing::info!("收到二进制数据: {} bytes", data.len());
            }
            Ok(Message::Ping(data)) => {
                if sender.send(Message::Pong(data)).await.is_err() {
                    break;
                }
            }
            Ok(Message::Pong(_)) => {}
            Ok(Message::Close(_)) => {
                let _ = sender.send(Message::Close(None)).await;
                break;
            }
            Err(e) => {
                tracing::error!("WebSocket 错误: {}", e);
                break;
            }
        }
    }
}