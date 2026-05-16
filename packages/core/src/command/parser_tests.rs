//! 命令解析器测试

use crate::command::parser::CommandParser;
use crate::models::SyntaxType;

#[test]
fn test_parse_command_mode() {
    let parser = CommandParser::new(SyntaxType::Command);
    let content = "echo hello\n# comment\necho world\n\nls -la";

    let commands = parser.parse(content).unwrap();

    assert_eq!(commands.len(), 5);
    assert_eq!(commands[0].command, "echo hello");
    assert!(!commands[0].is_empty);
    assert!(!commands[0].is_comment);

    assert!(commands[1].is_comment);
    assert!(commands[3].is_empty);
}

#[test]
fn test_parse_python_mode() {
    let parser = CommandParser::new(SyntaxType::Python);
    let content = r#"
import os
print("hello")
"#;

    let commands = parser.parse(content).unwrap();

    // Python 模式下，整个脚本作为一个命令
    assert_eq!(commands.len(), 1);
    assert!(commands[0].command.contains("import os"));
}

#[test]
fn test_filter_valid_commands() {
    let parser = CommandParser::new(SyntaxType::Command);
    let content = "echo hello\n\n# comment\necho world";

    let commands = parser.parse(content).unwrap();
    let valid = parser.filter_valid_commands(commands);

    assert_eq!(valid.len(), 2);
    assert_eq!(valid[0], "echo hello");
    assert_eq!(valid[1], "echo world");
}

#[test]
fn test_extract_selection() {
    let parser = CommandParser::new(SyntaxType::Command);
    let content = "echo hello\necho world";

    let selected = parser.extract_selection(content, 0, 10);
    assert_eq!(selected, "echo hello");

    let empty = parser.extract_selection(content, 5, 3);
    assert!(empty.is_empty());
}