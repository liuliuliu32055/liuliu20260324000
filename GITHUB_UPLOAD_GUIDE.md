# GitHub 网页上传指南（无需 Git）

本指南帮助您将项目上传到 GitHub，无需安装 Git 工具。

---

## 📋 前置准备

在开始之前，请确保您有以下信息：

- ✅ GitHub 账号（如果没有，访问 https://github.com 注册，免费）
- ✅ 项目文件夹位置：`d:/Users/Administrator/Desktop/20260323154302`

---

## 🚀 完整步骤

### 第一步：创建 GitHub 仓库

1. **访问 GitHub 创建页面**
   - 打开浏览器，访问：https://github.com/new
   - 如果未登录，先登录您的账号

2. **填写仓库信息**
   ```
   Repository name: ai-reading-assistant
   Description: AI 智能文档阅读助手 - Next.js + DeepSeek AI
   Public/Private: Public（公开）或 Private（私有）
   ```

3. **初始化仓库**
   - ✅ 勾选 "Add a README file"
   - ❌ 不要勾选 "Add .gitignore"
   - ❌ 不要勾选 "Choose a license"

4. **创建仓库**
   - 点击绿色的 "Create repository" 按钮

5. **复制仓库地址**
   - 仓库创建成功后，点击绿色的 "Code" 按钮
   - 复制 HTTPS 地址，例如：
     ```
     https://github.com/your-username/ai-reading-assistant.git
     ```
   - 将这个地址保存好，稍后需要用到

---

### 第二步：压缩项目文件

由于 GitHub 网页上传不能直接上传整个文件夹，我们需要先压缩项目：

1. **打开文件资源管理器**
   - 按下 `Win + E` 键
   - 导航到：`d:/Users/Administrator/Desktop/`

2. **选择项目文件**
   - 找到文件夹 `20260323154302`
   - 双击进入文件夹

3. **全选所有文件**
   - 在文件夹内按下 `Ctrl + A` 键（全选所有文件和文件夹）

4. **压缩文件**
   - 右键点击选中的文件
   - 选择 "发送到" → "压缩(zipped)文件夹"
   - 或者选择 "7-Zip" → "添加到压缩文件"（如果安装了 7-Zip）
   - 会生成一个压缩文件，例如：`20260323154302.zip`

---

### 第三步：上传到 GitHub

#### 方法 A：使用 GitHub Desktop（推荐，更简单）

如果您可以使用 GitHub Desktop，这是最简单的方法：

1. **安装 GitHub Desktop**
   - 访问：https://desktop.github.com/
   - 下载并安装 GitHub Desktop
   - 安装完成后，使用 GitHub 账号登录

2. **克隆仓库**
   - 在 GitHub Desktop 中点击 "File" → "Clone Repository"
   - 选择刚才创建的 `ai-reading-assistant` 仓库
   - 选择本地路径，点击 "Clone"

3. **复制项目文件**
   - 打开克隆的本地文件夹
   - 解压之前创建的 `20260323154302.zip`
   - 将所有文件复制到克隆的仓库文件夹中
   - 替换或保留所有文件

4. **提交和推送**
   - 回到 GitHub Desktop
   - 在左下角输入提交信息：`Initial commit: AI 智能文档阅读助手 v2.0`
   - 点击 "Commit to main"
   - 点击 "Push origin"

5. **完成！**
   - 访问您的 GitHub 仓库页面
   - 您应该能看到所有代码已经上传

---

#### 方法 B：直接在 GitHub 网页上传

如果不想安装 GitHub Desktop，可以尝试网页上传：

**注意**：GitHub 网页上传有文件大小限制（单文件最大 25MB），不适合大型项目。

1. **删除 README.md**
   - 在 GitHub 仓库页面，找到 `README.md` 文件
   - 点击文件名
   - 点击右上角的 "..." → "Delete file"
   - 输入提交信息："Delete default README"
   - 点击 "Commit changes"

2. **上传文件**
   - 回到仓库首页
   - 点击 "uploading an existing file" 链接
   - 或者点击 "Add file" → "Upload files"

3. **选择文件**
   - 解压 `20260323154302.zip`
   - **按重要性顺序上传**（建议优先上传这些）：
   
   **第一优先级（必须）**：
   - `package.json`
   - `tsconfig.json`
   - `next.config.js`
   - `tailwind.config.ts`
   
   **第二优先级（核心）**：
   - `app/` 文件夹
   - `components/` 文件夹
   - `lib/` 文件夹
   
   **第三优先级（可选）**：
   - `.env.local`（建议重命名为 `.env.example`）
   - 各种 `.md` 文档文件

4. **每次上传后提交**
   - 拖拽文件到上传区域
   - 在 "Commit changes" 输入：
     ```
     Add core project files
     ```
   - 点击 "Commit changes"

5. **重复上传**
   - 重复步骤 3-4
   - 直到所有重要文件上传完成

---

### 第四步：验证上传

1. **访问仓库页面**
   - 打开您的 GitHub 仓库地址
   - 检查文件结构是否完整

2. **检查关键文件**
   确认以下文件存在：
   - ✅ `package.json`
   - ✅ `app/page.tsx`
   - ✅ `components/layout/layout.tsx`
   - ✅ `lib/supabase.ts`

---

## 🚀 第五步：部署到 Vercel

代码上传成功后，部署到 Vercel：

### 步骤 1：登录 Vercel

1. 访问：https://vercel.com
2. 点击右上角 "Login" 或 "Sign Up"
3. 选择 "Continue with GitHub"（最简单）
4. 授权 Vercel 访问您的 GitHub 仓库

### 步骤 2：导入项目

1. 登录后，点击 "Add New" → "Project"
2. 在 "Import Git Repository" 列表中
3. 找到 `ai-reading-assistant` 仓库
4. 点击 "Import"

### 步骤 3：配置项目

Vercel 会自动检测到这是一个 Next.js 项目：

```
Project Name: ai-reading-assistant（可以自定义）
Framework Preset: Next.js（自动检测）
Root Directory: ./（保持默认）
Build Command: npm run build（自动检测）
Output Directory: .next（自动检测）
```

### 步骤 4：添加环境变量（重要！）

在 "Environment Variables" 部分，逐个添加以下变量：

**变量 1：**
```
Key: DEEPSEEK_API_KEY
Value: sk-89110f071ffe41ceb64353c5d0affaf6
Environment: Production, Preview, Development
```
点击 "Add"

**变量 2：**
```
Key: NEXT_PUBLIC_SUPABASE_URL
Value: https://vulgoixjxbxftolapabj.supabase.co
Environment: Production, Preview, Development
```
点击 "Add"

**变量 3：**
```
Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: sb_publishable_21nixa31YXB39xiuBA2s7w_FScAXxEH
Environment: Production, Preview, Development
```
点击 "Add"

### 步骤 5：部署

1. 滚动到页面底部
2. 点击蓝色的 "Deploy" 按钮
3. 等待 1-2 分钟（可以看到构建进度）
4. 部署成功后，会显示一个绿色的复选标记

### 步骤 6：获取网址

1. 部署成功后，Vercel 会显示一个网址，例如：
   ```
   https://ai-reading-assistant.vercel.app
   ```
2. 点击 "Visit" 可以预览应用
3. 复制这个网址，可以分享给任何人

---

## ✅ 部署完成！

现在您有了：

- ✅ GitHub 仓库：`https://github.com/your-username/ai-reading-assistant`
- ✅ Vercel 应用：`https://ai-reading-assistant.vercel.app`
- ✅ 24/7 在线的应用
- ✅ 可以分享给任何人使用

---

## 📱 别人如何使用？

1. **访问网址**
   - 在浏览器中打开您分享的 Vercel 网址

2. **注册账号**
   - 点击"注册"按钮
   - 使用邮箱注册

3. **登录使用**
   - 登录后可以上传文档
   - 使用 AI 伴读功能
   - 所有功能都可以使用

---

## 🔧 后续更新

如果需要更新代码：

### 使用 GitHub Desktop（推荐）：

1. 在本地修改代码
2. 打开 GitHub Desktop
3. 输入提交信息："Update feature"
4. 点击 "Commit to main"
5. 点击 "Push origin"
6. Vercel 会自动重新部署

### 使用 GitHub 网页：

1. 在 GitHub 网页上修改文件
2. 提交更改
3. Vercel 会自动检测并重新部署

---

## ❓ 常见问题

### Q1: 上传文件太慢怎么办？
**A:** 使用 GitHub Desktop 上传，或者只上传核心文件（app/, components/, lib/）

### Q2: 文件太大无法上传？
**A:** GitHub 单文件限制 25MB，如果文件超过大小，可以使用 GitHub Desktop

### Q3: 部署失败怎么办？
**A:** 检查环境变量是否正确，查看 Vercel 的构建日志

### Q4: 如何让别人访问？
**A:** 直接分享 Vercel 网址，例如：`https://ai-reading-assistant.vercel.app`

---

## 🎯 我的推荐

**如果您可以安装软件**：使用 GitHub Desktop（方法 A），简单可靠

**如果不想安装任何软件**：使用 GitHub 网页上传（方法 B），但可能比较慢

---

## 📞 需要帮助？

如果遇到任何问题：

1. 查看 GitHub 的官方文档
2. 查看 Vercel 的部署指南
3. 随时回来问我

---

**祝您部署成功！🎉**
