# Changelog

## v0.2.1 — 2026-09-06 — 仓库治理

- **仓库精简为单项目**：twice_hand_system / llm-autoresearch-pipeline / _contest / 新建文件夹 / outputs / .obsidian_vault 移出 git 跟踪（本地文件保留），本仓库此后只承载 daily-zero-decision 应用
- **.gitignore 白名单化**：根目录默认忽略、仅放行 README/LICENSE/.github/vercel.json/app/，新增同级项目不再需要改 .gitignore；同时新增通用产物规则（*.zip / *.mp4 / *.pptx / node_modules / dist 等），重型媒体文件不再进入历史
- **CI 布局修复**：升级版 workflow（Node 20/22 矩阵、PR 全分支触发）从永不触发的 app/.github/ 子目录提升到根级 .github/workflows/
- **文档去重**：根级 6 份陈旧文档（SPEC / DATA_MODEL / DELIVERY_CHECKLIST / SECURITY / PRIVACY / CHANGELOG）移除，app/ 下同名文件为唯一事实来源；根 README 改写为准确的仓库结构说明
- **杂项清理**：app/PR_BODY.md（一次性 PR 描述）、app/.superpowers/（AI 工作状态，正式文档在 app/docs/superpowers/）移出跟踪
- 已知遗留：app/public/pet/ 下多张 1~1.3MB PNG 为运行必需资源，建议后续压缩（Sharp/squoosh）以减小构建产物

## v0.2.0 — 2026-06-23 — 企业级基线

### 新增（Round 1-4：45 个 bug 修复）

**Round 1 — 核心正确性（F1-F15）**
- F1: getToday/isYesterday 用本地时区组件（不再 UTC 跨天误读）
- F2: calculateStreak 用日历日差（修复 DST/25h-day 断 streak）
- F3: generateId 改用 crypto.randomUUID()（同 ms 不再冲突）
- F4: 删除 handleOnboardingFinish 双写 localStorage 竞态
- F5: Pomodoro 用 modeRef/onCompleteRef 避免闭包陷阱
- F6: usePet.rewardPetForCompletion 用 setState updater 守卫
- F7: usePeace.rewardCard 同日不重发 + lastRewardedDate 守卫
- F8: Celebration 改用 streak prop（绕过 loadState 风险消除）
- F9: saveState 抛 StorageQuotaError + App 顶部 banner
- F10: handleConfirmComplete 接受 taskId 参数（消除闭包陷阱）
- F11: getLastNDays 工具补齐缺失日历日
- F12: ShareCard shareText 经 sanitizeVisibleText 脱敏
- F13: 新增 ChangelogOverlay 可访问 modal（role/aria-modal/Escape）
- F14: SkyScene 改用 matchMedia 替代 resize 监听
- F15: importState 单→数组迁移（与 loadState 对称）

**Round 2 — F10/F1 回归 + a11y（F17-F21）**
- F17: handleConfirmComplete remaining-check 移到 setState updater
- F18: SkyPage 3 处 UTC → getToday()
- F19: FileReader.onerror 处理器
- F20: TodayDecisionCard 3 个主按钮 aria-label
- F21: handleEasier console.warn 改 alert

**Round 3 — a11y + void props + 抖动（F22-F33）**
- F22: PeaceCardInfoModal 加 role/aria-modal/Escape/focus trap
- F23: CloudSparkles 位置 useMemo 缓存（避免抖动）
- F24: 删 8 个 void props（TodayPage ↔ App.tsx 同步）
- F25: PetNameModal Escape 关闭 + aria-labelledby
- F26: SearchResults formatDate 时区解析（split 替代 new Date）
- F27: Cloud SVG id 改 React 18 useId（SSR-safe）
- F28: HeroSky streak 真正接入 sunGlow
- F29: SkyProgress 删除未用 today prop
- F30: PresetManager emoji 选择 + 编辑/删除按钮 aria-pressed/aria-label
- F32: SearchBar 删除 handleClear 双调 onSearch
- F33: TodayFeedbackStrip 补 streak/total 依赖

**Round 4 — 业务逻辑 + i18n + 资源（F34-F43）**
- F34: StatsPage today 改 getToday()（与全应用一致）
- F35: useStreak allHistoryTasks 加"只读合成视图"注释
- F36: achievements 仅统计 history 已完成任务
- F37: exportState Safari 延迟 revoke + try/catch ExportFailedError
- F38: SkyPet bump setTimeout 存 ref + cleanup
- F39: copy.ts QUOTES_BANK 提取（quoteOfDay/randomQuote 共享）
- F40: 删 SkyPage MOOD_CLOUD 死代码
- F41: SkyPet Tag: 'button' | 'div' 替代 any
- F42-F43: copy.ts 加 cloudTypeName + petGreeting + petStageHint

### 新增（Round 7 — 企业级基础设施）

- `.eslintrc.cjs` 启用 eslint-plugin-boundaries（依赖方向规则）
- `src/observability/` 全局可观测层：
  - `index.ts` — 单例 observability
  - `types.ts` — ObservabilityAdapter 接口
  - `adapters/ConsoleAdapter.ts` — 默认实现
  - `adapters/SentryAdapter.ts` — Round 10 实接的 stub
  - `ringBuffer.ts` — 最近 100 条事件/异常内存 buffer
- `src/error-boundary/ErrorBoundary.tsx` — role=alert + 重试 + observability
- App.tsx 顶层包裹 ErrorBoundary（app-root）
- 新增 8 个测试：ringBuffer (4) + ErrorBoundary (4)
- ARCHITECTURE.md + 3 个 ADR + CONTRIBUTING.md

### 修复（Round 7 实现期间发现）

- **CRITICAL**: StatsDashboard.tsx 在 early-return 之后调用 useMemo（4 处）→ 违反 React Hooks Rules
- **CRITICAL**: CloudGarden.tsx 在 early-return 之后调用 useState/useEffect → 违反 React Hooks Rules

### 文档

- 详细架构图谱（docs/ARCHITECTURE.md）
- 3 个 ADR 记录关键选型理由
- CONTRIBUTING.md 含提交流程 + 边界速查

### 测试

- 基线（v0.1.0）：37 测试
- v0.2.0：63 测试（+26 新增）
- 8 个测试文件

### 构建

- 84 → 88 modules
- bundle: 256 KB → 258 KB（+2 KB：observability + ErrorBoundary）

## 上线验收

- ✅ typecheck PASS
- ✅ 63/63 tests PASS
- ✅ build PASS
- ✅ 0 ESLint errors（21 warnings 历史遗留，下次清理）
