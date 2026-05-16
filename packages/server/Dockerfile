# NexTest 服务端 Dockerfile
# 多阶段构建，优化镜像大小

# 构建阶段
FROM rust:1.78-bookworm AS builder

WORKDIR /app

# 安装依赖
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# 复制 Cargo 文件
COPY Cargo.toml Cargo.lock ./
COPY packages/core/Cargo.toml ./packages/core/
COPY packages/server/Cargo.toml ./packages/server/

# 创建空的 src 目录以缓存依赖
RUN mkdir -p packages/core/src packages/server/src
RUN echo "fn main() {}" > packages/core/src/lib.rs
RUN echo "fn main() {}" > packages/server/src/main.rs

# 构建依赖
RUN cargo build --release -p nextest-server

# 复制源代码
COPY packages/core/src ./packages/core/src
COPY packages/server/src ./packages/server/src
COPY packages/server/migrations ./packages/server/migrations

# 构建应用
RUN touch packages/core/src/lib.rs packages/server/src/main.rs
RUN cargo build --release -p nextest-server

# 运行阶段
FROM debian:bookworm-slim

WORKDIR /app

# 安装运行时依赖
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

# 从构建阶段复制二进制文件
COPY --from=builder /app/target/release/nextest-server /app/
COPY --from=builder /app/packages/server/migrations /app/migrations

# 创建数据目录
RUN mkdir -p /app/data

# 设置环境变量
ENV DATABASE_URL=sqlite:/app/data/nextest.db
ENV RUST_LOG=info

# 暴露端口
EXPOSE 3000

# 运行服务
CMD ["./nextest-server"]