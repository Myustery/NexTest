//! 文件夹数据模型

use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// 文件夹实体
/// 
/// 用于组织和分类会话，支持多级嵌套
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Folder {
    /// 文件夹唯一标识符
    pub id: Uuid,
    
    /// 文件夹名称
    pub name: String,
    
    /// 父文件夹 ID（可为空，表示根级别）
    pub parent_id: Option<Uuid>,
    
    /// 排序顺序
    pub order: i32,
}

impl Folder {
    /// 创建新文件夹
    /// 
    /// # 参数
    /// - `name`: 文件夹名称
    /// - `parent_id`: 父文件夹 ID
    /// - `order`: 排序顺序
    /// 
    /// # 返回
    /// 新创建的文件夹实例
    pub fn new(name: String, parent_id: Option<Uuid>, order: i32) -> Self {
        Self {
            id: Uuid::new_v4(),
            name,
            parent_id,
            order,
        }
    }
}

/// 文件夹创建请求
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateFolderRequest {
    /// 文件夹名称
    pub name: String,
    
    /// 父文件夹 ID
    pub parent_id: Option<Uuid>,
}

/// 文件夹更新请求
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateFolderRequest {
    /// 文件夹名称
    pub name: Option<String>,
    
    /// 父文件夹 ID
    pub parent_id: Option<Uuid>,
    
    /// 排序顺序
    pub order: Option<i32>,
}