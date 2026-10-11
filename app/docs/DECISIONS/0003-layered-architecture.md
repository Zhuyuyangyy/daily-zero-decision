# ADR-0003: 分层 — UI / Hooks / Utils (Round 6) → 4 层 + Cross-cutting (Round 7)

## Context

项目 60+ 文件散落在 `src/components/` `src/hooks/` `src/utils/` `src/pages/`。
随着 Round 1-4 修复的累积，发现：

- `utils/storage.ts` 同时承担纯函数（`getToday`、`calculateStreak`）和 IO（`saveState`、`loadState`、`exportState`）
- `hooks/useTasks.ts` 内联业务规则（streak 重算、pet 奖励、peace 消耗）+ React state 耦合
- `components/` 直接 `import { storage.ts }` 读 `localStorage.getItem`（F8 Celebration 绕过 loadState）

## Round 6 状态

3 层隐式：
- **UI**：`components/` `pages/` — 自由 import utils 和 hooks
- **Hooks**：`hooks/` — 业务逻辑 + state
- **Utils**：`utils/` — 纯函数 + IO 混合

**问题**：边界模糊。`Celebration.readStreak()` 直接读 localStorage 绕过 loadState 校验（F8）。

## Round 7 决策

**选择：4 层 + Cross-cutting，eslint boundary 规则强制**

### 4 层

```
┌─────────────────────────────────────────────────────┐
│  UI Layer        components/* + pages/*              │
│                  可 import：hooks, types, copy,      │
│                             cross-cutting (obs)     │
│                  不可 import：storage IO, repos      │
├─────────────────────────────────────────────────────┤
│  Application     hooks/*                            │
│                  可 import：domain, repos, types,    │
│                             copy, cross-cutting     │
│                  不可 import：React 仅在本身         │
├─────────────────────────────────────────────────────┤
│  Domain Layer    utils/achievements + utils/storage  │
│                  的纯函数 + (未来) domain/*           │
│                  纯业务逻辑，无 IO，无 React          │
│                  可 import：types                    │
├─────────────────────────────────────────────────────┤
│  Infrastructure  utils/storage.ts (Round 6)         │
│                  未来：src/storage/ (Dexie) +         │
│                  src/repositories/                   │
│                  可 import：types, zod               │
│                  不可 import：React, hooks, UI       │
└─────────────────────────────────────────────────────┘
  Cross-Cutting Concerns：
  - utils/copy.ts（i18n 文案）— 任何层可读
  - observability/（Round 7）— 任何层可写
  - error-boundary/（Round 7）— UI 层包裹
```

### 依赖方向（强制）

UI → Application → Domain → Infrastructure
       → Cross-cutting (任何层)

反向不得出现：
- Domain import UI / hooks / React
- Infrastructure import hooks / UI

### eslint boundary 规则（Round 7）

```js
'boundaries/element-types': ['error', {
  default: 'disallow',
  rules: [
    { from: 'ui',          allow: ['application', 'cross-cutting', 'domain'] },
    { from: 'application', allow: ['domain', 'cross-cutting'] },
    { from: 'domain',      allow: ['infrastructure', 'cross-cutting'] },
    { from: 'infrastructure', allow: ['cross-cutting'] },
  ],
}],
'no-restricted-imports': ['error', {
  patterns: [
    { group: ['@/storage/db', '@/storage/migrations'],
      message: 'UI/Application 层不允许直接 import storage/Dexie，请通过 repositories/* 间接调用。' },
    { group: ['dexie'],
      message: '不要直接 import dexie，请通过 repositories/* 间接调用。' },
  ],
}],
```

## Consequences

正面：
- ✅ 依赖方向清晰，新人可读 ARCHITECTURE.md 后 5 分钟开始改
- ✅ Repository 抽象允许换存储（IndexedDB → 后端 API）零业务改动
- ✅ Domain 层纯函数可纯单测（无 mock）

负面：
- ⚠️ eslint boundary 规则会拒绝一些"实际无害但违反方向"的 import，需要逐个修复
- ⚠️ 现有 60+ 文件中部分 import 路径需要重构到合规方向（Round 7 实现期间）

## Alternatives considered

1. **保持 3 层混用**
   - 拒绝：F8 Celebration 绕过 loadState 就是边界模糊导致
2. **5 层（加 Presentation / Hooks 分开）**
   - 拒绝：项目规模不需要；过度分层
3. **Hexagonal / Clean Architecture**
   - 拒绝：理论完整但实现成本高；项目规模不足以承担

## Migration path

Round 7：
1. 在 `.eslintrc.cjs` 加 boundary 规则（先 warn 后 error）
2. 修现有违规 import（src/components/ 中所有直接 `import ... from 'utils/storage'` 的非 helper 调用 → 改用 hook）
3. CI 启用 `boundaries/element-types: error`

未来：
- Round 10+: src/storage/ + src/repositories/ 落地后，eslint boundary rules 收紧到 error 等级
