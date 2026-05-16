-- 创建用户表
CREATE TABLE users (
    id TEXT PRIMARY KEY NOT NULL,
    email TEXT NOT NULL UNIQUE,
    employee_id TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

-- 创建邮箱索引
CREATE INDEX idx_users_email ON users(email);

-- 创建工号索引
CREATE INDEX idx_users_employee_id ON users(employee_id);