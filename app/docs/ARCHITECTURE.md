# ARCHITECTURE — daily-zero-decision

> 一份新加入 1 周内的开发者能照着读完就能动手改的架构图谱。

## 1. 分层

```
┌─────────────────────────────────────────────────────┐
│  UI Layer        pages/* + components/*             │
│                  只调用 hooks + types + copy         │
├─────────────────────────────────────────────────────┤
│  Application     hooks/*  (useTasks, usePet, ...)   │
│                  调用 Repository 接口 + copy         │
├─────────────────────────────────────────────────────┤
│  Domain Layer    utils/achievements + utils/storage  │
│                  纯业务逻辑，无 IO，无 React          │
│                  提供：calculateStreak、parseTask、  │
│                        checkAchievements、copy      │
├─────────────────────────────────────────────────────┤
│  Infrastructure  utils/storage.ts (localStorage)    │
│                  saveState/loadState/importState    │
│                  storage 版本控制在此演进           │
└─────────────────────────────────────────────────────┘
  Cross-Cutting Concerns（copy 文案系统、错误处理）
  — 任何层都可调用，但不得反向依赖业务层
```

## 2. 依赖规则（强制）

UI 不 import storage.ts 内部实现（除了 `getToday` 等纯函数 helper）；
Application 通过 hook 调用；
Domain 不 import React。

```
// ✅ 允许
import { getToday } from '@/utils/storage';           // 任何层可用
import { calculateStreak } from '@/utils/storage';    // 任何层可用（纯函数）

// ❌ 禁止（未来 eslint boundary 规则上线后）
import { saveState } from '@/utils/storage';           // 只在 useAppState 等应用层
import { loadState } from '@/utils/storage';           // 只在 useAppState 等应用层
```

未来（Round 7 实现完成后）：
- `src/storage/` Dexie 多表 + Zod schema
- `src/repositories/` Repository 接口 + Dexie 实现 + InMemory fake
- `src/observability/` event bus + ConsoleAdapter + ring buffer

## 3. 数据流（完成任务）

```
TodayDecisionCard.onClick
  └─ useTasks.handleConfirmComplete (note, taskId)
      ├─ setState(prev => { ...修改 tasks/log/streak/pet/peace/history })
      ├─ observability.event('task.completed')        [Round 7]
      ├─ TaskRepository.update + PetRepository.bumpAffection  [Round 7]
      └─ achievement 解锁条件检查（utils/achievements）
      → React re-render
          ├─ useTasks 重算 todayTasks / allTodaysTasksDone
          ├─ useStreak 重算 streak / skyMood
          └─ <SkyScene mood> 重渲
```

## 4. 模块边界速查

| 目录 | 可 import | 不可 import |
|---|---|---|
| `components/` | hooks, types, copy, observability | storage (内部函数) |
| `pages/` | hooks, types, components, copy | storage (内部函数) |
| `hooks/` | utils (storage helper), types, copy, repositories | React 仅在本身 |
| `utils/` (achievements, storage) | types, zod (Round 7) | React, hooks, components |
| `utils/copy.ts` | — | 任何业务模块（纯文案表） |

## 5. 数据契约（Zod 单一真相源）— Round 7 演进

`src/storage/schema.ts` 定义所有表行的 Zod schema。Repository 写入前 `parse`，读取后 `safeParse`。当前 Round 6 阶段：types.ts 是唯一真相源；Round 7 后 Zod schema 与 types.ts 1:1 映射。

## 6. 错误处理

3 个 ErrorBoundary 包裹 `<App>` / `<SkyScene>` / `<TodayDecisionCard>`：
- 失败 → observability → ring buffer → Settings「导出诊断」可看
- saveState 抛 `StorageQuotaError` → App 顶部 banner + 一键备份

## 7. 测试金字塔

```
        ┌─────────┐
        │  smoke  │  ← Playwright 烟测（Round 7 引入）
        ├─────────┤
        │ comp    │  ← RTL + jsdom：核心组件
        ├─────────┤
        │  repo   │  ← fake-indexeddb 集成测试（Round 7 引入）
        ├─────────┤
        │  unit   │  ← vitest：domain 纯逻辑 / hooks
        └─────────┘
```

当前覆盖：55 测试 / 6 文件（Round 6 基线 37 + Round 1-4 新增 18）。

## 8. CI 总览

| 步骤 | 工具 | 作用 |
|---|---|---|
| typecheck | tsc --noEmit | TypeScript 类型检查 |
| lint | eslint --max-warnings 0（含 boundary 规则） | 代码风格 + 依赖方向 |
| test:coverage | vitest --coverage（thresholds 70%） | 测试 + 覆盖率 |
| knip | knip | 死代码 / 未用依赖 |
| audit:high | npm audit --audit-level=high | SCA 漏洞 |
| build | tsc && vite build | 生产构建 |
| smoke | Playwright（Round 7 引入） | 关键路径烟测 |

## 9. 历史修复（按 Round）

- **Round 6**（v0.1.0）：产品收口 + 安心卡 + 宠物 MVP
- **Round 1**（F1-F15）：时区 / DST / ID / 双写竞态 / 闭包 / 持久化错误 / a11y modal
- **Round 2**（F17-F21）：F10/F1 跨页回归 / a11y / FileReader / 错误 UX
- **Round 3**（F22-F33）：modal a11y / void props / PetNameModal Escape / SVG useId / 死代码 / PresetManager a11y
- **Round 4**（F34-F43）：StatsPage 时区 / achievements 修正 / Safari 兼容 / copy.ts 去重 / i18n 补全
- **Round 7**（当前）：Dexie + Repository + observability + CI 加固

详细 changelog：见 `CHANGELOG.md`。
