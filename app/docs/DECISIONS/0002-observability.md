# ADR-0002: 可观测 — console.warn + 静默吞错 → event bus + 适配器 + ring buffer

## Context

应用在生产环境出现故障时（白屏、数据不保存、状态异常），用户没有反馈渠道，开发者只能等用户截图。

- 当前 (Round 6)：错误用 `console.warn` 静默吞；用户感知 0
- 错误路径：localStorage 写入（QuotaExceeded）、JSON.parse（数据坏）、async 任务（FileReader 等）
- 无远程监控：用户不会主动报 bug，bug 在沉默中积累

## Round 6 状态

- `saveState` catch 后只 `console.warn` — 用户数据丢失无感知
- `importState` 坏 JSON 返回 null — 用户看到 alert 但没线索排查
- FileReader 无 onerror — 文件读取失败静默

## Round 7 决策

**选择：event bus + 适配器模式 + ring buffer + 不实接 Sentry**

### 架构

```ts
interface Observability {
  captureException(error: unknown, context?: Record<string, unknown>): void;
  event(name: string, props?: Record<string, unknown>): void;
}

interface ObservabilityAdapter {
  captureException(error: unknown, context?: Record<string, unknown>): void;
  event(name: string, props?: Record<string, unknown>): void;
}
```

- **observability**：全局单例，调用方使用
- **ObservabilityAdapter**：具体实现（Console / Sentry / ...）
- 默认 ConsoleAdapter（开发 + 生产 fallback）
- 预留 SentryAdapter stub，等真实流量再实接

### Ring buffer

最近 100 条事件 + 异常写到 Dexie `_events` 表。
Settings → 「导出诊断」一键导出 JSON。

```
2026-06-23T10:00:00Z | task.completed | { taskId: 't1', type: 'reading' }
2026-06-23T10:00:01Z | exception      | { message: 'QuotaExceeded', ... }
```

### 关键打点

- `app.boot.duration` — 启动耗时
- `task.created` / `task.completed` / `task.eased`
- `pet.affection.changed`
- `storage.migration.applied` / `storage.migration.failed`
- `ui.error.boundary`

## Consequences

正面：
- ✅ 失败可见：用户报告 bug 时附上"导出诊断" → 立即看到错误轨迹
- ✅ 解耦：业务代码只调 `observability.event('...')`，不绑死 Sentry
- ✅ 可演进：未来加 Sentry 只需替换 adapter，业务代码不动
- ✅ 离线友好：ring buffer 在 IndexedDB，无网络也能记录

负面：
- ⚠️ 增加 ~50 行代码（observability + adapter + ringBuffer + tests）
- ⚠️ 存储压力：100 条事件 ≈ 10-50 KB

## Alternatives considered

1. **直接接 Sentry**
   - 拒绝：用户基数未知，未确认有真实问题前不应引入外部依赖
2. **console.error 继续 + 自己写日志面板**
   - 拒绝：仅 console 用户看不到；面板自己写又重复造轮子
3. **window.onerror + 单一函数**
   - 拒绝：粒度太粗，无法捕获 React event handler 内的 error

## Migration path

Round 7：
1. 新建 `src/observability/` + adapter 接口
2. 把 `saveState` 静默 catch 改为 `observability.captureException` + 抛 `StorageQuotaError`
3. App 顶部 banner 在 `saveError` 时显示 + 一键导出
4. 关键路径打点：task.completed / pet.affection.changed / etc

Round 10（之后）：
1. 实接 Sentry（环境变量 VITE_SENTRY_DSN）
2. 生产采样率
3. 用户 session context
