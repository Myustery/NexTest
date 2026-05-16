//! PTY 进程管理模块
//!
//! 负责创建和管理伪终端进程

use anyhow::Result;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

/// PTY 进程信息
#[derive(Debug, Clone)]
pub struct PtyProcess {
    /// 进程 ID
    pub id: u32,
    /// 会话 ID
    pub session_id: String,
    /// Shell 类型
    pub shell: String,
    /// 是否运行中
    pub running: bool,
}

/// PTY 管理器
///
/// 管理所有 PTY 进程的生命周期
pub struct PtyManager {
    /// 进程映射表
    processes: Arc<Mutex<HashMap<u32, PtyProcess>>>,
}

impl PtyManager {
    /// 创建新的 PTY 管理器
    pub fn new() -> Self {
        Self {
            processes: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    /// 创建新的 PTY 进程
    ///
    /// # 参数
    /// - `session_id`: 会话 ID
    /// - `shell`: Shell 类型（如 "cmd"、"powershell"、"pwsh"）
    ///
    /// # 返回
    /// 进程 ID
    pub fn spawn(&self, session_id: String, shell: &str) -> Result<u32> {
        #[cfg(target_os = "windows")]
        {
            self.spawn_windows(session_id, shell)
        }

        #[cfg(not(target_os = "windows"))]
        {
            self.spawn_unix(session_id, shell)
        }
    }

    /// Windows 平台创建 PTY
    #[cfg(target_os = "windows")]
    fn spawn_windows(&self, session_id: String, shell: &str) -> Result<u32> {
        use std::process::Command;

        // Windows 下使用 Command 启动 shell 进程
        let child = Command::new(shell)
            .spawn()?;

        let pid = child.id();

        let process = PtyProcess {
            id: pid,
            session_id,
            shell: shell.to_string(),
            running: true,
        };

        let mut processes = self.processes.lock().map_err(|_| anyhow::anyhow!("锁获取失败"))?;
        processes.insert(pid, process);

        tracing::info!("创建 Windows 进程: {} (PID: {})", shell, pid);

        Ok(pid)
    }

    /// Unix 平台创建 PTY
    #[cfg(not(target_os = "windows"))]
    fn spawn_unix(&self, session_id: String, shell: &str) -> Result<u32> {
        use std::process::Command;

        let child = Command::new(shell)
            .spawn()?;

        let pid = child.id();

        let process = PtyProcess {
            id: pid,
            session_id,
            shell: shell.to_string(),
            running: true,
        };

        let mut processes = self.processes.lock().map_err(|_| anyhow::anyhow!("锁获取失败"))?;
        processes.insert(pid, process);

        tracing::info!("创建 Unix 进程: {} (PID: {})", shell, pid);

        Ok(pid)
    }

    /// 终止 PTY 进程
    ///
    /// # 参数
    /// - `pid`: 进程 ID
    pub fn kill(&self, pid: u32) -> Result<()> {
        let mut processes = self.processes.lock().map_err(|_| anyhow::anyhow!("锁获取失败"))?;

        if let Some(mut process) = processes.remove(&pid) {
            process.running = false;
            tracing::info!("终止进程: PID {}", pid);
        }

        Ok(())
    }

    /// 终止会话的所有进程
    ///
    /// # 参数
    /// - `session_id`: 会话 ID
    pub fn kill_session(&self, session_id: &str) -> Result<()> {
        let mut processes = self.processes.lock().map_err(|_| anyhow::anyhow!("锁获取失败"))?;

        let pids: Vec<u32> = processes
            .iter()
            .filter(|(_, p)| p.session_id == session_id)
            .map(|(pid, _)| *pid)
            .collect();

        for pid in pids {
            processes.remove(&pid);
            tracing::info!("终止会话进程: PID {}", pid);
        }

        Ok(())
    }

    /// 获取所有进程
    pub fn get_all(&self) -> Result<Vec<PtyProcess>> {
        let processes = self.processes.lock().map_err(|_| anyhow::anyhow!("锁获取失败"))?;
        Ok(processes.values().cloned().collect())
    }

    /// 获取进程信息
    pub fn get(&self, pid: u32) -> Result<Option<PtyProcess>> {
        let processes = self.processes.lock().map_err(|_| anyhow::anyhow!("锁获取失败"))?;
        Ok(processes.get(&pid).cloned())
    }
}

impl Default for PtyManager {
    fn default() -> Self {
        Self::new()
    }
}