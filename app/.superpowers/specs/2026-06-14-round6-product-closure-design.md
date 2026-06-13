# Round 6 — 产品上线总收口

| 字段 | 值 |
|---|---|
| 日期 | 2026-06-14 |
| 阶段 | Round 6A–6G（产品主线收口 + 上线预备） |
| 基础分支 | `feature/scroll-optimization` |
| 并发分支 | `round6/product-logic`、`round6/sky-scene-infra`、`round6/today-integration`、`round6/docs-ci-deploy`、`round6/qa-polish` |
| 合并目标 | `main` → `v0.1.0` tag → 部署 |

## 1. 总目标

锁死产品主线：

```
我想坚持一件事
  ↓
系统帮我变成今天最小的一步
  ↓
我完成
  ↓
天空多一朵云
```

四层全部对齐：
- **产品文案层**：用户 3 秒知道这是干嘛的
- **交互层**：一天只完成一张今日卡
- **组件层**：SkyScene / CloudGarden / TodayDecisionCard 边界清晰
- **工程层**：CI、构建、部署、README、回归测试完整

## 2. 范围

### 2.1 本轮必须做

| ID | 内容 | 负责人 |
|---|---|---|
| 6A | SkyScene 架构落地 | 前端架构 agent |
| 6B | TodayPage 接入新天空头部 | 页面集成 agent |
| 6C | CloudGarden mode='today' 重构 | 云朵交互 agent |
| 6D | 最小行动解析与数据逻辑收口 | 数据逻辑 agent |
| 6E | README / CI / 部署预备 | 工程收口 agent |
| 6F | QA 回归与上线检查 | QA agent |

### 2.2 本轮不做

- 完整 SkyPage rich garden 重构
- CloudGarden mode='garden' 完整拖拽实现
- 用户账号
- 通知系统
- 多任务列表
- 复杂云朵档案
- 排行榜 / 社交
- 更多番茄钟模式

### 2.3 本轮保留未来接口

`CloudGarden.mode: 'today' | 'garden'` 类型可声明，但本轮只实现 `mode='today'`。`mode='garden'` 仅放类型 + TODO 注释 + 空分支保护。

## 3. 架构与组件契约

### 3.1 顶层组件树

```
TodayPage
├── <SkyScene mood density variant reducedMotion?>
│     ├── SkyBackground (5 层 radial + linear gradient)
│     ├── Sun / Stars (山后；本轮无 Moon，见 §3.2 Sun/Moon 规则)
│     ├── FarMountains
│     ├── MidMountains
│     ├── CloudAtmosphere (一层淡云薄雾)
│     ├── Birds (2-3 只, comfortable / 5-7 只, rich)
│     ├── Balloon (仅 rich)
│     ├── <SkyHeaderContent title subtitle>
│     │     ├── h1
│     │     ├── p
│     │     └── <SkyProgressMini streak totalClouds mood hasTodayCloud>
│     ├── <CloudGarden mode="today" today last7 onTodayComplete mood>
│     │     <!-- mode='today' 时 history / onOpenCloud 必为 undefined，详见 §3.6 -->
│     ├── GrassLine
│     └── ForegroundFade (variant='today' 才渲染)
├── <TodayDecisionCard>
├── 心情小记
├── <TodayFeedbackStrip>
└── 弱化区
```

> **M6 — HeroSky 关系**：本轮 `SkyScene` 不替代 `components/sky/HeroSky.tsx`。`HeroSky` 是 SkyPage 旧版沉浸式天空，本轮保留不动，仅在 TodayPage 引入 `SkyScene`。两条线并存，迁移到 SkyPage 是后续 Issue。

`SkyPage`（未来）：

```
<SkyScene mood density="rich" variant="garden" reducedMotion?>
  <CloudGarden mode="garden" history onOpenCloud mood />
</SkyScene>
```

### 3.2 SkyScene

#### 类型

```ts
export type SkyDensity = 'minimal' | 'comfortable' | 'rich';
export type SkyVariant = 'today' | 'garden';
// 对齐 src/utils/skyMood.ts:4 的实际枚举（以代码为准，不臆造 night/overcast）
export type SkyMood = 'dawn' | 'morning' | 'clear' | 'sunny' | 'golden';

export interface SkySceneProps {
  mood: SkyMood;
  density: SkyDensity;
  variant: SkyVariant;
  reducedMotion?: boolean;
  className?: string;
  children?: React.ReactNode;
}
```

#### SkyScene 不允许做的事

- 读取 `AppState`
- 读取 `Task`
- 调用 `useTasks` / `useStreak`
- 判断 today 是否完成
- 渲染完成按钮
- 渲染任务文案

#### 层级顺序（自底向上）

```
SkyBackground
Sun / Moon / Stars
FarMountains
MidMountains
CloudAtmosphere
Birds
Balloon
children
GrassLine
ForegroundFade
```

#### density 规则

| density | bg | sun/moon | far mountains | mid mountains | cloud atmosphere | birds | balloon | stars |
|---|---|---|---|---|---|---|---|---|
| minimal | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| comfortable | ✅ | ✅ | ✅ | ✅ | ✅ | 2-3 只 | ❌ | ❌ |
| rich | ✅ | ✅ | ✅ | ✅ | ✅ | 5-7 只 | ✅ | ✅ |

**Sun/Moon 与 Stars 渲染规则**（H1 改 SkyMood 枚举后联动）：

- 本轮 `SkyMood` 不含 `night` / `overcast`，所以 `sun/moon` 列恒为 ✅（即始终渲染 Sun），具体颜色 / 高度 / 光晕强度由 mood 决定（详见 Sun 视觉参数表）。

#### Sun 视觉参数表（H3 补全 — 落地占位值，Issue 1 落地时调优）

| mood | 高度 (top%) | 主色 (hex) | 光晕 opacity |
|---|---|---|---|
| dawn | 18% | #FFB37A | 0.5 |
| morning | 22% | #FFD89B | 0.6 |
| clear | 28% | #FFE4A8 | 0.55 |
| sunny | 32% | #FFCB6B | 0.7 |
| golden | 25% | #FF9D5C | 0.75 |

> 高度 = Sun 圆心到 viewport 顶部的距离占 viewport 高度的百分比。光晕 opacity = Sun 外圈 radial-gradient 的最大透明度。本表为参考初始值，Issue 1 sky-scene-infra agent 落地时按实际渲染效果调整，无需对齐表里精确数字。最终视觉效果以 `SkyScene.tsx` 实际渲染为准，spec 不强制精确数值。
- `stars` 在 `comfortable` / `minimal` 默认不渲染（白天为主）；`rich` 可选 3-5 颗散落，但 **本轮默认不渲染**（v0.1.0 范围），留 TODO 注释。`SkyScene` 装饰层未来若扩展夜间 mood，需要先扩 SkyMood 枚举 + 单独 Issue。
- 若后续产品要 night mood（星空主视觉），需新增 `'night'` 枚举 + stars 全量渲染分支，不在本轮。

**小屏断点规则（H12）**：

- 当 `window.innerWidth <= 375` 时，`<SkyScene>` 默认强制 `density='minimal'`，避免装饰层挤压今日卡。
- 实现位置：`SkyScene` 入口处用 `useState` + `useEffect` 监听 `resize`，初始值用 `typeof window !== 'undefined' ? window.innerWidth <= 375 : false` 兜底 SSR。
- 决策同步落到 §11 默认决策。

#### variant 规则

| variant | ForegroundFade | 草原线 | 高度 |
|---|---|---|---|
| today | ✅ | 明显 | 中等 |
| garden | ❌ | 弱 | 全屏 |

`ForegroundFade` 与 `GrassLine` 都声明在组件树中，但 `ForegroundFade` 仅当 `variant='today'` 时实际渲染，`GrassLine` 永远渲染。

#### 装饰层无障碍

```tsx
aria-hidden="true"
```

```css
pointer-events: none;
```

适用对象：SkyBackground、Sun / Moon / Stars、FarMountains、MidMountains、CloudAtmosphere、Birds、Balloon、GrassLine、ForegroundFade。

**禁止**给 `SkyHeaderContent`、`SkyProgressMini`、`CloudGarden` 主云加 `aria-hidden` 或 `pointer-events: none`。

### 3.3 useReducedMotion（src/hooks/useReducedMotion.ts）

```ts
import { useEffect, useState } from 'react';

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);

    if (mq.addEventListener) {
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }

    mq.addListener(handler);
    return () => mq.removeListener(handler);
  }, []);

  return reduced;
}
```

**CSS 兜底必须加**（即使 React prop 未传，也保护用户）：

> **M1 实现位置（强制）**：下方 `@media (prefers-reduced-motion: reduce) { ... }` 兜底规则**必须**写入 `src/index.css` 顶部（全局加载）。**禁止**放入 `src/components/sky/SkyScene.module.css` 或其他 `*.module.css` 内，否则 TodayPage 内联的 `dawn-aura-breathe` / `cloud-drift` / `float` / `sky-breathe` 等非 sky-scene 组件的类名不会命中 @media 规则，违反 §13 验收第 8 条。Issue 1 落地时一次性把整段 @media 块 commit 到 `src/index.css` 顶部（在所有其它规则之前）。

```css
@media (prefers-reduced-motion: reduce) {
  .sky-bird,
  .sky-balloon,
  .sky-cloud-drift,
  .sky-sparkle,
  .sky-atmosphere,
  .clay-cloud-drift,
  .dawn-aura-breathe,
  .cloud-drift,
  .float,
  .sky-breathe {
    animation: none !important;
    transform: none !important;
  }
}
```

> **M5 覆盖范围**：CSS 兜底必须**穷尽所有动画类**，不能只列 React prop 命名的 `sky-*` 前缀。TodayPage 内联的 `dawn-aura-breathe` / `cloud-drift` / `float` / `sky-breathe` 也必须包含。否则用户开 reduced-motion 后内联动画仍会动，违反 §13 验收第 8 条。

### 3.4 SkyHeaderContent

```ts
interface SkyHeaderContentProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
}
```

默认：
- title: `今天只做这一小步`
- subtitle: `完成后，天空会多一朵云`（H3 统一：全文档无句号，§4.1 实际传入时也保持无句号）

空状态（TodayPage 传）：
- title: `每天不知道从哪开始？`
- subtitle: `我帮你把想坚持的事，变成今天能完成的一小步。`

**SkyHeaderContent 不接 AppState、不计算 streak**。所有业务字段由调用方决定传入。

> **L2 subtitle 句号规则**：默认 subtitle（按钮型短文案）无句号，与 H3 统一的全文档无句号规则保持一致；空状态 / 长描述 subtitle 保留句号（`我帮你把想坚持的事，变成今天能完成的一小步。`）。判断标准：subtitle 是否为完整的"告知/描述"句，是 → 保留句号；subtitle 是否为按钮旁的"导引"短文案，是 → 省略句号。Issue 1 / Issue 3 落地时按此规则校对。

### 3.5 SkyProgressMini

```ts
interface SkyProgressMiniProps {
  streak: number;
  totalClouds: number;
  mood: SkyMood;
  hasTodayCloud: boolean;
}
```

文案规则（仅三类）：

| 状态 | 文案 |
|---|---|
| `hasTodayCloud = true` | `☁️ 今天已长出 · 连续 N 天` |
| `hasTodayCloud = false` 且 `totalClouds > 0` | `☁️ 今天待长出 · 累计 N 朵` |
| 无历史 | `☁️ 第一朵云，今天开始` |

**禁止**出现：`还差 N 朵`、`今日 0/3`、`完成 2/5`、`再养一朵`、`多做几朵`。

`mood` → 图标映射（对齐 H1 改后的 SkyMood 枚举）：

| mood | icon |
|---|---|
| dawn | 🌅 |
| morning | 🌄 |
| clear | 🌤️ |
| sunny | ☀️ |
| golden | ☀️ |

> H1 收尾：`SkyMood` 不再有 `overcast` / `night` 枚举，故表里删除这两行。如后续产品需要，再加 Issue 扩枚举 + 补图。

### 3.6 CloudGarden

```ts
type CloudGardenMode = 'today' | 'garden';

interface CloudGardenProps {
  mode: CloudGardenMode;
  today?: Task | null;
  last7?: Array<{ date: string; tasks: Task[] }>;
  history?: Record<string, Task[]>;
  onTodayComplete?: () => void;
  onOpenCloud?: (date: string) => void;
  mood: 'calm' | 'happy' | 'celebrate';
}
```

**CloudGarden 不接 `density`**。density 是 SkyScene 的环境密度，mode 是 CloudGarden 的业务场景。

#### 配置表

```ts
const CLOUD_GARDEN_CONFIG = {
  today: {
    maxClouds: 7,
    draggable: false,
    showTodayMainCloud: true,
    showEmptyState: true,
    showCompleteButton: true,
    minOpacity: 0.18,
  },
  garden: {
    maxClouds: 30,
    draggable: true,
    showTodayMainCloud: false,
    showEmptyState: false,
    showCompleteButton: false,
    minOpacity: 0.32,
  },
} as const;
```

本轮实现 `mode='today'`；`mode='garden'` 返回 `null` 并附 TODO 注释。

> **L3 类型契约说明**：本轮 `CloudGardenProps` 用**可选字段 + 内部守卫**实现：`history` / `onOpenCloud` 保持可选（`?:`），不在类型层做强制。`mode='today'` 分支内部加 `if (history) throw new Error('mode=today must not pass history')` 守卫，仅在误传时 throw；`mode='garden'` 分支加 `if (!history) throw new Error('mode=garden requires history')` 守卫。**不**采用 discriminated union（`{ mode: 'today'; history?: undefined } | { mode: 'garden'; history: Record<...> }`），避免本轮给 `mode='today'` 的调用方引入额外类型负担。后续 Issue 7（`mode='garden'` 完整实现）落地时再升级为 discriminated union 联合类型，spec 此处不强制。

#### CloudGarden 移除项（迁出到 SkyScene）

- 内嵌背景渐变
- 内嵌远山
- 内嵌草地线
- 硬编码 `height: 260`

`CloudGarden` 改用 `position: relative; flex: 1; min-height: 0;` 由外层 `SkyScene` 容器决定实际高度，不再自设固定值。

#### CloudGarden 保留

- 记忆云
- 今日主云
- 空状态云
- 完成按钮
- 庆祝状态

#### 记忆云规则（mode='today'）

- `last7.slice(0, 7)`（**注意：当前 `CloudGarden.tsx:82` 实际是 `slice(0, 5)`，Issue 2 落地时必须改成 7**，对齐 spec）
- 不拖拽
- 不 blur
- opacity 不低于 `0.18`
- 尺寸不盖过主云
- 主云永远在视觉中心

#### 空状态文案（M1 修订 — 避免与 §4.2 禁止词重叠）

```
☁️
云朵还没发芽
选一个轻的开始，今天就够了。
```

> M1 修订：原文案 `今天不用想太多，我帮你挑一朵轻的。` 与 §4.2 禁止列表中 `不用想太多` / `先养今天这一朵` 共享关键词，统一替换为中性文案。不抢 TodayDecisionCard 视觉。

#### Sun / Moon 互斥与 Stars（M2）

§3.2 density 表的 `sun/moon` 列对所有 density 都是 ✅。本轮 `SkyMood` 枚举（`dawn | morning | clear | sunny | golden`，详见 H1）**均为白天 mood**，统一渲染 `Sun`；`Moon` 渲染分支保留代码骨架（空 return + TODO），不实际挂载。

`Stars` 渲染分支同上：保留空骨架 + TODO。本轮默认星星数量为 0，v0.1.0 不引入 night mood。

#### CloudGarden mood 映射表（M3 补全）

`CloudGarden.mood` 与 `SkyMood` 是两套枚举，必须显式声明换算，禁止在调用方散写三元：

| SkyMood（§3.2）| CloudGarden.mood |
|---|---|
| dawn | calm |
| morning | calm |
| clear | calm |
| sunny | calm |
| golden | happy |
| （无枚举值映射）| celebrate（仅当日 task.completedAt 时） |

实现位置：新增 `src/utils/cloudGardenMood.ts` 导出 `toCloudGardenMood(skyMood, completedAt): 'calm' | 'happy' | 'celebrate'`。Issue 2 / Issue 3 落地时 TodayPage 改为直接调用，禁止在 JSX 写 `skyMood === 'golden' ? 'happy' : 'calm'`。

> 重要：M3 表里 `completed` 映射 `celebrate` 来自任务完成信号（`task.completedAt`），**不属于 SkyMood 枚举**。TodayPage 当前传 `currentTask?.completedAt ? 'celebrate' : ...` 的逻辑在重构时统一走 `toCloudGardenMood(skyMood, !!currentTask?.completedAt)`。

> 今日任务状态对 mood 映射有影响：completed → celebrate，incomplete → calm/happy（按 toCloudGardenMood 映射表），handleEasier 三态决策详见 §5.3。

#### TodayPage 接入约束（M7）

§3.6 加 `mode: CloudGardenMode` 后，Issue 2 落地时必须同步修改 `TodayPage.tsx:112-117` 的 `<CloudGarden ... />` 调用，**补 `mode="today"` prop**（当前调用没传 mode，运行时会因 prop 缺失在 TypeScript 严格模式下编译失败）。其他 prop（`today` / `last7` / `onTodayComplete` / `mood`）保持不变，`mood` 计算走 `toCloudGardenMood(skyMood, !!currentTask?.completedAt)`。

## 4. TodayPage 改造

### 4.1 页面结构

```tsx
<SkyScene mood={skyMood} density="comfortable" variant="today">
  <SkyHeaderContent
    title={currentTask ? '今天只做这一小步' : '每天不知道从哪开始？'}
    subtitle={
      currentTask
        ? '完成后，天空会多一朵云'  /* H3: 无句号，与 §3.4 默认值一致 */
        : '我帮你把想坚持的事，变成今天能完成的一小步。'
    }
  >
    <SkyProgressMini
      streak={state.streak.current}
      totalClouds={state.log.length}
      mood={skyMood}
      hasTodayCloud={allTodaysTasksDone}
    />
  </SkyHeaderContent>

  <CloudGarden
    mode="today"  /* M7: Issue 2 落地时补上 */
    today={currentTask}
    last7={last7}
    onTodayComplete={() => currentTask && handleCompleteTask(currentTask.id)}
    mood={toCloudGardenMood(skyMood, !!currentTask?.completedAt)}  /* M3: 走统一换算函数，依赖 Issue 3 落地的 toCloudGardenMood */
  />
</SkyScene>
```

### 4.2 文案硬约束

**禁止出现**：

- `今天，从一朵云开始`
- `不用想太多，先养今天这一朵`
- `再养一朵`
- `还差 N 朵`
- `今日 0/3`

#### H5 精确文案替换清单（Issue 3 落地时执行）

> 当前 `TodayPage.tsx:97-103` 与 `124-127` 仍存在与 §4.2 冲突 / 需明确保留的文案。Issue 3 必须按下列清单逐条处理：

| 位置 | 当前文案 | 处理 | 理由 |
|---|---|---|---|
| `TodayPage.tsx:99` h1 | `今天，从一朵云开始` | **删除**整个 h1 节点 | 与 §4.2 禁止列表第一项冲突；改由 `<SkyHeaderContent title="今天只做这一小步" />` 接管 |
| `TodayPage.tsx:101` p | `不用想太多，先养今天这一朵。` | **删除**整个 p 节点 | 与 §4.2 禁止列表第二项冲突；改由 `<SkyHeaderContent subtitle />` 接管 |
| `TodayPage.tsx:124` 完成态 h2 | `今天的云已经养好` | **保留** | 文本含"养"字但**不在 §4.2 禁止列表中**（禁止的是"再养一朵"）；可继续使用，spec 不强制改写 |
| `TodayPage.tsx:125` 完成态 p | `你只做了一小步，但它已经留下来了。` | **保留** | 完成态奖励闭环文案，与 §4.4 完成后入口设计一致 |

**执行后要求**：

- 删除两个节点后，TodayPage 头部只保留 `<SkyProgress>`（compact 模式）+ 状态 chips（🏆 最佳 / ☁️ 累计），由 `<SkyScene><SkyHeaderContent>...</SkyHeaderContent>...</SkyScene>` 在视觉顶部接管标题与副标题。
- 删除前请用 git 单独 commit 一次 `refactor(today): remove forbidden h1/p`，便于回溯。

### 4.3 视觉顺序

```
SkyScene
TodayDecisionCard
心情小记
TodayFeedbackStrip
弱化区
```

`TodayDecisionCard` 仍然是最大行动入口。番茄钟只保留 `⏱️ 开始计时` 内嵌按钮，不展开成大面板。

### 4.4 完成后入口

完成后只能出现：

- `去看看我的天空`
- `明天再来`

**禁止**：`再养一朵`、`再来一个任务`、`继续添加`。

> 允许 0 → 1 张的 seed 创建（仅一次），禁止 1 → N 张的再养。详见 §5.3 H4 三态决策表。

## 5. 数据逻辑收口

### 5.1 parseTaskFromInput

> 当前 `src/utils/storage.ts:155-204` `parseTaskFromInput` 返回 `Partial<Task>`，含 `type` / `bookName` / `pagesPerSession` / `startPage` / `time` 等字段。`pagesPerSession` 在命中 `新词/背词/单词` 关键词时强制为 5，`time` 字段在多数场景下缺失（仅 `minuteMatch` 命中时填，其他场景返回 `undefined`）。**Issue 4 不修改返回类型**（保持 `Partial<Task>` 不变），只在函数体末尾补 `time` 字段的推算逻辑（见下文 type 默认时间表 + 深呼吸特例）。

输入支持：

- `读 2 页书`
- `出门走走 5 分钟`
- `看 5 分钟代码`
- `背 5 个新词`
- `写一行日记`
- `深呼吸三次`

解析规则：

```ts
const pageMatch = input.match(/(\d+)\s*页/);
const minuteMatch = input.match(/(\d+)\s*(分钟|min)/i);
const wordMatch = input.match(/(\d+)\s*(个)?(新词|单词)/);
```

归类（顺序：先看更具体的）：

| 关键词 | type | 备注 |
|---|---|---|
| 散步 / 走走 / 出门走 | exercise | |
| 运动 / 跑步 / 健身 / 瑜伽 | exercise | M10 补：当前 `storage.ts:193` 已实现但 spec 漏列 |
| 代码 / 写代码 / 编程 | coding | |
| 新词 / 背词 / 单词 | reading | bookName='单词本'；无页数时 pagesPerSession=5；type=reading 且命中 新词/背词/单词 关键词时，无条件 5 分钟，绕过页数推算（"背单词特例"，M3 修订） |
| 书 / read / 阅读 | reading | 解析 `《书名》`；否则书名留空 |
| 其他 | other | |

返回（`Partial<Task>` 形态，下方代码块仅展示 Issue 4 新增的 `time` 推算片段；**不是**完整返回 shape）：

```ts
// 插入位置：现有函数体末尾、return 之前
// 推算 time，优先级：minuteMatch > 背单词特例 > pagesPerSession 推算 > type 默认 > 深呼吸覆盖
let time: number | undefined;
if (minuteMatch) {
  time = parseInt(minuteMatch[1], 10);
} else if (type === 'reading' && /新词|背词|单词/.test(input)) {
  time = 5; // 背单词特例
} else if (pagesPerSession !== undefined) {
  time = pagesPerSession <= 2 ? 5 : pagesPerSession <= 10 ? 15 : 30;
} else if (/呼吸|深呼吸/.test(input)) {
  time = 1; // 深呼吸特例
} else {
  const defaults: Record<string, number> = { reading: 5, exercise: 5, coding: 5, other: 3 };
  time = defaults[type];
}
```

> 重要：`parseTaskFromInput` 的 `Partial<Task>` 返回类型是 `useTasks.ts` `addWithValue`（`useTasks.ts:42-69`）与 `handleEasier` seed 分支（`useTasks.ts:203-206`）的共同依赖。**禁止**把返回类型改窄为 4 字段对象，否则 `handleEasier` seed 分支会丢失 `startPage` 等字段。

#### type 默认时间表（H2 收口 §5.1 与 §7.3 一致性）

`parseTaskFromInput` 内部时间优先级：

1. 用户输入含 `X 分钟`（含 `min`） → 直接取该数字，例 `出门走走 5 分钟` → `5 分钟`
2. 用户输入含 `X 页` → 按 `pagesPerSession` 推算（≤2 页→`5 分钟`，≤10 页→`15 分钟`，否则 `30 分钟`）
3. 上述都没有 → 走 **type 默认时间表**：

| type | 含数字分钟 | 无数字分钟 | 备注 |
|---|---|---|---|
| reading | 取该分钟 | 5 分钟 | 背单词 / 无页数也按 5 分钟（H2 让 §7.3 `背 5 个新词 → 5 分钟` 自洽） |
| exercise | 取该分钟 | 5 分钟 | 默认 5 分钟散步 |
| coding | 取该分钟 | 5 分钟 | 默认 5 分钟看代码 |
| other | 取该分钟 | 3 分钟 | 默认 3 分钟小动作 |
| other 特例 `深呼吸` | — | **1 分钟** | §7.3 用例 `深呼吸三次 → 1 分钟` 的特例判定，**不**走 3 分钟默认 |

> 关键判定：`深呼吸` / `呼吸` 关键词命中且 type=other 时，**强制** 1 分钟；其他 other 走 3 分钟。
>
> 关键判定（M3 背单词特例）：type=reading 且命中 `新词` / `背词` / `单词` 关键词时，**无条件** 5 分钟，绕过 `pagesPerSession` 推算（即使 `pagesPerSession > 5` 也走 5 分钟）。这是因为 `storage.ts:179` 的 pagesPerSession=5 后 `5≤10` 会推算成 15 分钟，与 `背 5 个新词 → 5 分钟` 期望冲突。
>
> 实现位置：`parseTaskFromInput` 末尾加 `time` 推算分支，优先级：`minuteMatch` > 背单词特例（type=reading + 关键词）> `pagesPerSession` 推算 > type 默认 > 深呼吸覆盖。

#### §7.3 期望值对齐（H2 收尾）

按上述默认表，§7.3 全部用例保持：

- `读 2 页书` → reading, 2 页≤2 → 5 分钟 ✅
- `出门走走 5 分钟` → exercise, 含 5 分钟 → 5 分钟 ✅
- `看 5 分钟代码` → coding, 含 5 分钟 → 5 分钟 ✅
- `背 5 个新词` → reading, 无分钟无页数 → type 默认 5 分钟 ✅
- `写一行日记` → other, 无分钟无页数 → 3 分钟 ✅
- `深呼吸三次` → other + 深呼吸特例 → 1 分钟 ✅

### 5.2 handleEasier

**按任务类型重写主标题**（不是字符串替换）：

| 当前 | type | 改后 |
|---|---|---|
| 读 10 页书 | reading | 读 2 页书 |
| 读 2 页书 | reading | 读 1 页书 |
| 出门走走 10 分钟 | exercise | 出门走走 2 分钟（halved） |
| 看 30 分钟代码 | coding | 看 5 分钟代码（halved 后下限 5） |
| 写一行日记 | other | 写一行日记（保持原标题） |
| 深呼吸三次 | other | 深呼吸三次（保持原标题） |

> L4 修订：原表 `整理桌面 5 分钟 → 把一个东西放回原位` **不在当前 `LIGHT_TEMPLATES` 列表中**（`useTasks.ts:172-178` 的真实列表是 `读 2 页书 / 出门走走 / 看 5 分钟代码 / 深呼吸三次 / 写一行日记`），删除该行避免误导。其他 type 的「换轻一点」统一按 `makeEasierTitle` 重写主标题或保持原意。

实现策略：

- 抽取 `makeEasierTitle(task, newMinutes, newPages)`
- `reading` → `读 ${newPages} 页书`
- `coding` → `看 ${newMinutes} 分钟代码`
- `exercise` → `出门走走 ${newMinutes} 分钟`
- `other` → 保持原标题，只动时间

### 5.3 一天一张卡

```ts
const MAX_TASKS_PER_DAY = 1;
```

**现状**：`MAX_TASKS_PER_DAY = 1` 已在 `src/hooks/useTasks.ts:14` 实现。Issue 4 不需要新增该常量，但要**审查所有入口是否尊重它**：

所有入口必须尊重：

- Onboarding 选择
- 快捷建议点击
- 输入框添加
- handleReset
- importState 后状态恢复
- **handleEasier 的无任务 seed 分支**（H4 补 — `useTasks.ts:191-212` 当前**没有** MAX 校验，是旁路）

**handleEasier 的 seed 分支规则（H4 新增）**：

`handleEasier` 必须按今日任务状态走三态决策表（实现位置：`useTasks.ts:191-212`）：

| 今日状态 | handleEasier 行为 |
|---|---|
| 0 张任务 | 允许 seed 一次（最多生成 1 张） |
| 1 张 incomplete | return prev（不允许再养） |
| 1 张 completed | return prev（今天已完成，不要再添加） |
| 2+ 张（违反 MAX） | return prev + log warning |

```ts
// H4 守卫：4 态决策（与上方决策表一一对应）
setState((prev) => {
  // 关键修正：必须计入"今日全部任务"（含 completed），不能排除 completed
  // 否则用户完成 1 张后点"换一朵轻一点的"会绕过 1 张 completed 行 → 触发 seed 生成第 2 张
  const allTodays = prev.tasks.filter((t) => t.createdAt === today);
  const todaysCount = allTodays.length;
  const hasIncomplete = allTodays.some((t) => !t.completedAt);

  // 行 4：2+ 张（违反 MAX）→ return prev + log warning
  if (todaysCount > MAX_TASKS_PER_DAY) {
    console.warn('[useTasks] handleEasier hit MAX violation', { todaysCount });
    return prev;
  }

  // 行 3：1 张 completed（今天已完成，不再添加）
  if (todaysCount === 1 && !hasIncomplete) {
    return prev;
  }

  // 行 2：1 张 incomplete（已有 incomplete 不允许再养；按 makeEasierTitle 重写主标题走原 map 分支）
  // 注意：原代码的 "!todayIncomplete" 触发 seed 是错的——1 张 completed 时 allTodays.length=1、hasIncomplete=false
  //   若走原逻辑会被算成"0 张"→ seed 第 2 张。修复后由"todaysCount === 0"独占 seed 入口。
  if (todaysCount === 1 && hasIncomplete) {
    // 走原 map 分支（按 type 重写标题，不增减 tasks）
    // return ...原重写逻辑...
  }

  // 行 1：0 张 → 允许 seed 一次（最多生成 1 张）
  if (todaysCount === 0) {
    // ...原有 seed 逻辑（0 → 1 张仅一次）
  }
});
```

> 实现要点：必须在 setState 的函数式 updater 内部判断，**不能**在 useCallback 闭包外判断（避免读到过期 state）。这是 H4 与现有 `addWithValue` 的关键差异 —— `addWithValue` 在闭包顶部判断（`useTasks.ts:40`），依赖 `[state.tasks]` deps；`handleEasier` 的 deps 是 `[today, setState]`，闭包里的 `prev.tasks` 才是真实值，所以**必须**挪到 updater 内部。

**禁止**让用户在一天内生成 2 张卡。允许 0 → 1 张的 seed 创建（仅一次），禁止 1 → N 张的再养。

### 5.4 importState

- 坏 JSON → 返回 `null`，不崩溃
- 缺字段 → fallback 到 `defaultState` 对应字段
- 成功 → 返回导入后的 `AppState`，**不**返回当前 `loadState`

调用方必须使用返回值：

```ts
const newState = importState(json);
if (newState) setState(newState);
```

#### onboarded fallback 三态规则（H9 — 禁止 `?? true`）

`importState` 内部 `onboarded` 字段处理**必须是三态**，不能写 `parsed.onboarded ?? true`（当前 `storage.ts:85` 是错的，会把缺失字段的备份强制标为已 onboarded，破坏首次升级用户的 Onboarding 流程）：

```ts
onboarded:
  parsed.onboarded === true ? true :
  parsed.onboarded === false ? false :
  defaultState.onboarded  // undefined 时走默认（false）
```

> 三态映射：
>
> | `parsed.onboarded` | 结果 |
> |---|---|
> | `true` | `true`（尊重用户） |
> | `false` | `false`（尊重用户） |
> | `undefined` / 字段缺失 | `defaultState.onboarded`（即 `false`，首次升级用户应看到 Onboarding） |
>
> `loadState` 同样适用本规则（`storage.ts:42` 实际是 `if (parsed.onboarded == null) parsed.onboarded = false;` 赋值形式，行为等价于三态规则的 false 分支，已经走 false，可保留 —— 但要加注释说明是有意行为，避免后续被改回 `?? true`）。

#### handleOnboardingFinish 落地（L5 — 显式 saveState）

`useTasks.ts:240-242` 当前实现：

```ts
const handleOnboardingFinish = useCallback(() => {
  setState((prev) => ({ ...prev, onboarded: true }));
}, [setState]);
```

仅 `setState` 不显式 `saveState` 存在竞态：用户点击完成 → setState 同步 → 立即刷新页面 → `useEffect` 还没跑 `saveState` → `loadState` 读到旧 `onboarded=false` → 重新弹 Onboarding。

**修复规则**：Issue 4 落地时 `handleOnboardingFinish` 改为：

```ts
const handleOnboardingFinish = useCallback(() => {
  setState((prev) => {
    const next = { ...prev, onboarded: true };
    saveState(next);  // 显式落盘
    return next;
  });
}, [setState]);
```

或者把 saveState 提到 `useEffect([state])` 由 `App.tsx` 集中处理（推荐，更彻底）。无论哪种，**禁止**只 setState 不落盘。

> H2 决策收口：本轮 L5 落地方案**采用**"`handleOnboardingFinish` 内部显式 `saveState`"分支（上方代码块），**不**走 `App.tsx` 集中处理。这样避免 `App.tsx` 被 product-logic 与 docs-ci-deploy 抢改，简化 §9.1 冲突面。Issue 4 落地时直接采用上方代码块；§9.1 共享文件表中 `App.tsx` 独占 `round6/docs-ci-deploy`，仅承载 §14.6 第 2 条浮层，不再叠加 L5 落盘责任。

#### 老用户数据 backfill（H8 — type 重分类）

历史 bug：早期 `parseTaskFromInput` 对带 `书/读/页` 的输入默认 type='other'（无 book 分类），导致一批老用户 history 里 type='other' 的任务实际是 reading 任务。升级到 v0.1.0 后 `handleEasier` 会按 other 处理（保留标题），不重写 `读 X 页`，行为不一致。

**修复规则**：`importState` 与 `loadState` 都要做一次性 backfill migration：

```ts
function backfillTaskType(t: Task): Task {
  if (t.type !== 'other') return t;
  const lower = t.title.toLowerCase();
  if (/(书|读|页|read|阅读)/i.test(lower)) {
    return { ...t, type: 'reading' };
  }
  if (/(散步|走走|出门走|运动|跑步|健身|瑜伽)/i.test(lower)) {
    return { ...t, type: 'exercise' };
  }
  if (/(代码|编程)/i.test(lower)) {
    return { ...t, type: 'coding' };
  }
  return t;
}
```

在 `importState` / `loadState` 末尾对 `parsed.tasks` 与 `Object.values(parsed.history).flat()` 全量过一遍。

**禁止**直接 spread 旧 parsed 而不跑 backfill（当前 `storage.ts:74-86` 的 `importState` 是直接 `{ ...defaultState, ...parsed }`，会让老用户的误分类任务残留 v0.1.0）。

> 本 backfill 仅处理 `tasks` / `history` / `onboarded` / `moods` / `achievements` / `log` / `streak` / `settings`，不涉及 `lastShownChangelog`（详见 §14.6 字段归属）。

## 6. README / CI / 部署

### 6.1 README 现状澄清

当前仓库布局：仓库根 = `D:/ZYY Project`（含 `.git`），子项目根 = `app/`（含 `package.json` `name = "daily-zero-decision"`）。本 spec 所有改动都落在 `app/` 子目录下。
所有 README 改动落在 `app/README.md`（已存在），CHANGELOG 落在 `app/CHANGELOG.md`（本轮新建），CI workflow 落在 `app/.github/workflows/ci.yml`（本轮新建），vercel.json 落在仓库根 `D:/ZYY Project/vercel.json`（本轮新建，部署时引用 `app/` 子项目）。
路径命名约定：所有"项目内路径"（README/CHANGELOG/CI workflow/package.json/src/*）字面前缀 `app/`；仓库根配置（vercel.json/.gitignore for root）不带 `app/` 前缀。

Issue 5 的交付物是 `app/README.md`，不是仓库根 README。

CHANGELOG 路径：`app/CHANGELOG.md`（本轮新建，记录 v0.1.0 改动）。归属：见 §9.1 共享文件表（随 `app/package.json` 一同归 `round6/docs-ci-deploy` 独占；本轮 Issue 5 落地时一次性 commit `docs: add CHANGELOG.md for v0.1.0`）。

> **路径命名约定（H1 收口）**：`app/` 前缀是**字面子目录**（仓库根下的子项目根），所有项目内路径必须字面前缀 `app/`；仓库根配置（vercel.json、`.gitignore for root`）不带 `app/` 前缀。CI runner 默认在仓库根检出，必须用 `working-directory: app` 进入子项目根。

```md
# 每日零决策卡 ☁️

> 每天不知道从哪开始？
> 把想坚持的事，变成今天能完成的一小步。
> 完成这一小步，你的天空就多一朵云。

这不是 Todo，不是番茄钟，也不是习惯统计器。
它每天帮你把想坚持的事，压成一张小到不会抗拒的行动卡。

## 功能

- 今日卡：把想坚持的事变成最小行动
- 我的天空：完成后长出一朵云
- 回顾：用自然语言看见自己慢慢坚持
- 设置：字体、数据导入导出、重置

## 可选小工具

番茄钟：需要时开始计时，不打扰主流程。
```

**禁止**：把番茄钟 / 统计 / 成就系统写在主功能列表；它们是辅助小工具。

### 6.2 GitHub Actions

> **H1 路径说明**：本仓库根 = `D:/ZYY Project`（含 `.git`），子项目根 = `app/`（含 `package.json` `name = "daily-zero-decision"`），详见 §6.1。CI runner 检出根 = 仓库根 = `D:/ZYY Project`，**必须** `cd` 到 `app/` 子目录才能跑 `npm`。故 CI workflow 用 `working-directory: app` 锁定到子项目根，所有项目内路径（`app/README.md` / `app/package.json` / `app/CHANGELOG.md` / `app/.github/workflows/ci.yml`）字面拼 `app/` 前缀，runner checkout 根下 `<repo>/app/...` 真实存在。

新增 `app/.github/workflows/ci.yml`（位于子项目根 app/ 下的标准路径）：

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    defaults:
      run:
        working-directory: app

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version-file: app/package.json
          cache: npm
          cache-dependency-path: app/package-lock.json

      - run: npm ci
      - run: npm test
      - run: npm run typecheck
      - run: npm run build
```

> **M9 强制**：`package.json`（即项目根下的 `app/package.json`，按 H1 路径约定）必须新增 `engines` 字段，CI 第一步才能用 `node-version-file`：
>
> ```json
> "engines": {
>   "node": ">=20"
> }
> ```
>
> 不加 `engines`，`node-version-file` 解析失败回退到默认，违反"锁 Node 版本"。

#### §6.x 测试基线（H6 — 现状几乎为零）

`__tests__/` 当前**只有** `skyMood.test.ts`。本轮上线前必须新增下列测试文件，否则 §7 QA 矩阵无法自动化：

| 文件 | 覆盖范围 | 阻塞 merge | 归属 |
|---|---|---|---|
| `src/utils/__tests__/storage.test.ts` | `parseTaskFromInput` §7.3 全部 6 用例（含 §5.1 type 默认时间表 + 深呼吸特例）；`importState` 坏 JSON / 缺字段 / onboarded 三态；`loadState` fallback；H8 backfill migration（type 重分类） | ✅ | Issue 4（product-logic）|
| `src/hooks/__tests__/useTasks.test.ts` | `addWithValue` 拒绝第 2 张卡；`handleEasier` seed 分支在已有今日任务时 return prev（H4）；`handleEasier` 已有任务时按 type 重写标题；`handleOnboardingFinish` 显式 saveState（L5） | ✅ | Issue 4（product-logic）|
| `src/components/__tests__/SkyScene.test.tsx` | `density='minimal'` 不渲染 birds / balloon；`variant='garden'` 不渲染 ForegroundFade；`reducedMotion=true` 不挂载动画类 | ✅ | Issue 1（sky-scene-infra）|
| `src/hooks/__tests__/useReducedMotion.test.ts` | `prefers-reduced-motion: reduce` 返回 `true`；`prefers-reduced-motion: no-preference` 返回 `false`；`change` 事件触发 state 更新 | ✅ | Issue 1（sky-scene-infra）|

> **CI 闸口规则（H6）**：`npm test` 任一用例失败 → merge 阻塞；不允许 `it.skip` / `describe.skip` 绕过测试；新增测试文件必须在 PR 描述里列出。

> **测试文件归属规则（H1 收口）**：测试文件一律随业务代码同分支合入。`qa-polish` **不写任何新测试文件**，只跑测试 + 改 `test/` 已有测试用例。具体映射：本表 §6.x 4 个测试文件分别归属 `src/utils/__tests__/storage.test.ts` → Issue 4（product-logic），`src/hooks/__tests__/useTasks.test.ts` → Issue 4（product-logic），`src/components/__tests__/SkyScene.test.tsx` → Issue 1（sky-scene-infra），`src/hooks/__tests__/useReducedMotion.test.ts` → Issue 1（sky-scene-infra）。`qa-polish` 仅在发现测试失败时打补丁修测试，不新增。

> **M3 真机不在 CI**：§7.6.x (e) 微信内置浏览器（X5 内核）与 (l) 真机机型清单（iOS 14-18 + Android 10-15 各 1 台）**无法**在 GitHub Actions ubuntu-latest runner 自动化（runner 无真机、无微信 App、无 X5 内核），这两项**不**纳入 §6.2 CI 闸口，改由 Issue 6（`round6/qa-polish`）的 QA agent 手动跑 + 截图存档，产物归档到 `app/docs/qa-evidence/v0.1.0/` 目录，PR 描述里附截图链接。其他子项 (f)-(k) 可 DevTools 模拟的部分仍需 §6.2 CI 闸口覆盖。

#### vitest 配置可选项（L3）

`vite.config.ts` 当前隐式承担 vitest 配置（`test` 字段挂在 vite 配置下）。可选改进：迁到独立 `app/vitest.config.ts`，与 `vite.config.ts` 解耦。

**本轮决策**：**不强制**。如果迁，需在 Issue 4 落地时一次性提交一个独立 commit `chore: split vitest config from vite config`，便于回退。L3 不阻塞 v0.1.0。

### 6.3 部署

当前 `app/vite.config.ts` 是 `base: './'`。两种部署策略：

| 平台 | base 设置 |
|---|---|
| GitHub Pages（根域） | `./` 保持 |
| GitHub Pages（子路径 `/daily-zero-decision/`） | `/daily-zero-decision/` |

**本轮决策**：保留 `./`，先部署到 Vercel（自动适配 base）。如果必须 GitHub Pages，再切到 `/daily-zero-decision/`。

#### Vercel 配置占位（M12 — 具体化部署平台）

```jsonc
// vercel.json（仓库根 D:/ZYY Project/vercel.json）
{
  "buildCommand": "cd app && npm run build",
  "outputDirectory": "app/dist",
  "framework": "vite",
  "installCommand": "cd app && npm ci"
}
```

> **H1 一致性说明**：Vercel 部署根 = git 仓库根 = `D:/ZYY Project`（无 `app/` 子目录约定，详见 §6.1）。`buildCommand` / `installCommand` 必须 `cd app` 切到子项目根执行 npm；`outputDirectory` 指向 `app/dist`（Vite `outDir` 产物位于 `app/dist/`）。修正后所有路径显式带 `app/` 前缀，与 §6.2 CI workflow 共享子项目根约定。

> **项目名 / 域占位**（H13）：
>
> - Vercel Project：`daily-zero-decision`（占位，正式 deploy 前由工程收口 agent 在 Vercel Dashboard 创建）
> - 主域：`daily-zero-decision.vercel.app`（占位）
> - 自定义域：本轮**不配置**，v0.1.0 只走 vercel.app 二级域

#### 回滚操作手册（H13 — §6.3 末尾）

| 平台 | 回滚命令 |
|---|---|
| Vercel | Vercel Dashboard → Deployments → 选中 `v0.0.x` 健康部署 → `Promote to Production` |
| GitHub Pages | `git revert v0.1.0` → push main → 触发 Pages 自动部署 |
| 紧急回退到 v0.0.x（任意平台） | `git checkout v0.0.x` → `git checkout -b hotfix/v0.0.1-rollback` → `git push origin hotfix/v0.0.1-rollback` → 走 §9 合并顺序 |

> **回滚不重跑产品评审**：hotfix 分支合 main 后**只**跑 §6.2 CI 闸口（`npm ci && npm test && npm run build`），不重走 §13 验收。

### 6.4 最小监控方案（H13 — 零监控缺位）

v0.1.0 范围**不**接入 Sentry / Vercel Analytics 等第三方，最小监控走 `window.onerror` 上报 console（§14.6 浮层用同样标记机制，详见 §14.6）：

```ts
// app/src/main.tsx（强制唯一挂载点，见 M2 规则）
if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => {
    // 浏览器 DevTools console 可见；后续接入 Sentry 时换 transport
    console.error('[daily-zero-decision] uncaught', e.error || e.message);
  });
  window.addEventListener('unhandledrejection', (e) => {
    console.error('[daily-zero-decision] unhandled rejection', e.reason);
  });
}
```

> **M2 强制位置规则**：上述 `window.onerror` 与 `unhandledrejection` 监听**统一只在 `app/src/main.tsx` 挂载**。**禁止**在 `index.html` 内联 `<script>` 重复挂载，也禁止在 `App.tsx` / 其他组件内二次挂载。两处同时挂载会导致同一错误被 console 打两次，且增加与 §14.6 浮层 `useEffect` 的时序耦合。Issue 5 落地时把 `main.tsx` 顶部的初始化块（ReactDOM.createRoot 之前）作为唯一落点。

**覆盖目标**：

- 渲染期 React 错误（boundary 兜底）
- localStorage 写入失败（Safari 隐私模式 / 配额超限）
- parseTaskFromInput 边界崩溃

**未来扩展**（不在本轮）：v0.2.0 接入 Sentry 自由层 / Vercel Analytics。

## 7. QA 回归矩阵

### 7.1 新用户路径

```
1. 清空 localStorage
2. 打开 App
3. 看到 Onboarding
4. 点击"读书"
5. 生成第一张今日卡
6. 卡片显示"读 2 页书"
7. 点击完成
8. 进入完成态
9. 点击"去看看我的天空"
10. 天空里有一朵云
11. 回顾页能看到自然语言总结
```

### 7.2 老用户路径

```
1. 保留已有 localStorage
2. 打开 App
3. 不重新弹 Onboarding
4. 历史云仍存在
5. Today 页正常显示今日卡或空状态
6. 导入导出不丢数据
```

### 7.3 轻任务解析 6 用例

每个都要校验 type / title / time / 云种 / 完成后奖励文案：

| 输入 | 预期 type | 预期 time |
|---|---|---|
| 读 2 页书 | reading | 5 分钟 |
| 出门走走 5 分钟 | exercise | 5 分钟 |
| 看 5 分钟代码 | coding | 5 分钟 |
| 背 5 个新词 | reading | 5 分钟（按"背单词特例"规则直接 5 分钟，不走页数推算）|
| 写一行日记 | other | 3 分钟 |
| 深呼吸三次 | other | 1 分钟 |

### 7.4 一天一张卡

```
1. 生成一张卡
2. 尝试再添加
3. 必须被阻止或替换
4. 完成后不能出现"再养一朵"
5. H4 收尾：完成今日卡后**再点"换一朵轻一点的"** 必须被阻止（验证 handleEasier seed 分支 H4 修复）
6. 验证：onboarding 完成后立即 add 任务 + handleEasier 双重入口，tasks 数组今日项数 ≤ 1
7. 空状态点"换一朵轻一点的"生成 1 张，再点第二次被阻止（验证 §5.3 H4 0 → 1 → 阻塞）
```

### 7.5 reduced-motion

```
1. 系统开启减少动态
2. 打开 Today 页
3. 飞鸟不动或不显示
4. 热气球不显示
5. 主流程仍可用
```

### 7.6 移动端宽度

测试 320 / 375 / 390 / 430 / 768 px（即 (a)-(d) viewport 宽度测试）：

- 标题不挤压
- SkyProgressMini 不断成难看的两行
- TodayDecisionCard 主按钮可见
- 底部 Tab 不遮挡内容
- CloudGarden 不盖住卡片
- **H12 收尾**：viewport ≤ 375px 时，`<SkyScene>` 自动降为 `density='minimal'`，飞鸟/热气球不渲染，装饰层不挤压今日卡

> 本节 (a)-(d) 是 viewport 宽度测试，§7.6.x 矩阵 (e)-(l) 是其他环境兼容。

#### 7.6.x 兼容性矩阵（H11 + H14）

下列子项本轮**必须**有最小验证（DevTools 模拟 + 至少 1 台真机）：

| 子项 | 测试方式 | 通过标准 |
|---|---|---|
| (e) 微信内置浏览器（X5 内核） | 真机：iOS 微信 8.0+ / Android 微信 8.0+，扫码打开部署链接 | localStorage 可写；动画不卡死；完成流程闭环 |
| (f) Android WebView API 24 以下 | Android 7.0 系统浏览器 / 旧 Chrome | 页面可加载；不依赖 `ResizeObserver` 等新 API 崩溃 |
| (g) Safari iOS 14 以下 `prefers-reduced-motion` | iOS 13 设备 | `matchMedia` 行为差异；用 `useReducedMotion` 内部 `addListener` 兜底（§3.3 代码已支持） |
| (h) 平板横屏 | iPad 1024×768 / Android 平板 | `<SkyScene>` 不溢出；TodayDecisionCard 居中 |
| (i) 系统 dark mode | iOS 13+ / Android 10+ / Windows | 装饰层渐变仍可见（不强求跟随 dark mode） |
| (j) 慢网络 | Chrome DevTools Slow 3G | 首屏 LCP < 4s（3G 降级标准） |
| (k) localStorage 禁用 | 隐私模式 / 企业策略 | saveState 失败时 console.warn，但**不**崩溃；任务仍可加在内存中 |
| (l) 真机机型清单 | 至少覆盖 iOS 14 / 15 / 16 / 17 / 18 + Android 10-15 各 1 台 | 主流程闭环；reduced-motion 生效 |

> **多 tab 同步**：v0.1.0 **不做**。详见 §15。

### 7.7 数据导入

```
1. 导出 JSON
2. 清空数据
3. 导入 JSON
4. streak / log / history / settings 全部恢复
5. 导入坏 JSON 不崩溃
```

## 8. Issue 拆分

| # | 标题 | 交付 |
|---|---|---|
| 1 | feat: 新增 SkyScene 无业务天空画布 | SkyScene / SkyHeaderContent / SkyProgressMini / useReducedMotion / CSS |
| 2 | refactor: CloudGarden 拆出 mode='today' 并移除内嵌背景 | 新接口、CLOUD_GARDEN_CONFIG、last7 5→7、garden 占位、toCloudGardenMood 换算函数（M3） |
| 3 | feat: TodayPage 接入 SkyScene，强化"今天只做这一小步" | 移除旧 SkyProgress 首屏位置、接入 SkyScene、§4.2 精确文案替换清单（H5：TodayPage.tsx:99/101 删除，124/125 保留）、mode="today" prop 补全（M7）、新增 `src/utils/cloudGardenMood.ts` 导出 `toCloudGardenMood`（M3 落地） |
| 4 | fix: 收口最小行动解析与每日单卡规则 | parseTaskFromInput（含 §5.1 type 默认时间表 + 深呼吸特例）、handleEasier seed 分支 MAX 守卫（H4）、handleOnboardingFinish 显式 saveState（L5）、importState onboarded 三态（H9）+ 老用户 backfill（H8）、`src/utils/__tests__/storage.test.ts` 测试文件（H6）、`src/hooks/__tests__/useTasks.test.ts`（H4 handleEasier seed 守卫 / L5 显式 saveState / addWithValue 第二张卡拒绝用例） |
| 5 | chore: 更新仓库展示文档并加入 CI | README、CHANGELOG、CI（含 `engines` 字段 M9 + `npm run typecheck` M12）、Vercel 配置占位（M12 + H13）、回滚手册（H13）、最小监控（H13 §6.4）、**新增 `src/pages/SettingsPage.tsx` 中"v0.1.0 更新"区块（受 §14.6 第 1 条驱动，归属见 §9.1 共享文件表）**、**修改 `src/App.tsx` 加一次性浮层（受 §14.6 第 2 条驱动，归属见 §9.1 共享文件表）** |
| 6 | test: Round 6 上线前回归与移动端修复 | §6.x 测试基线验证（**不新增**测试文件，仅跑通 + 必要时修既有测试，详见 §6.x 脚注）、QA checklist、§7.6.x 兼容性矩阵（H11 + H14）、reduced-motion、空状态、截图、§14.5/§14.6（H10） |

## 9. 合并顺序

```
1. round6/product-logic   ← 不依赖视觉，先合
2. round6/sky-scene-infra ← TodayPage 要接它
3. round6/today-integration
4. round6/docs-ci-deploy
5. round6/qa-polish
6. merge into main
7. tag v0.1.0
8. deploy
```

### 9.1 并发冲突解决预案（H7 — 5 分支共享文件）

5 条分支都会改 `src/App.tsx` / `useTasks.ts` / `CloudGarden.tsx` / `TodayPage.tsx`，不预先分配归属 = 必冲突。下列规则**强制**：

| 共享文件 | 独占分支 | 其他分支禁止改动 |
|---|---|---|
| `src/pages/TodayPage.tsx` | `round6/today-integration` | product-logic / sky-scene-infra 只能新增导出，**不动** TodayPage 内部 |
| `src/hooks/useTasks.ts` | `round6/product-logic` | today-integration 只通过 props 调用 handleEasier / handleCompleteTask |
| `src/components/today/CloudGarden.tsx` | `round6/today-integration`（mode / 内嵌背景迁出 / last7 5→7） | product-logic 不动 CloudGarden；sky-scene-infra 不动 |
| `src/utils/storage.ts` | `round6/product-logic`（parseTaskFromInput / importState / loadState） | 独占；包含 `src/utils/__tests__/storage.test.ts`（仅测试文件，qa-polish 不得新增）。`qa-polish` 不写任何新测试文件，只跑 + 改 `test/` |
| `src/utils/cloudGardenMood.ts` | `round6/today-integration` | 新增文件独占（导出 toCloudGardenMood，M3） |
| `src/pages/SettingsPage.tsx` | `round6/docs-ci-deploy` | 独占；其他分支禁止改动（承载 §14.6 第 1 条"v0.1.0 更新"区块） |
| `src/App.tsx` | `round6/docs-ci-deploy` | 独占 commit，浮层一次性挂载（受 §14.6 第 2 条驱动）；其他分支不要并行 commit App.tsx |
| `src/main.tsx` | `round6/docs-ci-deploy` | 独占；其他分支禁止改动（承载 §6.4 M2 强制唯一 `window.onerror` 挂载点） |
| `app/package.json` | `round6/docs-ci-deploy` | 独占（M9 `engines` 字段 + M12 `typecheck` 脚本由 docs-ci-deploy 统一处理；本轮其他分支不新增依赖，故可独占） |
| `app/CHANGELOG.md` | `round6/docs-ci-deploy` | 独占；本轮新建（L1 收口，记录 v0.1.0 改动，路径见 §6.1） |
| `.github/workflows/ci.yml` | `round6/docs-ci-deploy` | 独占（受 §6.2 驱动；路径带 `app/` 前缀，CI workflow 位于子项目根 `app/.github/workflows/ci.yml`） |
| `vercel.json`（仓库根） | `round6/docs-ci-deploy` | 独占（受 §6.3 驱动；vercel.json 在仓库根，配置内引用 `app/` 子项目路径） |
| `src/index.css` | `round6/sky-scene-infra` | 独占（承载 §3.3 全局 reduced-motion 兜底；Issue 1 落地时一次性提交 @media 规则；M1 强制禁止放入 `*.module.css`） |

**`round6/sky-scene-infra` 约束**：**只新增** `src/components/sky/SkyScene.tsx` / `src/components/sky/SkyHeaderContent.tsx` / `src/components/sky/SkyProgressMini.tsx` / `src/hooks/useReducedMotion.ts` / 配套 CSS 文件，**禁止**改 `TodayPage.tsx` / `App.tsx` / `CloudGarden.tsx`。避免与 today-integration 抢同一文件。

> **M1 唯一例外**：`src/index.css` 虽非"新增"但仍归 `round6/sky-scene-infra` 独占（见上表）——该分支 Issue 1 落地时**仅在 `src/index.css` 顶部追加** §3.3 `@media (prefers-reduced-motion: reduce)` 一段，**不**允许改动 `src/index.css` 其它内容，避免与其它分支 CSS 改动（如 reset / 字体声明）冲突。

> H3 路径收尾：`useReducedMotion` 落点为 `src/hooks/useReducedMotion.ts`（与其他 hook 同目录），对应测试文件为 `src/hooks/__tests__/useReducedMotion.test.ts`，§6.x 测试基线表中的 `src/components/__tests__/useReducedMotion.test.ts` 是错的，本 spec 以本节为准。

#### 合并顺序末尾加 dry-run 验证（H7）

合并第 5 → 6 步之间（`round6/qa-polish` → `merge into main`）必须先在临时分支做 dry-run：

```bash
git checkout -b dry-run/v0.1.0-merge main
git merge --no-commit --no-ff round6/product-logic
git merge --no-commit --no-ff round6/sky-scene-infra
git merge --no-commit --no-ff round6/today-integration
git merge --no-commit --no-ff round6/docs-ci-deploy
git merge --no-commit --no-ff round6/qa-polish
# 检查冲突
git diff --check
npm ci && npm test && npm run build  # 跑 CI 闸口
```

任一冲突未解决 / CI 失败 → **不**进 main，回退到对应分支作者处理。

### 9.2 tag → deploy 闸口（H13 — 缺闸口）

```
6. merge into main
7. main HEAD 重跑：npm ci && npm test && npm run build  ← H13: 强制本地复跑
8. git tag -a v0.1.0 -m "v0.1.0: product closure"
9. 推送 tag → 触发部署流水线
10. Vercel Dashboard 确认 preview URL 健康
11. promote preview → production（或回退到 v0.0.x 走 §6.3 回滚手册）
```

> step 7 失败 → 阻塞 tag，按 dry-run 流程定位修复。**禁止**在 CI 失败时强行 tag。

## 10. Commit 规范

```
feat(sky): add SkyScene and motion-safe decorative layers
feat(sky): add SkyHeaderContent and SkyProgressMini
refactor(today): render CloudGarden inside SkyScene
refactor(cloud): add CloudGarden mode contract for today garden
fix(tasks): parse tiny actions and enforce one daily card
fix(storage): validate and migrate imported state
docs: align README with minimum action positioning
ci: add GitHub Actions build and test workflow
test: add Round 6 QA checklist
```

**禁止**一个 commit 塞全部。

## 11. 默认决策（避免反复问方向）

```
TodayPage 默认 density='comfortable'
SkyPage 未来默认 density='rich'
低端 / reduced-motion / 小屏默认 minimal
viewport ≤ 375px 强制 density='minimal'（H12 收尾）
CloudGarden 本轮只实现 mode='today'
SkyProgressMini 禁止"还差 N 朵"
完成后按钮是"去看看我的天空"
README 首屏优先讲"最小行动"，不是"养云"
番茄钟永远是辅助小工具
SkyMood 枚举以 src/utils/skyMood.ts:4 为准（'dawn'|'morning'|'clear'|'sunny'|'golden'，H1）
CloudGarden.mood 走 toCloudGardenMood 统一换算（M3），禁止 JSX 内嵌三元
parseTaskFromInput 时间优先级：含数字分钟 > 含数字页数推算 > type 默认表 > 深呼吸特例（H2）
onboarded 三态映射（H9），禁止 ?? true
handleEasier seed 分支在已有今日任务时 return prev（H4）
```

## 12. Agent 提问规则（仅以下情况允许提问）

1. 需要新增第三方依赖
2. `npm test` 或 `npm run build` 连续两次失败且无法定位
3. 需要改变产品主文案
4. 需要改变"一天一张卡"规则
5. 需要删除现有用户数据字段
6. 需要部署密钥或平台账号权限

其他情况默认按本 spec 执行。

## 13. 上线验收标准（11 条全过才发版）

1. 用户 3 秒内能理解：它帮我把想坚持的事变成今天一小步
2. 首页最大视觉不是番茄钟，不是统计，不是搜索，而是今日卡
3. 今日卡包含主题壳、任务核、奖励闭环
4. 一天只能完成一张卡
5. 完成后进入奖励，而不是继续加任务
6. 我的天空是奖励页，不是数据库页
7. 回顾页是自然语言总结，不是冷冰冰报表
8. reduced-motion 可用
9. CI 通过
10. 线上链接可访问
11. README 和 App 内文案一致

## 14. 风险与回退

| 风险 | 触发条件 | 回退 |
|---|---|---|
| SkyScene 装饰层影响首屏 LCP | comfortable 密度下 LCP > 2.5s | 降为 minimal 排查 |
| CloudGarden last7=7 性能下降 | 移动端低端机滚动掉帧 | 退回 last7=5 |
| parseTaskFromInput 新规则破坏老任务 | 老用户 reload 后任务 type 变 | 只对新增任务应用新解析；老任务保持原字段 |
| 历史 type='other' 误归类的 reading 任务被 handleEasier 误判 | L1 修订：原条目措辞与现状不符；新版描述 | H8 已合并：importState / loadState 内做 backfill migration（`/(书\|读\|页\|read\|阅读)/i` → reading 等），加单元测试覆盖 |
| importState 返回 null 旧调用方忽略 | 导入后页面无变化 | 加 typecheck 警告 + 单元测试 |
| 多动画叠加导致 LCP > 2.5s（M8） | TodayPage 内联 `dawn-aura-breathe` 10s + CloudGarden `float` 6s + `cloud-drift` 15s 同时存在 | 降为 `density='minimal'` + 移除 dawn-aura 内联动画（仅保留径向渐变静态层） |
| SkyScene 视觉回退刷新延迟（M11） | `density` 切换需要刷新生效，无运行时降级 | v0.1.0 不做；§15 加一条不在范围说明 |

### 14.5 SkyScene 整段回退（H10 — 缺整段回退预案）

如果 SkyScene 整体上线后出现不可接受渲染问题（Safari 崩溃 / localStorage 写崩 / React 边界），整段 SkyScene 回退走 §9.2 step 11（git checkout v0.0.x → hotfix 分支 → dry-run → merge）。具体脚本与回退流程统一在 §9.2 维护，本节不再重复。

**回退前**必须在 SettingsPage 显式标注"已回退到 v0.0.x"以避免用户困惑（详见 §14.6）。

### 14.6 README 大改后用户感知（H10 — 用户感知缺位）

v0.1.0 README 与 App 内文案会大改（§6.1）。老用户升级后无引导会以为 App 变了但不知道改了啥。两层兜底：

1. **SettingsPage 新增 `本次更新了什么` 区块**（v0.1.0 永久可见）：

   ```
   v0.1.0 更新
   - 主线收口：今天只做这一小步
   - 天空：5 层渐变 + 远山 + 飞鸟
   - 数据：自动识别最小行动
   - 文案：替换 2 处禁止词
   ```

   > （由 Issue 5 / `round6/docs-ci-deploy` 落地，对应 `src/pages/SettingsPage.tsx` 独占修改，详见 §9.1 共享文件表）

2. **首次升级展示一次性浮层**（localStorage 标记 `lastShownChangelog === 'v0.1.0'`，已展示过不再弹）：

   ```
   ✨ v0.1.0 上线
   从今天起，每件事都只做今天这一小步。
   [好的]
   ```

   实现位置：`App.tsx` mount 后用 `useEffect` 检测 `state.history` 非空 && `lastShownChangelog !== 'v0.1.0'` → 弹浮层 → 关闭时 setItem。

   > **字段归属**：`lastShownChangelog` 走 localStorage 独立 key (`daily-zero-decision:lastShownChangelog`)，不进 `AppState`，因此 `importState` / `loadState` / H8 backfill 不涉及该字段。本字段纯粹是用户已读标记，删除/重置不会影响用户数据。

## 15. 不在本 spec 范围

- CloudGarden mode='garden' 完整实现
- SkyPage rich garden 渲染
- 多账号 / 云同步
- 推送通知
- **多 tab 同步**（H14 收尾）：v0.1.0 不做跨 tab `storage` 事件监听；用户在 tab A 完成的任务在 tab B 不会实时刷新
- **density 切换运行时降级**（M11 收尾）：v0.1.0 `density` 在 mount 时确定，运行时切换需要刷新生效；不在 v0.1.0 实现运行时响应（如 `IntersectionObserver` / 设备性能检测）
- 任何"让云朵看起来更可爱"的视觉微调（云朵表情、形状变体等）除非属于 SkyScene density 内的层
- 番茄钟新模式（长休息、白噪音等）

---

> 这不是 Todo。
> 这不是番茄钟。
> 这不是统计 App。
>
> 它是一个每天帮用户完成一件小到不会放弃的事的温柔打卡 App。
> 云朵只是奖励，行动才是主角。