# Supabase 配置指南

## 步骤 1：注册 Supabase 账号

1. 访问 [Supabase 官网](https://supabase.com)
2. 点击 "Start your project"
3. 使用 GitHub 账号或邮箱注册
4. 完成邮箱验证

## 步骤 2：创建新项目

1. 登录后点击 "New project"
2. 填写项目信息：
   - **Name**: `ai-reading-assistant` (或自定义)
   - **Database Password**: 生成并保存安全密码
   - **Region**: 选择离你最近的地区（如 `East Asia (Tokyo)`）
   - **Pricing Plan**: 选择免费计划

3. 点击 "Create new project"
4. 等待项目初始化完成（约1-2分钟）

## 步骤 3：获取 API 密钥

项目创建完成后，进入项目设置：

1. 点击左侧菜单的 **Settings**
2. 选择 **API**
3. 复制以下信息：
   - **Project URL**: `https://xxxxxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 步骤 4：配置环境变量

在项目根目录创建 `.env.local` 文件：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# DeepSeek API 配置（阶段3使用）
DEEPSEEK_API_KEY=your-deepseek-api-key

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**注意：将 `your-project-url` 和 `your-anon-key` 替换为实际值**

## 步骤 5：创建数据库表

使用以下 SQL 语句在 Supabase SQL 编辑器中创建表：

### 1. users 表（用户表）

```sql
-- 创建 users 表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
```

### 2. documents 表（文档表）

```sql
-- 创建 documents 表
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_key TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  parse_status TEXT DEFAULT 'pending' CHECK (parse_status IN ('pending', 'parsing', 'completed', 'failed')),
  page_count INTEGER,
  parsed_text TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_parse_status ON documents(parse_status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
```

### 3. notes 表（笔记表）

```sql
-- 创建 notes 表
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  paragraph_id TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  highlighted_text TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_document_id ON notes(document_id);
CREATE INDEX IF NOT EXISTS idx_notes_paragraph_id ON notes(paragraph_id);
CREATE INDEX IF NOT EXISTS idx_notes_tags ON notes USING GIN(tags);
```

### 4. 启用 RLS（行级安全）

```sql
-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- users 表策略
CREATE POLICY "用户可以查看自己的资料" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "用户可以更新自己的资料" ON users
  FOR UPDATE USING (auth.uid() = id);

-- documents 表策略
CREATE POLICY "用户可以查看自己的文档" ON documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户可以创建文档" ON documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的文档" ON documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的文档" ON documents
  FOR DELETE USING (auth.uid() = user_id);

-- notes 表策略
CREATE POLICY "用户可以查看自己的笔记" ON notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户可以创建笔记" ON notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的笔记" ON notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的笔记" ON notes
  FOR DELETE USING (auth.uid() = user_id);
```

## 步骤 6：创建 Storage Bucket

1. 在 Supabase 控制台点击 **Storage**
2. 点击 **Create a new bucket**
3. 填写信息：
   - **Name**: `documents`
   - **Public**: ✅ 启用（允许公开访问上传的文件）
4. 点击 **Create bucket**

## 步骤 7：配置 Storage 策略

```sql
-- 创建 storage 策略
CREATE POLICY "用户可以上传文件" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND
    (auth.uid()::text = (storage.foldername(name))[1])
  );

CREATE POLICY "用户可以查看自己的文件" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND
    (auth.uid()::text = (storage.foldername(name))[1])
  );

CREATE POLICY "用户可以更新自己的文件" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'documents' AND
    (auth.uid()::text = (storage.foldername(name))[1])
  );

CREATE POLICY "用户可以删除自己的文件" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents' AND
    (auth.uid()::text = (storage.foldername(name))[1])
  );
```

## 步骤 8：验证配置

运行以下命令验证配置：

```bash
npm run dev
```

访问 `http://localhost:3000`，如果看到应用界面，说明 Supabase 配置成功。

## 故障排除

### 1. 连接失败
- 检查 `.env.local` 文件中的 URL 和 Key 是否正确
- 确保 Supabase 项目处于活动状态
- 检查网络连接

### 2. 表创建失败
- 确保有正确的数据库权限
- 检查 SQL 语法错误
- 尝试在 Supabase SQL 编辑器中逐条执行

### 3. 存储上传失败
- 检查 Storage bucket 名称是否正确
- 验证 Storage 策略配置
- 检查文件大小限制（默认 50MB）

### 4. RLS 策略问题
- 确保已启用 RLS
- 检查策略条件是否正确
- 使用 Supabase 的 Auth 调试工具

## 下一步

完成 Supabase 配置后，继续以下步骤：

1. 实现用户认证系统（注册/登录）
2. 实现 PDF 上传功能
3. 集成 DeepSeek API 进行文档解析
4. 部署应用到生产环境

## 重要提示

1. **安全第一**：不要将 `.env.local` 文件提交到 Git
2. **备份数据**：定期备份数据库
3. **监控使用**：免费计划有使用限制，注意监控使用量
4. **测试环境**：建议先使用测试环境进行开发

如有问题，参考 [Supabase 官方文档](https://supabase.com/docs) 或查看控制台错误信息。