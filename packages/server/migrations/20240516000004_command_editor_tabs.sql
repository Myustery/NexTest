-- 创建命令编辑页签表
CREATE TABLE command_editor_tabs (
    id TEXT PRIMARY KEY NOT NULL,
    tab_id TEXT NOT NULL,
    name TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    syntax TEXT NOT NULL DEFAULT 'command',
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (tab_id) REFERENCES tabs(id) ON DELETE CASCADE
);

-- 创建 Tab 索引
CREATE INDEX idx_command_editor_tabs_tab_id ON command_editor_tabs(tab_id);