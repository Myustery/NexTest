//! NexTest 桌面端主程序
//!
//! 基于 Tauri 框架实现，提供原生终端体验

#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod commands;
mod pty;

use std::fs::File;
use std::io::Write;
use std::path::PathBuf;
use std::sync::Arc;

use tauri::Manager;
use tokio::sync::RwLock;
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::util::SubscriberInitExt;
use tracing_subscriber::EnvFilter;

use pty::PtyManager;

const APP_NAME: &str = "NexTest";

pub struct AppState {
    pub pty_manager: Arc<RwLock<PtyManager>>,
}

fn get_exe_dir() -> PathBuf {
    std::env::current_exe()
        .unwrap_or_else(|_| PathBuf::from("."))
        .parent()
        .map(|p| p.to_path_buf())
        .unwrap_or_else(|| PathBuf::from("."))
}

fn init_file_logger() {
    let exe_dir = get_exe_dir();
    let log_path = exe_dir.join("nextest-debug.log");

    match File::create(&log_path) {
        Ok(file) => {
            let file_writer = std::sync::Mutex::new(file);
            let file_layer = tracing_subscriber::fmt::layer()
                .with_writer(file_writer)
                .with_ansi(false)
                .with_target(true)
                .with_thread_ids(true)
                .with_file(true)
                .with_line_number(true);

            let console_layer = tracing_subscriber::fmt::layer()
                .with_writer(std::io::stderr);

            let filter = EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| EnvFilter::new("info"));

            tracing_subscriber::registry()
                .with(filter)
                .with(console_layer)
                .with(file_layer)
                .init();

            tracing::info!("日志文件已创建: {}", log_path.display());
            tracing::info!("可执行文件路径: {:?}", std::env::current_exe());
            tracing::info!("工作目录: {:?}", std::env::current_dir());
        }
        Err(e) => {
            eprintln!("无法创建日志文件 {}: {}", log_path.display(), e);
            tracing_subscriber::fmt::init();
            tracing::warn!("无法创建日志文件，仅使用控制台日志");
        }
    }
}

fn write_startup_banner() {
    let exe_dir = get_exe_dir();
    let banner_path = exe_dir.join("nextest-startup.log");

    if let Ok(mut f) = File::create(&banner_path) {
        let _ = writeln!(f, "=== NexTest 启动 ===");
        let _ = writeln!(f, "时间: {}", chrono::Local::now().format("%Y-%m-%d %H:%M:%S"));
        let _ = writeln!(f, "可执行文件: {:?}", std::env::current_exe());
        let _ = writeln!(f, "工作目录: {:?}", std::env::current_dir());
        let _ = writeln!(f, "命令行参数: {:?}", std::env::args().collect::<Vec<_>>());
        let _ = writeln!(f, "操作系统: {}", std::env::consts::OS);
        let _ = writeln!(f, "架构: {}", std::env::consts::ARCH);
        let _ = writeln!(f, "========================");
        let _ = f.flush();
    }
}

fn main() {
    write_startup_banner();
    init_file_logger();

    tracing::info!("{} 桌面端启动中...", APP_NAME);

    let state = AppState {
        pty_manager: Arc::new(RwLock::new(PtyManager::new())),
    };

    tracing::info!("应用状态已创建");

    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            tracing::info!("单实例回调触发");
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_focus();
            }
        }))
        .invoke_handler(tauri::generate_handler![
            commands::create_session,
            commands::close_session,
            commands::execute_command,
            commands::get_sessions,
            commands::get_pty_processes,
        ])
        .manage(state)
        .setup(|app| {
            tracing::info!("Tauri setup 开始");

            tracing::info!("窗口列表:");
            for window in app.webview_windows() {
                tracing::info!("  窗口: {}", window.0);
            }

            #[cfg(debug_assertions)]
            {
                if let Some(window) = app.get_webview_window("main") {
                    window.open_devtools();
                    tracing::info!("已打开 DevTools");
                }
            }

            tracing::info!("Tauri setup 完成");
            Ok(())
        });

    tracing::info!("开始运行 Tauri 应用...");

    builder
        .run(tauri::generate_context!())
        .unwrap_or_else(|e| {
            tracing::error!("Tauri 运行失败: {}", e);
            let exe_dir = get_exe_dir();
            let crash_path = exe_dir.join("nextest-crash.log");
            if let Ok(mut f) = File::create(&crash_path) {
                let _ = writeln!(f, "Tauri 运行失败: {}", e);
                let _ = writeln!(f, "时间: {}", chrono::Local::now().format("%Y-%m-%d %H:%M:%S"));
            }
        });

    tracing::info!("应用正常退出");
}
