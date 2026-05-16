-- 创建会话表
CREATE TABLE sessions (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    folder_id TEXT,
    user_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建用户索引
CREATE INDEX idx_sessions_user_id ON sessions(user_id);

-- 创建文件夹索引
CREATE INDEX idx_sessions_folder_id ON sessions(folder_id);