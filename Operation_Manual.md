# 项目运行与调试手册

## 🚀 快速开始

### 环境要求
- Node.js 18+（推荐 20+）
- npm 9+ 或 yarn 1.22+
- Git
- PostgreSQL（Supabase 提供）

### 安装步骤
```bash
# 克隆项目
git clone [您的仓库地址]
cd ai-reading-assistant

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 文件，填入您的配置

# 启动开发服务器
npm run dev
```

### 环境变量说明
**必须配置的变量（在 `.env.local` 中）：**

```env
# Supabase 配置（请替换为您的实际值）
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY

# DeepSeek API 配置（使用账号 15922233923）
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DEEPSEEK_API_URL=https://api.deepseek.com

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## 🔧 开发调试

### 本地开发
```bash
# 启动开发服务器（热重载）
npm run dev

# 构建生产版本
npm run build

# 运行生产版本
npm start

# 运行代码检查
npm run lint

# 运行类型检查
npm run type-check
```

### 调试工具
#### 1. 浏览器开发者工具
- **Console**: 查看 JavaScript 错误和日志
- **Network**: 监控 API 请求和响应
- **Elements**: 检查 DOM 和样式
- **Application**: 查看本地存储和 Cookie

#### 2. 服务器端调试
```bash
# 查看详细日志
npm run dev -- --verbose

# 使用调试器
node --inspect node_modules/.bin/next dev
```

#### 3. 数据库调试
```sql
-- 在 Supabase SQL Editor 中执行
-- 查看用户表
SELECT * FROM users LIMIT 10;

-- 查看文档表
SELECT * FROM documents ORDER BY created_at DESC LIMIT 10;

-- 查看笔记表
SELECT * FROM notes WHERE user_id = '用户ID';
```

## 🐛 常见问题排查

### 1. API 调用失败
**症状**: `Error: Failed to fetch` 或网络超时
**解决方案**:
1. 检查网络连接
2. 验证 API Key 是否正确
3. 检查 CORS 设置
4. 查看 DeepSeek API 额度

```javascript
// 调试代码示例
try {
  const response = await fetch('/api/ai/ask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content: '测试内容' }),
  });
  
  if (!response.ok) {
    console.error('API 响应错误:', response.status, response.statusText);
    const errorText = await response.text();
    console.error('错误详情:', errorText);
  }
} catch (error) {
  console.error('网络错误:', error);
}
```

### 2. PDF 解析失败
**症状**: 上传 PDF 后无法解析或显示错误
**解决方案**:
1. 检查文件格式（支持 PDF、TXT、DOCX）
2. 验证文件大小（默认 10MB 限制）
3. 检查 PDF 解析服务状态
4. 查看服务器日志

```bash
# 查看 PDF 解析日志
tail -f logs/pdf-parser.log

# 手动测试 PDF 解析
node scripts/test-pdf-parser.js test.pdf
```

### 3. 用户认证问题
**症状**: 登录/注册失败，Session 丢失
**解决方案**:
1. 检查 Supabase Auth 配置
2. 验证邮箱/密码格式
3. 清除浏览器 Cookie 和缓存
4. 检查 JWT 令牌有效期

```javascript
// 调试认证状态
import { supabase } from '@/lib/supabase/supabase';

// 检查当前用户
const { data: { user }, error } = await supabase.auth.getUser();
console.log('当前用户:', user);
console.log('认证错误:', error);

// 检查 Session
const { data: { session }, error: sessionError } = await supabase.auth.getSession();
console.log('Session:', session);
```

### 4. 移动端显示异常
**症状**: 样式错乱、触摸事件不响应
**解决方案**:
1. 检查 Tailwind 响应式断点
2. 验证 viewport 设置
3. 测试触摸事件处理
4. 检查移动端 CSS 类

```css
/* 移动端调试样式 */
.debug-mobile {
  border: 2px solid red !important;
}

/* 检查触摸事件 */
document.addEventListener('touchstart', (e) => {
  console.log('触摸事件:', e.touches[0].clientX, e.touches[0].clientY);
});
```

### 5. 数据库连接问题
**症状**: 数据库查询超时或连接失败
**解决方案**:
1. 检查 Supabase 项目状态
2. 验证数据库连接字符串
3. 检查网络防火墙设置
4. 查看 Supabase 控制台

```sql
-- 测试数据库连接
SELECT NOW() as current_time, VERSION() as postgres_version;

-- 检查表结构
\d users;
\d documents;
\d notes;
```

## 📊 性能优化

### 1. 前端性能
```javascript
// 代码分割
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(
  () => import('@/components/HeavyComponent'),
  { loading: () => <p>加载中...</p> }
);

// 图片优化
import Image from 'next/image';

<Image
  src="/image.jpg"
  width={500}
  height={300}
  alt="描述"
  priority={false} // 延迟加载
/>;
```

### 2. 数据库优化
```sql
-- 创建索引
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_notes_document_id ON notes(document_id);
CREATE INDEX idx_notes_paragraph_id ON notes(paragraph_id);

-- 查询优化
EXPLAIN ANALYZE SELECT * FROM documents WHERE user_id = 'xxx';

-- 定期清理
VACUUM ANALYZE;
```

### 3. API 优化
```javascript
// 实现缓存
import { unstable_cache } from 'next/cache';

const getCachedData = unstable_cache(
  async (id) => {
    // 数据库查询
    return data;
  },
  ['data-key'],
  { revalidate: 3600 } // 1小时缓存
);

// 批量处理
const processBatch = async (items) => {
  const batchSize = 10;
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.all(batch.map(processItem));
  }
};
```

## 🔒 安全维护

### 1. 环境安全
```bash
# 检查依赖漏洞
npm audit

# 更新依赖
npm update

# 安全扫描
npm run security-check
```

### 2. 数据安全
```sql
-- 启用行级安全
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 创建安全策略
CREATE POLICY "用户只能访问自己的数据" ON users
  USING (auth.uid() = id);
```

### 3. API 安全
```javascript
// 实现速率限制
import { rateLimit } from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 100次请求
  message: '请求过于频繁，请稍后再试'
});

// 验证输入
import { z } from 'zod';

const schema = z.object({
  content: z.string().min(1).max(10000),
  documentId: z.string().uuid(),
});
```

## 📈 监控与日志

### 1. 应用日志
```javascript
// 结构化日志
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// 使用日志
logger.info('用户登录', { userId: user.id, timestamp: new Date() });
logger.error('API 调用失败', { error: error.message, url: apiUrl });
```

### 2. 性能监控
```javascript
// Web Vitals 监控
import { reportWebVitals } from 'next/web-vitals';

reportWebVitals(console.log);

// 自定义指标
const metrics = {
  pageLoad: performance.now(),
  apiLatency: 0,
  renderTime: 0,
};

// 发送到监控服务
fetch('/api/metrics', {
  method: 'POST',
  body: JSON.stringify(metrics),
});
```

### 3. 错误追踪
```javascript
// 全局错误处理
window.addEventListener('error', (event) => {
  console.error('全局错误:', event.error);
  // 发送到错误追踪服务
  fetch('/api/error', {
    method: 'POST',
    body: JSON.stringify({
      message: event.error.message,
      stack: event.error.stack,
      url: window.location.href,
    }),
  });
});

// 未捕获的 Promise 错误
window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的 Promise 错误:', event.reason);
});
```

## 🔄 数据备份与恢复

### 1. 数据库备份
```bash
# 使用 Supabase 备份
# 在 Supabase 控制台 → Database → Backups

# 手动备份
pg_dump -h db.supabase.co -U postgres -d [数据库名] -f backup_$(date +%Y%m%d).sql

# 恢复备份
psql -h db.supabase.co -U postgres -d [数据库名] < backup.sql
```

### 2. 文件备份
```bash
# 备份上传的文件
# Supabase Storage → 手动下载

# 定期备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d)
BACKUP_DIR="/backups/storage_$DATE"
mkdir -p $BACKUP_DIR
# 下载文件逻辑...
```

### 3. 配置备份
```bash
# 备份环境变量
cp .env.local .env.backup_$(date +%Y%m%d)

# 备份配置文件
cp tailwind.config.ts backup/
cp next.config.js backup/
```

## 🆘 紧急恢复

### 1. 网站无法访问
1. 检查 Vercel 部署状态
2. 查看域名 DNS 解析
3. 检查 SSL 证书
4. 回滚到上一个稳定版本

### 2. 数据库损坏
1. 从备份恢复数据
2. 联系 Supabase 支持
3. 修复损坏的表
4. 重建索引

### 3. API 服务中断
1. 检查 DeepSeek API 状态
2. 切换备用 API Key
3. 实现降级策略
4. 通知用户维护

## 📞 技术支持

### 紧急联系方式
- **项目维护者**: [您的姓名]
- **邮箱**: [您的邮箱]
- **电话**: [紧急联系电话]
- **GitHub**: [仓库 Issues]

### 服务提供商支持
- **Vercel**: support@vercel.com
- **Supabase**: support@supabase.com
- **DeepSeek**: support@deepseek.com

### 文档资源
- 项目 README.md
- API 文档 (app/api/README.md)
- 数据库设计文档 (database-schema.md)
- 部署指南 (Vercel_Deployment_Guide.md)

---

**最后更新**: 2024年12月  
**版本**: 1.0.0  
**状态**: ✅ 生产环境验证通过