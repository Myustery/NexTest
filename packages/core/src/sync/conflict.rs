//! 同步冲突解决模块

use anyhow::Result;

use crate::models::SyncEvent;

/// 冲突类型
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ConflictType {
    /// 更新冲突：两端同时修改同一实体
    UpdateConflict,
    
    /// 删除冲突：一端删除，另一端修改
    DeleteConflict,
    
    /// 版本冲突：版本号不匹配
    VersionConflict,
}

/// 冲突解决策略
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ConflictStrategy {
    /// 客户端优先：使用客户端数据
    ClientWins,
    
    /// 服务端优先：使用服务端数据
    ServerWins,
    
    /// 最新优先：使用时间戳最新的数据
    LatestWins,
    
    /// 手动解决：需要用户介入
    Manual,
}

/// 同步冲突
#[derive(Debug, Clone)]
pub struct SyncConflict {
    /// 冲突类型
    pub conflict_type: ConflictType,
    
    /// 本地事件
    pub local_event: SyncEvent,
    
    /// 远程事件
    pub remote_event: SyncEvent,
}

/// 冲突解决器
pub struct ConflictResolver {
    /// 默认解决策略
    default_strategy: ConflictStrategy,
}

impl ConflictResolver {
    /// 创建新冲突解决器
    /// 
    /// # 参数
    /// - `default_strategy`: 默认解决策略
    pub fn new(default_strategy: ConflictStrategy) -> Self {
        Self { default_strategy }
    }

    /// 检测冲突
    /// 
    /// # 参数
    /// - `local_events`: 本地事件列表
    /// - `remote_events`: 远程事件列表
    /// 
    /// # 返回
    /// 检测到的冲突列表
    pub fn detect_conflicts(
        &self,
        local_events: &[SyncEvent],
        remote_events: &[SyncEvent],
    ) -> Vec<SyncConflict> {
        let mut conflicts = Vec::new();
        
        for local in local_events {
            for remote in remote_events {
                if local.entity_id == remote.entity_id {
                    // 同一实体存在修改
                    if local.version != remote.version {
                        conflicts.push(SyncConflict {
                            conflict_type: ConflictType::VersionConflict,
                            local_event: local.clone(),
                            remote_event: remote.clone(),
                        });
                    }
                }
            }
        }
        
        conflicts
    }

    /// 解决冲突
    /// 
    /// # 参数
    /// - `conflict`: 同步冲突
    /// - `strategy`: 解决策略（可选，使用默认策略）
    /// 
    /// # 返回
    /// 解决后的事件
    pub fn resolve(
        &self,
        conflict: &SyncConflict,
        strategy: Option<ConflictStrategy>,
    ) -> Result<SyncEvent> {
        let strategy = strategy.unwrap_or(self.default_strategy);
        
        let resolved_event = match strategy {
            ConflictStrategy::ClientWins => conflict.local_event.clone(),
            ConflictStrategy::ServerWins => conflict.remote_event.clone(),
            ConflictStrategy::LatestWins => {
                if conflict.local_event.timestamp > conflict.remote_event.timestamp {
                    conflict.local_event.clone()
                } else {
                    conflict.remote_event.clone()
                }
            }
            ConflictStrategy::Manual => {
                return Err(anyhow::anyhow!("需要手动解决冲突"));
            }
        };
        
        Ok(resolved_event)
    }
}

impl Default for ConflictResolver {
    fn default() -> Self {
        Self::new(ConflictStrategy::LatestWins)
    }
}