//! 数据模型测试

use chrono::Utc;
use uuid::Uuid;

use crate::models::*;

#[test]
fn test_user_creation() {
    let user = User::new(
        "test@example.com".to_string(),
        "EMP001".to_string(),
        "hashed_password".to_string(),
        "测试用户".to_string(),
    );

    assert_eq!(user.email, "test@example.com");
    assert_eq!(user.employee_id, "EMP001");
    assert_eq!(user.name, "测试用户");
    assert!(!user.id.to_string().is_empty());
}

#[test]
fn test_session_creation() {
    let folder_id = Uuid::new_v4();
    let session = Session::new("测试会话".to_string(), Some(folder_id));

    assert_eq!(session.name, "测试会话");
    assert_eq!(session.folder_id, Some(folder_id));
    assert!(!session.id.to_string().is_empty());
}

#[test]
fn test_folder_creation() {
    let parent_id = Uuid::new_v4();
    let folder = Folder::new("测试文件夹".to_string(), Some(parent_id), 1);

    assert_eq!(folder.name, "测试文件夹");
    assert_eq!(folder.parent_id, Some(parent_id));
    assert_eq!(folder.order, 1);
}

#[test]
fn test_command_editor_tab_creation() {
    let tab = CommandEditorTab::new("测试页签".to_string(), SyntaxType::Command);

    assert_eq!(tab.name, "测试页签");
    assert_eq!(tab.syntax, SyntaxType::Command);
    assert!(tab.content.is_empty());
}

#[test]
fn test_command_tool_creation() {
    let tool = CommandTool::new("测试工具".to_string(), SyntaxType::Python);

    assert_eq!(tool.name, "测试工具");
    assert_eq!(tool.syntax, SyntaxType::Python);
    assert!(tool.continue_on_failure);
}

#[test]
fn test_theme_default() {
    let theme = Theme::default_theme();

    assert_eq!(theme.name, "默认主题");
    assert!(!theme.colors.foreground.is_empty());
    assert!(!theme.colors.background.is_empty());
}

#[test]
fn test_shortcut_creation() {
    let shortcut = Shortcut::new("Ctrl+T".to_string(), ShortcutAction::NewSession);

    assert_eq!(shortcut.key, "Ctrl+T");
    assert!(shortcut.enabled);
}

#[test]
fn test_shortcut_defaults() {
    let defaults = Shortcut::defaults();

    assert!(!defaults.is_empty());
    assert!(defaults.iter().any(|s| s.key == "Ctrl+Shift+T"));
}

#[test]
fn test_sync_event_creation() {
    let user_id = Uuid::new_v4();
    let entity_id = Uuid::new_v4();
    let payload = serde_json::json!({ "name": "test" });

    let event = SyncEvent::new(
        user_id,
        "device-001".to_string(),
        SyncEventType::Create,
        SyncEntityType::Session,
        entity_id,
        payload.clone(),
        1,
    );

    assert_eq!(event.user_id, user_id);
    assert_eq!(event.device_id, "device-001");
    assert_eq!(event.event_type, SyncEventType::Create);
    assert_eq!(event.entity_type, SyncEntityType::Session);
    assert_eq!(event.entity_id, entity_id);
    assert_eq!(event.version, 1);
}

#[test]
fn test_version_creation() {
    let version = Version::new(
        "1.0.0".to_string(),
        "初始版本".to_string(),
        "https://example.com/download".to_string(),
        Platform::Windows,
        1024 * 1024 * 50, // 50 MB
    );

    assert_eq!(version.version, "1.0.0");
    assert_eq!(version.changelog, "初始版本");
    assert_eq!(version.platform, Platform::Windows);
    assert_eq!(version.update_type, UpdateType::Full);
}