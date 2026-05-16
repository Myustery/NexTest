# NexTest 部署说明

## Docker 部署

### 构建镜像

```bash
cd packages/server
docker build -t nextest-server:latest -f Dockerfile ../..
```

### 使用 Docker Compose

```bash
cd packages/server
docker-compose up -d
```

### 查看日志

```bash
docker logs nextest-server
```

### 停止服务

```bash
docker-compose down
```

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| DATABASE_URL | SQLite 数据库路径 | sqlite:nextest.db |
| RUST_LOG | 日志级别 | info |

## 数据持久化

数据存储在 Docker volume `nextest-data` 中，位于容器内 `/app/data` 目录。

## 健康检查

服务提供 `/health` 端点用于健康检查。

## 端口

- 3000: HTTP API 服务
- WebSocket 服务也通过 3000 端口提供