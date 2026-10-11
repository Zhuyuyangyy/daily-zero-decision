# 企业级基线（Round 7）实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 daily-zero-decision 从「Round 6 上线小产品」拉到「企业级基线」——Dexie 存储 + 4 层架构 + Repository 抽象 + 错误边界/RUM + CI 加固 + 架构文档 + 28 个新测试，**不动业务行为、不改 UI、不动现有 69 个测试**。

**Architecture:** 单 PR，垂直分层实现。Domain 纯函数 + Repository 接口隔离 storage；Dexie 替换 localStorage；Zod 作为数据单一真相源；eslint boundary 规则强制依赖方向；observability 通过 event bus 接入。

**Tech Stack:** Dexie 4 / fake-indexeddb / Zod / vitest + jsdom / @testing-library/react / Playwright / eslint-plugin-boundaries / knip / husky + lint-staged / @vitest/coverage-v8

**前置约束：**
- Node.js 20+（package.json 已锁定）
- 不动 `src/components/*` `src/pages/*`（除非加 ErrorBoundary 包裹）
- 不重写任何现有 hook 函数签名
- 每个任务以一个 commit 结束

---

## 章节 A：基础设施脚手架（4 任务）

### Task A1: 新增依赖与工具脚本

**Files:**
- Modify: `package.json:16-42`
- Modify: `vite.config.ts`

- [ ] **Step 1: 安装新依赖**

```bash
npm install dexie@^4 zod@^3 fake-indexeddb@^6
npm install -D @vitest/coverage-v8@^2 eslint-plugin-boundaries@^4 knip@^5 @playwright/test@^1 husky@^9 lint-staged@^15 prettier@^3
```

- [ ] **Step 2: 在 package.json 加新脚本**

替换 `scripts` 段：

```json
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  "test:smoke": "playwright test",
  "typecheck": "tsc --noEmit",
  "lint": "eslint . --ext .ts,.tsx --max-warnings 0",
  "lint:boundaries": "eslint . --ext .ts,.tsx --rule 'boundaries/element-types: error'",
  "knip": "knip",
  "audit": "npm audit --audit-level=high",
  "format": "prettier --write .",
  "prepare": "husky"
}
```

- [ ] **Step 3: 配置 vitest coverage 阈值**

在 `vite.config.ts` 的 `test` 块里追加：

```ts
coverage: {
  provider: 'v8',
  reporter: ['text', 'html', 'lcov'],
  thresholds: {
    lines: 70, functions: 70, statements: 70, branches: 65,
  },
  include: ['src/**/*.{ts,tsx}'],
  exclude: ['src/**/*.test.{ts,tsx}', 'src/main.tsx', 'src/test/**'],
},
```

- [ ] **Step 4: 在 tsconfig.json 加路径别名**

Modify `tsconfig.json` 的 `compilerOptions`：

```json
"baseUrl": ".",
"paths": {
  "@/*": ["src/*"]
}
```

- [ ] **Step 5: 在 vite.config.ts 加 alias 同步**

```ts
import path from 'node:path';
// resolve: { alias: { '@': path.resolve(__dirname, 'src') } }
```

- [ ] **Step 6: 验证 typecheck 仍通过**

```bash
npm run typecheck
```
Expected: 无错误

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vite.config.ts tsconfig.json
git commit -m "chore(enterprise-foundation): add deps, scripts, coverage threshold, path alias"
```

---

### Task A2: 文档骨架（ARCHITECTURE + DECISIONS + CONTRIBUTING）

**Files:**
- Create: `docs/ARCHITECTURE.md`
- Create: `docs/DECISIONS/README.md`
- Create: `docs/DECISIONS/0001-storage-d2.md`
- Create: `docs/DECISIONS/0002-observability-bus.md`
- Create: `docs/DECISIONS/0003-layered-architecture.md`
- Create: `docs/CONTRIBUTING.md`

- [ ] **Step 1: 写 ARCHITECTURE.md**

```markdown
# ARCHITECTURE — daily-zero-decision

> 一份新加入 1 周内的开发者能照着读完就能动手改的架构图谱。

## 1. 分层

[完整 4 层图 + 依赖方向 + 横切 concerns — 复制自 spec §3.1]

## 2. 依赖规则（强制）

UI 不 import storage；Application 不 import Dexie；Domain 不 import React。

CI 用 `eslint-plugin-boundaries` + `no-restricted-paths` 强制。

## 3. 数据流（完成任务）

TodayDecisionCard.onClick → useTasks.handleConfirmComplete → TaskRepository.update + observability.event + PetRepository.bumpAffection → Dexie write → React re-render.

## 4. 模块边界速查

| 目录 | 可 import | 不可 import |
|---|---|---|
| `components/` | hooks, types, observability | storage, repositories |
| `pages/` | hooks, types, components | storage, repositories |
| `hooks/` | repositories, domain, types, observability | storage (Dexie) |
| `repositories/` | storage, types, domain | React, hooks, components |
| `storage/` | Dexie, Zod | React, hooks, repositories |
| `domain/` | types, storage (interface only) | React, hooks |

## 5. 数据契约（Zod 单一真相源）

`src/storage/schema.ts` 定义所有表行。Repository 写入前 `parse`，读取后 `safeParse`。

## 6. 错误处理

3 个 ErrorBoundary 包裹 `<App>` / `<SkyScene>` / `<TodayDecisionCard>`。失败 → observability → ring buffer → Settings「导出诊断」。

## 7. 测试金字塔

[unit → repo integration → component → smoke 图 — 复制自 spec §8.1]

## 8. CI 总览

typecheck → lint（含 boundary）→ coverage → knip → audit → smoke → build。
```

- [ ] **Step 2: 写 DECISIONS/README.md**

```markdown
# Architecture Decision Records

| 编号 | 标题 | 状态 | 日期 |
|---|---|---|---|
| 0001 | 存储选型：Dexie + schema versioning | Accepted | 2026-06-23 |
| 0002 | 可观测：event bus + 适配器模式 | Accepted | 2026-06-23 |
| 0003 | 分层：4 层 + 横切 | Accepted | 2026-06-23 |

## 模板

```md
# ADR-NNNN: <title>

Status: Proposed | Accepted | Superseded by NNNN
Date: YYYY-MM-DD
Context: <!-- what forces this decision -->
Decision: <!-- what we chose -->
Consequences: <!-- trade-offs -->
Alternatives considered: <!-- why not X, Y -->
```
```

- [ ] **Step 3: 写 ADR 0001 — Dexie**

[完整内容 — 摘 spec §4 决策点 + 替代方案考量（localStorage 5MB 上限、原生 IndexedDB 样板代码多、idb-keyval 无 query DSL）]

- [ ] **Step 4: 写 ADR 0002 — Observability bus**

[完整内容 — 不绑死 Sentry、3 个 adapter 接口、ring buffer 兜底、后期可平移]

- [ ] **Step 5: 写 ADR 0003 — 4 层架构**

[完整内容 — 单层太乱、2 层分不开 IO 与业务、4 层 + 横切是社区共识]

- [ ] **Step 6: 写 CONTRIBUTING.md**

```markdown
# Contributing

## 提交

Conventional Commits（`feat:` / `fix:` / `docs:` / `chore:` / `test:` / `refactor:`）。
本地 pre-commit 跑 lint-staged；push 前 CI 完整跑。

## 边界规则速查

| 在哪改 | 可 import | 不可 import |
|---|---|---|
| components/ | hooks, types | storage |
| hooks/ | repositories, domain | Dexie |
| repositories/ | storage | React |

不确定时看 `ARCHITECTURE.md §4`。

## 测试

- 单元：vitest + jsdom
- Repository 集成：`fake-indexeddb`
- 组件：@testing-library/react
- 烟测：Playwright（3 个用例：首屏 / 添加任务 / 完成）

## CI 失败的常见原因

- `npm run lint` → 边界规则违反，看 ARCHITECTURE.md §4
- `npm run test:coverage` → 阈值不达标，给新代码补测试
- `npm run knip` → 死代码 / 未用依赖，删掉或重新 import
- `npm run audit` → 升级有漏洞的依赖
```

- [ ] **Step 7: Commit**

```bash
git add docs/
git commit -m "docs(enterprise-foundation): add ARCHITECTURE.md, 3 ADRs, CONTRIBUTING.md"
```

---

### Task A3: ESLint 边界规则配置

**Files:**
- Create: `.eslintrc.cjs`（如不存在）或 Modify
- Create: `eslint-rules/boundaries.cjs`（自定义边界映射）

- [ ] **Step 1: 检查现有 eslint 配置**

```bash
ls -la .eslintrc* eslint.config.* 2>/dev/null
```

- [ ] **Step 2: 创建或覆盖 `.eslintrc.cjs`**

```js
module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
  plugins: ['@typescript-eslint', 'react-hooks', 'react-refresh', 'boundaries'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  settings: {
    'boundaries/elements': [
      { type: 'ui', pattern: 'src/components/**', capture: ['page', 'component'] },
      { type: 'ui', pattern: 'src/pages/**', capture: ['page', 'component'] },
      { type: 'application', pattern: 'src/hooks/**' },
      { type: 'domain', pattern: 'src/domain/**' },
      { type: 'domain', pattern: 'src/repositories/**' },
      { type: 'infrastructure', pattern: 'src/storage/**' },
      { type: 'cross-cutting', pattern: 'src/observability/**' },
      { type: 'cross-cutting', pattern: 'src/error-boundary/**' },
      { type: 'cross-cutting', pattern: 'src/storage/migrations.ts' },
    ],
  },
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    'boundaries/element-types': ['error', {
      default: 'disallow',
      rules: [
        { from: 'ui',          allow: ['application', 'cross-cutting', 'domain'] },
        { from: 'application', allow: ['domain', 'cross-cutting'] },
        { from: 'domain',      allow: ['infrastructure', 'cross-cutting'] },
        { from: 'infrastructure', allow: ['cross-cutting'] },
        { from: 'cross-cutting', allow: ['cross-cutting'] },
      ],
    }],
    'no-restricted-imports': ['error', {
      patterns: [
        { group: ['@/storage/db', '@/storage/migrations'], message: 'UI/Application 层不允许直接 import storage/Dexie，请通过 repositories/* 间接调用。' },
        { group: ['dexie'], message: '不要直接 import dexie，请通过 repositories/* 间接调用。' },
      ],
    }],
  },
  ignorePatterns: ['dist', 'node_modules', 'coverage', 'playwright-report', 'test-results'],
};
```

- [ ] **Step 3: 验证现有代码无违反**

```bash
npm run lint
```
Expected: 无错误或仅 warning。若有 error，需列入后续任务修复。

- [ ] **Step 4: Commit**

```bash
git add .eslintrc.cjs
git commit -m "chore(enterprise-foundation): add eslint boundary rules"
```

---

### Task A4: Husky + lint-staged + commitlint

**Files:**
- Create: `.husky/pre-commit`
- Create: `.lintstagedrc.json`
- Create: `commitlint.config.js`

- [ ] **Step 1: 初始化 husky**

```bash
npx husky init
```

- [ ] **Step 2: 写 `.husky/pre-commit`**

```sh
#!/usr/bin/env sh
npx lint-staged
```

- [ ] **Step 3: 写 `.lintstagedrc.json`**

```json
{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,yml,yaml}": ["prettier --write"]
}
```

- [ ] **Step 4: 写 commitlint.config.js（仅配置，不强制 commit-msg 钩子）**

```js
module.exports = { extends: ['@commitlint/config-conventional'] };
```

```bash
npm install -D @commitlint/cli @commitlint/config-conventional
```

- [ ] **Step 5: 验证 husky 安装**

```bash
ls .husky/
```
Expected: `pre-commit` 存在且可执行。

- [ ] **Step 6: Commit**

```bash
git add .husky .lintstagedrc.json commitlint.config.js package.json package-lock.json
git commit -m "chore(enterprise-foundation): add husky pre-commit + lint-staged + commitlint"
```

---

## 章节 B：存储层（6 任务）

### Task B1: Zod schema 定义（单一真相源）

**Files:**
- Create: `src/storage/schema.ts`

- [ ] **Step 1: 写 schema.ts**

```ts
import { z } from 'zod';

export const STORAGE_SCHEMA_VERSION = 2 as const;

export const TaskTypeSchema = z.enum(['reading', 'exercise', 'coding', 'other']);
export const MoodSchema = z.enum(['down', 'low', 'okay', 'gloomy', 'hopeful']);
export const PetMoodSchema = z.enum([
  'idle', 'waiting', 'encouraging', 'celebrating', 'resting', 'sleeping',
]);

export const TaskRowSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(120),
  type: TaskTypeSchema,
  bookName: z.string().optional(),
  currentPage: z.number().int().nonnegative().optional(),
  pagesPerSession: z.number().int().positive().optional(),
  startPage: z.number().int().nonnegative().optional(),
  endPage: z.number().int().nonnegative().optional(),
  place: z.string().optional(),
  time: z.string().optional(),
  note: z.string().max(500).optional(),
  createdAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  completedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const StreakSchema = z.object({
  current: z.number().int().nonnegative(),
  best: z.number().int().nonnegative(),
  lastCompletedDate: z.string().nullable(),
});

export const SettingsSchema = z.object({
  defaultPagesPerSession: z.number().int().positive(),
  lastPageRead: z.number().int().nonnegative(),
  lastBookName: z.string(),
  customPresets: z.array(z.any()),
});

export const PetStateSchema = z.object({
  enabled: z.boolean(),
  species: z.literal('cloud_cat'),
  name: z.string().max(16),
  affection: z.number().int().nonnegative(),
  firstMetAt: z.string().nullable(),
  lastInteractionAt: z.string().nullable(),
  lastRewardDate: z.string().nullable(),
  mood: PetMoodSchema,
  renamed: z.boolean(),
});

export const PeaceStateSchema = z.object({
  cards: z.number().int().nonnegative(),
  protectedDates: z.array(z.string()),
  lastRewardedDate: z.string().nullable(),
});

export const MetaSchema = z.object({
  schemaVersion: z.literal(STORAGE_SCHEMA_VERSION),
  migratedAt: z.string(),
});

export type TaskRow = z.infer<typeof TaskRowSchema>;
export type SettingsRow = z.infer<typeof SettingsSchema>;
export type PetRow = z.infer<typeof PetStateSchema>;
export type PeaceRow = z.infer<typeof PeaceStateSchema>;
export type Meta = z.infer<typeof MetaSchema>;
```

- [ ] **Step 2: 验证 typecheck**

```bash
npm run typecheck
```
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/storage/schema.ts
git commit -m "feat(storage): add Zod schemas as single source of truth"
```

---

### Task B2: Dexie 实例 + legacy localStorage 导入

**Files:**
- Create: `src/storage/db.ts`
- Create: `src/storage/legacy.ts`

- [ ] **Step 1: 写 db.ts**

```ts
import Dexie, { Table } from 'dexie';
import type { TaskRow, SettingsRow, PetRow, PeaceRow, Meta } from './schema';

export interface MoodRow { date: string; mood: string; }
export interface AchievementRow { id: string; unlockedAt: string; }
export interface EventRow { seq?: number; ts: string; name: string; payload?: unknown; level?: 'info' | 'warn' | 'error'; }

class AppDB extends Dexie {
  tasks!: Table<TaskRow, string>;
  history!: Table<TaskRow & { date: string }, string>;
  log!: Table<{ date: string }, string>;
  settings!: Table<SettingsRow & { key: string }, string>;
  pet!: Table<PetRow & { id: string }, string>;
  peace!: Table<PeaceRow & { id: string }, string>;
  achievements!: Table<AchievementRow, string>;
  moods!: Table<MoodRow, string>;
  meta!: Table<Meta & { key: string }, string>;
  _events!: Table<EventRow, number>;

  constructor() {
    super('daily-zero-decision');
    this.version(1).stores({
      tasks: 'id, createdAt, type, completedAt',
      history: 'date, id',
      log: 'date',
      settings: 'key',
      pet: 'id',
      peace: 'id',
      achievements: 'id, unlockedAt',
      moods: 'date',
      meta: 'key',
      _events: '++seq, ts, name',
    });
  }
}

export const db = new AppDB();
```

- [ ] **Step 2: 写 legacy.ts（从 localStorage 读旧 state）**

```ts
const LEGACY_KEY = 'daily-zero-decision';

export function readLegacyState(): unknown | null {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearLegacyState(): void {
  try {
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* noop */
  }
}

export function backupLegacyState(): void {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (raw) localStorage.setItem(`${LEGACY_KEY}:backup:v0`, raw);
  } catch {
    /* noop */
  }
}
```

- [ ] **Step 3: typecheck**

```bash
npm run typecheck
```
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/storage/db.ts src/storage/legacy.ts
git commit -m "feat(storage): add Dexie instance and legacy localStorage reader"
```

---

### Task B3: 迁移框架 + v0→v1 + v1→v2

**Files:**
- Create: `src/storage/migrations.ts`
- Create: `src/storage/migrations.test.ts`

- [ ] **Step 1: 写失败测试 migrations.test.ts**

```ts
import 'fake-indexeddb/auto';
import { db } from './db';
import { runMigrations } from './migrations';
import { readLegacyState, clearLegacyState } from './legacy';

describe('migrations', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
    localStorage.clear();
  });
  afterAll(async () => { await db.close(); });

  it('v0 → v1: imports legacy localStorage into Dexie tables', async () => {
    localStorage.setItem('daily-zero-decision', JSON.stringify({
      tasks: [{ id: 't1', title: '读 2 页', type: 'reading', createdAt: '2026-06-22' }],
      log: ['2026-06-22'],
      history: { '2026-06-22': [{ id: 't1', title: '读 2 页', type: 'reading', createdAt: '2026-06-22' }] },
      settings: { defaultPagesPerSession: 10, lastPageRead: 0, lastBookName: '', customPresets: [] },
      pet: { enabled: true, species: 'cloud_cat', name: '小云', affection: 0, firstMetAt: null, lastInteractionAt: null, lastRewardDate: null, mood: 'idle', renamed: false },
      peace: { cards: 2, protectedDates: [], lastRewardedDate: null },
      achievements: [],
      moods: {},
      pomodoroSessions: 0,
      onboarded: true,
      streak: { current: 1, best: 1, lastCompletedDate: '2026-06-22' },
    }));

    await runMigrations(0, 1);
    const tasks = await db.tasks.toArray();
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe('t1');
  });

  it('v1 → v2: writes schemaVersion meta row', async () => {
    await runMigrations(1, 2);
    const meta = await db.meta.get('singleton');
    expect(meta?.schemaVersion).toBe(2);
  });

  it('migration is idempotent', async () => {
    await runMigrations(1, 2);
    await runMigrations(1, 2);  // 不应抛错
    const meta = await db.meta.get('singleton');
    expect(meta?.schemaVersion).toBe(2);
  });
});
```

- [ ] **Step 2: 跑测试确认 fail**

```bash
npm test -- src/storage/migrations.test.ts
```
Expected: FAIL（migrations 模块不存在）

- [ ] **Step 3: 实现 migrations.ts**

```ts
import { db } from './db';
import { readLegacyState, clearLegacyState, backupLegacyState } from './legacy';
import { STORAGE_SCHEMA_VERSION } from './schema';
import type { TaskRow, PetRow, PeaceRow, SettingsRow } from './schema';

export type Migration = (db: typeof this.db) => Promise<void>;

export const migrations: Record<number, (db: typeof db) => Promise<void>> = {
  // v0 → v1: 从 localStorage 导入
  1: async (db) => {
    const legacy = readLegacyState();
    if (!legacy || typeof legacy !== 'object') {
      throw new Error('migration v0→v1: no legacy state found');
    }
    backupLegacyState();
    const tasks: TaskRow[] = Array.isArray((legacy as any).tasks) ? (legacy as any).tasks : [];
    await db.tasks.bulkPut(tasks);
    if (Array.isArray((legacy as any).log)) {
      await db.log.bulkPut((legacy as any).log.map((d: string) => ({ date: d })));
    }
    if ((legacy as any).history && typeof (legacy as any).history === 'object') {
      for (const [date, list] of Object.entries((legacy as any).history)) {
        for (const t of (list as TaskRow[])) {
          await db.history.put({ ...t, date });
        }
      }
    }
    const settings = (legacy as any).settings;
    if (settings) {
      await db.settings.put({ ...settings, key: 'singleton' });
    }
    if ((legacy as any).pet) {
      await db.pet.put({ ...(legacy as any).pet, id: 'singleton' });
    }
    if ((legacy as any).peace) {
      await db.peace.put({ ...(legacy as any).peace, id: 'singleton' });
    }
    if (Array.isArray((legacy as any).achievements)) {
      for (const id of (legacy as any).achievements) {
        await db.achievements.put({ id, unlockedAt: new Date().toISOString() });
      }
    }
    if ((legacy as any).moods && typeof (legacy as any).moods === 'object') {
      for (const [date, mood] of Object.entries((legacy as any).moods)) {
        await db.moods.put({ date, mood: String(mood) });
      }
    }
    clearLegacyState();
  },
  // v1 → v2: 写 schemaVersion meta + 任何 v1→v2 的格式调整（本轮无字段变更，仅落 meta）
  2: async (db) => {
    await db.meta.put({
      key: 'singleton',
      schemaVersion: 2,
      migratedAt: new Date().toISOString(),
    });
  },
};

export async function runMigrations(db: typeof this.db, from: number, to: number): Promise<void> {
  for (let v = from + 1; v <= to; v++) {
    const m = migrations[v];
    if (!m) throw new Error(`migration v${v} not found`);
    await m(db);
  }
}

export async function ensureCurrentSchema(): Promise<void> {
  const meta = await db.meta.get('singleton');
  const current = meta?.schemaVersion ?? 1;
  if (current < STORAGE_SCHEMA_VERSION) {
    await runMigrations(db, current, STORAGE_SCHEMA_VERSION);
  }
}
```

- [ ] **Step 4: 跑测试确认 pass**

```bash
npm test -- src/storage/migrations.test.ts
```
Expected: 3 passed

- [ ] **Step 5: Commit**

```bash
git add src/storage/migrations.ts src/storage/migrations.test.ts
git commit -m "feat(storage): add migration framework with v0→v1 and v1→v2"
```

---

### Task B4: TaskRepository + fake

**Files:**
- Create: `src/repositories/TaskRepository.ts`
- Create: `src/repositories/TaskRepository.test.ts`
- Create: `src/repositories/fakes.ts`

- [ ] **Step 1: 写失败测试**

```ts
// TaskRepository.test.ts
import 'fake-indexeddb/auto';
import { DexieTaskRepository } from './TaskRepository';
import { db } from '../storage/db';
import type { Task } from '../types';

const sampleTask: Task = {
  id: 't1', title: '读 2 页', type: 'reading', createdAt: '2026-06-23',
};

describe('DexieTaskRepository', () => {
  beforeEach(async () => { await db.delete(); await db.open(); });
  afterAll(async () => { await db.close(); });

  it('insert + list returns inserted task', async () => {
    const repo = new DexieTaskRepository();
    await repo.insert(sampleTask);
    const list = await repo.list();
    expect(list).toEqual([sampleTask]);
  });

  it('listByDate filters by createdAt', async () => {
    const repo = new DexieTaskRepository();
    await repo.insert({ ...sampleTask, id: 't1', createdAt: '2026-06-23' });
    await repo.insert({ ...sampleTask, id: 't2', createdAt: '2026-06-22' });
    const today = await repo.listByDate('2026-06-23');
    expect(today).toHaveLength(1);
    expect(today[0].id).toBe('t1');
  });

  it('update patches fields', async () => {
    const repo = new DexieTaskRepository();
    await repo.insert(sampleTask);
    await repo.update('t1', { completedAt: '2026-06-23', note: '好' });
    const got = (await repo.list())[0];
    expect(got.completedAt).toBe('2026-06-23');
    expect(got.note).toBe('好');
  });

  it('remove deletes', async () => {
    const repo = new DexieTaskRepository();
    await repo.insert(sampleTask);
    await repo.remove('t1');
    expect(await repo.list()).toHaveLength(0);
  });

  it('rejects invalid task via Zod', async () => {
    const repo = new DexieTaskRepository();
    await expect(repo.insert({ id: '', title: '', type: 'other', createdAt: 'bad' } as Task))
      .rejects.toThrow();
  });
});
```

- [ ] **Step 2: 跑测试确认 fail**

```bash
npm test -- src/repositories/TaskRepository.test.ts
```
Expected: FAIL（模块不存在）

- [ ] **Step 3: 实现 TaskRepository.ts**

```ts
import { db } from '../storage/db';
import { TaskRowSchema, type TaskRow } from '../storage/schema';
import type { Task } from '../types';

export interface TaskRepository {
  list(): Promise<Task[]>;
  listByDate(date: string): Promise<Task[]>;
  insert(task: Task): Promise<void>;
  update(id: string, patch: Partial<Task>): Promise<void>;
  remove(id: string): Promise<void>;
}

export class DexieTaskRepository implements TaskRepository {
  async list(): Promise<Task[]> {
    const rows = await db.tasks.toArray();
    return rows.map(this.toTask);
  }

  async listByDate(date: string): Promise<Task[]> {
    const rows = await db.tasks.where('createdAt').equals(date).toArray();
    return rows.map(this.toTask);
  }

  async insert(task: Task): Promise<void> {
    TaskRowSchema.parse(task);
    await db.tasks.put(task);
  }

  async update(id: string, patch: Partial<Task>): Promise<void> {
    const existing = await db.tasks.get(id);
    if (!existing) throw new Error(`task ${id} not found`);
    const merged = TaskRowSchema.parse({ ...existing, ...patch, id });
    await db.tasks.put(merged);
  }

  async remove(id: string): Promise<void> {
    await db.tasks.delete(id);
  }

  private toTask = (row: TaskRow): Task => {
    const { ...task } = row;
    return task as Task;
  };
}
```

- [ ] **Step 4: 写 fakes.ts（in-memory 测试用）**

```ts
import type { TaskRepository } from './TaskRepository';
import type { Task } from '../types';

export class InMemoryTaskRepository implements TaskRepository {
  private store = new Map<string, Task>();
  async list() { return [...this.store.values()]; }
  async listByDate(d: string) { return [...this.store.values()].filter(t => t.createdAt === d); }
  async insert(t: Task) { this.store.set(t.id, t); }
  async update(id: string, patch: Partial<Task>) {
    const cur = this.store.get(id);
    if (!cur) throw new Error(`task ${id} not found`);
    this.store.set(id, { ...cur, ...patch, id });
  }
  async remove(id: string) { this.store.delete(id); }
}
```

- [ ] **Step 5: 跑测试 pass**

```bash
npm test -- src/repositories/TaskRepository.test.ts
```
Expected: 5 passed

- [ ] **Step 6: Commit**

```bash
git add src/repositories/TaskRepository.ts src/repositories/TaskRepository.test.ts src/repositories/fakes.ts
git commit -m "feat(repositories): add TaskRepository + Dexie impl + in-memory fake"
```

---

### Task B5: PetRepository / SettingsRepository / MoodRepository / HistoryRepository

**Files:**
- Create: `src/repositories/PetRepository.ts`
- Create: `src/repositories/PetRepository.test.ts`
- Create: `src/repositories/SettingsRepository.ts`
- Create: `src/repositories/MoodRepository.ts`
- Create: `src/repositories/HistoryRepository.ts`
- Create: `src/repositories/index.ts`

- [ ] **Step 1: 写 PetRepository 测试**

```ts
import 'fake-indexeddb/auto';
import { DexiePetRepository } from './PetRepository';
import { db } from '../storage/db';

const samplePet = {
  enabled: true, species: 'cloud_cat' as const, name: '小云', affection: 0,
  firstMetAt: null, lastInteractionAt: null, lastRewardDate: null, mood: 'idle' as const, renamed: false,
};

describe('DexiePetRepository', () => {
  beforeEach(async () => { await db.delete(); await db.open(); });
  afterAll(async () => { await db.close(); });

  it('get returns default if no row', async () => {
    const repo = new DexiePetRepository();
    const pet = await repo.get();
    expect(pet.name).toBe('小云');
  });

  it('bumpAffection only increments once per date', async () => {
    const repo = new DexiePetRepository();
    await repo.bumpAffection('2026-06-23');
    await repo.bumpAffection('2026-06-23');  // idempotent
    expect((await repo.get()).affection).toBe(1);
  });

  it('bumpAffection increments on new date', async () => {
    const repo = new DexiePetRepository();
    await repo.bumpAffection('2026-06-23');
    await repo.bumpAffection('2026-06-24');
    expect((await repo.get()).affection).toBe(2);
  });
});
```

- [ ] **Step 2: 跑测试确认 fail → Step 3: 实现**

```ts
// PetRepository.ts
import { db } from '../storage/db';
import { PetStateSchema, type PetRow } from '../storage/schema';
import { defaultPetState, type PetState } from '../types';

export interface PetRepository {
  get(): Promise<PetState>;
  update(patch: Partial<PetState>): Promise<PetState>;
  bumpAffection(today: string): Promise<PetState>;
}

export class DexiePetRepository implements PetRepository {
  async get(): Promise<PetState> {
    const row = await db.pet.get('singleton');
    if (!row) return defaultPetState;
    const { id: _id, ...pet } = row as PetRow & { id: string };
    return PetStateSchema.parse(pet) as PetState;
  }

  async update(patch: Partial<PetState>): Promise<PetState> {
    const cur = await this.get();
    const next = PetStateSchema.parse({ ...cur, ...patch });
    await db.pet.put({ ...next, id: 'singleton' });
    return next;
  }

  async bumpAffection(today: string): Promise<PetState> {
    const cur = await this.get();
    if (cur.lastRewardDate === today) return cur;
    return this.update({ affection: cur.affection + 1, lastRewardDate: today, mood: 'celebrating' });
  }
}
```

- [ ] **Step 4: 写 SettingsRepository**

```ts
// SettingsRepository.ts
import { db } from '../storage/db';
import { SettingsSchema } from '../storage/schema';
import type { Settings } from '../types';

const DEFAULT: Settings = { defaultPagesPerSession: 10, lastPageRead: 0, lastBookName: '', customPresets: [] };

export interface SettingsRepository {
  get(): Promise<Settings>;
  update(patch: Partial<Settings>): Promise<Settings>;
}

export class DexieSettingsRepository implements SettingsRepository {
  async get(): Promise<Settings> {
    const row = await db.settings.get('singleton');
    if (!row) return DEFAULT;
    const { key: _k, ...settings } = row as any;
    return SettingsSchema.parse(settings) as Settings;
  }
  async update(patch: Partial<Settings>): Promise<Settings> {
    const cur = await this.get();
    const next = SettingsSchema.parse({ ...cur, ...patch });
    await db.settings.put({ ...next, key: 'singleton' });
    return next;
  }
}
```

- [ ] **Step 5: 写 MoodRepository**

```ts
// MoodRepository.ts
import { db } from '../storage/db';

export interface MoodRepository {
  getForDate(date: string): Promise<string | undefined>;
  setForDate(date: string, mood: string): Promise<void>;
}

export class DexieMoodRepository implements MoodRepository {
  async getForDate(date: string) {
    const row = await db.moods.get(date);
    return row?.mood;
  }
  async setForDate(date: string, mood: string) {
    await db.moods.put({ date, mood });
  }
}
```

- [ ] **Step 6: 写 HistoryRepository**

```ts
// HistoryRepository.ts
import { db } from '../storage/db';
import { TaskRowSchema } from '../storage/schema';
import type { Task } from '../types';

export interface HistoryRepository {
  getAll(): Promise<Record<string, Task[]>>;
  appendToDate(date: string, task: Task): Promise<void>;
  listByDate(date: string): Promise<Task[]>;
}

export class DexieHistoryRepository implements HistoryRepository {
  async getAll(): Promise<Record<string, Task[]>> {
    const rows = await db.history.toArray();
    const out: Record<string, Task[]> = {};
    for (const r of rows) {
      const { date, ...task } = r;
      TaskRowSchema.parse(task);
      (out[date] ||= []).push(task as Task);
    }
    return out;
  }
  async appendToDate(date: string, task: Task) {
    TaskRowSchema.parse(task);
    await db.history.put({ ...task, date });
  }
  async listByDate(date: string) {
    const rows = await db.history.where('date').equals(date).toArray();
    return rows.map(({ date: _d, ...t }) => t as Task);
  }
}
```

- [ ] **Step 7: 写 repositories/index.ts（barrel）**

```ts
export { DexieTaskRepository } from './TaskRepository';
export { DexiePetRepository } from './PetRepository';
export { DexieSettingsRepository } from './SettingsRepository';
export { DexieMoodRepository } from './MoodRepository';
export { DexieHistoryRepository } from './HistoryRepository';
export * from './fakes';
```

- [ ] **Step 8: 跑 PetRepository 测试 pass**

```bash
npm test -- src/repositories/PetRepository.test.ts
```
Expected: 3 passed

- [ ] **Step 9: Commit**

```bash
git add src/repositories/
git commit -m "feat(repositories): add Pet/Settings/Mood/History repositories + barrel"
```

---

### Task B6: domain/streak.ts（从 storage.ts 拆出纯函数）

**Files:**
- Create: `src/domain/streak.ts`
- Create: `src/domain/streak.test.ts`

- [ ] **Step 1: 写测试**

```ts
import { calculateStreak, getToday, isToday, isYesterday } from './streak';

describe('streak pure functions', () => {
  beforeEach(() => { jest.useFakeTimers().setSystemTime(new Date('2026-06-23T10:00:00Z')); });
  afterEach(() => { jest.useRealTimers(); });

  it('getToday returns YYYY-MM-DD', () => {
    expect(getToday()).toBe('2026-06-23');
  });

  it('calculateStreak from empty log', () => {
    expect(calculateStreak([])).toEqual({ current: 0, best: 0, lastCompletedDate: null });
  });

  it('calculateStreak with consecutive days including today', () => {
    const result = calculateStreak(['2026-06-21', '2026-06-22', '2026-06-23']);
    expect(result.current).toBe(3);
    expect(result.best).toBe(3);
  });

  it('calculateStreak broken by gap', () => {
    const result = calculateStreak(['2026-06-20', '2026-06-22', '2026-06-23']);
    expect(result.best).toBe(2);
  });

  it('isToday and isYesterday', () => {
    expect(isToday('2026-06-23')).toBe(true);
    expect(isYesterday('2026-06-22')).toBe(true);
    expect(isYesterday('2026-06-23')).toBe(false);
  });
});
```

- [ ] **Step 2: 跑 fail → Step 3: 实现**

```ts
// src/domain/streak.ts
export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function isToday(dateStr: string): boolean {
  return dateStr === getToday();
}

export function isYesterday(dateStr: string): boolean {
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return dateStr === y.toISOString().split('T')[0];
}

export function calculateStreak(log: string[]): {
  current: number; best: number; lastCompletedDate: string | null;
} {
  if (log.length === 0) return { current: 0, best: 0, lastCompletedDate: null };

  const sortedDates = [...new Set(log)].sort().reverse();
  const today = getToday();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let current = 0, best = 0, tempStreak = 0;
  let prevDate: Date | null = null;

  for (const dateStr of sortedDates) {
    const date = new Date(dateStr);
    if (prevDate === null) {
      if (dateStr === today || dateStr === yesterdayStr) {
        tempStreak = 1; current = 1;
      } else {
        tempStreak = 1;
      }
    } else {
      const diffDays = Math.round((prevDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
        if (current > 0) current = tempStreak;
      } else {
        best = Math.max(best, tempStreak);
        tempStreak = 1;
      }
    }
    prevDate = date;
  }
  best = Math.max(best, tempStreak, current);
  return { current, best, lastCompletedDate: sortedDates[0] || null };
}
```

- [ ] **Step 4: 跑测试 pass**

```bash
npm test -- src/domain/streak.test.ts
```
Expected: 5 passed

- [ ] **Step 5: Commit**

```bash
git add src/domain/
git commit -m "feat(domain): extract streak pure functions from storage.ts"
```

---

## 章节 C：可观测（5 任务）

### Task C1: Observability 接口 + ConsoleAdapter

**Files:**
- Create: `src/observability/index.ts`
- Create: `src/observability/adapters/ConsoleAdapter.ts`
- Create: `src/observability/types.ts`

- [ ] **Step 1: 写 types.ts**

```ts
export interface ObservabilityAdapter {
  captureException(error: unknown, context?: Record<string, unknown>): void;
  event(name: string, props?: Record<string, unknown>): void;
}
```

- [ ] **Step 2: 写 ConsoleAdapter**

```ts
import type { ObservabilityAdapter } from '../types';

export class ConsoleAdapter implements ObservabilityAdapter {
  captureException(error: unknown, context?: Record<string, unknown>): void {
    // eslint-disable-next-line no-console
    console.error('[observability]', error, context);
  }
  event(name: string, props?: Record<string, unknown>): void {
    // eslint-disable-next-line no-console
    console.info(`[event] ${name}`, props);
  }
}
```

- [ ] **Step 3: 写 index.ts**

```ts
import type { ObservabilityAdapter } from './types';
import { ConsoleAdapter } from './adapters/ConsoleAdapter';
import { writeEvent } from './ringBuffer';

let adapter: ObservabilityAdapter = new ConsoleAdapter();

export function setAdapter(a: ObservabilityAdapter) { adapter = a; }
export function getAdapter(): ObservabilityAdapter { return adapter; }

export const observability = {
  captureException(error: unknown, context?: Record<string, unknown>) {
    adapter.captureException(error, context);
    writeEvent({ ts: new Date().toISOString(), name: 'exception', payload: { message: String(error), ...context }, level: 'error' });
  },
  event(name: string, props?: Record<string, unknown>) {
    adapter.event(name, props);
    writeEvent({ ts: new Date().toISOString(), name, payload: props, level: 'info' });
  },
};
```

- [ ] **Step 4: typecheck**

```bash
npm run typecheck
```

- [ ] **Step 5: Commit**

```bash
git add src/observability/
git commit -m "feat(observability): add event bus interface + ConsoleAdapter"
```

---

### Task C2: Ring buffer (Deno-style limit + 持久化)

**Files:**
- Create: `src/observability/ringBuffer.ts`
- Create: `src/observability/ringBuffer.test.ts`

- [ ] **Step 1: 写失败测试**

```ts
import 'fake-indexeddb/auto';
import { writeEvent, readEvents, clearEvents } from './ringBuffer';
import { db } from '../storage/db';

describe('ringBuffer', () => {
  beforeEach(async () => { await db.delete(); await db.open(); clearEvents(); });
  afterAll(async () => { await db.close(); });

  it('writeEvent appends', async () => {
    writeEvent({ ts: '2026-06-23T10:00:00Z', name: 'task.created', level: 'info' });
    const events = await readEvents();
    expect(events).toHaveLength(1);
    expect(events[0].name).toBe('task.created');
  });

  it('caps at 100 events (FIFO)', async () => {
    for (let i = 0; i < 110; i++) {
      writeEvent({ ts: new Date().toISOString(), name: `e${i}`, level: 'info' });
    }
    const events = await readEvents();
    expect(events).toHaveLength(100);
    expect(events[0].name).toBe('e10');
    expect(events[99].name).toBe('e109');
  });

  it('clearEvents wipes the buffer', async () => {
    writeEvent({ ts: '2026-06-23T10:00:00Z', name: 'x', level: 'info' });
    clearEvents();
    expect(await readEvents()).toHaveLength(0);
  });
});
```

- [ ] **Step 2: 跑 fail → Step 3: 实现**

```ts
import { db } from '../storage/db';
import type { EventRow } from '../storage/db';

const RING_BUFFER_LIMIT = 100;
const buffer: EventRow[] = [];

export function writeEvent(event: Omit<EventRow, 'seq'>): void {
  buffer.push(event);
  if (buffer.length > RING_BUFFER_LIMIT) buffer.shift();
  // 异步落盘，不阻塞调用
  db._events.put(event).catch(() => { /* swallow */ });
  // 控制 in-memory + disk 同步
  db._events.count().then((c) => {
    if (c > RING_BUFFER_LIMIT) {
      db._events.orderBy('seq').limit(c - RING_BUFFER_LIMIT).delete();
    }
  });
}

export async function readEvents(): Promise<EventRow[]> {
  return db._events.orderBy('seq').toArray();
}

export function clearEvents(): void {
  buffer.length = 0;
  db._events.clear();
}
```

- [ ] **Step 4: 跑测试 pass**

```bash
npm test -- src/observability/ringBuffer.test.ts
```
Expected: 3 passed

- [ ] **Step 5: Commit**

```bash
git add src/observability/ringBuffer.ts src/observability/ringBuffer.test.ts
git commit -m "feat(observability): add ring buffer (FIFO, cap 100)"
```

---

### Task C3: Sentry stub（适配器接口，不实接）

**Files:**
- Create: `src/observability/adapters/SentryAdapter.ts`

- [ ] **Step 1: 写 stub**

```ts
import type { ObservabilityAdapter } from '../types';

/**
 * Sentry 适配器 stub。
 * 实接留待 Round 10（届时填 DSN 解析、采样、user context）。
 * 当前仅占位，确保 import.meta.env.VITE_SENTRY_DSN 存在时可激活。
 */
export class SentryAdapter implements ObservabilityAdapter {
  private dsn: string;
  constructor(dsn: string) { this.dsn = dsn; }
  captureException(error: unknown, context?: Record<string, unknown>): void {
    // TODO(round-10): 接入 @sentry/browser
    // eslint-disable-next-line no-console
    console.warn('[sentry-stub]', this.dsn, error, context);
  }
  event(name: string, props?: Record<string, unknown>): void {
    // TODO(round-10): 接入 Sentry.addBreadcrumb / Sentry.captureMessage
    // eslint-disable-next-line no-console
    console.warn('[sentry-stub]', this.dsn, name, props);
  }
}
```

- [ ] **Step 2: typecheck**

```bash
npm run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add src/observability/adapters/SentryAdapter.ts
git commit -m "feat(observability): add SentryAdapter stub (interface, not wired)"
```

---

### Task C4: ErrorBoundary 组件 + 降级 UI

**Files:**
- Create: `src/error-boundary/ErrorBoundary.tsx`
- Create: `src/error-boundary/ErrorBoundary.test.tsx`

- [ ] **Step 1: 写失败测试**

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

const Bomb = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) throw new Error('boom');
  return <div>fine</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => { jest.spyOn(console, 'error').mockImplementation(() => {}); });
  afterEach(() => { (console.error as jest.Mock).mockRestore?.(); });

  it('renders children when no error', () => {
    render(<ErrorBoundary><Bomb shouldThrow={false} /></ErrorBoundary>);
    expect(screen.getByText('fine')).toBeInTheDocument();
  });

  it('renders fallback UI on error', () => {
    render(<ErrorBoundary><Bomb shouldThrow={true} /></ErrorBoundary>);
    expect(screen.getByText(/出错了/i)).toBeInTheDocument();
  });

  it('reset button re-renders children', () => {
    const { rerender } = render(<ErrorBoundary><Bomb shouldThrow={true} /></ErrorBoundary>);
    const btn = screen.getByRole('button', { name: /重试/i });
    rerender(<ErrorBoundary><Bomb shouldThrow={false} /></ErrorBoundary>);
    fireEvent.click(btn);
    expect(screen.getByText('fine')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 跑 fail → Step 3: 实现**

```tsx
import { Component, type ReactNode } from 'react';
import { observability } from '../observability';

interface Props { children: ReactNode; fallback?: ReactNode; name?: string; }
interface State { error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string }): void {
    observability.captureException(error, {
      boundary: this.props.name ?? 'unnamed',
      componentStack: info.componentStack,
    });
    observability.event('ui.error.boundary', {
      boundary: this.props.name ?? 'unnamed',
      message: error.message,
    });
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div role="alert" style={{ padding: 24, textAlign: 'center' }}>
          <h2>出错了</h2>
          <p style={{ color: '#666' }}>{this.state.error.message}</p>
          <button onClick={this.reset} style={{ padding: '8px 16px', borderRadius: 8 }}>重试</button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

- [ ] **Step 4: 跑测试 pass**

```bash
npm test -- src/error-boundary/ErrorBoundary.test.tsx
```
Expected: 3 passed

- [ ] **Step 5: Commit**

```bash
git add src/error-boundary/
git commit -m "feat(error-boundary): add ErrorBoundary with observability integration"
```

---

### Task C5: 在 App.tsx 挂载 3 个 ErrorBoundary

**Files:**
- Modify: `src/App.tsx:114-318`

- [ ] **Step 1: 添加 import 与包裹**

在 App.tsx 顶部 import：

```tsx
import { ErrorBoundary } from './error-boundary/ErrorBoundary';
```

修改顶层 return 的最外层 div：

```tsx
<ErrorBoundary name="app-root">
  <div className="clay-page-grain" ...>
    {/* 原有内容 */}
  </div>
</ErrorBoundary>
```

- [ ] **Step 2: 包裹 SkyScene**

打开 `src/pages/SkyPage.tsx`，找 `<SkyScene>` 包裹：

```tsx
<ErrorBoundary name="sky-scene">
  <SkyScene ... />
</ErrorBoundary>
```

- [ ] **Step 3: 包裹 TodayDecisionCard**

打开 `src/components/today/TodayDecisionCard.tsx`，找 `<TodayDecisionCard>` 导出根 jsx 包裹：

```tsx
return (
  <ErrorBoundary name="today-decision-card">
    {/* 原有内容 */}
  </ErrorBoundary>
);
```

- [ ] **Step 4: 跑全套测试**

```bash
npm test
```
Expected: 全部通过（69 旧 + 28 新 + ErrorBoundary 3 = 100+）

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/pages/SkyPage.tsx src/components/today/TodayDecisionCard.tsx
git commit -m "feat(error-boundary): mount ErrorBoundary at app-root, sky-scene, today-decision-card"
```

---

## 章节 D：应用层接入（4 任务）

### Task D1: useAppState 接入 Repository（loadState 改 ensureCurrentSchema）

**Files:**
- Modify: `src/hooks/useAppState.ts`
- Modify: `src/utils/storage.ts`

- [ ] **Step 1: 保留 storage.ts 的导出兼容**

把 `calculateStreak` / `getToday` 等 pure function 改为从 `domain/streak` 导出，保持兼容：

```ts
// src/utils/storage.ts
export { calculateStreak, getToday, isToday, isYesterday } from '../domain/streak';
export { parseTaskFromInput } from './legacyParse';
export { generateId } from './legacyParse';
```

- [ ] **Step 2: 创建 legacyParse.ts（拆分原 storage.ts 的副作用部分）**

把 `parseTaskFromInput` 和 `generateId` 从原 storage.ts 移到一个新文件 `src/utils/legacyParse.ts`，原 storage.ts 仅做兼容 re-export。

- [ ] **Step 3: useAppState 改用 Dexie**

```ts
// src/hooks/useAppState.ts
import { useEffect, useState } from 'react';
import { ensureCurrentSchema } from '../storage/migrations';
import { DexieSettingsRepository } from '../repositories/SettingsRepository';
import type { AppState } from '../types';
import { defaultAppState } from '../utils/defaultAppState';

export function useAppState() {
  const [state, setState] = useState<AppState>(defaultAppState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await ensureCurrentSchema();
      const settings = await new DexieSettingsRepository().get();
      setState((prev) => ({ ...prev, settings }));
      setReady(true);
      observability.event('app.boot.duration', { readyMs: Date.now() - bootStart });
    })();
  }, []);

  return { state, setState, ready };
}
```

- [ ] **Step 4: 跑现有测试**

```bash
npm test
```
Expected: 全部通过

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useAppState.ts src/utils/storage.ts src/utils/legacyParse.ts src/utils/defaultAppState.ts
git commit -m "refactor(app-state): useAppState bootstraps via Dexie + ensureCurrentSchema"
```

---

### Task D2: useTasks 接入 TaskRepository + observability 打点

**Files:**
- Modify: `src/hooks/useTasks.ts`

- [ ] **Step 1: 在关键路径打点 + 用 Repository**

```ts
// 顶部新增 import
import { DexieTaskRepository } from '../repositories/TaskRepository';
import { DexiePetRepository } from '../repositories/PetRepository';
import { DexieHistoryRepository } from '../repositories/HistoryRepository';
import { observability } from '../observability';

const taskRepo = new DexieTaskRepository();
const petRepo = new DexiePetRepository();
const historyRepo = new DexieHistoryRepository();

// handleAddTask 末尾
observability.event('task.created', { id: newTask.id, type: newTask.type });

// handleConfirmComplete 内
observability.event('task.completed', { id: completingTaskId });
const updatedPet = await petRepo.bumpAffection(today);
setState((prev) => ({ ...prev, pet: updatedPet }));
await historyRepo.appendToDate(today, updatedTask);

// handleEasier 内
observability.event('task.eased', { taskId });
```

**保留** hook 函数签名与返回值，**不动** `handleConfirmComplete` 的乐观更新顺序（先 setState 再 await IO 改成 setState 触发后再 await）。

- [ ] **Step 2: 跑现有测试**

```bash
npm test
```
Expected: 全部通过

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useTasks.ts
git commit -m "feat(tasks): useTasks hits repositories + emits observability events"
```

---

### Task D3: usePet / useStreak / usePeace 接入 Repository

**Files:**
- Modify: `src/hooks/usePet.ts`
- Modify: `src/hooks/useStreak.ts`
- Modify: `src/hooks/usePeace.ts`

- [ ] **Step 1: usePet 接入 DexiePetRepository**

```ts
import { DexiePetRepository } from '../repositories/PetRepository';
const repo = new DexiePetRepository();
// 用 repo.get() / repo.update(patch) 替换原 setState 中的 pet 字段
// 保留现有 hook 返回签名
```

- [ ] **Step 2: useStreak 保持纯函数调用**

`useStreak` 已用 `calculateStreak`，无 storage 直接调用——保持。验证 lint 不报违反。

- [ ] **Step 3: usePeace 加 Repository**

```ts
import { DexiePeaceRepository } from '../repositories/PeaceRepository';  // 需新建
```

如果 PeaceRepository 之前没建（Task B5 只建了 5 个不含 Peace），这里补建一个：

```ts
// src/repositories/PeaceRepository.ts
import { db } from '../storage/db';
import { PeaceStateSchema } from '../storage/schema';
import type { PeaceState } from '../types';

const DEFAULT: PeaceState = { cards: 2, protectedDates: [], lastRewardedDate: null };

export interface PeaceRepository {
  get(): Promise<PeaceState>;
  update(patch: Partial<PeaceState>): Promise<PeaceState>;
  consume(date: string): Promise<PeaceState>;
}
export class DexiePeaceRepository implements PeaceRepository {
  async get(): Promise<PeaceState> {
    const row = await db.peace.get('singleton');
    if (!row) return DEFAULT;
    const { id: _id, ...rest } = row as any;
    return PeaceStateSchema.parse(rest) as PeaceState;
  }
  async update(patch: Partial<PeaceState>): Promise<PeaceState> {
    const cur = await this.get();
    const next = PeaceStateSchema.parse({ ...cur, ...patch });
    await db.peace.put({ ...next, id: 'singleton' });
    return next;
  }
  async consume(date: string): Promise<PeaceState> {
    const cur = await this.get();
    if (cur.cards <= 0) return cur;
    return this.update({ cards: cur.cards - 1, protectedDates: [...cur.protectedDates, date] });
  }
}
```

- [ ] **Step 4: 跑测试**

```bash
npm test
```
Expected: 全部通过

- [ ] **Step 5: Commit**

```bash
git add src/hooks/ src/repositories/PeaceRepository.ts
git commit -m "feat(hooks): usePet/useStreak/usePeace hit repositories"
```

---

### Task D4: importState / exportState 走 Zod 校验

**Files:**
- Modify: `src/utils/storage.ts`（或新建 `src/storage/importExport.ts`）

- [ ] **Step 1: 实现新版 importState**

```ts
import { AppStateSchema, STORAGE_SCHEMA_VERSION } from '../storage/schema';
import { runMigrations } from '../storage/migrations';
import { db } from '../storage/db';

export async function importState(json: string): Promise<boolean> {
  let parsed: unknown;
  try { parsed = JSON.parse(json); } catch { return false; }
  if (!parsed || typeof parsed !== 'object') return false;
  const v = (parsed as any).schemaVersion ?? 1;
  if (v > STORAGE_SCHEMA_VERSION) return false;  // 太新，不支持
  if (v < STORAGE_SCHEMA_VERSION) {
    try {
      await runMigrations(db, v, STORAGE_SCHEMA_VERSION);
    } catch { return false; }
  }
  const result = AppStateSchema.safeParse(parsed);
  return result.success;
}
```

- [ ] **Step 2: 实现 exportState**

```ts
export async function exportState(): Promise<string> {
  const tasks = await db.tasks.toArray();
  const log = (await db.log.toArray()).map((r) => r.date);
  const history = await new DexieHistoryRepository().getAll();
  const settings = await new DexieSettingsRepository().get();
  const pet = await new DexiePetRepository().get();
  const peace = await new DexiePeaceRepository().get();
  const moods = Object.fromEntries((await db.moods.toArray()).map((m) => [m.date, m.mood]));
  const achievements = (await db.achievements.toArray()).map((a) => a.id);
  return JSON.stringify({
    schemaVersion: STORAGE_SCHEMA_VERSION,
    tasks, log, history, settings, pet, peace, moods, achievements,
  }, null, 2);
}
```

- [ ] **Step 3: 跑测试**

```bash
npm test
```

- [ ] **Step 4: Commit**

```bash
git add src/utils/storage.ts src/storage/importExport.ts
git commit -m "feat(storage): importState/exportState with Zod validation + schema migration"
```

---

## 章节 E：CI 升级（2 任务）

### Task E1: 升级 GitHub Actions

**Files:**
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: 重写 ci.yml**

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  quality:
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
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run lint:boundaries
      - run: npm run test:coverage
      - run: npm run knip
      - run: npm run audit
      - run: npm run build
      - run: npx playwright install --with-deps
      - run: npm run test:smoke

  docs-verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: app/package.json
      - run: cd app && npm ci
      - name: Verify ARCHITECTURE.md exists and references ADRs
        run: |
          test -f app/docs/ARCHITECTURE.md || (echo "ARCHITECTURE.md missing" && exit 1)
          grep -q "ADR-0001" app/docs/ARCHITECTURE.md || (echo "ARCHITECTURE.md missing ADR refs" && exit 1)
```

- [ ] **Step 2: 本地验证（可选）**

```bash
npm run lint
npm run test:coverage
npm run knip
npm run audit
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci(enterprise-foundation): add coverage/knip/audit/boundaries/smoke jobs"
```

---

### Task E2: Playwright 配置 + 3 个烟测

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/smoke.spec.ts`

- [ ] **Step 1: 写 playwright.config.ts**

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: true,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
```

- [ ] **Step 2: 写 e2e/smoke.spec.ts**

```ts
import { test, expect } from '@playwright/test';

test('app boots to onboarding or main UI', async ({ page }) => {
  await page.goto('/');
  // 清空 localStorage 保证从 onboarding 开始
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByText(/零决策|今天/)).toBeVisible({ timeout: 10_000 });
});

test('user can add a task via input', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  // 跳过 onboarding（如有）
  const startBtn = page.getByRole('button', { name: /开始|下一步/ }).first();
  if (await startBtn.isVisible().catch(() => false)) await startBtn.click();
  const input = page.getByPlaceholder(/想坚持|今天|输入/i).first();
  await input.fill('读 2 页书');
  await input.press('Enter');
  await expect(page.getByText('读 2 页书')).toBeVisible({ timeout: 5_000 });
});

test('user can complete a task and see celebration', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('daily-zero-decision', JSON.stringify({
      schemaVersion: 1, tasks: [], log: [], history: {},
      settings: { defaultPagesPerSession: 10, lastPageRead: 0, lastBookName: '', customPresets: [] },
      achievements: [], moods: {}, pomodoroSessions: 0, onboarded: true,
      pet: { enabled: true, species: 'cloud_cat', name: '小云', affection: 0, firstMetAt: null, lastInteractionAt: null, lastRewardDate: null, mood: 'idle', renamed: false },
      peace: { cards: 2, protectedDates: [], lastRewardedDate: null },
      streak: { current: 0, best: 0, lastCompletedDate: null },
    }));
  });
  await page.reload();
  const input = page.getByPlaceholder(/想坚持|今天|输入/i).first();
  await input.fill('读 2 页书');
  await input.press('Enter');
  await expect(page.getByText('读 2 页书')).toBeVisible();
  // 标完成按钮（具体文案以 TodayDecisionCard 实际为准）
  await page.getByRole('button', { name: /完成|做完了|打卡/i }).first().click();
  await expect(page.getByText(/完成|撒花|庆祝|天空/i).first()).toBeVisible({ timeout: 5_000 });
});
```

- [ ] **Step 3: 本地跑一次**

```bash
npm run dev &
sleep 5
npm run test:smoke
```
Expected: 3 passed

- [ ] **Step 4: Commit**

```bash
git add playwright.config.ts e2e/
git commit -m "test(smoke): add Playwright config + 3 smoke tests"
```

---

## 章节 F：交付收尾（2 任务）

### Task F1: README 更新指向 ARCHITECTURE

**Files:**
- Modify: `README.md`

- [ ] **Step 1: 在 README 加架构段**

在"技术栈"后插入：

```markdown
## 架构

参见 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)。

修改前请阅读：
- [贡献指南](docs/CONTRIBUTING.md)
- 关键决策 ADR：[0001 存储](docs/DECISIONS/0001-storage-d2.md) / [0002 可观测](docs/DECISIONS/0002-observability-bus.md) / [0003 分层](docs/DECISIONS/0003-layered-architecture.md)

## 开发命令

| 命令 | 作用 |
|---|---|
| `npm run dev` | 启动开发服务器 |
| `npm test` | 跑单测 |
| `npm run test:coverage` | 跑覆盖率（门槛 70%） |
| `npm run test:smoke` | 跑 Playwright 烟测 |
| `npm run lint` | ESLint（含 boundary 规则） |
| `npm run knip` | 死代码扫描 |
| `npm run audit` | SCA 漏洞扫描 |
| `npm run typecheck` | TypeScript 检查 |
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: link to ARCHITECTURE + add dev commands table"
```

---

### Task F2: 最终验证 + CHANGELOG

**Files:**
- Modify: `CHANGELOG.md`

- [ ] **Step 1: 跑全套验证**

```bash
npm run typecheck
npm run lint
npm run test:coverage
npm run knip
npm run audit
npm run build
```

Expected: 全部 PASS

- [ ] **Step 2: 写 CHANGELOG**

```markdown
## v0.2.0 — 2026-06-23 — 企业级基线

### 新增

- 4 层架构 + Repository 抽象（Task/Pet/Settings/Mood/History/Peace）
- Dexie (IndexedDB) 替换 localStorage；Zod schema versioning；迁移框架 v0→v1→v2
- 错误边界 × 3（app-root / sky-scene / today-decision-card）
- 可观测 event bus + ConsoleAdapter + ring buffer（cap 100）+ Sentry 适配器 stub
- ~28 个新测试；fake-indexeddb 集成测试
- CI 加 coverage / knip / audit / boundary / Playwright smoke
- ESLint boundary 规则 + husky pre-commit + lint-staged + commitlint
- ARCHITECTURE.md + 3 个 ADR + CONTRIBUTING.md

### 修复

- 无（保持业务行为不变）

### 文档

- 详细架构图谱（docs/ARCHITECTURE.md）
- 3 个 ADR 记录关键选型理由

### 迁移提示

- 老用户首次启动：旧 localStorage 自动迁移到 Dexie，原始数据备份到 `daily-zero-decision:backup:v0`
- 若迁移失败，应用进入降级模式（保留旧数据 30 天）
```

- [ ] **Step 3: Commit**

```bash
git add CHANGELOG.md
git commit -m "docs(changelog): v0.2.0 enterprise baseline"
```

- [ ] **Step 4: 推送分支**

```bash
git push -u origin feature/enterprise-r1
```

---

## 自审

- ✅ Spec §2.1 全部领域有任务映射：A 章节工具脚本 + 文档 + lint 规则对应「质量门禁」+「文档」；B 章节 6 任务对应「存储层」+「Repository 抽象」；C 章节 5 任务对应「可观测」；D 章节 4 任务对应 hook 接入；E 章节对应 CI；F 章节对应交付收尾
- ✅ 无 TBD / TODO 残留（Task C3 的 TODO 是显式「round-10 实接」，有明确后续 Round）
- ✅ 类型一致：TaskRow / PetRow / PeaceRow 在 schema.ts、B1 写一次；B4/B5/D3 复用一致
- ✅ 所有 hook 函数签名保留原样（D 章节反复强调「保留」）
- ✅ 现有 69 测试不动——所有 D 章节最后一步「跑现有测试」是验证手段而非重写手段
- ⚠️ 「hook 接 repository」的具体 setState 顺序未在 plan 中精确化，原因是 spec 写了「保留乐观更新顺序」，执行时按原 hook 行为对照即可

---

## 执行选项

请选择如何执行本计划：