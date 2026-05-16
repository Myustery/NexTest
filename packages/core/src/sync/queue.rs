//! 同步队列模块

use anyhow::Result;
use std::collections::VecDeque;
use std::sync::{Arc, Mutex};

use crate::models::SyncEvent;

/// 同步队列
/// 
/// 用于暂存待同步的事件，支持离线同步
#[derive(Debug, Clone)]
pub struct SyncQueue {
    /// 内部队列
    queue: Arc<Mutex<VecDeque<SyncEvent>>>,
    
    /// 最大队列长度
    max_size: usize,
}

impl SyncQueue {
    /// 创建新同步队列
    /// 
    /// # 参数
    /// - `max_size`: 最大队列长度
    pub fn new(max_size: usize) -> Self {
        Self {
            queue: Arc::new(Mutex::new(VecDeque::new())),
            max_size,
        }
    }

    /// 入队事件
    /// 
    /// # 参数
    /// - `event`: 同步事件
    /// 
    /// # 返回
    /// 成功返回 Ok(())，队列已满返回错误
    pub fn enqueue(&self, event: SyncEvent) -> Result<()> {
        let mut queue = self.queue.lock().map_err(|_| anyhow::anyhow!("队列锁获取失败"))?;
        
        if queue.len() >= self.max_size {
            return Err(anyhow::anyhow!("同步队列已满"));
        }
        
        queue.push_back(event);
        Ok(())
    }

    /// 出队事件
    /// 
    /// # 返回
    /// 队列中的事件，队列为空返回 None
    pub fn dequeue(&self) -> Option<SyncEvent> {
        let mut queue = self.queue.lock().ok()?;
        queue.pop_front()
    }

    /// 查看队首事件（不移除）
    /// 
    /// # 返回
    /// 队首事件
    pub fn peek(&self) -> Option<SyncEvent> {
        let queue = self.queue.lock().ok()?;
        queue.front().cloned()
    }

    /// 获取队列长度
    pub fn len(&self) -> usize {
        self.queue.lock().map(|q| q.len()).unwrap_or(0)
    }

    /// 检查队列是否为空
    pub fn is_empty(&self) -> bool {
        self.len() == 0
    }

    /// 清空队列
    pub fn clear(&self) -> Result<()> {
        let mut queue = self.queue.lock().map_err(|_| anyhow::anyhow!("队列锁获取失败"))?;
        queue.clear();
        Ok(())
    }

    /// 获取所有事件（不移除）
    /// 
    /// # 返回
    /// 所有事件的克隆列表
    pub fn get_all(&self) -> Vec<SyncEvent> {
        self.queue
            .lock()
            .map(|q| q.iter().cloned().collect())
            .unwrap_or_default()
    }

    /// 批量入队
    /// 
    /// # 参数
    /// - `events`: 事件列表
    /// 
    /// # 返回
    /// 成功入队的事件数量
    pub fn enqueue_batch(&self, events: Vec<SyncEvent>) -> Result<usize> {
        let mut count = 0;
        for event in events {
            if self.enqueue(event).is_ok() {
                count += 1;
            }
        }
        Ok(count)
    }

    /// 批量出队
    /// 
    /// # 参数
    /// - `count`: 出队数量
    /// 
    /// # 返回
    /// 出队的事件列表
    pub fn dequeue_batch(&self, count: usize) -> Vec<SyncEvent> {
        let mut result = Vec::new();
        for _ in 0..count {
            if let Some(event) = self.dequeue() {
                result.push(event);
            } else {
                break;
            }
        }
        result
    }
}

impl Default for SyncQueue {
    fn default() -> Self {
        Self::new(10000)
    }
}