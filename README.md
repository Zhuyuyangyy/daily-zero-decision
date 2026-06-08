# 养一片自己的天空 · 每日零决策卡

> **每天不知道从哪开始？**
> 把想坚持的事，变成今天能完成的一小步。
> 完成这一小步，你的天空就多一朵云。

一个**最小行动**打卡 App。不是 Todo，不是番茄钟，也不是习惯追踪器。
它每天帮你把想坚持的事，压成一张小到不会抗拒的行动卡。
完成这一小步，你的天空就多一朵云。漏一天也没关系，云不会骂你，明天回来就好。

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

## 仓库结构

这是一个 monorepo。每个子目录都是独立项目（自带 git 仓库）。
本项目位于 `app/` 子目录：

```
.
├── README.md                 # 你正在看（项目门面）
├── SPEC.md                   # 详细规格文档
├── .gitignore                # 忽略所有 sibling 项目
└── app/                      # 本项目
    ├── README.md             # app 内的开发者文档
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── tsconfig.json
    ├── src/
    │   ├── App.tsx          # 应用壳 + Tab 路由
    │   ├── main.tsx         # 入口
    │   ├── types.ts         # TypeScript 类型
    │   ├── index.css        # 全局样式
    │   ├── pages/           # 4 个页面（TodayPage / SkyPage / StatsPage / SettingsPage）
    │   ├── components/      # 按功能分组
    │   │   ├── ui/          # 5 个基础组件（SoftButton/PillChip/CloudCard/FloatingInput/PageShell）
    │   │   ├── task/        # 任务组件
    │   │   ├── sky/         # 天空视觉
    │   │   ├── stats/       # 统计
    │   │   ├── search/      # 搜索
    │   │   └── shared/      # 共享
    │   ├── hooks/           # 5 个自定义 hooks
    │   ├── utils/           # 工具函数
    │   └── theme/           # 设计系统 tokens
    └── public/
```

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装与运行

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

## 详细文档

- **app/README.md** — 开发者文档（项目结构、状态管理、组件组织、设计系统）
- **SPEC.md** — 完整产品规格（定位、功能循环、禁止添加的功能、视觉规格）

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
