-- 创建快捷键表
CREATE TABLE shortcuts (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT,
    action TEXT NOT NULL UNIQUE,
    key TEXT NOT NULL,
    enabled INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建用户索引
CREATE INDEX idx_shortcuts_user_id ON shortcuts(user_id);

-- 插入默认快捷键
INSERT INTO shortcuts (id, action, key, enabled) VALUES
    ('new-session', 'Ctrl+Shift+T', 1),
    ('close-session', 'Ctrl+W', 1),
    ('next-session', 'Ctrl+Tab', 1),
    ('prev-session', 'Ctrl+Shift+Tab', 1),
    ('split-horizontal', 'Ctrl+\\', 1),
    ('split-vertical', 'Ctrl+Shift+\\', 1),
    ('toggle-fullscreen', 'F11', 1),
    ('open-settings', 'Ctrl+,', 1),
    ('search-terminal', 'Ctrl+F', 1),
    ('clear-terminal', 'Ctrl+L', 1),
    ('execute-command', 'Ctrl+Enter', 1),
    ('stop-command', 'Ctrl+C', 1);