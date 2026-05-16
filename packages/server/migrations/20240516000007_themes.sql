-- 创建主题表
CREATE TABLE themes (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT,
    name TEXT NOT NULL,
    foreground TEXT NOT NULL DEFAULT '#cccccc',
    background TEXT NOT NULL DEFAULT '#1e1e1e',
    cursor TEXT NOT NULL DEFAULT '#ffffff',
    selection TEXT NOT NULL DEFAULT '#264f78',
    font_family TEXT NOT NULL DEFAULT 'Consolas, ''Courier New'', monospace',
    font_size INTEGER NOT NULL DEFAULT 14,
    bg_type TEXT NOT NULL DEFAULT 'solid',
    bg_image_path TEXT,
    bg_opacity REAL NOT NULL DEFAULT 1.0,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建用户索引
CREATE INDEX idx_themes_user_id ON themes(user_id);

-- 插入默认主题
INSERT INTO themes (id, name, foreground, background, cursor, selection)
VALUES ('default', '默认主题', '#cccccc', '#1e1e1e', '#ffffff', '#264f78');