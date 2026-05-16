//! PTY 进程管理模块
//!
//! 负责创建和管理伪终端进程

use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};

/// PTY 进程管理器
pub struct PtyManager {
    /// 进程列表
    processes: Arc<Mutex<Vec<PtyProcess>>>,
}

/// PTY 进程
struct PtyProcess {
    /// 进程 ID
    id: u32,
    /// 会话 ID
    session_id: String,
    /// 子进程
    child: Child,
}

impl PtyManager {
    /// 创建新的 PTY 管理器
    pub fn new() -> Self {
        Self {
            processes: Arc::new(Mutex::new(Vec::new())),
        }
    }

    /// 创建新的 PTY 进程
    /// 
    /// # 参数
    /// - `session_id`: 会话 ID
    /// - `shell`: Shell 类型（如 "cmd"、"powershell"）
    /// 
    /// # 返回
    /// 进程 ID
    pub fn create_pty(&self, session_id: String, shell: &str) -> anyhow::Result<u32> {
        #[cfg(target_os = "windows")]
        let child = Command::new(shell)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()?;

        #[cfg(not(target_os = "windows"))]
        let child = Command::new(shell)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()?;

        let id = child.id();
        let process = PtyProcess {
            id,
            session_id,
            child,
        };

        let mut processes = self.processes.lock().map_err(|_| anyhow::anyhow!("锁获取失败"))?;
        processes.push(process);

        tracing::info!("创建 PTY 进程: {} (PID: {})", shell, id);

        Ok(id)
    }

    /// 终止 PTY 进程
    /// 
    /// # 参数
    /// - `id`: 进程 ID
    pub fn kill_pty(&self, id: u32) -> anyhow::Result<()> {
        let mut processes = self.processes.lock().map_err(|_| anyhow::anyhow!("锁获取失败"))?;
        
        if let Some(idx) = processes.iter().position(|p| p.id == id) {
            let mut process = processes.remove(idx);
            process.child.kill()?;
            tracing::info!("终止 PTY 进程: {}", id);
        }

        Ok(())
    }

    /// 终止会话的所有 PTY 进程
    /// 
    /// # 参数
    /// - `session_id`: 会话 ID
    pub fn kill_session_ptys(&self, session_id: &str) -> anyhow::Result<()> {
        let mut processes = self.processes.lock().map_err(|_| anyhow::anyhow!("锁获取失败"))?;
        
        let ids: Vec<u32> = processes
            .iter()
            .filter(|p| p.session_id == session_id)
            .map(|p| p.id)
            .collect();

        for id in ids {
            if let Some(idx) = processes.iter().position(|p| p.id == id) {
                let mut process = processes.remove(idx);
                process.child.kill()?;
                tracing::info!("终止 PTY 进程: {}", id);
            }
        }

        Ok(())
    }
}

impl Default for PtyManager {
    fn default() -> Self {
        Self::new()
    }
}