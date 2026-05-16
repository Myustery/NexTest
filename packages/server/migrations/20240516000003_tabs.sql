-- 创建 Tab 表
CREATE TABLE tabs (
    id TEXT PRIMARY KEY NOT NULL,
    session_id TEXT NOT NULL,
    name TEXT NOT NULL,
    shell_type TEXT NOT NULL DEFAULT 'cmd',
    font_size INTEGER NOT NULL DEFAULT 14,
    font_family TEXT NOT NULL DEFAULT 'Consolas, ''Courier New'', monospace',
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- 创建会话索引
CREATE INDEX idx_tabs_session_id ON tabs(session_id);