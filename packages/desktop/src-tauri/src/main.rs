//! NexTest 桌面端主程序
//!
//! 基于 Tauri 框架实现，提供原生终端体验

#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod commands;
mod pty;

use tauri::Manager;

/// 应用名称常量
const APP_NAME: &str = "NexTest";

fn main() {
    // 初始化日志
    tracing_subscriber::fmt::init();

    tracing::info!("{} 桌面端启动中...", APP_NAME);

    tauri::Builder::default()
        // 注册插件
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        // 单实例检查
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            let _ = app
                .get_webview_window("main")
                .expect("找不到主窗口")
                .set_focus();
        }))
        // 注册命令
        .invoke_handler(tauri::generate_handler![
            commands::create_session,
            commands::execute_command,
            commands::get_sessions,
        ])
        // 设置系统托盘
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Tauri 运行失败");
}