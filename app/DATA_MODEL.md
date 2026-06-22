# DATA MODEL

> 每日零决策卡（Daily Zero Decision / 养一片自己的天空）
> 文档版本：v1.0.0（与应用 v0.1.0 配套）
> 适用代码：`app/src/utils/storage.ts`

本文件是**唯一权威**的客户端数据契约。任何对 `localStorage` 中 `daily-zero-decision` key 的修改、schema 升级、字段新增，都必须先更新本文件再写代码。

---

## 1. 存储位置

- **介质**：浏览器 `localStorage`（同步、同源、5–10 MB 容量上限）
- **Key**：`daily-zero-decision`（字符串，固定不变）
- **值**：UTF-8 JSON 字符串（明文）
- **作用域**：当前 origin（部署域名 / `localhost`）

## 2. schemaVersion

- 字段名：`schemaVersion`
- 类型：`string`
- 当前值：`"1.0.0"`
- 位置：根级
- 升级规则：
  - **追加字段**（向后兼容）：minor + 1（如 `1.0.0` → `1.1.0`）
  - **删除 / 重命名字段**（不兼容）：major + 1（如 `1.0.0` → `2.0.0`）
  - **不兼容升级**时，`loadState` 必须保留旧 JSON 解析路径，并写一份迁移记录到 `migrationLog`

## 3. 根级字段

```ts
interface AppState {
  schemaVersion: string;        // 当前 "1.0.0"
  tasks: Task[];                // 用户主动创建的今日任务
  log: LogEntry[];              // 完成任务的全量流水
  streak: Streak;               // 连续天数
  settings: Settings;           // 偏好设置
  achievements: Achievement[];  // 解锁的成就
  history: Record<string, Task[]>; // 按 ISO 日期归档当日任务快照
  moods: Record<string, Mood>;  // 按 ISO 日期归档心情
  pomodoroSessions: number;     // 累计番茄钟次数
  onboarded: boolean;           // 是否完成过 Onboarding
  peace: PeaceState;            // 安心卡
  pet: PetState;                // 天空宠物（cloud_cat MVP）
  migrationLog?: MigrationEntry[]; // 不兼容升级时记录
}
```

## 4. 子结构

### 4.1 `Task`

```ts
interface Task {
  id: string;                   // uuid v4（生成于客户端）
  title: string;                // 用户输入，最长 80 字符
  type: 'reading' | 'exercise' | 'coding' | 'other';
  minutes?: number;             // 预估时长（分钟，0 < n ≤ 480）
  createdAt: string;            // ISO 8601 datetime
  completedAt?: string;         // ISO 8601 datetime，完成时写入
  source: 'onboarding' | 'manual' | 'preset' | 'import';
}
```

### 4.2 `LogEntry`

```ts
interface LogEntry {
  id: string;                   // uuid v4
  taskId: string;               // 关联 Task.id
  date: string;                 // ISO date (YYYY-MM-DD)
  completedAt: string;          // ISO 8601 datetime
  mood?: Mood;                  // 完成时选择的心情
}
```

### 4.3 `Streak`

```ts
interface Streak {
  current: number;              // 当前连续天数
  best: number;                 // 历史最高
  lastCompletedDate: string | null; // ISO date or null
}
```

### 4.4 `Settings`

```ts
interface Settings {
  defaultPagesPerSession: number;   // 阅读类任务每会话默认页数
  lastPageRead: number;             // 上次读到的页码
  lastBookName: string;             // 上次读的书名
  customPresets: Preset[];          // 用户自定义预设
}

interface Preset {
  id: string;
  title: string;
  type: Task['type'];
  minutes?: number;
}
```

### 4.5 `Achievement`

```ts
interface Achievement {
  id: string;                   // 成就 id，固定字符串
  unlockedAt: string;           // ISO 8601 datetime
}
```

### 4.6 `Mood`

```ts
type Mood = 'calm' | 'happy' | 'tired' | 'anxious' | 'proud';
```

### 4.7 `PeaceState`（安心卡）

```ts
interface PeaceState {
  cards: number;                // 当前持有张数
  protectedDates: string[];     // 被保护的 ISO date 列表
  lastRewardedDate: string | null;
}
```

### 4.8 `PetState`（云猫）

```ts
interface PetState {
  name: string;
  happiness: number;            // 0–100
  clouds: number;               // 累计云朵数
  variant: 'kitten' | 'cat' | 'elder';
  bornAt: string;               // ISO 8601 datetime
}
```

### 4.9 `MigrationEntry`

```ts
interface MigrationEntry {
  fromVersion: string;
  toVersion: string;
  at: string;                   // ISO 8601 datetime
  note: string;                 // 人类可读说明
}
```

---

## 5. 默认值（first-run state）

`loadState()` 在 localStorage 为空 / 解析失败 / 关键字段缺失时，回退到以下默认对象（来自 `storage.ts` 的 `defaultState`）：

```json
{
  "schemaVersion": "1.0.0",
  "tasks": [],
  "log": [],
  "streak": { "current": 0, "best": 0, "lastCompletedDate": null },
  "settings": {
    "defaultPagesPerSession": 10,
    "lastPageRead": 0,
    "lastBookName": "",
    "customPresets": []
  },
  "achievements": [],
  "history": {},
  "moods": {},
  "pomodoroSessions": 0,
  "onboarded": false,
  "peace": { "cards": 2, "protectedDates": [], "lastRewardedDate": null },
  "pet": { "name": "", "happiness": 50, "clouds": 0, "variant": "kitten", "bornAt": "" }
}
```

**新用户默认 2 张安心卡**（产品设计：让用户先放心）。

---

## 6. 导入 / 导出格式

### 6.1 导出

- 触发：用户点击 UI 中的「导出」按钮
- 实现：`exportState(state)`，将完整 `AppState` 用 `JSON.stringify(state, null, 2)` 序列化
- 触发浏览器下载：`<a download>` + Blob URL
- 文件名：`daily-cloud-backup-YYYY-MM-DD.json`（`getToday()` 为本地时区 ISO date）
- MIME：`application/json`

### 6.2 导入

- 触发：用户选择本地 JSON 文件
- 实现：`importState(json)`，先 `JSON.parse`，再做**最小校验**：
  - `Array.isArray(parsed.log)` 必须为真
  - `parsed.streak.current` 必须为 `number`
  - `onboarded` 兼容三态（`true` / `false` / 缺失）
- 失败处理：返回 `null`，UI 给出"备份格式不对"提示，**不抛错、不覆盖当前状态**
- 成功处理：返回归一化后的 `AppState`，调用方负责 `saveState` 持久化

### 6.3 文件示例（最小集）

```json
{
  "schemaVersion": "1.0.0",
  "tasks": [
    {
      "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "title": "读 10 页《置身事内》",
      "type": "reading",
      "minutes": 30,
      "createdAt": "2026-06-23T08:12:34.000Z",
      "completedAt": "2026-06-23T09:01:11.000Z",
      "source": "onboarding"
    }
  ],
  "log": [
    {
      "id": "1c2d3e4f-5a6b-7c8d-9e0f-1a2b3c4d5e6f",
      "taskId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "date": "2026-06-23",
      "completedAt": "2026-06-23T09:01:11.000Z",
      "mood": "calm"
    }
  ],
  "streak": { "current": 1, "best": 1, "lastCompletedDate": "2026-06-23" },
  "settings": {
    "defaultPagesPerSession": 10,
    "lastPageRead": 10,
    "lastBookName": "置身事内",
    "customPresets": []
  },
  "achievements": [],
  "history": { "2026-06-23": [] },
  "moods": { "2026-06-23": "calm" },
  "pomodoroSessions": 0,
  "onboarded": true,
  "peace": { "cards": 2, "protectedDates": [], "lastRewardedDate": "2026-06-23" },
  "pet": { "name": "云云", "happiness": 55, "clouds": 1, "variant": "kitten", "bornAt": "2026-06-23T08:00:00.000Z" }
}
```

---

## 7. 兼容与迁移策略

1. **新增字段**：在 `defaultState` 添加 + 在 `loadState` 做 `parsed.x = parsed.x ?? defaultState.x`，`schemaVersion` minor + 1
2. **字段重命名**：保留旧名解析 → 写到新名 → 删旧名，记入 `migrationLog`，`schemaVersion` major + 1
3. **删除字段**：解析时丢弃，记入 `migrationLog`，`schemaVersion` major + 1
4. **老用户 backfill**（H8 历史遗留）：`'other'` 类型任务若标题含「书/读/页/新词/单词/走/跑/运动/健身/瑜伽/代码/编程」关键词，会被改写为对应子类型
5. **`onboarded` 三态**（H9）：`true` 保留，`false` 保留，缺失走默认值

---

## 8. 容量与性能

- 5 MB 限额下，单用户连续打卡 10 年约产生 5–20 KB JSON，安全裕度充足
- `saveState` 不做节流（操作频次低），失败时 `console.warn` 不抛错
- 若未来超过 1 MB，需引入分页 / 归档策略并 major + 1

---

## 9. 不在本模型中

- **任何服务端数据** —— 本应用没有服务端
- **任何设备标识** —— 不收集
- **任何网络缓存 / IndexedDB** —— 不使用
- **任何用户账号字段**（email / phone / password）—— 不存在

---

## 10. 变更记录

| 版本 | 日期 | 变更 |
| --- | --- | --- |
| 1.0.0 | 2026-06-23 | 初始定义，与应用 v0.1.0 对齐 |
