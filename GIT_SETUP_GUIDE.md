# Git 安装和 GitHub 推送指南

## 步骤 1: 下载并安装 Git

### 下载 Git
1. 访问官方下载页面：https://git-scm.com/download/win
2. 下载最新的 Windows 版本（通常会自动识别您的系统）

### 安装 Git
1. 双击下载的安装文件（如 `Git-2.x.x.x-64-bit.exe`）
2. 按照以下步骤操作：

   **步骤 1**: 欢迎
   - 点击 "Next"

   **步骤 2**: 选择安装路径
   - 默认即可，点击 "Next"

   **步骤 3**: 选择组件
   - 默认即可，点击 "Next"

   **步骤 4**: 开始菜单文件夹
   - 默认即可，点击 "Next"

   **步骤 5**: 选择默认编辑器
   - 选择 "Vim" 或 "Notepad++"（推荐 Notepad++）
   - 点击 "Next"

   **步骤 6**: 设置初始分支名称
   - 保持默认 "main"
   - 点击 "Next"

   **步骤 7**: 调整 PATH 环境变量
   - 选择 "Git from the command line and also from 3rd-party software"（推荐）
   - 点击 "Next"

   **步骤 8**: 选择 HTTPS 后端传输
   - 选择 "Use the OpenSSL library"
   - 点击 "Next"

   **步骤 9**: 配置行尾转换
   - 选择 "Checkout Windows-style, commit Unix-style line endings"（推荐）
   - 点击 "Next"

   **步骤 10**: 配置终端模拟器
   - 选择 "Use Windows' default console window"
   - 点击 "Next"

   **步骤 11**: 选择默认的 'pull' 行为
   - 选择 "Fast-forward"
   - 点击 "Next"

   **步骤 12**: 选择凭据助手
   - 选择 "None"
   - 点击 "Next"

   **步骤 13**: 额外选项
   - 默认即可，点击 "Next"

   **步骤 14**: 配置实验性选项
   - 默认即可，点击 "Next"

   **步骤 15**: 安装
   - 点击 "Install"
   - 等待安装完成（1-2分钟）

   **步骤 16**: 完成
   - 点击 "Finish"

3. **重启命令行**
   - 关闭所有命令行窗口
   - 重新打开 PowerShell 或 CMD

---

## 步骤 2: 配置 Git

安装完成后，打开 PowerShell，执行以下命令：

### 2.1 配置用户名
```bash
git config --global user.name "您的名字"
```

### 2.2 配置邮箱
```bash
git config --global user.email "您的邮箱@example.com"
```

**重要**：请使用您即将在 GitHub 注册/登录时使用的邮箱

### 2.3 验证安装
```bash
git --version
```

如果显示 Git 版本号（如 `git version 2.x.x.x`），说明安装成功！

---

## 步骤 3: 注册/登录 GitHub

### 3.1 访问 GitHub
打开浏览器，访问：https://github.com

### 3.2 注册账号（如果没有）
1. 点击右上角的 "Sign up"
2. 填写：
   - Email: 您的邮箱
   - Password: 设置密码
   - Username: 用户名（建议使用英文，如 `yourname`）
3. 点击 "Continue"
4. 按照提示完成注册
5. 验证邮箱（GitHub 会发送验证邮件）

### 3.3 登录（如果有账号）
1. 点击右上角的 "Sign in"
2. 输入邮箱和密码登录

---

## 步骤 4: 创建 GitHub 仓库

### 4.1 创建新仓库
1. 登录后，点击右上角的 "+" 按钮
2. 选择 "New repository"
3. 填写仓库信息：
   - **Repository name**: `ai-reading-assistant`
   - **Description**: `AI 智能文档阅读助手 - 基于 Next.js + DeepSeek`
   - **选择 Public 或 Private**：
     - Public: 任何人都可以看到
     - Private: 只有您可以访问
   - **不要勾选** "Add a README file"（我们已经有了）
   - **不要勾选** "Add .gitignore"（我们已经有了）
4. 点击 "Create repository"

### 4.2 获取仓库地址
创建后，GitHub 会显示仓库地址，例如：
```
https://github.com/your-username/ai-reading-assistant.git
```

**复制这个地址**，稍后要用到！

---

## 步骤 5: 推送代码到 GitHub

安装完 Git 并重启命令行后，按照以下步骤操作：

### 5.1 初始化 Git 仓库
打开 PowerShell，进入项目目录：
```bash
cd d:/Users/Administrator/Desktop/20260323154302
```

初始化 Git：
```bash
git init
```

### 5.2 创建 .gitignore 文件
确保 `.gitignore` 文件包含以下内容（避免上传不必要的文件）：

```gitignore
# 依赖
node_modules
.pnp
.pnp.js

# 测试
coverage

# Next.js
.next/
out/
build
dist

# 生产环境
.env*.local
.env.production

# 调试
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# 编辑器
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# 本地数据
.codebuddy
```

### 5.3 添加所有文件到暂存区
```bash
git add .
```

### 5.4 创建第一次提交
```bash
git commit -m "Initial commit: AI 智能文档阅读助手 v2.0"
```

### 5.5 关联远程仓库
（将 `your-username` 替换为您的 GitHub 用户名）
```bash
git remote add origin https://github.com/your-username/ai-reading-assistant.git
```

### 5.6 推送代码到 GitHub
```bash
git branch -M main
git push -u origin main
```

**第一次推送时会要求输入凭证**：
- Username: 输入您的 GitHub 用户名
- Password: 输入您的 **Personal Access Token**（不是登录密码）

---

## 步骤 6: 创建 GitHub Personal Access Token

从 2021 年开始，GitHub 不再支持密码推送，需要使用 Personal Access Token。

### 6.1 创建 Token
1. 登录 GitHub
2. 点击右上角头像 → "Settings"
3. 左侧菜单选择 "Developer settings"
4. 选择 "Personal access tokens" → "Tokens (classic)"
5. 点击 "Generate new token (classic)"
6. 填写：
   - Note: `AI Reading Assistant`
   - Expiration: 选择 "No expiration" 或合适的过期时间
   - 勾选权限（scopes）：
     - ✅ repo（完整仓库访问权限）
     - ✅ workflow（工作流权限）
7. 点击 "Generate token"

### 6.2 复制 Token
- Token 生成后只会显示一次
- **立即复制并保存**，格式如：
  ```
  ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  ```

### 6.3 使用 Token 推送
当推送要求输入密码时：
```bash
git push -u origin main
```
提示输入密码时，粘贴您的 Token 而不是登录密码。

---

## 步骤 7: 部署到 Vercel

代码推送成功后，就可以部署了：

### 7.1 访问 Vercel
1. 访问：https://vercel.com
2. 登录或注册账号（可以使用 GitHub 账号登录）

### 7.2 导入项目
1. 点击 "Add New" → "Project"
2. 点击 "Continue with GitHub"
3. 授权 Vercel 访问您的 GitHub
4. 选择 `ai-reading-assistant` 仓库
5. 点击 "Import"

### 7.3 配置项目
- **Project Name**: `ai-reading-assistant`（或自定义）
- **Framework Preset**: Next.js（自动检测）
- **Root Directory**: `./`

### 7.4 添加环境变量
在 "Environment Variables" 部分添加：

| 名称 | 值 |
|------|-----|
| `DEEPSEEK_API_KEY` | `sk-89110f071ffe41ceb64353c5d0affaf6` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://vulgoixjxbxftolapabj.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_21nixa31YXB39xiuBA2s7w_FScAXxEH` |

### 7.5 部署
点击 "Deploy" 按钮，等待 1-2 分钟。

### 7.6 获取网址
部署完成后，Vercel 会提供一个免费网址，例如：
```
https://ai-reading-assistant.vercel.app
```

**复制这个网址分享给任何人！**

---

## 🎯 完成后的效果

✅ 代码已推送到 GitHub
✅ 应用已部署到 Vercel
✅ 获得一个可分享的网址
✅ 其他人可以访问并注册使用

---

## 📝 常用 Git 命令

推送后更新代码：
```bash
git add .
git commit -m "更新说明"
git push
```

查看状态：
```bash
git status
```

查看提交历史：
```bash
git log
```

---

## ❓ 遇到问题？

### Q1: Git 命令不识别
**A**: 重启命令行，确保 Git 已正确安装

### Q2: 推送失败，提示 Authentication failed
**A**: 使用 Personal Access Token 而不是密码

### Q3: Vercel 部署失败
**A**: 检查环境变量是否正确配置

---

## 🚀 快速开始

安装完 Git 后，按顺序执行这些命令即可：

```bash
# 1. 进入项目目录
cd d:/Users/Administrator/Desktop/20260323154302

# 2. 初始化 Git
git init

# 3. 配置用户信息（只需一次）
git config --global user.name "您的名字"
git config --global user.email "您的邮箱"

# 4. 添加文件
git add .

# 5. 提交
git commit -m "Initial commit: AI 智能文档阅读助手 v2.0"

# 6. 关联远程仓库（替换为您的地址）
git remote add origin https://github.com/your-username/ai-reading-assistant.git

# 7. 推送
git branch -M main
git push -u origin main
```

---

**准备好了吗？请按照步骤操作，有任何问题随时告诉我！**
