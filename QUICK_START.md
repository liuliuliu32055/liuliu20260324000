# AI 伴读助手 - 快速启动指南

## 🚀 5分钟快速启动

### 步骤 1：克隆项目
```bash
git clone <repository-url>
cd ai-reading-assistant
```

### 步骤 2：安装依赖
```bash
npm install
```

### 步骤 3：获取 API 密钥

#### 1. Supabase（数据库和存储）
1. 访问 [https://supabase.com](https://supabase.com)
2. 注册账号
3. 创建新项目
4. 获取：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### 2. DeepSeek（AI 模型）
1. 访问 [https://platform.deepseek.com](https://platform.deepseek.com)
2. 使用手机号 15922233923 登录
3. 创建 API Key

### 步骤 4：配置环境
```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑 .env.local 文件
nano .env.local

# 添加以下配置：
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
DEEPSEEK_API_KEY=your-deepseek-api-key
```

### 步骤 5：初始化数据库
```bash
# 访问 Supabase SQL 编辑器
# 运行以下 SQL 语句：

-- 1. 创建 users 表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. 创建 documents 表
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  file_name TEXT NOT NULL,
  file_key TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  parse_status TEXT DEFAULT 'pending',
  page_count INTEGER,
  parsed_text TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. 创建 notes 表
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  document_id UUID REFERENCES documents(id),
  paragraph_id TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  highlighted_text TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 步骤 6：启动项目
```bash
# 开发模式
npm run dev

# 或生产构建
npm run build
npm start
```

## 🌐 访问应用

1. **开发环境**: http://localhost:3000
2. **默认页面**:
   - 首页: `/`
   - 登录: `/login`
   - 注册: `/register`
   - 文档管理: `/documents`
   - 案例库: `/cases`

## 👤 测试账户

**管理员账户**（已内置）：
- 邮箱：admin@example.com
- 密码：Admin123!

**普通用户**（注册后使用）：
- 自行注册账户

## 🚀 一键部署脚本

### Linux/macOS
```bash
#!/bin/bash

# 1. 克隆项目
git clone <repository-url> ai-reading-assistant
cd ai-reading-assistant

# 2. 安装依赖
npm install

# 3. 配置环境变量
echo "请配置以下环境变量："
echo ""
echo "NEXT_PUBLIC_SUPABASE_URL=你的Supabase_URL"
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Anon_Key"
echo "DEEPSEEK_API_KEY=你的DeepSeek_API_Key"
echo ""
echo "配置完成后，运行以下命令："
echo "npm run build"
echo "npm start"
```

### Windows (PowerShell)
```powershell
# 1. 克隆项目
git clone <repository-url> ai-reading-assistant
cd ai-reading-assistant

# 2. 安装依赖
npm install

# 3. 配置环境变量
Write-Host "请配置以下环境变量：" -ForegroundColor Yellow
Write-Host "" -ForegroundColor Yellow
Write-Host "NEXT_PUBLIC_SUPABASE_URL=你的Supabase_URL"
Write-Host "NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Anon_Key"
Write-Host "DEEPSEEK_API_KEY=你的DeepSeek_API_Key"
Write-Host "" -ForegroundColor Yellow
Write-Host "配置完成后，运行以下命令：" -ForegroundColor Green
Write-Host "npm run build"
Write-Host "npm start"
```

## 📱 移动端访问

### iOS Safari / Chrome
1. 打开 Safari 或 Chrome
2. 输入: `http://[你的服务器IP]:3000`
3. 添加到主屏幕（可选）

### Android Chrome
1. 打开 Chrome
2. 输入: `http://[你的服务器IP]:3000`
3. 添加到主屏幕（可选）

## 🔧 常见配置

### 端口冲突
```bash
# 如果端口 3000 被占用
# 修改 package.json 中的 dev 命令：
# "dev": "next dev -p 3001"
```

### 内存不足
```bash
# 如果遇到内存问题
export NODE_OPTIONS="--max-old-space-size=4096"
```

### 防火墙配置
```bash
# 开放端口
sudo ufw allow 3000
```

## 🐳 Docker 部署（可选）

### 使用 Docker Compose
```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
      - NODE_ENV=production
    restart: unless-stopped
```

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

## 🚨 故障排除

### 1. 无法启动服务器
```bash
# 检查端口占用
netstat -tulpn | grep :3000

# 杀死占用进程
sudo kill -9 <PID>

# 重启服务
npm run dev
```

### 2. 数据库连接失败
```bash
# 检查环境变量
echo $NEXT_PUBLIC_SUPABASE_URL

# 测试数据库连接
npm run test:db
```

### 3. AI 功能不可用
```bash
# 验证 API 密钥
node -e "console.log(process.env.DEEPSEEK_API_KEY ? 'Configured' : 'Not configured')"

# 测试 API 连接
npm run test:ai
```

### 4. 文件上传失败
```bash
# 检查存储配置
npm run test:storage
```

## 📞 获取帮助

### 1. 查看日志
```bash
# 前端日志
tail -f .next/server/logs/error.log

# 服务器日志
tail -f logs/server.log
```

### 2. 运行诊断
```bash
npm run diagnose
```

### 3. 重置配置
```bash
npm run reset
```

## 🎯 下一步

1. 创建第一个用户
2. 上传测试文档
3. 体验 AI 伴读功能
4. 配置更多设置

---

**注意**: 首次启动可能需要 1-2 分钟进行初始化。

**安全建议**: 生产环境中请使用 HTTPS 和安全的数据库配置。

**支持**: 如有问题，请查看项目文档或联系技术支持。