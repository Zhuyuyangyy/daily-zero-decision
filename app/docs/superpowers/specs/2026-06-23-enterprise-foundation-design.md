# 企业级基线（Round 7） — 工程底盘设计

| 字段 | 值 |
|---|---|
| 日期 | 2026-06-23 |
| 阶段 | Round 7 — 工程与协作成熟度基线 |
| 基础分支 | `feature/enterprise-r1` |
| 工作分支 | `feature/enterprise-r1`（单 PR） |
| 合并目标 | `main` |
| 范围 | 最小企业级基线（不动业务行为） |

## 1. 总目标

把项目从「Round 6 已上线的小产品」拉到位到「企业级基线」：

```
v0.1.0: 业务能跑、CI 通过、数据存 localStorage
v0.2.0: 工程底盘就位 ── 干净的依赖方向、可演进的存储、可观测的运行、质量门禁齐备
```

**底线**：本轮不改任何业务行为、不改 UI、不动现有 69 个测试。仅**新增 + 替换**基础设施。

## 2. 范围

### 2.1 本轮做

| 域 | 内容 |
|---|---|
| **架构分层** | UI / Application / Domain / Infrastructure 四层 + Cross-cutting（observability/error-boundary/migration） |
| **存储层** | Dexie 替换 localStorage；schema versioning；Zod 校验；migrations 框架 |
| **Repository 抽象** | TaskRepository / PetRepository / SettingsRepository 接口 + Dexie 实现 + 测试 fake |
| **可观测** | ErrorBoundary × 3；observability event bus；本地 ring buffer；Console adapter；Sentry 适配器接口（不实接） |
| **质量门禁** | CI 加 vitest coverage / knip / npm audit；eslint boundary 规则；husky pre-commit + lint-staged |
| **文档** | ARCHITECTURE.md；DECISIONS/0001/0002/0003；CONTRIBUTING.md |

### 2.2 本轮不做

- Sentry 实接（保留适配器接口）
- 多用户 / 云同步 / 账号系统
- i18n / a11y 大改
- 通知系统
- 性能优化专项（动画 / 渲染）
- 拆分 Round 6 的 SkyPage 重构
- 把 useTasks 拆为更小 hook（只保证不更糟）
- 重写或删除现有 `utils/achievements.ts`（保留旧文件，新逻辑通过 Repository 调用）

## 3. 架构与依赖方向

### 3.1 分层

```
┌─────────────────────────────────────────────────────┐
│  UI Layer        pages/* + components/*             │
│                  ↓ 只调用 hooks + selectors + types │
├─────────────────────────────────────────────────────┤
│  Application     hooks/*  (useTasks, usePet, ...)   │
│                  ↓ 调用 repository 接口 + domain    │
├─────────────────────────────────────────────────────┤
│  Domain Layer    repositories/* + domain/services/* │
│                  纯业务逻辑，无 IO 无 React           │
│                  ↓ 调用 storage 接口                │
├─────────────────────────────────────────────────────┤
│  Infrastructure  storage/*  (Dexie adapter + schema) │
│                  ↑ 只被 domain 调用                 │
└─────────────────────────────────────────────────────┘
  Cross-Cutting Concerns（observability / error-boundary / migration）
  — 任何层都可调用，但不得反向依赖业务层
```

### 3.2 依赖规则（强制）

UI 不直接 import storage；Application 不直接 import Dexie；Domain 不 import React。

通过 `eslint-plugin-boundaries` + `no-restricted-paths` 在 CI 强制。

```
// 禁止
import { db } from '@/storage/db';      // 在 components/
import Dexie from 'dexie';              // 在 hooks/

// 允许
import { taskRepo } from '@/repositories/TaskRepository';  // 在 hooks/
```

### 3.3 目录布局

```
src/
├── components/         ← UI 层（已有，不动）
├── pages/              ← UI 层（已有，不动）
├── hooks/              ← Application 层（已有 + 部分迁移）
├── repositories/       ← Domain 层（新增）
│   ├── TaskRepository.ts
│   ├── PetRepository.ts
│   └── SettingsRepository.ts
├── domain/             ← Domain 层（新增）
│   ├── achievements.ts ← 纯逻辑（从 utils/achievements.ts 复制纯函数部分，原 utils 文件保留兼容导出）
│   └── streak.ts       ← 从 storage.ts 拆出的纯函数
├── storage/            ← Infrastructure 层（替换 storage.ts）
│   ├── db.ts           ← Dexie 实例
│   ├── schema.ts       ← Zod schemas + version
│   ├── migrations.ts   ← 迁移框架
│   ├── legacy.ts       ← 旧 localStorage 导入
│   └── adapter.ts      ← Repository 实现
├── observability/      ← Cross-cutting（新增）
│   ├── index.ts
│   ├── adapters/
│   │   ├── ConsoleAdapter.ts
│   │   └── SentryAdapter.ts  ← 仅接口，不实接
│   └── ringBuffer.ts
├── error-boundary/     ← Cross-cutting（新增）
│   └── ErrorBoundary.tsx
└── utils/              ← 兼容层（保留 storage.ts 的纯函数部分）
```

## 4. 存储层设计

### 4.1 Schema 版本

- `STORAGE_SCHEMA_VERSION = 2`
- v1 = 旧 localStorage JSON 直接导入（中间态）
- v2 = 稳定的 Dexie 多表结构（生产态）

### 4.2 Dexie 表

```ts
db.version(2).stores({
  tasks:      'id, createdAt, type, completedAt',
  history:    'date, *taskIds',           // date 为 key，taskIds 引用 tasks
  log:        'date',
  settings:   'key',                      // key-value，单行
  pet:        'id',                       // 单行 id='singleton'
  achievements: 'id, unlockedAt',
  moods:      'date',
  peace:      'id',                       // id='singleton'
  meta:       'key',                      // schemaVersion 等元信息
  _events:    '++seq, ts, name',          // observability ring buffer
});
```

### 4.3 Zod 单一真相源

`src/storage/schema.ts` 定义所有表行的 Zod schema。Repository 写入前 `parse`，读取后 `safeParse`。

### 4.4 迁移框架

```ts
type Migration = (db: Dexie) => Promise<void>;
const migrations: Record<number, Migration> = { 1: ..., 2: ... };

export async function runMigrations(db: Dexie, from: number, to: number) {
  for (let v = from + 1; v <= to; v++) await migrations[v](db);
}
```

启动顺序：
1. 打开 Dexie
2. 读 `meta.schemaVersion`
3. 若无值：尝试从 `localStorage['daily-zero-decision']` 导入到 v1
4. 跑 migrations 直到 `STORAGE_SCHEMA_VERSION`
5. 删除旧的 localStorage key（双写漂移防护）

### 4.5 Repository 接口

```ts
export interface TaskRepository {
  list(): Promise<Task[]>;
  listByDate(date: string): Promise<Task[]>;
  insert(task: Task): Promise<void>;
  update(id: string, patch: Partial<Task>): Promise<void>;
  remove(id: string): Promise<void>;
}
export interface PetRepository {
  get(): Promise<PetState>;
  update(patch: Partial<PetState>): Promise<void>;
  bumpAffection(today: string): Promise<PetState>;  // 防同日重复
}
export interface SettingsRepository {
  get(): Promise<Settings>;
  update(patch: Partial<Settings>): Promise<void>;
}
export interface HistoryRepository {
  listByDate(date: string): Promise<Task[]>;
  appendToDate(date: string, task: Task): Promise<void>;
  getAll(): Promise<Record<string, Task[]>>;
}
export interface MoodRepository {
  getForDate(date: string): Promise<string | undefined>;
  setForDate(date: string, mood: string): Promise<void>;
}
```

测试用 `fake-indexeddb` + in-memory fake 实现。

### 4.6 导入导出

- 导出：JSON 含 `schemaVersion` + Zod schema 的简化版本（不含 pet.affection 之类业务衍生字段）
- 导入：Zod 校验 → 自动从更老 schemaVersion 升级 → 写入

## 5. 可观测设计

### 5.1 错误边界

3 个挂载点：
- `<App>` 顶层（兜底：白屏 = 业务死了）
- `<SkyScene>`（动画多，崩溃频率高）
- `<TodayDecisionCard>`（核心交互入口）

降级 UI：友好文案 + 「重置今日」 + 「导出诊断」按钮（导出 ring buffer JSON）。

### 5.2 Event Bus

```ts
interface Observability {
  captureException(error: unknown, context?: Record<string, unknown>): void;
  event(name: string, props?: Record<string, unknown>): void;
}
```

关键打点：
- `app.boot.duration`
- `task.created` / `task.completed` / `task.eased`
- `pet.affection.changed`
- `storage.migration.applied` / `storage.migration.failed`
- `ui.error.boundary`

### 5.3 Ring Buffer

最近 100 条事件 + 异常写到 Dexie `_events` 表。Settings → 「导出诊断信息」一键导出。

### 5.4 Sentry 适配器接口

```ts
export interface ObservabilityAdapter {
  captureException(error: unknown, context?: Record<string, unknown>): void;
  event(name: string, props?: Record<string, unknown>): void;
}
// ConsoleAdapter（默认）
// SentryAdapter（当 import.meta.env.VITE_SENTRY_DSN 存在时启用；本轮仅写 stub）
```

## 6. 质量门禁

### 6.1 CI 流水线（升级版）

```yaml
jobs:
  quality:
    steps:
      - npm ci
      - npm run typecheck       # tsc --noEmit
      - npm run lint            # eslint --max-warnings 0 + boundary 规则
      - npm test -- --coverage  # vitest + v8 provider
      - npx knip                # 死代码扫描
      - npm audit --audit-level=high  # SCA
      - npm run build
      - npx playwright install --with-deps && npm run test:smoke  # 烟测
```

新增 npm scripts：
- `test:coverage` → `vitest run --coverage`
- `test:smoke` → `playwright test`
- `lint:boundaries` → `eslint --rule boundary:error`

### 6.2 覆盖率门槛

- 整体 ≥ 70%（用 v8 provider 在 `vitest.config.ts` 设 thresholds）
- CI 失败 if 阈值不达标
- **注**：diff coverage（仅本次 PR 新增代码 ≥ 80%）不在本轮实现——vitest 不原生支持，需要 codecov/coveralls 之类的外部工具；后续 Round 接 codecov 时再加

### 6.3 Husky pre-commit

```json
// .husky/pre-commit
npx lint-staged
```

`lint-staged.config.js`：
- `*.{ts,tsx}` → `eslint --fix` + `prettier --write`
- `*.{json,md}` → `prettier --write`

不在 push 钩子里跑——避免 CI 重复；留给 CI 完整跑。

### 6.4 Commitlint

`commitlint.config.js` 用 conventional commits。本轮不强制 commit-msg 钩子（避免影响现有协作）。

## 7. 文档

### 7.1 ARCHITECTURE.md

包含：分层图、依赖规则、数据流图、模块边界速查、Zod schema 是单一真相源、错误处理策略、测试金字塔、CI 总览。

### 7.2 ADR

- `0001-storage-d2.md` — 为什么选 Dexie + schema versioning（替代 localStorage）
- `0002-observability-bus.md` — 为什么 RUM 走 event bus + 适配器模式（不绑死 Sentry）
- `0003-layered-architecture.md` — 为什么 4 层（vs 单层 / 2 层）

### 7.3 CONTRIBUTING.md

提交流程、边界规则速查、测试要求、CI 失败的常见原因。

## 8. 测试策略

### 8.1 必须新增

| 文件 | 用例数（目标） |
|---|---|
| `src/storage/migrations.test.ts` | 6+ |
| `src/repositories/TaskRepository.test.ts` | 8+ |
| `src/storage/schema.test.ts` | 5+ |
| `src/observability/ringBuffer.test.ts` | 3+ |
| `src/error-boundary/ErrorBoundary.test.tsx` | 3+ |
| `e2e/smoke.spec.ts`（Playwright） | 3 |
| **合计** | **~28 个新测试** |

### 8.2 必须不动

现有 69 个测试（hook / 组件 / stats / 现有 storage 单测）全部保留原样。如果 repository 抽象导致某个 hook 单测需要 import mock，从 `fake-indexeddb` 解决。

## 9. 风险与回滚

### 9.1 风险

| 风险 | 缓解 |
|---|---|
| 迁移失败 → 用户数据丢 | 启动时先备份旧 localStorage 到 `daily-zero-decision:backup:v0`；失败时回退 |
| Dexie 在某些浏览器不可用 | IndexedDB 在所有目标浏览器（Chrome/Safari/Firefox/Edge）原生支持；检测 + 友好降级 |
| Repository 抽象让 hook 写起来更繁琐 | 提供 `useRepository()` helper 单行取实例 |
| Husky 在 Windows + Git Bash 上 hooks 不触发 | 文档里写清 `core.hooksPath` 配法；CI 不依赖 husky |

### 9.2 回滚

- PR 单点 → revert 即可
- 数据层：`backup:v0` localStorage key 保留 30 天，可手工恢复
- 监控：ring buffer 在 Settings → 导出诊断可看

## 10. 交付清单

- [ ] Dexie schema + migrations + Zod
- [ ] 5 个 Repository 接口（Task / Pet / Settings / History / Mood）+ Dexie 实现 + fake
- [ ] 5 个 hook 接入 repository（useTasks / usePet / useStreak / useAppState / usePeace）—— **保留** hook 函数签名与返回值，最小化对外行为差异
- [ ] ErrorBoundary × 3 + 降级 UI
- [ ] observability event bus + ConsoleAdapter + ring buffer + Sentry stub
- [ ] CI 升级（coverage + knip + audit + smoke）
- [ ] eslint boundary 规则
- [ ] Husky + lint-staged
- [ ] ARCHITECTURE.md + 3 个 ADR + CONTRIBUTING.md
- [ ] ~28 个新测试全部通过
- [ ] 现有 69 个测试全部通过
- [ ] README 更新（指向 ARCHITECTURE.md）

## 11. 后续路线（不在本轮）

- Round 8: 多用户 / 云同步
- Round 9: i18n + a11y 大改
- Round 10: Sentry 实接
- Round 11: 性能优化专项
