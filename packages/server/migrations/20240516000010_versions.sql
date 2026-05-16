-- 创建版本表
CREATE TABLE versions (
    id TEXT PRIMARY KEY NOT NULL,
    version TEXT NOT NULL UNIQUE,
    release_date INTEGER NOT NULL,
    changelog TEXT NOT NULL,
    download_url TEXT NOT NULL,
    signature TEXT,
    hash TEXT,
    size INTEGER NOT NULL,
    platform TEXT NOT NULL,
    update_type TEXT NOT NULL DEFAULT 'full',
    active INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- 创建版本号索引
CREATE INDEX idx_versions_version ON versions(version);

-- 创建平台索引
CREATE INDEX idx_versions_platform ON versions(platform);