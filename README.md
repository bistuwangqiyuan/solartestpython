# 光伏关断器实验数据管理系统

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-2.0-green)

## 📋 项目简介

光伏关断器实验数据管理系统是一个专业的工业级Web应用，专为光伏快速关断装置(PVRSD)的测试数据管理而设计。系统提供实时数据监控、实验管理、数据分析和仿真等功能，符合IEC 60947-3和UL 1741等国际标准。

## ✨ 主要特性

- 🖥️ **数据可视化大屏** - 实时监控和数据分析
- 🧪 **标准化实验管理** - 支持耐压、泄漏电流、正常/异常工况测试
- 📊 **高级数据分析** - 多维度数据对比和趋势分析
- 📁 **文件管理系统** - Excel/CSV数据导入导出
- 🔬 **实验仿真** - 交互式电路仿真和参数配置
- 🎨 **工业化UI设计** - 现代化、高端的用户界面
- 🔐 **安全认证** - 基于Supabase的用户认证和权限管理
- ☁️ **云端部署** - Netlify自动化部署

## 🚀 快速开始

### 前置要求

- Node.js 18.0 或更高版本
- npm 或 yarn 包管理器
- Git

### 安装步骤

1. **克隆仓库**
```bash
git clone https://github.com/your-username/pv-shutdown-test-system.git
cd pv-shutdown-test-system
```

2. **安装依赖**
```bash
npm install
# 或
yarn install
```

3. **环境配置**

创建 `.env.local` 文件并添加以下配置：

```env
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=https://zzyueuweeoakopuuwfau.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6eXVldXdlZW9ha29wdXV3ZmF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzODEzMDEsImV4cCI6MjA1OTk1NzMwMX0.y8V3EXK9QVd3txSWdE3gZrSs96Ao0nvpnd0ntZw_dQ4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6eXVldXdlZW9ha29wdXV3ZmF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDM4MTMwMSwiZXhwIjoyMDU5OTU3MzAxfQ.CTLF9Ahmxt7alyiv-sf_Gl3U6SNIWZ01PapTI92Hg0g

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **初始化数据库**

运行数据库迁移脚本：

```bash
npm run db:init
# 或
yarn db:init
```

5. **启动开发服务器**

```bash
npm run dev
# 或
yarn dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📁 项目结构

```
pv-shutdown-test-system/
├── app/                    # Next.js 应用目录
│   ├── (auth)/            # 认证相关页面
│   ├── dashboard/         # 仪表板页面
│   ├── experiments/       # 实验管理页面
│   ├── data/             # 数据管理页面
│   ├── simulation/       # 仿真页面
│   └── settings/         # 设置页面
├── components/            # React 组件
│   ├── charts/           # 图表组件
│   ├── layout/           # 布局组件
│   └── ui/               # UI 组件
├── lib/                   # 工具库
│   ├── supabase/         # Supabase 客户端
│   ├── utils/            # 工具函数
│   └── hooks/            # 自定义 Hooks
├── public/               # 静态资源
├── styles/               # 样式文件
├── types/                # TypeScript 类型定义
└── data/                 # 示例数据文件
```

## 🛠️ 技术栈

### 前端
- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **UI库**: Ant Design + 自定义组件
- **样式**: Tailwind CSS + CSS Modules
- **图表**: ECharts / Recharts
- **状态管理**: Zustand
- **表单**: React Hook Form + Zod

### 后端服务
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **存储**: Supabase Storage
- **实时通信**: Supabase Realtime

### 开发工具
- **代码规范**: ESLint + Prettier
- **提交规范**: Husky + Commitlint
- **测试**: Jest + React Testing Library

## 📊 数据格式

系统支持以下数据格式的导入：

```csv
序号,电流(A),电压(V),功率(W),时间戳,设备地址,设备类型
1,0.11000,20.35500,2.23905,2025/5/2,1,未知
2,0.26000,20.68100,5.37706,2025/5/2,1,未知
```

## 🚢 部署

### Netlify部署

1. **连接GitHub仓库**
   - 登录Netlify并连接GitHub账户
   - 选择项目仓库

2. **配置构建设置**
   - Build command: `npm run build`
   - Publish directory: `.next`

3. **设置环境变量**
   在Netlify控制台添加所有必要的环境变量

4. **部署**
   推送到main分支将自动触发部署

### 本地构建

```bash
# 构建生产版本
npm run build

# 本地预览生产版本
npm run start
```

## 🔧 配置说明

### Supabase配置

1. **数据库表初始化**
   参考 `supabase/migrations` 目录下的SQL文件

2. **Row Level Security (RLS)**
   确保为所有表启用RLS并配置适当的策略

3. **Storage Buckets**
   创建以下存储桶：
   - `experiment-files` - 实验数据文件
   - `reports` - 生成的报告

### 环境变量说明

| 变量名 | 描述 | 必需 |
|--------|------|------|
| NEXT_PUBLIC_SUPABASE_URL | Supabase项目URL | ✅ |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase匿名密钥 | ✅ |
| SUPABASE_SERVICE_ROLE_KEY | Supabase服务角色密钥 | ✅ |
| NEXT_PUBLIC_APP_URL | 应用URL | ✅ |

## 📝 开发指南

### 代码风格

```bash
# 运行代码检查
npm run lint

# 自动修复格式问题
npm run format
```

### 提交规范

使用约定式提交(Conventional Commits)：

- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/工具相关

### 测试

```bash
# 运行所有测试
npm run test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行端到端测试
npm run test:e2e
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [Supabase](https://supabase.io/) - 后端服务
- [Next.js](https://nextjs.org/) - React框架
- [Ant Design](https://ant.design/) - UI组件库
- [ECharts](https://echarts.apache.org/) - 数据可视化

## 📞 联系方式

- 项目主页: [https://github.com/your-username/pv-shutdown-test-system](https://github.com/your-username/pv-shutdown-test-system)
- 问题反馈: [Issues](https://github.com/your-username/pv-shutdown-test-system/issues)

---

Made with ❤️ by Your Team