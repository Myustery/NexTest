# NexTest

> 跨平台终端工具，支持桌面端和Web端

## 项目简介

NexTest 是一款现代化的终端工具，提供：

- 精美的用户界面和动画效果
- 强大的多终端管理能力
- 会话管理与多级文件夹支持
- 命令编辑与执行功能
- 多端实时同步
- 用户系统与分享功能

## 技术栈

| 技术 | 说明 |
|------|------|
| Tauri | 桌面端框架（Rust） |
| Axum | Web 后端框架（Rust） |
| React | UI 框架 |
| TypeScript | 前端语言 |
| xterm.js | 终端模拟器 |
| shadcn/ui | UI 组件库 |

## 项目结构

```
NexTest/
├── packages/
│   ├── core/        # 共享核心库（Rust）
│   ├── web/         # Web 前端
│   ├── desktop/     # Tauri 桌面应用
│   └── server/      # 后端服务（Axum）
├── .github/         # CI/CD 配置
└── docs/            # 文档
```

## 开发指南

### 环境要求

- Node.js: v22.x LTS
- Rust: 1.78+ stable
- pnpm: v9.x

### 安装依赖

```bash
# 安装 Node.js 依赖
pnpm install

# Rust 依赖会在首次构建时自动安装
```

### 开发命令

```bash
# 启动 Web 开发服务器
pnpm dev

# 启动桌面端开发模式
pnpm dev:desktop

# 构建所有项目
pnpm build

# 运行代码检查
pnpm lint

# 运行格式化
pnpm format
```

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