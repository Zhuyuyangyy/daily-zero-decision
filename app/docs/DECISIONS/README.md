# Architecture Decision Records

| 编号 | 标题 | 状态 | 日期 |
|---|---|---|---|
| 0001 | 存储选型：localStorage 单一 key + utils/storage.ts（Round 6）→ Dexie + Zod（Round 7） | Accepted | 2026-06-23 |
| 0002 | 可观测：内联 console + 显式 catch（Round 6）→ event bus + 适配器 + ring buffer（Round 7） | Accepted | 2026-06-23 |
| 0003 | 分层：UI / Hooks / Utils 三层（Round 6）→ 4 层 + Cross-cutting（Round 7） | Accepted | 2026-06-23 |

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
