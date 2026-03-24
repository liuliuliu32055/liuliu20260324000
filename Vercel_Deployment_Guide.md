# Vercel 部署指南

## 📋 部署前准备

### 1. 代码准备
- 确保所有代码已提交到 GitHub 仓库
- 检查 `package.json` 中的依赖版本
- 确保 `next.config.js` 配置正确

### 2. 环境变量准备
创建 `.env.production` 文件，包含以下变量（**请替换为您的实际值**）：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY

# DeepSeek API 配置
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DEEPSEEK_API_URL=https://api.deepseek.com

# 其他配置
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## 🚀 部署步骤

### 步骤1：登录 Vercel
1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub、GitLab 或 Bitbucket 账号登录
3. 点击 "New Project" 开始新项目部署

### 步骤2：导入 GitHub 仓库
1. 在 Vercel 控制台，点击 "Import Project"
2. 选择你的 GitHub 仓库
3. 授权 Vercel 访问仓库

### 步骤3：项目配置
1. **Framework Preset**: 选择 Next.js
2. **Root Directory**: `./` (如果项目在仓库根目录)
3. **Build Command**: `npm run build` (默认)
4. **Output Directory**: `.next` (默认)
5. **Install Command**: `npm install` (默认)

### 步骤4：环境变量配置
1. 在 "Environment Variables" 部分，点击 "Add"
2. 逐个添加以下环境变量：

```
变量名: NEXT_PUBLIC_SUPABASE_URL
值: https://YOUR_PROJECT_ID.supabase.co
```

```
变量名: NEXT_PUBLIC_SUPABASE_ANON_KEY
值: YOUR_SUPABASE_ANON_KEY
```

```
变量名: SUPABASE_SERVICE_ROLE_KEY
值: YOUR_SUPABASE_SERVICE_ROLE_KEY
```

```
变量名: DEEPSEEK_API_KEY
值: sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

```
变量名: DEEPSEEK_API_URL
值: https://api.deepseek.com
```

```
变量名: NEXT_PUBLIC_APP_URL
值: https://your-domain.vercel.app
```

### 步骤5：部署
1. 点击 "Deploy" 按钮
2. 等待构建完成（约 2-5 分钟）
3. 部署成功后，Vercel 会提供访问链接

## 🔗 域名配置（可选）

### 自定义域名
1. 在 Vercel 项目设置中，进入 "Domains"
2. 输入您的域名（如 `ai-reader.yourdomain.com`）
3. 按照提示配置 DNS 记录
4. 等待 DNS 生效（最多 24 小时）

## 🛠️ 项目维护

### 本地启动命令
```bash
# 安装依赖
npm install

# 开发环境启动
npm run dev

# 生产环境构建
npm run build

# 生产环境启动
npm start
```

### 常见问题排查

#### 1. API 调用失败
**症状**: 页面显示 "API 请求失败" 或网络错误
**排查步骤**:
1. 检查环境变量是否配置正确
2. 检查 API 额度是否充足（DeepSeek 控制台）
3. 查看 Vercel 日志：`vercel logs --prod`
4. 检查网络连接和防火墙设置

#### 2. PDF 解析失败
**症状**: PDF 上传后无法解析或显示错误
**排查步骤**:
1. 检查 Supabase Storage 权限
2. 验证 PDF 文件格式是否支持
3. 查看服务器日志中的错误信息
4. 检查文件大小限制（默认 10MB）

#### 3. 用户认证问题
**症状**: 登录/注册失败
**排查步骤**:
1. 检查 Supabase Auth 配置
2. 验证邮箱验证是否开启
3. 检查网络请求的 CORS 设置
4. 查看 Supabase 控制台的 Authentication 日志

#### 4. 移动端显示异常
**症状**: 移动端样式错乱或功能不可用
**排查步骤**:
1. 检查 Tailwind 响应式断点
2. 验证触摸事件处理
3. 测试不同设备尺寸
4. 检查移动端布局组件

## 📊 监控与维护

### 1. 性能监控
- Vercel Analytics: 查看页面加载速度
- Web Vitals: 监控 Core Web Vitals 指标
- 错误追踪: 使用 Sentry 或类似工具

### 2. 数据备份
#### Supabase 数据库备份
```sql
-- 手动备份（在 Supabase 控制台执行）
pg_dump -h db.supabase.co -U postgres -d postgres -f backup.sql

-- 自动备份（设置定期备份）
-- 在 Supabase Dashboard → Database → Backups 中配置
```

#### 文件存储备份
1. Supabase Storage → 手动下载重要文件
2. 配置 Supabase 存储桶的定期备份

### 3. 成本控制
#### 免费层限制
- **Vercel**: 100GB 带宽/月，1000 函数调用/天
- **Supabase**: 500MB 数据库，1GB 文件存储
- **DeepSeek API**: 按使用量计费

#### 预算设置
1. DeepSeek 控制台设置每月预算
2. Vercel 设置使用量告警
3. Supabase 监控使用量

## 🔄 更新与升级

### 1. 代码更新流程
```bash
# 本地开发
git pull origin main
npm install
npm run dev

# 测试
npm run test

# 部署
git push origin main
# Vercel 会自动部署
```

### 2. 依赖更新
```bash
# 检查更新
npm outdated

# 更新所有依赖
npm update

# 更新特定依赖
npm install package-name@latest

# 更新 Next.js
npm install next@latest
```

### 3. 数据库迁移
```sql
-- 创建新表
CREATE TABLE new_table (...);

-- 数据迁移
INSERT INTO new_table SELECT * FROM old_table;

-- 删除旧表
DROP TABLE old_table;
```

## 🆘 技术支持

### 1. 官方文档
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Vercel: https://vercel.com/docs
- DeepSeek API: https://platform.deepseek.com/api-docs

### 2. 社区支持
- GitHub Issues: 报告 bug 和功能请求
- Discord/Slack: 开发者社区
- Stack Overflow: 技术问题

### 3. 紧急联系方式
- 项目维护者邮箱: [您的邮箱]
- GitHub 仓库: [您的仓库地址]
- 部署状态: https://vercel.com/[您的用户名]/[项目名]

## 📈 扩展建议

### 1. 性能优化
- 启用图片优化：`next/image`
- 实现代码分割：动态导入组件
- 使用 CDN 缓存静态资源

### 2. 功能增强
- 添加实时协作功能
- 集成更多 AI 模型（OpenAI、Claude 等）
- 实现团队协作和权限管理

### 3. 安全加固
- 启用 HTTPS 强制跳转
- 设置 CSP（Content Security Policy）
- 实现 API 速率限制

---

**最后更新**: 2024年12月
**维护者**: AI 伴读助手开发团队
**状态**: ✅ 生产就绪