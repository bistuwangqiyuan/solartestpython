# 光伏关断器实验数据管理系统 PRD 文档

## 1. 产品概述

### 1.1 产品定位
光伏关断器实验数据管理系统是一个专业的工业级Web应用，用于管理、分析和可视化光伏快速关断装置(PVRSD)的测试数据。系统采用现代化的工业设计风格，提供实时数据监控、实验仿真、数据管理等功能。

### 1.2 目标用户
- 光伏设备测试工程师
- 质量控制人员
- 研发工程师
- 实验室管理人员

### 1.3 核心价值
- 符合国际标准(IEC 60947-3, UL 1741)的测试流程
- 实时数据可视化和分析
- 高效的数据管理和追溯
- 专业的实验仿真功能

## 2. 功能需求

### 2.1 数据可视化大屏
#### 2.1.1 实时监控面板
- 多设备实时数据显示
- 关键参数卡片：电压、电流、功率、温度
- 实时曲线图表(参考line.png)
- 设备状态指示器
- 告警信息滚动显示

#### 2.1.2 数据分析仪表板
- 历史数据趋势分析
- 多维度数据对比
- 统计报表生成
- 数据导出功能

### 2.2 实验管理模块

#### 2.2.1 耐压实验(Dielectric Withstand Test)
**参考标准**: IEC 60947-3 Section 8.3
- 测试电压设置：1000V + 2倍额定电压
- 测试时间：60秒
- 泄漏电流监测
- 合格判定：泄漏电流 < 5mA
- 数据展示：电压-时间曲线、泄漏电流实时值(参考line.png)

#### 2.2.2 泄漏电流实验(Leakage Current Test)
**参考标准**: UL 1741 Section 39
- 测试条件：额定电压的110%
- 测量范围：0-100mA
- 数据采集频率：10Hz
- 数据展示：电流-时间曲线、数据表格(参考lineandexcel.png)

#### 2.2.3 正常工况实验(Normal Operation Test)
**测试项目**：
- 接通能力测试
- 分断能力测试
- 短路耐受测试
- 温升测试
- 数据展示：多参数综合展示(参考lineandexcel.png)

#### 2.2.4 异常工况实验(Abnormal Condition Test)
**测试项目**：
- 过压保护测试
- 欠压保护测试
- 过流保护测试
- 反接保护测试
- 点动测试功能(参考point.png)

### 2.3 数据文件管理

#### 2.3.1 文件上传
- 支持Excel、CSV格式
- 批量上传功能
- 数据格式验证
- 自动解析和存储

#### 2.3.2 文件下载
- 实验报告生成(PDF)
- 原始数据导出(Excel/CSV)
- 批量下载功能

#### 2.3.3 文件检索
- 按时间范围筛选
- 按设备编号筛选
- 按实验类型筛选
- 全文搜索功能

### 2.4 实验仿真模块

#### 2.4.1 电路仿真
- 光伏组件特性仿真
- 关断器响应仿真
- 故障模拟功能

#### 2.4.2 参数配置
- 光伏组件参数设置
- 环境条件设置
- 负载特性设置

#### 2.4.3 仿真结果
- 动态曲线展示
- 关键参数实时计算
- 仿真报告生成

### 2.5 系统管理

#### 2.5.1 用户管理
- 角色权限管理
- 操作日志记录
- 用户认证(Supabase Auth)

#### 2.5.2 设备管理
- 设备信息维护
- 校准记录管理
- 维护计划提醒

## 3. 非功能需求

### 3.1 性能要求
- 页面加载时间 < 3秒
- 数据刷新频率：1Hz
- 支持100个并发用户
- 数据存储容量：100GB

### 3.2 设计要求
- **视觉风格**：工业化、现代化、高端
- **色彩方案**：深色主题，蓝绿色调为主
- **字体**：Sans-serif，清晰易读
- **图表风格**：专业、精确、高对比度

### 3.3 兼容性要求
- 浏览器：Chrome 90+, Firefox 88+, Safari 14+
- 响应式设计：支持1920x1080及以上分辨率
- 移动端适配：平板设备查看

## 4. 技术架构

### 4.1 前端技术栈
- **框架**：Next.js 14 (React 18)
- **语言**：TypeScript
- **状态管理**：Zustand
- **UI组件**：Ant Design + Custom Components
- **图表库**：ECharts / Recharts
- **样式**：Tailwind CSS + CSS Modules

### 4.2 后端服务
- **数据库**：Supabase (PostgreSQL)
- **认证**：Supabase Auth
- **文件存储**：Supabase Storage
- **实时通信**：Supabase Realtime

### 4.3 部署方案
- **托管平台**：Netlify
- **CI/CD**：GitHub Actions
- **环境变量管理**：Netlify Environment Variables

## 5. 数据模型

### 5.1 实验数据表(experiments)
```sql
CREATE TABLE experiments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_type VARCHAR(50) NOT NULL,
  device_id VARCHAR(100) NOT NULL,
  device_type VARCHAR(50),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  status VARCHAR(20) DEFAULT 'running',
  operator_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 5.2 测量数据表(measurements)
```sql
CREATE TABLE measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_id UUID REFERENCES experiments(id),
  sequence_number INTEGER NOT NULL,
  current_a DECIMAL(10,5),
  voltage_v DECIMAL(10,5),
  power_w DECIMAL(10,5),
  temperature_c DECIMAL(5,2),
  timestamp TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5.3 设备信息表(devices)
```sql
CREATE TABLE devices (
  id VARCHAR(100) PRIMARY KEY,
  device_name VARCHAR(200),
  device_type VARCHAR(50),
  manufacturer VARCHAR(100),
  model VARCHAR(100),
  serial_number VARCHAR(100),
  calibration_date DATE,
  next_calibration DATE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5.4 文件管理表(files)
```sql
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_id UUID REFERENCES experiments(id),
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50),
  file_size INTEGER,
  storage_path TEXT,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 6. API 设计

### 6.1 实验管理API
- `GET /api/experiments` - 获取实验列表
- `POST /api/experiments` - 创建新实验
- `GET /api/experiments/{id}` - 获取实验详情
- `PUT /api/experiments/{id}` - 更新实验信息
- `DELETE /api/experiments/{id}` - 删除实验

### 6.2 数据管理API
- `GET /api/measurements` - 获取测量数据
- `POST /api/measurements/batch` - 批量插入数据
- `GET /api/measurements/export` - 导出数据
- `GET /api/measurements/realtime` - 实时数据订阅

### 6.3 文件管理API
- `POST /api/files/upload` - 上传文件
- `GET /api/files/{id}/download` - 下载文件
- `DELETE /api/files/{id}` - 删除文件
- `GET /api/files/list` - 获取文件列表

## 7. 页面规划

### 7.1 仪表板(Dashboard)
- 路由：`/`
- 功能：实时数据监控大屏
- 参考设计：test.png风格的工业化界面

### 7.2 实验管理
- 路由：`/experiments`
- 子页面：
  - `/experiments/dielectric` - 耐压实验
  - `/experiments/leakage` - 泄漏电流实验
  - `/experiments/normal` - 正常工况实验
  - `/experiments/abnormal` - 异常工况实验

### 7.3 数据管理
- 路由：`/data`
- 功能：文件上传、下载、检索
- 参考设计：image.png的数据管理界面

### 7.4 仿真中心
- 路由：`/simulation`
- 功能：电路仿真、参数配置
- 参考设计：point.png的交互式界面

### 7.5 系统设置
- 路由：`/settings`
- 子页面：
  - `/settings/users` - 用户管理
  - `/settings/devices` - 设备管理
  - `/settings/system` - 系统配置

## 8. 安全性要求

### 8.1 认证与授权
- JWT令牌认证
- 基于角色的访问控制(RBAC)
- 会话超时管理

### 8.2 数据安全
- HTTPS加密传输
- 敏感数据加密存储
- 定期数据备份

### 8.3 审计日志
- 用户操作记录
- 数据修改追踪
- 异常访问告警

## 9. 开发计划

### Phase 1: 基础架构(第1-2周)
- 项目初始化和环境配置
- Supabase数据库设计和配置
- 基础页面框架搭建

### Phase 2: 核心功能(第3-4周)
- 实验管理模块开发
- 数据可视化大屏实现
- 实时数据采集功能

### Phase 3: 高级功能(第5-6周)
- 文件管理系统
- 实验仿真模块
- 报告生成功能

### Phase 4: 优化与部署(第7-8周)
- 性能优化
- UI/UX改进
- 部署到Netlify
- 用户测试和反馈

## 10. 成功指标

### 10.1 功能指标
- 支持4种标准实验类型
- 实时数据刷新延迟 < 1秒
- 文件上传成功率 > 99%

### 10.2 用户体验指标
- 页面加载时间 < 3秒
- 用户操作响应时间 < 500ms
- 错误率 < 0.1%

### 10.3 业务指标
- 实验效率提升 > 50%
- 数据管理时间减少 > 70%
- 用户满意度 > 90%