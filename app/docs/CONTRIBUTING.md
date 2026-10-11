# Contributing

## 提交

Conventional Commits（`feat:` / `fix:` / `docs:` / `chore:` / `test:` / `refactor:`）。

示例：
- `feat(storage): add Dexie schema versioning`
- `fix(celebration): read streak from prop instead of localStorage`

提交信息会出现在 changelog 中。

## 边界规则速查

参见 [ARCHITECTURE.md §4 模块边界速查](ARCHITECTURE.md)。

简版：

| 在哪改 | 可 import | 不可 import |
|---|---|---|
| components/ | hooks, types, copy | storage IO |
| pages/ | hooks, types, components, copy | storage IO |
| hooks/ | utils helpers, types, copy | React (本身除外) |
| utils/ | types | React, hooks, components |

不确定时看 ARCHITECTURE.md。

## 测试

- 单元：vitest + jsdom（`npm test`）
- 覆盖率：`npm run test:coverage`，门槛 70%
- 组件：@testing-library/react
- Repository（Round 7+）：fake-indexeddb
- 烟测（Round 7+）：Playwright

## i18n 文案

**所有用户可见文案必须从 `utils/copy.ts` 取**。组件不直接写字面量。

新增文案：
1. 在 `copy.ts` 加函数（如 `copy.myNewString()`）
2. 组件 import 后调用 `{copy.myNewString()}`
3. 类型由 `copy.ts` 的 TypeScript 函数签名约束

## 错误处理

- 异步路径必须 try/catch；catch 后调 `observability.captureException` + 决定是否抛
- 抛给上层时用自定义 Error 子类（`StorageQuotaError`、`ExportFailedError`），便于 UI 精准处理
- UI 收到错误后展示 toast / banner；不让用户面对沉默失败

## CI 失败的常见原因

| 命令 | 失败 | 修复 |
|---|---|---|
| `npm run lint` | 边界规则违反 | 看 ARCHITECTURE.md §4 调整 import |
| `npm run test:coverage` | 阈值不达标 | 给新代码补测试 |
| `npm run knip` | 死代码 / 未用依赖 | 删掉或重新 import |
| `npm run audit:high` | 升级有漏洞的依赖 | `npm update` |
| `npm run build` | 类型错误 | `npm run typecheck` 看细节 |

## 提交流程

1. 从 main 拉新分支：`git checkout -b feature/my-thing`
2. 改代码 + 加测试
3. `npm run typecheck && npm test && npm run lint`
4. `git commit -m "feat(scope): ..."`（遵循 conventional commits）
5. 推分支 + 开 PR

## 修复 Bug 的优先级

P0 critical：影响数据 / 时间 / 安全 / 阻断核心功能（如 F1 时区、F4 双写）
P1 major：性能 / 竞态 / 闭包 / a11y 阻断
P2 minor：清理 / 一致性 / UX

第四轮扫描发现的问题分布：
- F1-F15 Round 1：4 critical + 7 major + 4 minor
- F17-F21 Round 2：0 critical + 3 major + 2 minor
- F22-F33 Round 3：3 critical + 7 major + 3 minor
- F34-F43 Round 4：2 critical + 3 major + 5 minor

总计 9 critical + 20 major + 14 minor = 43 个真实问题。
