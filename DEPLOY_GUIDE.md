# 🚀 部署到 Vercel 详细指南

## 快速部署步骤（5分钟搞定）

### 方案一：通过 Vercel CLI 部署（推荐）

#### 1. 安装 Vercel CLI
```bash
npm install -g vercel
```

#### 2. 登录 Vercel
```bash
vercel login
```
会打开浏览器，登录您的 Vercel 账号（如果没有会提示注册）

#### 3. 部署项目
在项目根目录执行：
```bash
vercel
```

按照提示操作：
- 问"Set up and deploy"? 选择 `Yes`
- 问"Link to existing project"? 选择 `No`
- 输入项目名称（或使用默认的）
- 选择部署环境（默认为 Production）

部署完成后，Vercel 会给您一个网址，例如：
`https://ai-reading-assistant.vercel.app`

#### 4. 设置环境变量
```bash
vercel env add DEEPSEEK_API_KEY production
```
输入您的 API Key: `sk-89110f071ffe41ceb64353c5d0affaf6`

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
```
输入: `https://vulgoixjxbxftolapabj.supabase.co`

```bash
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
```
输入: `sb_publishable_21nixa31YXB39xiuBA2s7w_FScAXxEH

#### 5. 重新部署
```bash
vercel --prod
```

**完成！** 现在您可以分享这个网址给任何人访问了！

---

### 方案二：通过 Vercel 网站部署（可视化操作）

#### 1. 注册/登录 Vercel
访问：https://vercel.com
使用 GitHub、GitLab 或其他账号登录

#### 2. 导入项目
点击 "Add New" → "Project"

#### 3. 连接 Git 仓库
- 如果项目在 GitHub：点击 "Import" 按钮
- 如果不在 GitHub：可以选择 "Upload" 手动上传

#### 4. 配置环境变量
在项目设置页面，添加以下环境变量：

| 变量名 | 值 |
|--------|-----|
| `DEEPSEEK_API_KEY` | `sk-89110f071ffe41ceb64353c5d0affaf6` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://vulgoixjxbxftolapabj.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_21nixa31YXB39xiuBA2s7w_FScAXxEH

#### 5. 部署
点击 "Deploy" 按钮，等待部署完成（通常 1-2 分钟）

#### 6. 获取网址
部署完成后，Vercel 会提供一个免费域名，例如：
`https://ai-reading-assistant.vercel.app`

---

### 方案三：手动上传部署（无 Git 仓库）

#### 1. 准备部署文件
在项目根目录创建 `.vercelignore` 文件：
```
.env.local
node_modules
.next
.git
```

#### 2. 登录 Vercel
```bash
vercel login
```

#### 3. 部署到 Production
```bash
vercel --prod
```

#### 4. 添加环境变量
访问 Vercel 控制台：
1. 进入您的项目
2. 点击 "Settings" → "Environment Variables"
3. 添加上述三个环境变量
4. 重新部署

---

## 🔐 安全注意事项

### 重要提示：
1. **不要将 `.env.local` 文件上传到 Git**
2. **保护您的 API Key**，不要分享给他人
3. **Supabase 配置** 已经配置好，支持多用户
4. 用户注册/登录功能已经实现

### 用户访问流程：
1. 访问您的网址（如 `https://ai-reading-assistant.vercel.app`）
2. 点击"注册"创建账号
3. 使用邮箱和密码登录
4. 开始使用 AI 伴读功能

---

## 🌐 分享您的应用

部署完成后，您可以：

1. **分享网址**：直接发送 Vercel 提供的网址给他人
2. **自定义域名**（可选）：
   - 在 Vercel 控制台点击 "Settings" → "Domains"
   - 添加您自己的域名
   - 配置 DNS 解析

---

## 📱 部署后访问

- **桌面端**：在浏览器中输入网址即可
- **移动端**：在手机浏览器中输入网址
- **分享**：将网址发送给任何人，他们都可以访问

---

## 🔍 常见问题

### Q1: 部署后访问报错
**A**: 检查环境变量是否正确配置

### Q2: 用户无法注册
**A**: 检查 Supabase 数据库表是否已创建

### Q3: AI 功能不工作
**A**: 确认 DEEPSEEK_API_KEY 已正确添加到 Vercel 环境变量

### Q4: 如何更新应用
**A**: 修改代码后，运行 `vercel --prod` 重新部署

---

## 🎯 推荐部署方案

**如果您有 GitHub**：使用方案二（通过网站导入）
**如果您没有 Git**：使用方案一（CLI 部署）
**如果只是快速测试**：使用方案三（手动上传）

---

## 💰 成本说明

Vercel 免费套餐包含：
- ✅ 无限项目
- ✅ 100GB 带宽/月
- ✅ 100 次构建/月
- ✅ 自动 HTTPS
- ✅ 自定义域名支持

**完全免费，无需付费！**

---

需要我帮您执行具体的部署操作吗？
