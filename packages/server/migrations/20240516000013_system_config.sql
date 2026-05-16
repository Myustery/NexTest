-- 创建系统配置表
CREATE TABLE system_config (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- 插入默认配置
INSERT INTO system_config (key, value) VALUES
    ('system_name', '"NexTest"'),
    ('check_update_frequency', '"daily"'),
    ('max_upload_size', '"104857600"');