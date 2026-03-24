# GitHub Desktop 上传指南

使用 GitHub Desktop 将项目上传到 GitHub 的详细步骤。

---

## 📋 前置信息

- GitHub 仓库：`https://github.com/liuliu32055/liuliu20260324000`
- 本地项目路径：`d:/Users/Administrator/Desktop/20260323154302`

---

## 🚀 第一步：下载并安装 GitHub Desktop

### 1.1 下载 GitHub Desktop

1. 访问下载页面：https://desktop.github.com/
2. 点击 "Download for Windows" 按钮
3. 下载完成后，找到下载的文件（通常在下载文件夹）
4. 文件名类似：`GitHubDesktopSetup-x.x.x.exe`

### 1.2 安装 GitHub Desktop

1. 双击下载的安装文件
2. 在安装向导中：
   - 点击 "Install"
   - 等待安装完成（约 1-2 分钟）
   - 点击 "Finish" 完成安装

### 1.3 登录 GitHub 账号

1. 打开 GitHub Desktop（桌面图标或开始菜单）
2. 会自动打开登录页面
3. 选择 "Sign in to GitHub.com"
4. 输入您的 GitHub 账号和密码
5. 完成登录

---

## 🚀 第二步：克隆仓库到本地

### 2.1 开始克隆

1. 在 GitHub Desktop 主界面
2. 点击左上角的 "File" 菜单
3. 选择 "Clone Repository"

### 2.2 选择仓库

1. 在 "Clone a Repository" 窗口中
2. 点击 "GitHub.com" 标签
3. 在列表中找到：`liuliu20260324000`
4. 如果找不到，直接在 URL 栏输入：
   ```
   https://github.com/liuliu32055/liuliu20260324000
   ```

### 2.3 选择本地路径

1. 在 "Local path" 中选择保存位置
2. 建议：选择桌面
   ```
   C:\Users\Administrator\Desktop\liuliu20260324000
   ```
3. 点击 "Clone" 按钮
4. 等待克隆完成

---

## 🚀 第三步：复制项目文件

### 3.1 打开源项目文件夹

1. 打开文件资源管理器（Win + E）
2. 导航到：`d:/Users/Administrator/Desktop/20260323154302`
3. 全选所有文件（Ctrl + A）

### 3.2 复制到克隆的仓库文件夹

1. 导航到：`C:\Users\Administrator\Desktop\liuliu20260324000`
2. 将源项目的所有文件复制到这里
3. 如果提示替换 README.md，选择"是"或"替换"

**重要**：确保复制了以下重要文件：
- ✅ `package.json`
- ✅ `app/` 文件夹
- ✅ `components/` 文件夹
- ✅ `lib/` 文件夹
- ✅ `.env.local` 文件（重要！）

---

## 🚀 第四步：提交更改

### 4.1 查看更改

1. 回到 GitHub Desktop
2. 在左侧 "Changes" 标签中，您会看到所有新增和修改的文件
3. 确认文件列表正确

### 4.2 输入提交信息

1. 在左下角的 "Summary" 框中输入：
   ```
   Initial commit: AI 智能文档阅读助手 v2.0
   ```

2. （可选）在 "Description" 框中输入：
   ```
   - 添加学生模式和职场模式
   - 实现逐段精读 AI 伴读
   - 新增文档对比功能
   - 修复移动端交互问题
   ```

### 4.3 提交更改

1. 点击蓝色的 "Commit to main" 按钮
2. 等待提交完成（几秒钟）

---

## 🚀 第五步：推送到 GitHub

### 5.1 推送代码

1. 提交成功后，点击右上角的 "Push origin" 按钮
2. 等待推送完成（几秒钟）
3. 看到 "Successfully pushed" 提示

### 5.2 验证上传

1. 打开浏览器
2. 访问：https://github.com/liuliu32055/liuliu20260324000
3. 刷新页面
4. 您应该能看到所有项目文件已经上传

---

## ✅ 第六步：部署到 Vercel

### 6.1 登录 Vercel

1. 访问：https://vercel.com
2. 点击右上角 "Login"
3. 选择 "Continue with GitHub"
4. 使用您的 GitHub 账号登录

### 6.2 导入项目

1. 登录后，点击 "Add New" → "Project"
2. 在 "Import Git Repository" 列表中
3. 找到 `liuliu20260324000` 仓库
4. 点击 "Import" 按钮

### 6.3 配置项目（自动检测）

Vercel 会自动检测配置：
```
Project Name: liuliu20260324000（可以自定义）
Framework Preset: Next.js
Root Directory: ./
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### 6.4 添加环境变量（非常重要！）

在 "Environment Variables" 部分，逐个添加以下变量：

**变量 1：DeepSeek API Key**
```
Key: DEEPSEEK_API_KEY
Value: sk-89110f071ffe41ceb64353c5d0affaf6
Environment: ✓ Production ✓ Preview ✓ Development
```
点击 "Add"

**变量 2：Supabase URL**
```
Key: NEXT_PUBLIC_SUPABASE_URL
Value: https://vulgoixjxbxftolapabj.supabase.co
Environment: ✓ Production ✓ Preview ✓ Development
```
点击 "Add"

**变量 3：Supabase Anon Key**
```
Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: sb_publishable_21nixa31YXB39xiuBA2s7w_FScAXxEH
Environment: ✓ Production ✓ Preview ✓ Development
```
点击 "Add"

### 6.5 开始部署

1. 滚动到页面底部
2. 点击蓝色的 "Deploy" 按钮
3. 等待构建和部署（1-3 分钟）
4. 您可以看到实时构建日志

### 6.6 部署成功

部署成功后，您会看到：
- ✅ 绿色的复选标记
- ✅ 应用网址：`https://liuliu20260324000.vercel.app`
- ✅ 点击 "Visit" 可以预览应用

---

## 🎉 完成！

现在您有了：

- ✅ **GitHub 仓库**：https://github.com/liuliu32055/liuliu20260324000
- ✅ **Vercel 应用**：https://liuliu20260324000.vercel.app
- ✅ **24/7 在线**：任何人都可以访问
- ✅ **完全免费**：无需付费

---

## 📱 如何分享给他人？

直接分享 Vercel 网址：
```
https://liuliu20260324000.vercel.app
```

其他人访问后：
1. 点击"注册"按钮
2. 使用邮箱注册账号
3. 登录后使用所有功能

---

## 🔄 后续如何更新代码？

### 更新本地代码

1. 修改 `C:\Users\Administrator\Desktop\liuliu20260324000` 中的文件
2. 打开 GitHub Desktop
3. 在 "Changes" 中查看修改
4. 输入提交信息："Update feature"
5. 点击 "Commit to main"
6. 点击 "Push origin"
7. Vercel 会自动重新部署

---

## ❓ 常见问题

### Q1: GitHub Desktop 无法登录？
**A:** 确保使用正确的 GitHub 账号和密码，或使用 GitHub Token 登录

### Q2: 克隆失败？
**A:** 检查网络连接，确保仓库地址正确

### Q3: 推送失败？
**A:** 检查是否有权限，确保使用的是正确的 GitHub 账号

### Q4: Vercel 部署失败？
**A:** 检查环境变量是否正确，查看构建日志找出错误

---

## 📞 需要帮助？

如果在任何步骤遇到问题：
1. 检查 GitHub Desktop 的错误提示
2. 查看构建日志
3. 随时回来询问

---

**祝您部署成功！🚀**
