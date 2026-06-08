# 每日零决策卡 · 养一片自己的天空 ☁️

> **每天不知道从哪开始？**
> 把想坚持的事，变成今天能完成的一小步。
> 完成这一小步，你的天空就多一朵云。

一个**最小行动**打卡 App。不是 Todo，不是番茄钟，也不是习惯追踪器。
它每天帮你把想坚持的事，压成一张小到不会抗拒的行动卡。
完成这一小步，你的天空就多一朵云。
漏一天也没关系，云不会骂你，明天回来就好。

## 核心闭环

```
我想坚持一件事
   ↓
它帮我变成今天最小的一步
   ↓
我完成
   ↓
天空多一朵云
```

## 功能

- **今日卡** — 把想坚持的事变成最小行动（首次进入一屏激活）
- **我的天空** — 完成后长出一朵云；漂浮云朵画布，点击看当天任务
- **回顾** — 用自然语言看见自己慢慢坚持（不再罗列数字）
- **设置** — 字体偏好、数据导入导出、重置数据

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
- Vitest + Testing Library（测试）

## 项目结构

```
src/
├── App.tsx                    # 应用壳 + Tab 路由
├── main.tsx                   # 入口
├── types.ts                   # TypeScript 类型定义
├── index.css                  # 全局样式
├── pages/
│   ├── TodayPage.tsx          # 今日卡 Tab（主页）
│   ├── SkyPage.tsx            # 我的天空 Tab（奖励页）
│   ├── StatsPage.tsx          # 回顾 Tab
│   └── SettingsPage.tsx       # 设置 Tab
├── components/
│   ├── ui/                    # 5 个基础组件：SoftButton/PillChip/CloudCard/FloatingInput/PageShell
│   ├── task/                  # 任务相关
│   ├── sky/                   # 天空视觉（HeroSky/SkyProgress/Cloud）
│   ├── stats/                 # 统计相关
│   ├── search/                # 搜索相关
│   └── shared/                # 共享组件（Onboarding/Celebration/Pomodoro 等）
├── hooks/
│   ├── useAppState.ts         # 状态 + localStorage 持久化
│   ├── useTasks.ts            # 任务 CRUD
│   ├── useStreak.ts           # 连续天数派生值
│   ├── useSearch.ts           # 搜索状态
│   ├── usePomodoro.ts         # 番茄钟
│   └── useFont.ts             # 字体偏好
├── utils/
│   ├── storage.ts             # localStorage 工具
│   ├── copy.ts                # 文案系统
│   ├── cloudSeed.ts           # 云朵种子生成
│   ├── achievements.ts        # 成就定义
│   └── skyMood.ts             # 天空心情计算
└── theme/
    └── clay.css               # 设计系统 tokens
```

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装

```bash
cd app
npm install
```

### 开发

```bash
npm run dev          # http://localhost:5173
```

### 测试

```bash
npm test             # 运行所有测试
npm run test:watch   # 监听模式
```

### 构建

```bash
npm run build        # → dist/
```

## 设计系统

采用 clay.css 设计系统，包含：

- **暖奶油画布** — 柔和的背景色调
- **软圆 3D** — claymorphism 风格的圆角和阴影
- **命名 swatch** — Matcha / Lemon / Pomegranate 等语义化颜色
- **4-8pt 间距** — 统一的间距系统
- **44px 触点** — 移动端友好的触摸目标

详见 `src/theme/clay.css`。

## 架构说明

### 状态管理

使用 React hooks 进行状态管理，无外部状态库：

- `useAppState` — 核心状态 + localStorage 持久化
- `useTasks` — 任务 CRUD 操作 + 智能降难度
- `useStreak` — 连续天数 + 天空心情
- `useSearch` — 搜索状态
- `usePomodoro` — 番茄钟状态
- `useFont` — 字体偏好（4 套系统字体切换）

### 组件组织

按功能模块组织组件：

- **ui/** — 5 个基础组件（SoftButton/PillChip/CloudCard/FloatingInput/PageShell）
- **task/** — 任务相关（CompactTaskRow / TaskHistory）
- **sky/** — 天空视觉（HeroSky / SkyProgress / Cloud / StreakDisplay）
- **stats/** — 统计相关（StatsDashboard / AchievementGrid）
- **search/** — 搜索相关（SearchBar / SearchResults）
- **shared/** — 共享（Onboarding / Celebration / Pomodoro / ShareCard 等）

### 页面组件

每个 Tab 对应一个页面组件：

- `TodayPage` — 今日卡（价值主张头 + 今日卡 + 弱化区）
- `SkyPage` — 我的天空（沉浸式画布 + 漂浮云朵）
- `StatsPage` — 回顾（自然语言总结 + 云朵故事）
- `SettingsPage` — 设置（字体 / 数据 / 重置 / 关于）

## 视觉特色

- **主题型壳 + 任务型核**：卡片显示"📖 阅读云（壳）/ 读 2 页书（核）"
- **奖励闭环**：完成后，天空会多一朵阅读云
- **天空随坚持变丰盈**：晨雾 → 晨曦 → 晴空 → 暖阳 → 夕阳
- **每朵云由日期 hash 生成**：同一日期永远同一朵云，不同日期不同
- **8 种云的表情**：calm / smile / sleep / wink / tiny-smile / peeking / peaceful / neutral
- **呼吸光环**：进度 0% 时大而慢，100% 时紧而金
- **温柔文案系统**：每条文案都过"不骂你"审核

## 许可证

MIT
