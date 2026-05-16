-- 创建用户设备表（用于跨端登录检测）
CREATE TABLE user_devices (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    device_id TEXT NOT NULL,
    device_name TEXT,
    platform TEXT NOT NULL,
    last_login_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, device_id)
);

-- 创建用户索引
CREATE INDEX idx_user_devices_user_id ON user_devices(user_id);

-- 创建设备索引
CREATE INDEX idx_user_devices_device_id ON user_devices(device_id);