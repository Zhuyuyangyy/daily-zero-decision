# TECH_SPEC — 每日零决策卡

> 与 `PRODUCT_SPEC.md` 配对：本文档只回答**"用什么技术、为什么"**。产品边界、语气、排除项见 `PRODUCT_SPEC.md`。

---

## 1. 技术栈总览

| 层级 | 选型 | 理由 |
| --- | --- | --- |
| 框架 | **React 18 + TypeScript 5** | 类型安全是"企业级可审计"的前置条件 |
| 构建 | **Vite 5** | 冷启动快、原生 ESM、`base: './'` 便于子路径部署 |
| 样式 | **Tailwind CSS 3** | 工具类 + 设计 token；与软圆 3D 主题契合 |
| 测试 | **Vitest + Testing Library + jsdom** | 与 Vite 同源、零配置 |
| 持久化 | **`localStorage`** | 无后端、单设备、隐私优先 |
| 离线 | **Service Worker + manifest (PWA)** | 已就绪（`public/manifest.json`, `public/sw.js`） |
| 数据格式 | **JSON in `localStorage`** | 单一根 key，结构可演进（见 §5） |
| 状态管理 | **`useState` + `useReducer` + 自定义 hooks** | 状态规模小，无须 Redux/Zustand |
| 路由 | **状态机式页面切换**（非 URL 路由） | 单页 App，4 个页面用条件渲染 |
| 监控 | **`window.onerror` 最小监控** | 不接 Sentry / 第三方，避免外部依赖 |

**显式不引入**：

- ❌ 后端（Node/Express/FastAPI/任何）
- ❌ 数据库（SQLite/IndexedDB/任何）
- ❌ 状态管理库（Redux/Zustand/MobX）
- ❌ UI 组件库（Material UI / Ant Design / shadcn）
- ❌ 国际化框架（仅中文）
- ❌ 第三方监控 / 分析 SDK
- ❌ 任何需要 API key 的服务

---

## 2. 项目结构

```
app/
├── public/                    # 静态资源
│   ├── manifest.json         # PWA manifest
│   ├── sw.js                 # Service Worker
│   ├── icons/                # 应用图标（192/512/maskable）
│   └── pet/                  # 天空宠物素材
├── src/
│   ├── App.tsx               # 根组件
│   ├── main.tsx              # 入口
│   ├── index.css             # 全局样式 + 兜底 reduced-motion
│   ├── types.ts              # 全局类型定义（Task/AppState/PeaceState/PetState）
│   ├── pages/                # TodayPage / SkyPage / StatsPage / SettingsPage
│   ├── components/           # 纯展示组件
│   │   ├── pet/ premium/ search/ shared/ sky/ stats/ task/ today/ ui/
│   ├── features/             # 业务特性（premium/）
│   ├── hooks/                # useAppState / useTasks / usePeace / usePet / useStreak / usePomodoro / useFont / useSearch / useReducedMotion
│   ├── utils/                # storage / cloudSeed / skyMood / cloudGardenMood / achievements / copy
│   ├── theme/                # 主题 token
│   └── test/                 # Vitest setup
├── docs/                     # 设计文档（sky-pet-design.md）
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json / tsconfig.node.json
├── vite.config.ts
├── .github/workflows/        # CI（typecheck + test + build）
├── vercel.json (仓库根)       # 部署配置
├── PRODUCT_SPEC.md           # 本目录
├── TECH_SPEC.md              # 本文件
└── DELIVERY_STANDARD.md
```

---

## 3. 数据模型（单根 `localStorage`）

### 3.1 根 key

```
daily-zero-decision:state   →   JSON.stringify(AppState)
```

### 3.2 `AppState` 形状（`src/types.ts`）

```typescript
interface AppState {
  tasks: Task[];                           // 当前活跃任务
  log: string[];                           // 完成日志（date 数组）
  streak: { current: number; best: number; lastCompletedDate: string | null };
  settings: { defaultPagesPerSession: number; lastPageRead: number; lastBookName: string; customPresets: Preset[] };
  achievements: string[];                  // 实际不显示，仅作占位
  history: Record<string, Task[]>;         // date → 已完成任务
  moods: Record<string, Mood>;             // date → mood
  pomodoroSessions: number;
  onboarded: boolean;                      // 'true' | 'false' | 三态兼容老用户
  peace: { cards: number; protectedDates: string[]; lastRewardedDate: string | null };
  pet: PetState;                           // cloud_cat MVP
}
```

### 3.3 演进规则

- **加字段**：默认缺失即用 `defaultXxx()` 兜底（见 `defaultPetState`）。
- **改字段名**：通过版本号迁移（`SCHEMA_VERSION`，待引入）。
- **删字段**：保留 key 但忽略读取，N 个版本后清理。
- 严禁修改 `localStorage` 之外的持久化（不接 IndexedDB、不接 SessionStorage 备份）。

---

## 4. 关键模块契约

### 4.1 存储层 `utils/storage.ts`

| 函数 | 职责 | 错误处理 |
| --- | --- | --- |
| `loadState(): AppState \| null` | 读取并校验；失败返回 `null` | JSON 损坏 → 返回 `null` + `console.warn` |
| `saveState(state: AppState): void` | 写入 + 版本号 | 写入失败 → `window.onerror` 兜底 |
| `importState(json): AppState` | 用户导入；老用户 backfill | 缺字段 → 用默认值补；类型不匹配 → 抛错并提示 |
| `exportState(): string` | 导出 JSON | 始终成功 |
| `resetState(): void` | 清空 + 二次确认 | 二次确认由 UI 层负责 |

### 4.2 任务层 `hooks/useTasks.ts`

- 不直接操作 `localStorage`；所有 mutation 通过 `useAppState` 派发。
- 关键守卫：
  - `handleEasier` MAX 守卫：单卡最多换 1 次轻量卡。
  - `parseTaskFromInput` 支持 6 种时间表达用例。
  - 完成 1 张卡后**不再**生成第 2 张。

### 4.3 天空层 `hooks/usePet.ts` + `components/sky/`

- `PetState.affection` **只增不减**（在 `usePet.ts` 内由类型 + 单测共同保证）。
- `mood` 派生自 `tasks` + `log` + `peace`，不存储。
- `SkyScene` 支持 `density` / `variant` / `reduced-motion` 三参数。

### 4.4 安心卡 `hooks/usePeace.ts`

- `cards` 硬上限 2（类型 + 单测）。
- 保护日**不**写入 `log`（关键反作弊点）。
- 奖励触发：每 7 天连续完成奖励 1 张（最多 2）。

---

## 5. 性能预算

| 指标 | 预算 |
| --- | --- |
| 首屏 JS（gzipped） | < 100 KB |
| 首屏 LCP（本地） | < 1.5 s |
| TTI（本地） | < 2.0 s |
| 切页动画 | < 300 ms（`prefers-reduced-motion` 时禁用） |
| `localStorage` 体积 | < 50 KB（一个用户三年的数据都远低于此） |

如超出预算，必须在 PR 描述中说明并由 `DELIVERY_STANDARD.md` §4 验收。

---

## 6. PWA / 离线

- `manifest.json` 已配置（standalone、portrait、theme `#4AB574`）。
- `sw.js` 提供离线缓存（仅静态资源，不缓存用户数据）。
- 安装入口：浏览器地址栏"添加到主屏幕"。
- **不**做应用商店分发（iOS / Android 原生包），保持零分发成本。

---

## 7. CI / CD

`.github/workflows/` 内置三段式：

```yaml
- name: typecheck
  run: npm run typecheck
- name: test
  run: npm test
- name: build
  run: npm run build
```

- 所有 PR 必须三段全绿。
- 部署：仓库根 `vercel.json` 指向 `app/` 目录，Vercel 自动部署。
- 不接 staging 环境（产品无后端、无环境差异）。

---

## 8. 浏览器兼容

| 浏览器 | 支持等级 |
| --- | --- |
| Chrome / Edge 最新两个大版本 | 完整支持 |
| Safari 16+ (macOS / iOS) | 完整支持 |
| Firefox 最新两个大版本 | 完整支持 |
| IE 11 / 旧版 Edge | **不**支持（用户基数 < 0.1%，不值得 polyfill） |

---

## 9. 安全与隐私

- **无网络请求**：静态资源以外的所有数据均在本地。
- **无第三方 SDK**：不接 GA / Sentry / 任何追踪。
- **无 cookie**：纯 `localStorage`。
- **导入导出**：纯文本 JSON，用户控制。
- **XSS 防护**：React 18 默认转义；不使用 `dangerouslySetInnerHTML`。
- **CSP**：`index.html` 建议加 `default-src 'self'`（待补，由 `DELIVERY_STANDARD.md` §6 追踪）。

---

## 10. 演进原则

1. **数据本地优先**：任何新功能都先问"必须联网吗？"，答"否"才动手。
2. **可单测优先**：纯函数 > 有状态组件；hooks 逻辑抽出到 `utils/` 后单测。
3. **可审计优先**：每个状态变更路径必须有日志可追（`window.onerror` + 关键 mutation 埋点）。
4. **反 PUA 优先**：见 `PRODUCT_SPEC.md` §4。如新功能引入焦虑驱动元素，**禁止合入**。
