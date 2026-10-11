# 每日零决策卡 · 养一片自己的天空 ☁️

> **治愈不焦虑的打卡。你在养天空，天空不会 PUA 你。**

一个每日零决策打卡习惯应用。不是"坚持 X 天"的冷数字，是一片你亲手养出来的、独一无二的天空。每坚持一天，天空里多一朵属于你的云。

**仓库结构**：本仓库只包含这一个应用，全部源码位于 [`app/`](app/README.md)。根目录仅保留仓库级元文件（LICENSE、CI、部署配置）。

## 功能特性

- **今天** — 每日任务卡片：说一句话生成零决策卡，点完成养一朵云
- **我的天空** — 云朵花园：连续打卡让天空从晨雾变夕阳
- **统计** — 数据洞察：连续天数、心情趋势、任务分布
- **番茄钟** — 内置专注计时器
- **成就系统** — 解锁里程碑徽章
- **数据导出/导入** — JSON 备份，云朵不会丢
- **心情记录** — 每天记录一下心情

## 核心理念

### 反 Duolingo

Duolingo 漏签会骂你、扣你 XP、看着火苗熄灭。
**我们不会。**

断签 = 多云的一天。
你不欠这朵云任何东西。
明天回来，云还在。

### 抖音天然可晒

"这是我坚持 30 天养出来的天空"——这句话本身就是一条短视频。
**每个人的天空都不一样**，别人会想拍自己的。

## 技术栈

- React 18 + TypeScript
- Tailwind CSS + clay.css design tokens
- Vite 5
- 纯前端，localStorage 持久化，可静态部署

## 项目结构

```
app/src/
├── App.tsx                    # 应用壳 + Tab 路由
├── main.tsx                   # 入口
├── types.ts                   # TypeScript 类型定义
├── pages/
│   ├── TodayPage.tsx          # 今天 Tab
│   ├── SkyPage.tsx            # 我的天空 Tab
│   ├── StatsPage.tsx          # 统计 Tab
│   └── SettingsPage.tsx       # 设置 Tab
├── components/
│   ├── task/                  # 任务相关组件
│   ├── sky/                   # 天空视觉组件
│   ├── stats/                 # 统计相关组件
│   ├── search/                # 搜索相关组件
│   ├── pet/                   # 天空宠物
│   ├── premium/               # 平静卡
│   ├── today/                 # 今日卡组件
│   ├── ui/                    # 通用 UI 原语
│   └── shared/                # 共享组件（番茄钟、庆祝动画等）
├── hooks/                     # useAppState / useTasks / useStreak / usePomodoro 等
├── utils/                     # storage / copy / cloudSeed / achievements 等
├── observability/             # 可观测性（ring buffer + 适配器）
├── error-boundary/            # 错误边界
└── theme/clay.css             # 设计系统 tokens
```

完整架构说明见 [`app/docs/ARCHITECTURE.md`](app/docs/ARCHITECTURE.md) 与 [`app/docs/DECISIONS/`](app/docs/DECISIONS/README.md)。

## 快速开始

### 环境要求

- Node.js 18+（CI 在 Node 20 / 22 上验证）
- npm

### 安装与开发

```bash
cd app
npm install
npm run dev          # http://localhost:5173
```

### 测试

```bash
npm test             # 运行所有测试
npm run test:watch   # 监听模式
```

### 构建

```bash
npm run build        # → app/dist/
```

### CI 与部署

- **CI**：根级 `.github/workflows/ci.yml`，在 Node 20/22 上运行 typecheck → lint → test → build
- **部署**：Vercel（`vercel.json`），构建产物为 `app/dist`

## 设计系统

采用 clay.css 设计系统，包含：

- **暖奶油画布** — 柔和的背景色调
- **软圆 3D** — claymorphism 风格的圆角和阴影
- **命名 swatch** — Matcha / Lemon / Pomegranate 等语义化颜色
- **4-8pt 间距** — 统一的间距系统
- **44px 触点** — 移动端友好的触摸目标

详见 `app/src/theme/clay.css`。

## 视觉特色

- **天空随坚持变丰盈**：晨雾 → 晨曦 → 晴空 → 暖阳 → 夕阳
- **每朵云由日期 hash 生成**：同一日期永远同一朵云，不同日期不同
- **8 种云的表情**：calm / smile / sleep / wink / tiny-smile / peeking / peaceful / neutral
- **温柔文案系统**：每条文案都过"不骂你"审核

## 文档

产品规格、数据模型、交付标准等文档统一放在 [`app/`](app/) 下：

- [`app/SPEC.md`](app/SPEC.md) — 规格入口（拆分为 PRODUCT_SPEC / TECH_SPEC / DELIVERY_STANDARD）
- [`app/DATA_MODEL.md`](app/DATA_MODEL.md) — 存储与 Schema 参考
- [`app/docs/CONTRIBUTING.md`](app/docs/CONTRIBUTING.md) — 贡献指南
- [`app/CHANGELOG.md`](app/CHANGELOG.md) — 产品演化记录
- [`app/SECURITY.md`](app/SECURITY.md) / [`app/PRIVACY.md`](app/PRIVACY.md) — 安全与隐私

## 许可证

MIT
