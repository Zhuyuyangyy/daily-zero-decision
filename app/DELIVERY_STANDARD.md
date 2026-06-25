# DELIVERY_STANDARD — 什么是"企业级"对这个产品

> 这是一个**单人维护、本地优先、无后端**的 PWA。传统"企业级"标准（SLA / 5 个 9 / SOC2）在这里不适用。本文件定义**适用于本产品的"可交付"标准**。

---

## 1. 设计原则

1. **可测试 (Testable)**：核心逻辑 100% 单测覆盖；UI 用 Testing Library 覆盖关键路径。
2. **可审计 (Auditable)**：所有状态变更可追溯；`localStorage` 写入路径必须经由 `saveState` 单一入口。
3. **可安装 (Installable)**：PWA manifest + Service Worker 双就绪；离线打开可用。
4. **数据完整 (Data Integrity)**：导入导出是幂等的；schema 升级不丢数据。
5. **类型安全 (Type-safe)**：`tsc --noEmit` 必须零错误；禁止 `any`（除明确注释豁免）。
6. **零 PUA (Anti-PUA)**：见 `PRODUCT_SPEC.md` §4。代码中不允许出现"催办 / 弹窗 / 红点 / 连续天数显眼"等模式。
7. **零废话 (No Fluff)**：CHANGELOG / commit / 文档用陈述句；禁止"令人惊叹的""革命性的""完美的"等营销词。

---

## 2. 可测试性标准

### 2.1 强制覆盖范围

| 模块 | 覆盖率目标 | 工具 |
| --- | --- | --- |
| `utils/storage.ts` | 100% 行覆盖 | Vitest |
| `utils/parseTaskFromInput` 6 用例 | 100% 分支 | Vitest |
| `hooks/usePet.ts`（affection 单调性） | 100% 关键路径 | Vitest + Testing Library |
| `hooks/usePeace.ts`（cards ≤ 2） | 100% 关键路径 | Vitest + Testing Library |
| `hooks/useTasks.ts`（handleEasier MAX 守卫） | 100% 关键路径 | Vitest + Testing Library |
| 页面（TodayPage / SkyPage / StatsPage / SettingsPage） | 关键路径冒烟 | Testing Library |

### 2.2 测试规范

- 用 **`describe` / `it` + 中文** 描述场景（如 `it('完成 1 张卡后不再生成第 2 张', ...)`）。
- 禁止依赖真实 `localStorage` 时序；用 `vi.spyOn` 或 `vitest` 的 `setSystemTime`。
- 每个 bug 修复必须**先加复现测试**，再改实现。
- 不写"为了覆盖率"的空测试；删代码时同步删测试。

### 2.3 CI 门槛

- PR 合并前：`typecheck` + `test` + `build` 三段全绿。
- 覆盖率下降 > 2% 必须有 PR 描述说明。

---

## 3. 可审计性标准

### 3.1 状态变更入口

- 任何修改 `AppState` 的代码路径必须经由 `useAppState` 派发，**禁止**组件内直接调用 `saveState`（除初始化和重置两个明确场景）。
- `localStorage` 写入**唯一**入口：`utils/storage.ts` 的 `saveState`。

### 3.2 错误捕获

- `window.onerror` 最小监控（已实现）：捕获未处理异常并 `console.error`。
- 不上传任何错误日志到第三方（无 Sentry）。
- 关键 mutation（完成卡 / 用安心卡 / 改名）打 `console.debug`（开发期可见，生产期可被 `console` filter 屏蔽）。

### 3.3 文档同步

- 任何 `AppState` 形状变更必须同步更新 `TECH_SPEC.md` §3。
- 任何产品边界变更必须同步更新 `PRODUCT_SPEC.md` §3。
- 文档与代码**不一致**视为 bug，需在同一 PR 修复。

---

## 4. 可安装性标准

### 4.1 PWA 清单

- [x] `manifest.json` 完整（name / short_name / icons / start_url / display / theme_color）
- [x] `sw.js` 注册成功（`main.tsx` 中 `navigator.serviceWorker.register`）
- [x] 图标三件套：192×192、512×512、512×512 maskable
- [x] HTTPS 部署（Vercel 默认）

### 4.2 离线行为

- 首次访问后，离线打开必须能进入今日卡。
- 离线状态下数据读写与在线一致（纯本地，无网络依赖）。
- SW 升级不丢用户数据（不缓存 `localStorage` 之外的写操作）。

### 4.3 安装提示

- 不弹"安装到主屏幕"提示（避免 PUA 模式）；用户自行从浏览器菜单添加。

---

## 5. 数据完整性标准

### 5.1 导入导出

- 导出：`exportState()` 生成的 JSON 必须是**自描述**的（包含 `version` 字段、未来可加 `schemaVersion`）。
- 导入：`importState(json)` 必须：
  - 对未知字段**容错**（不报错，保留原值）。
  - 对缺失字段**兜底**（用 `defaultXxxState`）。
  - 对类型错误**显式**失败（抛出可读错误信息）。
- 幂等：相同 JSON 二次导入结果一致。

### 5.2 重置

- "重置"必须二次确认（UI 层）。
- 重置后所有 `localStorage` 中的本应用 key 被清除，**不**残留 task/log/pet/peace 任何片段。

### 5.3 老用户 backfill

- 新增字段必须对老数据 backfill（例：`onboarded` 三态兼容、`pet` 默认值兜底）。
- 每次 backfill 必须有迁移单测。

---

## 6. 类型安全标准

### 6.1 编译

- `tsc --noEmit` 必须零错误。
- CI 中的 `typecheck` 步骤是合并门禁。

### 6.2 `any` 使用

- 默认禁止 `any`。
- 豁免场景（必须加行内注释说明）：
  - 第三方库类型缺失。
  - 与 `unknown` 联合的窄化过程中。
  - 测试桩。

### 6.3 关键类型不变量

以下不变量必须由**类型 + 单测**双重保证：

| 不变量 | 类型层面 | 测试层面 |
| --- | --- | --- |
| `PetState.affection` 只增不减 | 用 `readonly` 字段 + setter 限定 | 100 次操作后 `affection` 不下降 |
| `PeaceState.cards` ≤ 2 | 用 branded type 或 setter 限定 | 触发 +1 / -1 后仍 ≤ 2 |
| `Task` 一日内最多 1 张活跃 | 用 `useTasks` hook 封装 | 完成 1 张后 `tasks` 不再追加 |
| `Mood` 与 `moods[date]` 同步 | 联合类型 `Mood = 'down'\|'low'\|'okay'\|'gloomy'\|'hopeful'` | 任意写入路径都用合法 Mood |

---

## 7. 零 PUA 审计清单（Code Review 必查项）

每次 PR 合入前，reviewer 必须勾选：

- [ ] 没有新增弹窗（除"完成一朵云"反馈）
- [ ] 没有新增红点 / 徽章 / 通知
- [ ] 没有新增"连续 N 天"显眼展示
- [ ] 没有新增催促性文案（"你今天还没……" / "别忘了……" / "再坚持……"）
- [ ] 没有新增成就解锁动画
- [ ] 没有引入"积分 / 排名 / 对比"概念
- [ ] 没有引入推送 / 闹钟 / 系统通知

**任何一项打勾失败 → 拒绝合入。**

---

## 8. 零废话审计清单（文档 / Commit / CHANGELOG）

- [ ] CHANGELOG 用陈述句，不带形容词（"完成 1 张卡后再点'换一朵轻一点的'会生成第 2 张" ✅；"巧妙修复了一个令人惊艳的 bug" ❌）
- [ ] commit message 用祈使句（"fix: 防止完成卡后重复生成" ✅；"史诗级优化" ❌）
- [ ] 文档不出现"令人惊叹 / 革命性 / 完美 / 极致 / 行业领先"等词
- [ ] README 不放 emoji 作装饰
- [ ] 错误信息面向开发者，不面向用户夸张化（"localStorage 写入失败" ✅；"糟糕！出大事了！" ❌）

---

## 9. 性能验收（每次发版前）

- [ ] `npm run build` 产物 < 100 KB gzipped（首屏 JS）
- [ ] Lighthouse Performance ≥ 95
- [ ] Lighthouse Accessibility ≥ 95
- [ ] Lighthouse PWA = 100
- [ ] `prefers-reduced-motion` 下无任何强制动画

---

## 10. 发布门禁（人工）

发版前确认：

1. `CHANGELOG.md` 已更新本次变更。
2. `PRODUCT_SPEC.md` / `TECH_SPEC.md` 与代码一致。
3. `package.json` 版本号已 bump（语义化版本）。
4. CI 全绿。
5. 本地 `npm run preview` 在浏览器手测核心 5 流程（Onboarding / 今日卡 / 完成 / 天空 / 重置）。
6. 本节无未勾选。

---

## 11. 维护 SLA（个人版）

- **P0（数据丢失 / 无法打开）**：发现后 24 小时内修复。
- **P1（核心流程阻塞）**：发现后 7 天内修复。
- **P2（视觉 / 体验瑕疵）**：纳入下个版本。
- **P3（重构 / 优化）**：看心情。

无 24×7 on-call；无值班轮换；用户问题在 GitHub Issues 处理。
