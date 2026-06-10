# 每日零决策卡 · 养一片自己的天空 ☁️

> **治愈不焦虑的打卡。你在养天空，天空不会 PUA 你。**

一个每日零决策打卡习惯应用。不是"坚持 X 天"的冷数字，是一片你亲手养出来的、独一无二的天空。每坚持一天，天空里多一朵属于你的云。

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
src/
├── App.tsx                    # 应用壳 + Tab 路由
├── main.tsx                   # 入口
├── types.ts                   # TypeScript 类型定义
├── index.css                  # 全局样式
├── pages/
│   ├── TodayPage.tsx          # 今天 Tab
│   ├── SkyPage.tsx            # 我的天空 Tab
│   ├── StatsPage.tsx          # 统计 Tab
│   └── SettingsPage.tsx       # 设置 Tab
├── components/
│   ├── task/
│   │   ├── CompactTaskRow.tsx # 紧凑任务行
│   │   └── TaskHistory.tsx    # 任务历史
│   ├── sky/
│   │   ├── HeroSky.tsx        # 天空视觉
│   │   ├── Cloud.tsx          # 云朵组件
│   │   └── StreakDisplay.tsx  # 连续天数显示
│   ├── stats/
│   │   ├── StatsDashboard.tsx # 统计面板
│   │   └── AchievementGrid.tsx# 成就网格
│   ├── search/
│   │   ├── SearchBar.tsx      # 搜索栏
│   │   └── SearchResults.tsx  # 搜索结果
│   └── shared/
│       ├── TabBar.tsx         # 底部 Tab 栏
│       ├── Onboarding.tsx     # 新手引导
│       ├── Celebration.tsx    # 庆祝动画
│       ├── CompletionNote.tsx # 完成备注
│       ├── MoodWidget.tsx     # 心情选择
│       ├── DailyQuote.tsx     # 每日金句
│       ├── Pomodoro.tsx       # 番茄钟
│       ├── ShareCard.tsx      # 分享卡片
│       └── PresetManager.tsx  # 预设管理
├── hooks/
│   ├── useAppState.ts         # 状态 + 持久化
│   ├── useTasks.ts            # 任务 CRUD
│   ├── useStreak.ts           # 连续天数
│   ├── useSearch.ts           # 搜索状态
│   └── usePomodoro.ts         # 番茄钟
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
- `useTasks` — 任务 CRUD 操作
- `useStreak` — 连续天数派生值
- `useSearch` — 搜索状态
- `usePomodoro` — 番茄钟状态

### 组件组织

按功能模块组织组件：

- **task/** — 任务相关组件
- **sky/** — 天空视觉组件
- **stats/** — 统计相关组件
- **search/** — 搜索相关组件
- **shared/** — 共享组件

### 页面组件

每个 Tab 对应一个页面组件：

- `TodayPage` — 今天 Tab
- `SkyPage` — 我的天空 Tab
- `StatsPage` — 统计 Tab
- `SettingsPage` — 设置 Tab

## 视觉特色

- **天空随坚持变丰盈**：晨雾 → 晨曦 → 晴空 → 暖阳 → 夕阳
- **每朵云由日期 hash 生成**：同一日期永远同一朵云，不同日期不同
- **8 种云的表情**：calm / smile / sleep / wink / tiny-smile / peeking / peaceful / neutral
- **温柔文案系统**：每条文案都过"不骂你"审核

## 许可证

MIT
