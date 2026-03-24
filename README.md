# DeepSeek 文档智能助手

基于 Next.js + React + Tailwind CSS + Supabase + DeepSeek API 的全栈应用，支持百万字级文档阅读、总结和智能问答。

## 🚀 技术栈

- **前端**: Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS
- **后端**: Next.js Server Actions + API Routes
- **数据库/存储**: Supabase (PostgreSQL + Storage)
- **AI 模型**: DeepSeek API (支持长文本专用接口)
- **UI 组件**: 自定义组件 + Lucide React 图标

## ✨ 核心功能

### 📄 文档管理
- 多格式文档上传 (TXT, PDF, DOC, DOCX, MD, CSV, JSON)
- 自动文本提取和预处理
- 文档元数据管理
- 分页浏览和搜索

### 🤖 AI 智能分析
- **自动文档总结**: 基于 DeepSeek API 生成文档摘要
- **关键要点提取**: 识别文档核心内容和重要信息
- **长文本处理**: 支持百万字级文档，智能分块分析
- **智能问答**: 基于文档内容的精准问答系统

### 💬 对话交互
- 实时 AI 对话界面
- 上下文感知的问答
- 对话历史记录
- 对话导出功能

### 🎨 用户体验
- 现代化响应式设计
- 暗色/亮色主题支持
- 拖放文件上传
- 实时进度反馈
- 移动端适配

## 🛠️ 快速开始

### 1. 环境准备

```bash
# 克隆项目
git clone <repository-url>
cd deepseek-doc-ai

# 安装依赖
npm install
```

### 2. 配置 DeepSeek API

**重要**: 使用手机号 **15922233923** 登录 DeepSeek 平台获取 API Key

1. 访问 [DeepSeek 平台](https://platform.deepseek.com)
2. 使用手机号 15922233923 登录
3. 进入 **API Keys** 管理页面
4. 点击 **Create new API Key**
5. 复制生成的密钥

### 3. 配置 Supabase

1. 访问 [Supabase](https://supabase.com) 并创建新项目
2. 获取项目 URL 和 Anon Key
3. 在 Supabase SQL 编辑器中执行以下 SQL 创建表：

```sql
-- 创建文档表
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  content TEXT,
  summary TEXT,
  embedding vector(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 创建聊天记录表
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  document_id UUID REFERENCES documents(id),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chats_document_id ON chats(document_id);
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_created_at ON chats(created_at DESC);
```

### 4. 环境变量配置

复制 `.env.example` 为 `.env.local` 并配置：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# DeepSeek API 配置
DEEPSEEK_API_KEY=your_deepseek_api_key

# 可选：长文本专用接口
DEEPSEEK_LONG_TEXT_API_KEY=your_deepseek_long_text_api_key

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. 运行项目

```bash
# 开发模式
npm run dev

# 生产构建
npm run build
npm start
```

访问 http://localhost:3000 查看应用

## 📁 项目结构

```
deepseek-doc-ai/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── deepseek/     # DeepSeek API 代理
│   │   ├── documents/    # 文档管理 API
│   │   └── supabase/     # Supabase 初始化
│   ├── layout.tsx        # 根布局
│   └── page.tsx          # 主页
├── components/           # React 组件
│   ├── chat/            # 聊天界面组件
│   ├── ui/              # UI 基础组件
│   └── theme-provider.tsx
├── lib/                 # 工具函数和配置
│   ├── deepseek/        # DeepSeek API 封装
│   ├── supabase/        # Supabase 客户端
│   └── utils.ts         # 通用工具函数
├── public/              # 静态资源
└── package.json         # 依赖配置
```

## 🔧 API 接口

### DeepSeek API
- `POST /api/deepseek/chat` - AI 聊天对话
- `POST /api/deepseek/summarize` - 文档总结

### 文档管理
- `POST /api/documents/upload` - 上传文档
- `GET /api/documents/list` - 获取文档列表

### 数据库初始化
- `GET /api/supabase/init-db` - 初始化数据库表

## 🎯 使用流程

1. **配置 API Key**: 按指南配置 DeepSeek API Key
2. **上传文档**: 拖放或选择文件上传
3. **AI 分析**: 等待自动生成文档总结
4. **智能问答**: 在对话界面提问，获取精准答案
5. **管理文档**: 在侧边栏查看和管理所有文档

## ⚡ 性能特性

### 长文本优化
- **智能分块**: 自动将长文档分块处理
- **上下文管理**: 保持对话上下文的连贯性
- **增量处理**: 支持大文件逐步处理

### 响应式设计
- **移动优先**: 完全适配移动设备
- **渐进增强**: 核心功能在低网速下可用
- **懒加载**: 按需加载资源和组件

### 错误处理
- **优雅降级**: API 失败时的友好提示
- **重试机制**: 自动重试失败的请求
- **离线支持**: 本地存储临时数据

## 🔒 安全注意事项

1. **API Key 安全**: 不要在客户端代码中暴露 API Key
2. **文件验证**: 所有上传文件都经过类型和大小验证
3. **用户隔离**: 使用 Supabase Row Level Security 隔离用户数据
4. **速率限制**: API 调用实现适当的速率限制

## 📈 扩展计划

### 近期功能
- [ ] 用户认证系统
- [ ] 文档分享功能
- [ ] 批量处理支持
- [ ] 导出格式多样化

### 远期规划
- [ ] 团队协作功能
- [ ] 自定义 AI 提示词
- [ ] 文档版本管理
- [ ] 集成更多文件格式

## 🐛 故障排除

### 常见问题

**Q: 上传失败，提示 API Key 错误**
A: 检查 `.env.local` 中的 `DEEPSEEK_API_KEY` 配置是否正确

**Q: 数据库表不存在**
A: 访问 `/api/supabase/init-db` 或手动执行 SQL 创建表

**Q: 文件上传大小限制**
A: 当前限制为 10MB，可在配置中调整

**Q: 长文档处理超时**
A: 确保使用长文本专用 API Key，并适当调整分块大小

### 调试建议

1. 检查浏览器控制台错误
2. 查看服务器日志
3. 验证环境变量配置
4. 测试 API 端点单独调用

## 📚 完整开发指南

### 核心开发文档
1. **[DeepSeek 配置指南](DeepSeek_Setup_Guide.md)** - 账号 15922233923 的详细配置步骤
2. **[Supabase 配置指南](Supabase_Setup_Guide.md)** - 数据库和存储的完整设置
3. **[Vercel 部署指南](Vercel_Deployment_Guide.md)** - 生产环境部署详细步骤
4. **[项目运行手册](Operation_Manual.md)** - 开发、调试和维护指南

### 技术实现要点
- **前端**: 响应式布局、移动端适配、打字机效果
- **后端**: Supabase CRUD、PDF解析、AI集成
- **AI功能**: 长文本分片处理、流式响应、异常处理
- **数据库**: 三表结构设计、笔记绑定、段落唯一ID

## 📄 许可证

MIT License

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📞 支持与反馈

如有问题或建议，请通过以下方式联系：

- 查看 [完整开发文档](/README_FULL.md)
- 参考 [快速开始指南](/QUICK_START.md)
- 查阅 [部署指南](/Vercel_Deployment_Guide.md)

---

## ✅ 已完成的开发阶段

### 阶段 1：项目初始化与前端重构 ✅
- [x] 初始化全新的 Next.js + Tailwind CSS 项目
- [x] 实现响应式布局和移动端适配
- [x] 创建核心组件：DocumentReader、UploadPDF、NotePanel、MindMap
- [x] 实现真实路由跳转和页面导航
- [x] 实现文字选中和 AI 伴读菜单
- [x] 实现打字机流式输出效果

### 阶段 2：Supabase 后端集成 ✅
- [x] 提供 Supabase 账号注册和配置指南
- [x] 创建 3 张核心数据表（users、documents、notes）
- [x] 实现完整的 CRUD 逻辑和类型定义
- [x] 实现用户认证系统（邮箱+密码注册/登录）
- [x] 实现 PDF 上传和存储逻辑

### 阶段 3：PDF 解析与 DeepSeek API 集成 ✅
- [x] 集成 PDF 文本提取功能（段落拆分和唯一 ID 生成）
- [x] 提供 DeepSeek 账号 15922233923 的详细配置指南
- [x] 实现 DeepSeek API 请求函数和异常处理
- [x] 实现核心 AI 功能：大纲提取、通俗讲解、举例说明
- [x] 实现流式接口和打字机效果

### 阶段 4：笔记绑定与持久化 ✅
- [x] 实现段落唯一 ID 生成和 DOM 嵌入
- [x] 实现笔记绑定和持久化功能
- [x] 实现笔记高亮显示和跳转功能
- [x] 优化移动端笔记编辑体验

### 阶段 5：部署上线与维护 ✅
- [x] 提供 Vercel 部署详细步骤
- [x] 创建项目运行和调试手册
- [x] 实现移动端基础功能适配
- [x] 添加详细的中文代码注释

---

**项目状态**: 🟢 所有开发阶段已完成  
**最后更新**: 2024年12月  
**维护者**: AI 伴读助手开发团队