# Daily Zero Decision · 每日零决策卡

> 把「想坚持的事」变成今天愿意完成的一小步。  
> A quieter way to begin — one small action at a time.

**产品设计 / 前端工程** · React 18 · TypeScript · Vite · Vitest

[体验逻辑](#体验逻辑) · [本地运行](#本地运行) · [技术实现](#技术实现) · [文档索引](#文档索引)

---

## 它解决什么问题？

很多习惯产品强调连续打卡、积分和不断完成任务。但真正困难的往往是**开始**。

每日零决策卡围绕一个简单的过程展开：

**选择想做的事 → 缩小为今天的一小步 → 完成 → 在自己的天空里留下一朵云。**

产品希望通过更轻的交互降低启动成本，而不是用断签惩罚制造压力。这是设计方向，**不是已经经过严格实验验证的行为改善结论**。

## 体验逻辑

| 页面 | 主要用途 |
| --- | --- |
| **今天** | 管理今日行动卡，完成时保留简短反馈 |
| **我的天空** | 把完成的记录转化为可以回顾的云朵 |
| **统计 / 回顾** | 查看历史记录、趋势与阶段性变化 |
| **设置** | 调整偏好，管理本地数据的导入与导出 |

还包括番茄钟、完成动画、分享卡片、辅助提示等交互模块。功能入口可以从 [`app/src/App.tsx`](app/src/App.tsx) 与 [`app/src/pages/`](app/src/pages) 追踪。

## 本地运行

**请注意：真正的前端应用在 `app/` 中，而不是仓库根目录。**

要求 Node.js 20+ 和 npm：

```bash
git clone https://github.com/Zhuyuyangyy/daily-zero-decision.git
cd daily-zero-decision/app
npm ci
npm run dev
```

本地页面通常位于 `http://localhost:5173`（以 Vite 实际输出为准）。

### 验证与构建

```bash
cd app
npm test
npm run typecheck
npm run lint
npm run build
```

这些是 [`app/package.json`](app/package.json) 中的脚本入口；是否通过应以当前提交、运行环境和 CI 结果为准。构建产物由 Vite 输出。

## 技术实现

| 方向 | 实现 |
| --- | --- |
| UI | React 18、TypeScript、Tailwind CSS |
| 构建 | Vite 5 |
| 测试与质量 | Vitest、TypeScript、ESLint |
| 状态与交互 | React Hooks、任务与打卡状态、可独立维护的页面组件 |
| 数据 | 浏览器本地持久化及备份流程；实际存储与数据约束以代码为准 |

这个项目的重点不是复杂后端，而是把**交互体验、状态恢复、视觉反馈和用户控制权**做好。代码中还包含 Dexie、Zod 等依赖，不应把旧版文档中关于存储和依赖的绝对声明视为无需再检查的保证。

### 代码入口

```text
app/
├── src/
│   ├── App.tsx          # 页面组合与主要交互入口
│   ├── pages/           # Today / Sky / Stats / Settings
│   ├── components/      # 可复用交互组件
│   ├── hooks/           # 行为与状态逻辑
│   └── utils/           # 工具与数据处理
├── public/              # 静态资源
├── package.json
└── README.md            # 应用目录的简明说明
```

仓库根目录还有阶段性实验和辅助工作区；如果只是想运行每日零决策卡，**从 `app/` 开始即可**。

## 文档索引

- [应用快速说明](app/README.md) — 简明使用与开发入口
- [产品规格](app/PRODUCT_SPEC.md) — 功能与体验设计
- [技术设计](app/TECH_SPEC.md) — 组件和工程约束
- [数据结构](app/DATA_MODEL.md) — 状态与迁移
- [版本记录](app/CHANGELOG.md) — 版本演进
- [隐私说明](app/PRIVACY.md) · [安全说明](app/SECURITY.md) — 需要与当前实现持续核对

## 维护说明

欢迎反馈复现步骤清晰的 Bug、可访问性问题或改进建议。提交修改时请先确认 `app/` 内对应的测试、类型检查与构建脚本。这个仓库目前仍以产品迭代和工程验证为主。

**License:** [MIT](LICENSE)

---

<sub>Less pressure, more room to begin.</sub>
