-- 创建分享表
CREATE TABLE shares (
    id TEXT PRIMARY KEY NOT NULL,
    from_user_id TEXT NOT NULL,
    share_type TEXT NOT NULL,
    content_id TEXT NOT NULL,
    content_snapshot TEXT NOT NULL,
    include_command_editors INTEGER NOT NULL DEFAULT 0,
    allow_forward INTEGER NOT NULL DEFAULT 1,
    version INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建发起者索引
CREATE INDEX idx_shares_from_user_id ON shares(from_user_id);

-- 创建内容索引
CREATE INDEX idx_shares_content_id ON shares(content_id);

-- 创建分享接收者关联表
CREATE TABLE share_recipients (
    id TEXT PRIMARY KEY NOT NULL,
    share_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    accepted INTEGER NOT NULL DEFAULT 0,
    accepted_at INTEGER,
    FOREIGN KEY (share_id) REFERENCES shares(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(share_id, user_id)
);

-- 创建分享索引
CREATE INDEX idx_share_recipients_share_id ON share_recipients(share_id);

-- 创建用户索引
CREATE INDEX idx_share_recipients_user_id ON share_recipients(user_id);