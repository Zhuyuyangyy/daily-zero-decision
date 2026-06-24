# ADR-0001: 存储选型 — localStorage (Round 6) → Dexie (Round 7)

## Context

应用是一款**纯前端 PWA 风格的本地优先应用**——用户数据存浏览器本地，无后端、无账号、无云同步。

- 数据规模：单用户使用 1 年约 500 个任务 + 365 日 mood + pet state ≈ < 1 MB
- 跨设备同步：暂不要求（产品定位"个人每日小步"，跨设备是 Round 8+ 才考虑）
- 写入频率：每日 < 10 次（打卡 + 心情 + pet 互动）
- 读取频率：每次渲染多次（streak / history / settings）

## Round 6 决策（v0.1.0）

**选择：localStorage 单一 key + JSON.stringify(整个 state)**

优点：
- 零依赖、API 简单
- 同步 API 简单心智
- < 5 MB 数据足够

缺点（Round 1 修复暴露的问题）：
- 无版本控制：迁移靠 `if 链` 难维护（已通过 H8 backfill / H9 onboarded 三态演示）
- 无 schema 校验：JSON.parse 失败 → catch 返回 defaultState，**用户数据丢失无感知**
- 无查询能力：每次都得 `Object.values(history).flat()`（性能问题随数据增长）
- 容量限制：5 MB 上限；私密模式直接抛 `QuotaExceededError`
- 串行化整个 state：每次写入 = 序列化全部

## Round 7 决策（v0.2.0）

**选择：Dexie (IndexedDB) + Zod schema versioning + Repository 抽象**

### 为什么 Dexie

| 维度 | Dexie (IndexedDB) | 原生 IndexedDB | idb-keyval |
|---|---|---|---|
| 查询 DSL | ✅ 支持 where/index | ❌ 样板代码 | ❌ 仅 KV |
| 异步 API | ✅ Promise | ⚠️ callback 时代 | ✅ |
| 社区 | 成熟 | 浏览器原生 | 小 |
| 包大小 | ~25 KB | 0 | ~600 B |

我们选 Dexie 是因为 history/moods 按日期查询是核心场景，KV 模式不够用。

### 为什么 Zod

| 维度 | Zod | io-ts | yup | 手写 validator |
|---|---|---|---|---|
| 体积 | ~50 KB | ~40 KB | ~30 KB | 0 |
| 类型推导 | ✅ z.infer<> | ✅ | ⚠️ | ❌ |
| 与 TS 集成 | 一流 | 一流 | 一般 | — |
| 社区 | 大量 | 一般 | 一般 | — |

Zod 的 `z.infer<>` 直接生成 TS 类型，schema 是**单一真相源**。

### Repository 抽象

```ts
interface TaskRepository {
  list(): Promise<Task[]>;
  listByDate(date: string): Promise<Task[]>;
  insert(task: Task): Promise<void>;
  update(id: string, patch: Partial<Task>): Promise<void>;
  remove(id: string): Promise<void>;
}
```

- 业务逻辑脱离 IO：hooks 调用 Repository 接口而非 Dexie
- 内存 fake 用于测试：`InMemoryTaskRepository implements TaskRepository`
- 未来后端同步：换 `HttpTaskRepository implements TaskRepository` 即可

## Consequences

正面：
- ✅ 多表结构化存储 + 索引查询
- ✅ Schema 版本控制 + 数据迁移框架
- ✅ Zod 校验在边界捕获坏数据
- ✅ 测试用 fake-indexeddb，无需浏览器
- ✅ Repository 抽象为未来多端同步铺路

负面：
- ⚠️ 包大小增加 ~75 KB（dexie + zod + fake-indexeddb）
- ⚠️ 异步 API 改写 hooks（migration 期间 hooks 签名可能需要调整）
- ⚠️ 学习曲线：Dexie 的 query DSL 对新人不直观

## Alternatives considered

1. **保持 localStorage + 加 schema validation**
   - 拒绝：仍是单 key 序列化，查询瓶颈仍在
2. **IndexedDB 原生**
   - 拒绝：样板代码多，cursor / transaction 难维护
3. **idb-keyval**
   - 拒绝：仅 KV 接口，按日期查 history 需自己写索引
4. **PouchDB / RxDB**
   - 拒绝：包大小 200+ KB，过重；且内置 sync 暂不需要

## Migration plan（Round 7）

启动时检测：
1. 若 Dexie `meta.schemaVersion` 缺失：尝试读 localStorage `daily-zero-decision`
2. 跑 migrations[1]：写入 Dexie tables + 删除 localStorage key（保留 backup:v0）
3. 跑 migrations[2]：写 `meta.schemaVersion = 2`
4. 应用启动用 Dexie（fallback 到 defaultState）
