//! 命令执行器

use anyhow::Result;
use std::process::Command;

use crate::models::SyntaxType;
use super::parser::CommandParser;

/// 命令执行器
/// 
/// 负责执行解析后的命令
pub struct CommandExecutor {
    /// 命令解析器
    parser: CommandParser,
    
    /// 是否在失败时继续执行
    continue_on_failure: bool,
}

/// 执行结果
#[derive(Debug, Clone)]
pub struct ExecutionResult {
    /// 是否成功
    pub success: bool,
    
    /// 输出内容
    pub output: String,
    
    /// 错误内容
    pub error: String,
}

impl CommandExecutor {
    /// 创建新执行器
    /// 
    /// # 参数
    /// - `syntax`: 语法类型
    /// - `continue_on_failure`: 失败时是否继续
    pub fn new(syntax: SyntaxType, continue_on_failure: bool) -> Self {
        Self {
            parser: CommandParser::new(syntax),
            continue_on_failure,
        }
    }

    /// 执行命令文本
    /// 
    /// # 参数
    /// - `content`: 命令内容
    /// 
    /// # 返回
    /// 执行结果列表
    pub fn execute(&self, content: &str) -> Result<Vec<ExecutionResult>> {
        let commands = self.parser.parse(content)?;
        let valid_commands = self.parser.filter_valid_commands(commands);
        
        let mut results = Vec::new();
        
        for cmd in valid_commands {
            let result = self.execute_single(&cmd)?;
            results.push(result.clone());
            
            if !result.success && !self.continue_on_failure {
                break;
            }
        }
        
        Ok(results)
    }

    /// 执行单条命令
    /// 
    /// # 参数
    /// - `command`: 命令文本
    /// 
    /// # 返回
    /// 执行结果
    fn execute_single(&self, command: &str) -> Result<ExecutionResult> {
        // Windows 下使用 cmd /C 执行命令
        #[cfg(target_os = "windows")]
        let output = Command::new("cmd")
            .args(["/C", command])
            .output()?;

        // Unix 系统使用 sh -c 执行命令
        #[cfg(not(target_os = "windows"))]
        let output = Command::new("sh")
            .args(["-c", command])
            .output()?;

        Ok(ExecutionResult {
            success: output.status.success(),
            output: String::from_utf8_lossy(&output.stdout).to_string(),
            error: String::from_utf8_lossy(&output.stderr).to_string(),
        })
    }

    /// 执行 Python 脚本
    /// 
    /// # 参数
    /// - `script`: Python 脚本内容
    /// 
    /// # 返回
    /// 执行结果
    pub fn execute_python(&self, script: &str) -> Result<ExecutionResult> {
        let output = Command::new("python")
            .args(["-c", script])
            .output()?;

        Ok(ExecutionResult {
            success: output.status.success(),
            output: String::from_utf8_lossy(&output.stdout).to_string(),
            error: String::from_utf8_lossy(&output.stderr).to_string(),
        })
    }
}