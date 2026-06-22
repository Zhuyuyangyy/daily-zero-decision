# Data Model

> **每日零决策卡 · 养一片自己的天空** — Schema reference.

## TL;DR

One JSON object. One `localStorage` key (`daily-zero-decision`). No database, no network, no sync. The export file is this exact object, pretty-printed, with today's date in the filename.

---

## Storage location

| Where | Key | Encoding |
|---|---|---|
| Browser `localStorage` | `daily-zero-decision` | UTF-8 JSON |
| Export file (when you tap Export) | `daily-cloud-backup-YYYY-MM-DD.json` | UTF-8 JSON, 2-space indented |

The export file is **byte-for-byte the same shape** as the `localStorage` value. You can rename it, edit it in a text editor, and re-import it — assuming you keep the schema valid.

---

## Schema version

```json
{
  "schemaVersion": "0.1.0"
}
```

Field name: **`schemaVersion`** (string, semver).

- **`0.1.0`** — initial schema (current).
- Older exports missing `schemaVersion` are treated as `0.0.x` and migrated forward in `app/src/utils/storage.ts` (`importState`).
- Newer exports are validated against this document; unknown fields are preserved on round-trip but ignored by current code (forward-compat).

---

## Top-level shape

```ts
interface AppState {
  schemaVersion?: string;   // "0.1.0" — added 2026-06-22, optional in older exports
  tasks: Task[];            // active (not-yet-completed) tasks for today
  log: string[];            // ISO local-date strings (YYYY-MM-DD), one per day with a completion
  streak: StreakState;
  settings: Settings;
  achievements: string[];   // unlocked achievement IDs
  history: Record<string, Task[]>;  // YYYY-MM-DD → tasks completed that day
  moods: Record<string, Mood>;     // YYYY-MM-DD → mood tag
  pomodoroSessions: number;
  onboarded: boolean;
  peace: PeaceState;
  pet: PetState;
}
```

## Field reference

### `Task`

```ts
interface Task {
  id: string;                 // base36: Date.now().toString(36) + random
  title: string;              // free text, user-typed
  type: 'reading' | 'exercise' | 'coding' | 'other';
  bookName?: string;          // present if type === 'reading'
  currentPage?: number;
  pagesPerSession?: number;
  startPage?: number;
  endPage?: number;
  place?: string;             // e.g. "home", "cafe"
  time?: string;              // free text, e.g. "15 分钟"
  note?: string;              // user note
  createdAt: string;          // ISO 8601 timestamp
  completedAt?: string;       // ISO 8601 timestamp, set on completion
}
```

### `StreakState`

```ts
interface StreakState {
  current: number;            // current consecutive-day count
  best: number;               // all-time best
  lastCompletedDate: string | null;  // YYYY-MM-DD or null
}
```

### `Settings`

```ts
interface Settings {
  defaultPagesPerSession: number;  // default 10
  lastPageRead: number;            // default 0
  lastBookName: string;            // default ""
  customPresets: Preset[];         // user-defined quick-add shortcuts
}

interface Preset {
  id: string;
  label: string;             // shown on button
  icon: string;              // emoji or short text
  value: string;             // the string that gets parsed into a Task
}
```

### `Mood`

```ts
type Mood = 'down' | 'low' | 'okay' | 'gloomy' | 'hopeful';
```

Stored as a per-day record: `moods["2026-06-22"] = "hopeful"`. Days without an entry simply have no key.

### `PeaceState` (安心卡 system)

```ts
interface PeaceState {
  cards: number;                  // count, capped at 2
  protectedDates: string[];       // YYYY-MM-DD entries the user has shielded
  lastRewardedDate: string | null;
}
```

### `PetState` (天空宠物 / cloud_cat MVP)

```ts
type PetSpecies = 'cloud_cat';
type PetMood =
  | 'idle'         // resting on a cloud edge
  | 'waiting'      // blinking at today's card
  | 'encouraging'  // leaning toward an incomplete card
  | 'celebrating'  // small jump + star particles
  | 'resting'      // holding a blanket by the moon
  | 'sleeping';    // reserved, not yet triggered

interface PetState {
  enabled: boolean;
  species: PetSpecies;
  name: string;                       // user-chosen, max 8 chars
  affection: number;                  // monotonically non-decreasing
  firstMetAt: string | null;          // ISO 8601
  lastInteractionAt: string | null;   // ISO 8601
  lastRewardDate: string | null;      // YYYY-MM-DD, prevents same-day +1
  mood: PetMood;
}
```

The pet's affection is **monotonically non-decreasing** — we never lower it. This is the "anti-PUA" invariant: the sky and the pet never punish you.

### `Achievements`

A list of unlocked IDs:

```ts
type AchievementId =
  | 'first-cloud'   // 完成第一次打卡
  | 'streak-7'      // 连续打卡 7 天
  | 'streak-30'     // 连续打卡 30 天
  | 'total-100'     // 累计打卡 100 天
  | 'bookworm'      // 累计完成 50 次阅读任务
  | 'runner'        // 累计完成 30 次运动任务
  | 'geek';         // 累计完成 50 次编码任务
```

Display metadata (icon, title, description) is **not** stored in the export — it's hardcoded in `app/src/utils/achievements.ts`. This keeps exports small and lets us localize copy without breaking user data.

---

## Export format

When you tap **Export Backup**, the app writes a file like:

```
daily-cloud-backup-2026-06-22.json
```

Contents:

```json
{
  "schemaVersion": "0.1.0",
  "tasks": [ ... ],
  "log": ["2026-06-20", "2026-06-21", "2026-06-22"],
  "streak": { "current": 3, "best": 12, "lastCompletedDate": "2026-06-22" },
  "settings": { ... },
  "achievements": ["first-cloud", "streak-7"],
  "history": {
    "2026-06-22": [ ... ],
    "2026-06-21": [ ... ]
  },
  "moods": {
    "2026-06-22": "hopeful",
    "2026-06-21": "okay"
  },
  "pomodoroSessions": 7,
  "onboarded": true,
  "peace": { "cards": 2, "protectedDates": [], "lastRewardedDate": "2026-06-22" },
  "pet": { ... }
}
```

### How to export

1. Open the app.
2. Settings tab → **Export Backup**.
3. Your browser saves the JSON to your default download location.

### How to import

1. Open the app.
2. Settings tab → **Import Backup** → pick a JSON file.
3. The app validates, migrates if needed, and merges into `localStorage`.

### What import does NOT do

- It does **not** contact any server.
- It does **not** verify the file's origin (no signature, no checksum) — it's a plain JSON file. **Don't import a file you didn't create yourself**, the same way you wouldn't `eval()` an untrusted script.
- It does **not** preserve display metadata (achievement icons, etc.) — those come from the bundled code.

---

## Migration policy

When we bump the schema:

- **Additive changes** (new optional field) → silently accepted, default value applied on next save.
- **Renames / moves** → handled in `loadState()` and `importState()` in `app/src/utils/storage.ts`. Old keys are mapped to new keys on read.
- **Removals** → the field is ignored on import, dropped on next save.
- **Breaking changes** → major version bump in `schemaVersion` and a documented migration step in `CHANGELOG.md`.

The migration code is intentionally boring and explicit — no fancy transforms, no implicit defaults that could hide data loss.

---

## Date handling

All dates are **local time**, formatted as `YYYY-MM-DD`. We deliberately do **not** use ISO 8601 with a `Z` suffix or epoch milliseconds for day-level fields, because:

- A streak is a calendar-day concept, not an instant.
- UTC dates would shift across midnight in non-UTC timezones and break streaks.

Timestamps for `createdAt`, `completedAt`, `firstMetAt`, `lastInteractionAt` are ISO 8601 with the local offset (e.g. `2026-06-22T09:15:00+08:00`), not UTC.

---

## Privacy summary

For the full privacy story, see [`PRIVACY.md`](./PRIVACY.md). For security commitments and how to audit them, see [`SECURITY.md`](./SECURITY.md).

---

_Last updated: 2026-06-22. Schema: `0.1.0`._