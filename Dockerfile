# 基础镜像（使用 Node.js 18，与你本地版本一致）
FROM node:18-alpine

# 设置工作目录
WORKDIR /

# 复制 package.json 和 package-lock.json（如果有）
COPY package*.json ./

# 安装依赖（包括 koa 等）
RUN npm install

# 复制项目所有文件到工作目录
COPY . .

# 暴露应用运行的端口（如果你的应用有端口，比如 3000）
EXPOSE 9990

# 启动命令（根据你的入口文件调整，比如 node index.js）
CMD ["node", "server.js"]