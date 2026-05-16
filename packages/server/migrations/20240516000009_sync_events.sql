-- 创建同步事件表
CREATE TABLE sync_events (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    device_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    payload TEXT NOT NULL,
    version INTEGER NOT NULL,
    timestamp INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建用户索引
CREATE INDEX idx_sync_events_user_id ON sync_events(user_id);

-- 创建设备索引
CREATE INDEX idx_sync_events_device_id ON sync_events(device_id);

-- 创建实体索引
CREATE INDEX idx_sync_events_entity_id ON sync_events(entity_id);

-- 创建版本索引
CREATE INDEX idx_sync_events_version ON sync_events(user_id, entity_id, version);