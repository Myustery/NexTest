# NexTest 架构设计文档

> 创建日期：2026-05-14
> 最后更新：2026-05-17
> 状态：开发中

---

## 一、项目概述

### 1.1 项目简介

NexTest（原名 NextShell）是一款跨平台终端工具，同时支持桌面端和网页端，提供 VS Code 风格的现代化 UI 设计、多协议连接支持，以及强大的多终端管理能力。

### 1.2 项目名称

- 名称：NexTest
- 要求：名称定义为变量/常量，便于后续修改

### 1.3 目标平台

- 优先：Windows
- 后续扩展：macOS、Linux

---

## 二、技术栈

### 2.1 桌面端

| 技术 | 说明 |
|------|------|
| Tauri v2 | Rust 框架，资源占用少，性能好 |
| portable-pty | 伪终端实现，支持本地 Shell |
| ssh2 | SSH 连接库 |
| serialport | 串口通信库 |
| rusqlite | 本地 SQLite 数据库 |
| tauri-plugin-shell | 进程管理 |
| tauri-plugin-fs | 文件系统 |
| tauri-plugin-dialog | 文件对话框 |

### 2.2 Web 端

与桌面端共享同一套前端代码，但不支持真实终端连接（仅模拟展示）。

### 2.3 前端

| 技术 | 说明 |
|------|------|
| Vite | 构建工具，快速 |
| React 18 | UI 框架 |
| TypeScript | 类型安全 |
| Zustand | 状态管理，轻量级 |
| xterm.js | 终端模拟器，VS Code 同款 |
| Tailwind CSS | 原子化 CSS |
| JetBrains Mono | 代码字体 |

### 2.4 后端

| 技术 | 说明 |
|------|------|
| Rust | 语言 |
| Axum | Web 框架 |
| SQLite | 数据库 |
| WebSocket | 实时通信 |

---

## 三、UI 布局设计

### 3.1 整体布局（已实现）

```
┌─────────────────────────────────────────────────────────────┐
│  [图标] NexTest    [新建] [搜索] [设置]     [─][□][×]       │  标题栏
├────┬───────────────────────────────────────────────────┬────┤
│ 📁 │ [Tab1] [Tab2] [+]                           [🔍] │ 🔧 │  Tab栏
│ 📂 ├───────────────────────────────────────────────────┤ 📦 │
│ ⚡ │                                                       │    │
│ 🖥️ │                   终端界面                            │    │  主区域
│ ⚡ │                                                       │    │
│   │                                                       │    │
├────┴───────────────────────────────────────────────────┴────┤
│ ✓ 就绪 · PowerShell · 会话1       NexTest v0.1.0  UTF-8    │  状态栏
└─────────────────────────────────────────────────────────────┘
```

### 3.2 区域说明

#### 3.2.1 活动栏（最左侧）

- 位置：最左侧
- 宽度：48px
- 功能：图标导航
- 图标：资源管理器、搜索、Git、调试、扩展、设置

#### 3.2.2 会话管理区（左侧）

- 位置：左侧
- 功能：管理多个会话
- 特性：可折叠、右键菜单
- 操作：点击 + 新建会话

#### 3.2.3 终端区（中间）

- 顶部：Tab 页签栏（支持多标签）
- 中部：xterm.js 终端界面
- 特性：
  - Tab 可关闭
  - 右键菜单（复制/粘贴/清屏/搜索）

#### 3.2.4 工具侧边栏（右侧）

- 位置：右侧
- 功能：快捷命令、命令片段
- 特性：默认折叠

#### 3.2.5 状态栏（底部）

- 位置：最底部
- 高度：22px
- 颜色：蓝色背景
- 内容：连接状态、会话信息、版本号、编码

### 3.3 布局尺寸

| 区域 | 默认宽度 | 最小宽度 |
|------|----------|----------|
| 活动栏 | 48px | - |
| 会话管理区 | 240px | 180px |
| 终端区 | 自适应 | - |
| 工具侧边栏 | 240px | 180px |
| 状态栏 | - | 22px 高 |

---

## 四、核心功能模块

### 4.1 连接协议（已实现）

| 协议 | 说明 | 认证方式 | 实现状态 |
|------|------|----------|----------|
| 本地终端 | CMD, PowerShell, Bash, WSL | - | ✅ |
| SSH | 远程服务器连接 | 密码/密钥 | ✅ |
| Telnet | Telnet 协议连接 | - | ✅ |
| 串口 | COM/USB 串口通信 | - | ✅ |

### 4.2 会话创建弹窗（已实现）

- 支持四种连接类型选择
- 动态表单（根据协议显示不同字段）
- 表单验证
- 本地终端：选择 Shell 类型
- SSH：主机、端口、用户名、密码/密钥
- Telnet：主机、端口
- 串口：端口、波特率、数据位、校验位、停止位、流控

### 4.3 终端管理

#### 4.3.1 Tab 页签

- 每个 Tab 对应一个会话
- 显示 Shell 图标 + 会话名称
- 关闭按钮悬停显示

#### 4.3.2 右键菜单

不同区域不同菜单：
- 终端区：复制、粘贴、全选、清屏、搜索、分屏
- Tab 标签：关闭、关闭其他、关闭所有、重命名
- 会话项：打开、复制名称、关闭终端

### 4.4 数据库持久化（已实现）

- 使用 rusqlite 存储
- 数据库文件：`nextest.db`（exe 同目录）
- 存储内容：会话配置、最后使用时间

### 4.5 自定义标题栏（已实现）

- 沉浸式设计
- 窗口控制：最小化、最大化、关闭
- 工具按钮：新建终端、搜索、设置

---

## 五、后端架构

### 5.1 PTY 模块

```
ConnectionBackend trait
    ├── LocalBackend (portable-pty)
    ├── SshBackend (ssh2)
    ├── TelnetBackend (TcpStream)
    └── SerialBackend (serialport)
```

### 5.2 Tauri 命令

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

---

## 六、文件结构

```
packages/desktop/src-tauri/
├── src/
│   ├── main.rs           # 入口
│   ├── commands.rs       # Tauri 命令
│   ├── db/
│   │   └── mod.rs        # 数据库模块
│   └── pty/
│       └── mod.rs        # PTY 连接模块

packages/desktop/src/
├── ui/
│   ├── components/
│   │   ├── ContextMenu.tsx       # 右键菜单
│   │   ├── CreateSessionModal.tsx # 会话创建弹窗
│   │   └── TitleBar.tsx          # 自定义标题栏
│   ├── layout/
│   │   ├── Layout.tsx            # 主布局
│   │   ├── SessionPanel.tsx      # 会话面板
│   │   ├── TerminalArea.tsx      # 终端区
│   │   └── ToolSidebar.tsx       # 工具侧边栏
│   └── pages/
│       └── SettingsPage.tsx      # 设置页面
└── index.css                     # 全局样式
```

---

## 七、样式设计

### 7.1 颜色变量

```css
--color-primary: #0078d4;      /* 主色 */
--color-bg-deep: #1e1e1e;      /* 最深背景 */
--color-bg: #252526;           /* 背景色 */
--color-bg-elevated: #2d2d30;  /* 提升背景 */
--color-bg-hover: #37373d;     /* 悬停背景 */
--color-bg-active: #094771;    /* 激活背景 */
--color-border: #3c3c3c;       /* 边框色 */
--color-fg: #cccccc;           /* 前景色 */
--color-fg-muted: #858585;     /* 次要前景 */
```

### 7.2 字体

- UI 字体：系统字体
- 代码字体：JetBrains Mono, Fira Code, Consolas

---

## 八、CI/CD

### 8.1 构建触发

- `build-windows.yml`: 仅在 tag push 或手动触发
- `test.yml`: 仅在 PR 时运行

### 8.2 构建产物

- Windows: `NexTest-{version}-Portable.exe`
- 日志文件：`nextest-debug.log`, `nextest-startup.log`

---

> 文档版本：v2.0
> 最后更新：2026-05-17
