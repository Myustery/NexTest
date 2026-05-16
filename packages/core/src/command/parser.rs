//! 命令解析器

use anyhow::Result;

use crate::models::SyntaxType;

/// 解析后的命令
#[derive(Debug, Clone)]
pub struct ParsedCommand {
    /// 命令文本
    pub command: String,
    
    /// 是否为空行
    pub is_empty: bool,
    
    /// 是否为注释行
    pub is_comment: bool,
}

/// 命令解析器
/// 
/// 根据语法类型解析命令文本
pub struct CommandParser {
    /// 语法类型
    syntax: SyntaxType,
}

impl CommandParser {
    /// 创建新解析器
    /// 
    /// # 参数
    /// - `syntax`: 语法类型
    pub fn new(syntax: SyntaxType) -> Self {
        Self { syntax }
    }

    /// 解析命令文本
    /// 
    /// # 参数
    /// - `content`: 命令内容
    /// 
    /// # 返回
    /// 解析后的命令列表
    pub fn parse(&self, content: &str) -> Result<Vec<ParsedCommand>> {
        match self.syntax {
            SyntaxType::Command => self.parse_command(content),
            SyntaxType::Python => self.parse_python(content),
        }
    }

    /// 解析命令模式文本
    /// 
    /// 逐行解析，忽略空行和注释
    fn parse_command(&self, content: &str) -> Result<Vec<ParsedCommand>> {
        let commands = content
            .lines()
            .map(|line| {
                let trimmed = line.trim();
                ParsedCommand {
                    command: line.to_string(),
                    is_empty: trimmed.is_empty(),
                    is_comment: trimmed.starts_with('#') || trimmed.starts_with("//"),
                }
            })
            .collect();
        Ok(commands)
    }

    /// 解析 Python 模式文本
    /// 
    /// Python 脚本作为整体处理
    fn parse_python(&self, content: &str) -> Result<Vec<ParsedCommand>> {
        Ok(vec![ParsedCommand {
            command: content.to_string(),
            is_empty: content.trim().is_empty(),
            is_comment: false,
        }])
    }

    /// 过滤有效命令
    /// 
    /// # 参数
    /// - `commands`: 命令列表
    /// 
    /// # 返回
    /// 仅包含有效命令的列表
    pub fn filter_valid_commands(&self, commands: Vec<ParsedCommand>) -> Vec<String> {
        commands
            .into_iter()
            .filter(|cmd| !cmd.is_empty && !cmd.is_comment)
            .map(|cmd| cmd.command)
            .collect()
    }

    /// 提取选中文本中的命令
    /// 
    /// # 参数
    /// - `content`: 完整内容
    /// - `start`: 选区起始位置
    /// - `end`: 选区结束位置
    /// 
    /// # 返回
    /// 选中的命令
    pub fn extract_selection(&self, content: &str, start: usize, end: usize) -> String {
        if start >= end || start >= content.len() {
            return String::new();
        }
        let end = end.min(content.len());
        content[start..end].to_string()
    }
}