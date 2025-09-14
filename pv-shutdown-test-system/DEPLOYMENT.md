# 部署指南 - 光伏关断器实验数据管理系统

## 📋 部署前准备

### 1. Supabase 设置

1. 访问 [Supabase](https://supabase.com) 并创建账号
2. 创建新项目
3. 获取以下配置信息：
   - Project URL
   - Anon Key
   - Service Role Key

### 2. 数据库初始化

1. 在 Supabase Dashboard 中，进入 SQL Editor
2. 复制 `supabase/schema.sql` 文件内容
3. 执行 SQL 创建所有必要的表和权限

或者使用命令行：
```bash
npm run db:init
```

### 3. 环境变量配置

复制 `.env.example` 到 `.env.local` 并填入实际值：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=https://your-app-domain.netlify.app
```

## 🚀 Netlify 部署步骤

### 方法一：通过 Netlify 网站部署

1. **登录 Netlify**
   - 访问 [Netlify](https://www.netlify.com)
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "Add new site" → "Import an existing project"
   - 选择 GitHub
   - 选择您的项目仓库

3. **配置构建设置**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - 点击 "Show advanced" 添加环境变量

4. **添加环境变量**
   在 "Environment variables" 部分添加：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL`

5. **部署**
   - 点击 "Deploy site"
   - 等待部署完成（约3-5分钟）

### 方法二：通过 Netlify CLI 部署

1. **安装 Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **登录 Netlify**
   ```bash
   netlify login
   ```

3. **初始化项目**
   ```bash
   netlify init
   ```

4. **设置环境变量**
   ```bash
   netlify env:set NEXT_PUBLIC_SUPABASE_URL "your-supabase-url"
   netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "your-anon-key"
   netlify env:set SUPABASE_SERVICE_ROLE_KEY "your-service-role-key"
   netlify env:set NEXT_PUBLIC_APP_URL "your-app-url"
   ```

5. **部署**
   ```bash
   netlify deploy --prod
   ```

## 🔧 部署后配置

### 1. 更新 Supabase 配置

1. 在 Supabase Dashboard 中，进入 Authentication → URL Configuration
2. 添加您的 Netlify URL 到：
   - Site URL
   - Redirect URLs

### 2. 配置 Storage Buckets

在 Supabase Dashboard 中创建以下存储桶：

```sql
-- 创建文件存储桶
INSERT INTO storage.buckets (id, name, public) VALUES
  ('experiment-files', 'experiment-files', false),
  ('reports', 'reports', false);
```

### 3. 设置 CORS

如果遇到 CORS 问题，在 Supabase Dashboard 中：
1. 进入 Settings → API
2. 添加您的 Netlify domain 到 CORS allowed origins

## 📊 监控和维护

### 性能监控

1. **Netlify Analytics**
   - 在 Netlify Dashboard 中查看站点分析
   - 监控页面加载时间和访问量

2. **Supabase Monitoring**
   - 查看数据库使用情况
   - 监控 API 请求量

### 日志查看

1. **Netlify Functions 日志**
   ```bash
   netlify functions:log
   ```

2. **构建日志**
   - 在 Netlify Dashboard → Deploys 中查看

### 更新部署

1. **自动部署**
   - 推送到 main 分支将自动触发部署

2. **手动部署**
   ```bash
   netlify deploy --prod
   ```

## 🔐 安全建议

1. **环境变量**
   - 永远不要将敏感信息提交到代码仓库
   - 使用 Netlify 的环境变量管理

2. **API 限制**
   - 在 Supabase 中设置 Rate Limiting
   - 配置适当的 Row Level Security

3. **备份**
   - 定期备份 Supabase 数据库
   - 使用 Supabase 的自动备份功能

## 🐛 故障排查

### 常见问题

1. **构建失败**
   - 检查 Node.js 版本（需要 18+）
   - 查看构建日志中的错误信息

2. **数据库连接失败**
   - 验证环境变量是否正确
   - 检查 Supabase 项目是否暂停

3. **页面 404**
   - 确保 `netlify.toml` 配置正确
   - 检查路由配置

### 获取帮助

- Netlify 文档：https://docs.netlify.com
- Supabase 文档：https://supabase.com/docs
- 项目 Issues：在 GitHub 仓库中提交问题

## 📈 性能优化

1. **启用缓存**
   - 静态资源已配置长期缓存
   - 使用 Netlify 的 CDN 加速

2. **图片优化**
   - 使用 Next.js Image 组件
   - 配置适当的图片格式和大小

3. **代码分割**
   - Next.js 自动进行代码分割
   - 监控包大小避免过大

---

祝您部署顺利！如有问题，请参考文档或联系技术支持。