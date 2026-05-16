# 贡献指南

感谢您对 NexTest 项目的关注！本文档将帮助您了解如何为项目做出贡献。

## 开发环境设置

### 1. 安装必要工具

- Node.js v22.x LTS
- Rust 1.78+ stable
- pnpm v9.x
- Git

### 2. 克隆仓库

```bash
git clone https://github.com/Myustery/NexTest.git
cd NexTest
```

### 3. 安装依赖

```bash
pnpm install
```

## 代码规范

### Rust 代码规范

- 使用 `rustfmt` 格式化代码
- 使用 `clippy` 进行代码检查
- 所有公共 API 必须有文档注释
- 注释使用中文

```bash
# 格式化 Rust 代码
cargo fmt

# 运行 clippy 检查
cargo clippy
```

### TypeScript/JavaScript 代码规范

- 使用 ESLint 和 Prettier
- 使用 TypeScript 类型安全
- 注释使用中文

```bash
# 格式化前端代码
pnpm format

# 运行 ESLint 检查
pnpm lint
```

## Git 提交规范

使用约定式提交格式：

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

示例：

```
feat(core): 添加用户数据模型
fix(server): 修复 WebSocket 断连问题
docs: 更新 README 开发指南
```

## 分支策略

- `main`: 主分支，稳定版本
- `develop`: 开发分支
- `feature/*`: 功能分支
- `fix/*`: 修复分支

## Pull Request 流程

1. 从 `develop` 分支创建新分支
2. 进行开发和测试
3. 确保代码通过所有检查
4. 提交 Pull Request 到 `develop`
5. 等待代码审查

## 问题反馈

请在 GitHub Issues 中提交问题报告，包含：

- 问题描述
- 复现步骤
- 预期行为
- 实际行为
- 环境信息

## 许可证

本项目采用 MIT 许可证，贡献的代码将同样采用此许可证。