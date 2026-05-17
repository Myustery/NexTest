# NexTest

> 跨平台终端工具，支持桌面端和 Web 端

## 项目简介

NexTest 是一款现代化的终端工具，提供：

- VS Code 风格精美界面
- 多协议连接支持（本地终端、SSH、Telnet、串口）
- 会话管理与持久化
- 多标签终端支持
- 自定义右键菜单
- 多端实时同步

## 技术栈

| 技术 | 说明 |
|------|------|
| Tauri v2 | 桌面端框架（Rust） |
| Axum | Web 后端框架（Rust） |
| React 18 | UI 框架 |
| TypeScript | 前端语言 |
| xterm.js | 终端模拟器 |
| portable-pty | 伪终端实现 |
| ssh2 | SSH 连接 |
| serialport | 串口通信 |
| rusqlite | 本地数据库 |

## 项目结构

```
NexTest/
├── packages/
│   ├── core/           # 共享核心库（Rust）
│   ├── web/            # Web 前端
│   ├── desktop/        # Tauri 桌面应用
│   │   └── src-tauri/
│   │       ├── src/
│   │       │   ├── commands.rs  # Tauri 命令
│   │       │   ├── db/          # 数据库模块
│   │       │   └── pty/         # PTY 连接模块
│   │       └── tauri.conf.json
│   └── server/         # 后端服务（Axum）
├── .github/            # CI/CD 配置
└── docs/               # 文档
```

## 功能特性

### 连接协议

| 协议 | 说明 | 认证方式 |
|------|------|----------|
| 本地终端 | CMD, PowerShell, Bash, WSL | - |
| SSH | 远程服务器连接 | 密码/密钥 |
| Telnet | Telnet 协议连接 | - |
| 串口 | COM/USB 串口通信 | - |

### 桌面端 UI

- 自定义沉浸式标题栏
- 活动栏（左侧图标导航）
- 会话管理侧边栏
- 多标签终端区
- 工具侧边栏（快捷命令、命令片段）
- 状态栏（连接状态、版本信息）
- 自定义右键菜单

## 开发指南

### 环境要求

- Node.js: v22.x LTS
- Rust: 1.78+ stable
- pnpm: v10.x
- Tauri CLI: v2.x

### 安装依赖

```bash
pnpm install
```

### 开发命令

```bash
# 启动 Web 开发服务器
pnpm dev

# 启动桌面端开发模式
cd packages/desktop
pnpm tauri dev

# 构建桌面端
cd packages/desktop
pnpm tauri build

# 运行代码检查
pnpm lint

# 运行格式化
pnpm format
```

### 构建产物

- Windows: `NexTest-{version}-Portable.exe`
- 数据库: `nextest.db`（存储在 exe 同目录）
- 日志: `nextest-debug.log`（存储在 exe 同目录）

## API 命令

| 命令 | 说明 |
|------|------|
| `create_session` | 创建新会话连接 |
| `close_session` | 关闭会话 |
| `write_pty` | 写入终端数据 |
| `read_pty` | 读取终端输出 |
| `resize_pty` | 调整终端大小 |
| `get_sessions` | 获取保存的会话列表 |
| `save_session` | 保存会话配置 |
| `delete_session` | 删除会话配置 |
| `get_serial_ports` | 获取可用串口列表 |

## Git 提交规范

```
feat: 新功能
fix: 修复 Bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试
chore: 构建/工具
ci: CI/CD 配置
```

## 许可证

MIT License

## 作者

NexTest Team
