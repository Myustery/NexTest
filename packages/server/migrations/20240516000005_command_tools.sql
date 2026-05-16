-- 创建命令工具表
CREATE TABLE command_tools (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'terminal',
    syntax TEXT NOT NULL DEFAULT 'command',
    content TEXT NOT NULL DEFAULT '',
    continue_on_failure INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建用户索引
CREATE INDEX idx_command_tools_user_id ON command_tools(user_id);