# NextShell 架构设计文档

> 创建日期：2026-05-14
> 状态：待审核

---

## 一、项目概述

### 1.1 项目简介

NextShell 是一款跨平台终端工具，同时支持桌面端和网页端，提供现代化的 UI 设计、精美的动画效果，以及强大的多终端管理能力。

### 1.2 项目名称

- 名称：NextShell
- 要求：名称定义为变量/常量，便于后续修改

### 1.3 目标平台

- 优先：Windows
- 后续扩展：macOS、Linux

---

## 二、技术栈

### 2.1 桌面端

| 技术 | 说明 |
|------|------|
| Tauri | Rust 框架，资源占用少，性能好 |
| tauri-plugin-shell | 进程管理 |
| tauri-plugin-fs | 文件系统 |
| tauri-plugin-sql | SQLite 数据库 |
| tauri-plugin-updater | 在线升级 |

### 2.2 Web 端

与桌面端共享同一套前端代码。

### 2.3 前端

| 技术 | 说明 |
|------|------|
| Vite | 构建工具，快速 |
| React | UI 框架 |
| TypeScript | 类型安全 |
| Zustand | 状态管理，轻量级 |
| xterm.js | 终端模拟器，VS Code 同款 |
| shadcn/ui | UI 组件库，现代美观 |
| Tailwind CSS | 原子化 CSS |
| Framer Motion | 动画库 |

### 2.4 后端

| 技术 | 说明 |
|------|------|
| Rust | 语言 |
| Axum | Web 框架 |
| SQLite | 数据库 |
| WebSocket | 实时通信 |

### 2.5 部署

- Docker 容器
- 直接部署

---

## 三、UI 布局设计

### 3.1 整体布局

```
┌──────────┬─────────────────────────────────────┬─────────┐
│ 会话管理区 │              终端区                  │ 工具栏   │
│ (可折叠)  │  [Tab1] [Tab2] [分身] [+]           │ (可折叠) │
│          │  ┌────────────┬────────────┐       │  🔧     │
│ 📁 文件夹1 │  │  终端界面1   │  终端界面2  │       │  📦     │
│   ├ 会话A  │  │             │             │       │  ...    │
│   └ 会话B  │  ├────────────┴────────────┤       │         │
│ 📁 文件夹2 │  │ 命令编辑区（可折叠，可拖拽）│       │         │
│   └ 会话C  │  │ [Tab1][Tab2][+]   ▶ ⏹      │       │         │
├──────────┴─────────────────────────────────────┴─────────┤
│                   全局命令编辑页面（底部）                    │
│                   [Tab1][Tab2][+]        ▶ ⏹              │
└───────────────────────────────────────────────────────────┘
```

### 3.2 区域说明

#### 3.2.1 会话管理区（左侧）

- 位置：左侧
- 功能：管理多个会话，支持多级文件夹
- 特性：可折叠
- 文件夹层级：不限制
- 操作：右键新建文件夹/会话

#### 3.2.2 终端区（中间）

- 顶部：Tab 页签栏
- 中部：终端界面（支持分屏）
- 底部：命令编辑页面（可折叠）
- 特性：
  - Tab 支持分身（属性相同 + 独立进程）
  - 分屏时，每个终端各自对应一个命令编辑页面
  - 命令编辑区展开时，终端上缩，中间分割线可拖拽

#### 3.2.3 工具侧边栏（右侧）

- 位置：右侧
- 功能：命令工具等一系列工具
- 特性：
  - 默认折叠，显示图标
  - 点击图标展开
  - 展开时推开终端区
  - 可拖拽调整宽度

#### 3.2.4 全局命令编辑页面（底部）

- 位置：最底部
- 功能：全局命令编辑
- 特性：始终可见，作用域为全局

### 3.3 布局尺寸

| 区域 | 默认宽度 | 最小宽度 | 可调整 |
|------|----------|----------|--------|
| 会话管理区 | 200px | 150px | ✓ |
| 终端区 | 自适应 | 400px | - |
| 工具侧边栏 | 250px | 200px | ✓ |
| 命令编辑区 | 200px | 100px | ✓ |

### 3.4 动画设计

| 交互 | 动画效果 | 时长 |
|------|----------|------|
| 面板折叠/展开 | 滑动 + 淡入淡出 | 200ms |
| Tab 切换 | 淡入淡出 | 150ms |
| 分屏调整 | 平滑过渡 | 100ms |
| 命令执行 | 进度条动画 | 持续 |

---

## 四、核心功能模块

### 4.1 终端管理

#### 4.1.1 Tab 页签

- 每个 Tab 对应一个会话
- Tab 可创建分身（属性完全相同，独立进程）
- 关闭 Tab 即结束会话进程

#### 4.1.2 分屏

- 支持水平/垂直分屏
- 分屏时，每个终端界面各自对应一个命令编辑页面
- 命令编辑页面不被分隔，统一显示

#### 4.1.3 终端核心

- 基于 xterm.js
- 支持搜索（终端输出文本搜索）
- 支持自动补全
- 支持右键菜单（复制/粘贴/打开链接等）

### 4.2 会话管理

- 会话与 Tab 一对一映射
- 支持多级文件夹分组（不限制层级）
- 关闭 Tab 即结束会话进程

### 4.3 命令编辑页面

#### 4.3.1 结构

- 每个终端对应一个命令编辑页面
- 每个命令编辑页面可拥有多个文本 Tab
- 文本 Tab 名称支持自定义
- 文本 Tab 内容独立持久化，与 Tab 强绑定

#### 4.3.2 操作按钮

| 按钮 | 功能 |
|------|------|
| ▶ 播放 | 下发命令（选中部分/全部） |
| ⏸ 暂停 | 暂停下发，可继续 |
| ⏹ 终止 | 结束下发任务，重置状态 |

#### 4.3.3 下发逻辑

- 未选中文本 → 下发该页签所有文本
- 选中文本 → 仅下发选中文本
- 下发过程中播放按钮变为暂停按钮
- 暂停后可继续下发剩余命令
- 终止后不再考虑后续命令，重置状态

### 4.4 命令工具

#### 4.4.1 位置

- 工具侧边栏中
- 不同工具显示不同图标
- 点击图标展开侧边栏

#### 4.4.2 创建方式

- 在命令工具区域右键 → 新建命令
- 弹出文本输入框
- 输入框顶部可选择语法：command / python

#### 4.4.3 语法类型

**command 模式：**
- 逐行发送命令到终端

**python 模式：**
- 调用系统 Python 解释器
- 注入 `sendcmd` 函数
- `sendcmd(cmd, end_marker?)` 同步执行
  - 参数 `cmd`：要发送的命令
  - 参数 `end_marker`：可选，自定义结束标志
  - 返回值：终端对该命令的全部回显
- 回显结束判断：默认终端结束符，可自定义

#### 4.4.4 执行失败处理

- 用户可选择：继续执行 / 停止执行
- 默认：继续执行下一条

#### 4.4.5 持久化

- 命令工具内容持久化存储

### 4.5 历史记录

- 按会话 + Tab 粒度分别记录
- 不混在一起

### 4.6 快捷键

- 用户可自定义快捷键
- 禁止冲突（冲突时无法保存）

### 4.7 主题系统

- 颜色主题
- 字体（字体类型、字体大小）
- 背景（支持背景图片、透明度）

### 4.8 在线升级

#### 4.8.1 版本检查

- 客户端启动时自动检查新版本
- 用户可手动触发检查更新
- 检查频率可配置（每天/每周/手动）

#### 4.8.2 升级流程

```
客户端检查版本
    ↓
发现新版本 → 显示更新提示（版本号、更新日志）
    ↓
用户确认升级 → 下载安装包
    ↓
下载完成 → 校验文件完整性
    ↓
校验通过 → 执行安装
    ↓
安装完成 → 重启应用
```

#### 4.8.3 升级方式

| 方式 | 说明 |
|------|------|
| 增量更新 | 仅下载差异部分，节省流量 |
| 全量更新 | 下载完整安装包 |

优先使用增量更新，不支持时降级为全量更新。

#### 4.8.4 安全性

- 安装包签名验证
- HTTPS 下载
- 校验文件哈希

---

## 五、用户系统

### 5.1 账号字段

| 字段 | 唯一性 | 可修改 | 说明 |
|------|--------|--------|------|
| 邮箱 | ✓ | ✗ | 唯一标识 |
| 工号 | ✓ | ✓ | 可用于查找/分享 |
| 密码 | - | ✓ | - |

### 5.2 注册流程

- 输入：工号 + 邮箱 + 密码
- 验证：工号唯一性、邮箱唯一性

### 5.3 离线使用

- 未登录可使用
- 同步功能受限

### 5.4 跨端登录

#### 5.4.1 流程

```
Web 端登录页面
    ↓
检测本地是否有已登录客户端
    ├─ 有 → 显示用户信息，点击即登录
    └─ 无 → 显示正常登录表单
```

#### 5.4.2 检测方式

- Web 端通过设备标识查询服务器
- 服务器返回同设备上已登录的用户

---

## 六、分享功能

### 6.1 分享内容

- 会话
- 命令工具

### 6.2 分享权限

- 接收者可继续分享

### 6.3 分享选项

- 会话分享时，可选择是否携带命令编辑页签内容
- 如不携带，仅分享会话配置信息

### 6.4 更新机制

- 接收者获得的是副本
- 可查看原作者的更新
- 可选择是否同步更新

---

## 七、多端同步

### 7.1 同步范围

- 同一用户的 Web 端、本地端、不同机器的客户端
- 保持云端实时同步

### 7.2 同步机制

```
┌─────────────┐                    ┌─────────────┐
│  客户端 A   │◄───WebSocket──────►│             │
└─────────────┘                    │             │
                                   │   后端      │
┌─────────────┐                    │  (Axum)     │
│  客户端 B   │◄───WebSocket──────►│             │
└─────────────┘                    │             │
                                   │  ┌───────┐  │
┌─────────────┐                    │  │ 同步  │  │
│  客户端 C   │◄───轮询(降级)──────►│  │ 队列  │  │
└─────────────┘                    │  └───────┘  │
                                   └─────────────┘
```

### 7.3 实时通信

- 主：WebSocket 长连接
- 降级：轮询（WebSocket 断开时）

### 7.4 离线同步

- 本地暂存修改队列
- 恢复连接后自动同步

---

## 八、数据模型

### 8.1 用户

```typescript
interface User {
  id: string;              // 系统生成
  email: string;           // 唯一标识，不可修改
  employeeId: string;      // 工号，唯一，可修改
  passwordHash: string;    // 密码哈希
  name: string;            // 显示名称
  createdAt: number;
  updatedAt: number;
}
```

### 8.2 会话

```typescript
interface Session {
  id: string;
  name: string;
  folderId: string | null;
  createdAt: number;
  updatedAt: number;
}
```

### 8.3 文件夹

```typescript
interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  order: number;
}
```

### 8.4 Tab

```typescript
interface Tab {
  id: string;
  sessionId: string;
  name: string;
  terminalConfig: TerminalConfig;
  commandEditors: CommandEditorTab[];
}
```

### 8.5 命令编辑页签

```typescript
interface CommandEditorTab {
  id: string;
  name: string;
  content: string;
  syntax: 'command' | 'python';
  createdAt: number;
}
```

### 8.6 命令工具

```typescript
interface CommandTool {
  id: string;
  name: string;
  icon: string;
  syntax: 'command' | 'python';
  content: string;
  continueOnFailure: boolean;
}
```

### 8.7 分享

```typescript
interface Share {
  id: string;
  fromUserId: string;
  toUserIds: string[];
  type: 'session' | 'command-tool';
  contentId: string;
  contentSnapshot: any;
  includeCommandEditors: boolean;
  allowForward: boolean;
  version: number;
  createdAt: number;
}
```

### 8.8 主题

```typescript
interface Theme {
  id: string;
  name: string;
  colors: ColorScheme;
  font: FontConfig;
  background: BackgroundConfig;
}
```

### 8.9 快捷键

```typescript
interface Shortcut {
  id: string;
  key: string;
  action: string;
  enabled: boolean;
}
```

### 8.10 同步事件

```typescript
interface SyncEvent {
  id: string;
  userId: string;
  deviceId: string;
  type: 'create' | 'update' | 'delete';
  entityType: 'session' | 'tab' | 'command-tool' | 'folder';
  entityId: string;
  payload: any;
  version: number;
  timestamp: number;
}
```

### 8.11 版本信息

```typescript
interface Version {
  version: string;           // 版本号，如 "1.0.0"
  releaseDate: number;       // 发布日期
  changelog: string;         // 更新日志
  downloadUrl: string;       // 下载地址
  signature: string;         // 签名
  hash: string;              // 文件哈希
  size: number;              // 文件大小
  platform: 'windows' | 'macos' | 'linux';
  type: 'full' | 'incremental';
}
```

---

## 九、后端 API 设计

### 9.1 认证

```
POST   /api/auth/register     # 注册（工号+邮箱+密码）
POST   /api/auth/login        # 登录
POST   /api/auth/logout       # 登出
GET    /api/auth/me           # 当前用户信息
PATCH  /api/auth/me           # 修改用户信息（工号、密码）
GET    /api/auth/local-check  # 检测本地已登录用户
```

### 9.2 会话

```
GET    /api/sessions          # 获取会话列表
POST   /api/sessions          # 创建会话
PATCH  /api/sessions/:id      # 更新会话
DELETE /api/sessions/:id      # 删除会话
```

### 9.3 分享

```
POST   /api/shares            # 创建分享
GET    /api/shares/received   # 获取收到的分享
POST   /api/shares/:id/accept # 接收分享
GET    /api/shares/:id/updates# 查看分享更新
```

### 9.4 同步

```
WS     /ws/sync               # 实时同步 WebSocket
POST   /api/sync/pull         # 拉取更新（轮询降级）
POST   /api/sync/push         # 推送离线修改
```

### 9.5 升级

```
GET    /api/version/check     # 检查新版本
GET    /api/version/download/:version  # 下载安装包
GET    /api/version/diff/:from/:to     # 获取增量更新包
```

---

## 十、前端模块划分

```
src/
├── core/                    # 核心逻辑
│   ├── terminal/            # xterm.js 封装
│   ├── session/             # 会话管理
│   ├── command/             # 命令工具
│   └── history/             # 历史记录
├── ui/                      # UI 组件
│   ├── layout/              # 布局组件
│   │   ├── SessionPanel/    # 会话管理区
│   │   ├── TerminalArea/    # 终端区
│   │   ├── ToolSidebar/     # 工具侧边栏
│   │   └── GlobalCommand/   # 全局命令编辑
│   ├── terminal/            # 终端相关组件
│   │   ├── TerminalTab/     # Tab 页签
│   │   ├── TerminalScreen/  # 终端界面
│   │   ├── SplitPane/       # 分屏
│   │   └── CommandEditor/   # 命令编辑页面
│   └── settings/            # 设置组件
├── stores/                  # Zustand stores
├── hooks/                   # 自定义 hooks
└── utils/                   # 工具函数
```

---

## 十一、核心流程

### 11.1 终端命令执行流程

```
用户输入 → xterm.js → Tauri Shell Plugin → PTY 进程
                ↓
           输出回显 ← PTY 输出 ← Shell
```

### 11.2 命令工具执行流程

```
用户点击命令工具
    ↓
判断语法类型
    ├─ command → 逐行发送到终端
    └─ python → 调用系统 Python
                    ↓
              注入 sendcmd 函数
                    ↓
              执行脚本
                    ↓
              sendcmd(cmd) → 终端 → 等待回显 → 返回结果
```

### 11.3 会话同步流程

```
本地变更 → SQLite → 同步队列 → 后端 API → 远程存储
    ↑                                      ↓
    └──────────── 冲突检测 ←───────────────┘
```

---

## 十二、管理员后台

### 12.1 概述

管理员后台为 Web 端独立模块，用于系统管理和运维。

### 12.2 访问方式

- URL：`/admin`
- 权限：仅管理员角色可访问
- 认证：独立登录或复用用户系统（需管理员权限）

### 12.3 功能模块

#### 12.3.1 用户管理

| 功能 | 说明 |
|------|------|
| 用户列表 | 分页展示所有用户（工号、邮箱、注册时间、状态） |
| 用户搜索 | 按工号/邮箱搜索 |
| 用户详情 | 查看用户详细信息、设备列表、会话数量 |
| 编辑用户信息 | 修改用户工号、名称等信息 |
| 禁用/启用用户 | 禁用后用户无法登录 |
| 重置密码 | 管理员重置用户密码 |

#### 12.3.2 版本管理

| 功能 | 说明 |
|------|------|
| 版本列表 | 展示所有已发布版本 |
| 发布新版本 | 上传安装包、填写版本号、更新日志 |
| 编辑版本 | 修改版本信息、更新日志 |
| 撤回版本 | 撤回已发布版本（停止分发） |
| 版本统计 | 各版本安装数量、下载统计 |

#### 12.3.3 数据统计

| 功能 | 说明 |
|------|------|
| 概览面板 | 用户总数、今日活跃、会话总数等 |
| 用户统计 | 注册趋势、活跃度分布 |
| 使用统计 | 会话创建数、命令执行数 |
| 设备统计 | 各平台设备数量分布 |
| 时间维度 | 按日/周/月查看趋势 |

#### 12.3.4 系统配置

| 功能 | 说明 |
|------|------|
| 全局设置 | 系统名称、Logo、默认配置 |
| 公告管理 | 发布/编辑/删除系统公告 |
| 邮件配置 | SMTP 配置（用于通知邮件） |
| 存储配置 | 文件存储路径、容量限制 |
| 安全设置 | 密码策略、登录限制 |

### 12.4 数据模型

```typescript
interface Admin {
  id: string;
  userId: string;           // 关联用户
  role: 'super-admin' | 'admin';  // 角色
  permissions: string[];    // 权限列表
  createdAt: number;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'urgent';
  published: boolean;
  publishedAt: number | null;
  createdAt: number;
}

interface SystemConfig {
  key: string;
  value: any;
  updatedAt: number;
}
```

### 12.5 后端 API

```
# 用户管理
GET    /api/admin/users              # 用户列表
GET    /api/admin/users/:id          # 用户详情
PATCH  /api/admin/users/:id          # 修改用户（禁用/启用）
POST   /api/admin/users/:id/reset-pwd # 重置密码

# 版本管理
GET    /api/admin/versions           # 版本列表
POST   /api/admin/versions           # 发布新版本
PATCH  /api/admin/versions/:id       # 编辑版本
DELETE /api/admin/versions/:id       # 撤回版本

# 数据统计
GET    /api/admin/stats/overview     # 概览数据
GET    /api/admin/stats/users        # 用户统计
GET    /api/admin/stats/usage        # 使用统计
GET    /api/admin/stats/devices      # 设备统计

# 系统配置
GET    /api/admin/config             # 获取配置
PATCH  /api/admin/config             # 更新配置

# 公告管理
GET    /api/admin/announcements      # 公告列表
POST   /api/admin/announcements      # 创建公告
PATCH  /api/admin/announcements/:id  # 编辑公告
DELETE /api/admin/announcements/:id  # 删除公告
```

---

> 文档版本：v1.0
> 最后更新：2026-05-14