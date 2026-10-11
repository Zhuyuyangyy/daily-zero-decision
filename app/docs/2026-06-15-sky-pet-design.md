# Sky Pet — Design Spec

> 天空里的云猫：陪伴者，不是监工。

| | |
|---|---|
| **Date** | 2026-06-15 |
| **Status** | Draft (pending user review) |
| **Author** | Brainstorming session |
| **Project** | 每日零决策卡 · 养一片自己的天空 |

---

## 1. 定位

宠物是**住在天空里的陪伴者**。它看见你完成了一小步，仅此而已。

**主角顺序**（不破就不破调性）：

1. 今日最小行动卡（第一主角）
2. 完成后长出的云（第二主角）
3. 天空宠物（第三主角）

**宠物会做的**：陪伴 · 回应 · 见证 · 安慰 · 轻微成长 · 提供情绪反馈

**宠物绝不做的**（反 PUA 红线，触发任一条即回滚）：

- 催你 · 责怪你 · 因漏签生病 · 死亡
- 饥饿值 · 付费 · 抽卡 · 排行榜 · 装备
- 强通知 · 任务派发 · 偷懒惩罚
- 任何亲密度**下降**

---

## 2. 物种与视觉

### 2.1 物种

**云猫 (cloud_cat)** —— MVP 唯一物种，未来可扩。

设计关键词：

- 白色 / 奶油色（`#FFF9F2` 主体渐变）
- 圆润、像云一样软、低细节
- 小耳朵、尾巴像一缕云
- 不拟人化、无衣服、无强表情
- **不用**：二次元、Live2D、骨骼动画、强商业 IP 感

### 2.2 尺寸

| 位置 | 移动端 | 桌面端 |
|---|---|---|
| TodayPage | 64–76px | 80–96px |
| SkyPage | 96–120px | 96–120px |

### 2.3 6 个 mood → 视觉态

| mood | 姿态 | 触发条件 |
|---|---|---|
| `idle` | 静坐云边，呼吸 | 默认 |
| `waiting` | 望今日卡方向，眨眼 | 今天没卡 |
| `encouraging` | 看着卡片，小幅身体倾向 | 有卡未完成 |
| `celebrating` | 小跳 0.8s + 星星粒子 | 已完成今日卡 |
| `resting` | 抱小毯子坐月亮旁 | 安心卡保护昨日 |
| `sleeping` | 闭眼卷起 | （预留，MVP 暂不触发） |

### 2.4 动效约束

- 呼吸：4s/次
- 眨眼：8–12s 随机
- 庆祝小跳：0.8s
- `prefers-reduced-motion: reduce` → 全部禁用，只切换静态姿态

### 2.5 可点交互

点击云猫 → 眨眼 + 摇尾巴 + 气泡切到 `greeting` 系列（"你来啦 / 嗯，我在 / 今天也轻一点"）。

**不奖励亲密度**（避免用户为刷亲密度而点）。

---

## 3. 数据模型

### 3.1 `types.ts` 新增

```ts
export type PetMood =
  | 'idle'
  | 'waiting'
  | 'encouraging'
  | 'celebrating'
  | 'resting'
  | 'sleeping';

export type PetSpecies = 'cloud_cat';

export interface PetState {
  enabled: boolean;
  species: PetSpecies;
  name: string;                // 默认 "小云"，用户最多 8 字
  affection: number;           // 只增不减
  firstMetAt: string | null;   // ISO date
  lastInteractionAt: string | null;
  lastRewardDate: string | null;  // 防同日重复 +1
  mood: PetMood;
  renamed: boolean;
}
```

### 3.2 `AppState` 增字段

```ts
export interface AppState {
  // ... existing
  pet: PetState;
}
```

### 3.3 `defaultPetState`

```ts
export const defaultPetState: PetState = {
  enabled: true,
  species: 'cloud_cat',
  name: '小云',
  affection: 0,
  firstMetAt: null,
  lastInteractionAt: null,
  lastRewardDate: null,
  mood: 'idle',
  renamed: false,
};
```

### 3.4 storage migration（防白屏）

`utils/storage.ts` 解析时：

```ts
pet: { ...defaultPetState, ...(parsed.pet || {}) }
```

旧 localStorage 没有 `pet` 字段时，自动补默认，**不白屏**。

### 3.5 成长阶段

```ts
export function getPetStage(affection: number): 'new' | 'familiar' | 'trusted' {
  if (affection >= 14) return 'trusted';
  if (affection >= 5)  return 'familiar';
  return 'new';
}
```

| 阶段 | affection | 表现 |
|---|---|---|
| `new` | 0–4 | 静坐云边 |
| `familiar` | 5–13 | 靠近今日卡，偶尔眨眼 |
| `trusted` | 14+ | 完成后会抱住新长出的云 |

**不展示数字给用户**（只展示阶段名或图标）。

---

## 4. 成长与互动规则

### 4.1 亲密度 +1 触发（每日封顶 1）

- 完成今日卡 → +1（`lastRewardDate === today` 时跳过）
- 连续 3 天回来 → 额外 +1
- 首次改名 → +1

### 4.2 亲密度 +0 触发（不奖励，不惩罚）

- 漏签
- 安心卡保护日
- 点宠物打招呼
- 打开回顾页

### 4.3 mood 自动切换

```ts
function deriveMood({
  hasCurrentTask,
  todayCompleted,
  protectedYesterday,
}): PetMood {
  if (protectedYesterday) return 'resting';
  if (todayCompleted)      return 'celebrating';
  if (hasCurrentTask)      return 'encouraging';
  return 'waiting';
}
```

### 4.4 Onboarding 节奏

1. 用户生成第一张今日卡 → 云猫轻入
2. 用户完成该卡 → 庆祝 + 弹"要给它取个名字吗？"
3. 改名 +1 → 亲密度从 0 → 1
4. 累计 5 次完成 → 进入 `familiar` 阶段

**Onboarding 不增加复杂步骤**（不问"养猫还是养狗"、"性格"等）。

---

## 5. 组件结构

```
app/src/components/pet/
  ├── SkyPet.tsx              # 视觉主组件
  ├── SkyPet.css              # 6 个 mood + reduced-motion
  ├── PetBubble.tsx           # 气泡文案
  ├── PetBubble.css
  ├── PetNameModal.tsx        # 改名弹窗（首交 + 设置页入口）
  ├── PetNameModal.css
  ├── PetStatusChip.tsx       # "它叫小云 · 亲密度 3"
  └── PetStatusChip.css

app/src/hooks/
  └── usePet.ts               # renamePet / rewardPetForCompletion /
                              # markPetMet / pickPetLine / deriveMood
```

### 5.1 SkyPet 接口

```ts
interface SkyPetProps {
  pet: PetState;
  todayCompleted: boolean;
  hasCurrentTask: boolean;
  protectedYesterday?: boolean;
  reducedMotion?: boolean;
  onClick?: () => void;
}
```

### 5.2 气泡渲染规则

`PetBubble` 接收 `mood: PetMood | 'greeting'`，从 `PET_LINES[mood]` pick 一条；**若数组为空（idle / sleeping），返回 `null`，不渲染 DOM**。

### 5.3 气泡文案（统一收口，遵循 `copy.ts` 原则）

```ts
export const PET_LINES: Record<PetMood | 'greeting', readonly string[]> = {
  waiting: [
    '今天还没开始也没关系。',
    '我在云边等你慢慢来。',
    '先把它变成一小步吧。',
  ],
  encouraging: [
    '不用急，今天只要这一小步。',
    '我陪你做完这张卡。',
    '做一点点也算数。',
  ],
  celebrating: [
    '我看到啦，今天的云长出来了。',
    '这一步很小，但真的发生了。',
    '天空又多了一点点光。',
  ],
  resting: [
    '昨天休息了也没关系。',
    '天空没有责怪你。',
    '今天回来就很好。',
  ],
  sleeping: [
    '它睡得正香，不打扰它。',
  ],
  greeting: [
    '你来啦。',
    '嗯，我在。',
    '今天也轻一点。',
  ],
  // idle / sleeping 暂不展示气泡；空数组在 PetBubble 中渲染为 null
  idle: [],
  sleeping: [],  // 已在上面定义；占位以防扩展
};
```

文案铁律（任何 PR 触发任意一条即回滚）：

```
"你怎么还没完成？"
"宠物快饿了"
"再不来就断了"
"宠物很失望"
"不要偷懒"
"立即领取"
"宠物排行榜"
```

---

## 6. UI 放置

### 6.1 TodayPage SkyScene 内

层级（低 → 高）：

```
SkyBackground
Sun / Moon
Mountains
CloudAtmosphere
CloudGarden
SkyPet              ← 这里
GrassLine
ForegroundFade
```

- 移动端：右下云边，距 `grassLine` 16px
- 桌面端：右侧中下，不贴边
- **不得挡住主标题、不得挡住今日卡主体**

### 6.2 SkyPage

- 云猫坐在云朵上端
- 96–120px（移动 / 桌面同尺寸）
- 纯静态，hover 时尾巴轻摆（reduced-motion 禁用）
- 气泡在 hover 时短暂显示 2s

### 6.3 回顾页

自然语言总结卡底部加一句：

```
小云说：这周你回来 5 天，已经很不容易了。
```

**不评判**：

```
× "小云觉得你本周表现一般"
```

### 6.4 设置页

新增 1 行：

```
天空宠物
名字：小云  [修改]
显示天空宠物：开 ●
```

---

## 7. usePet Hook

```ts
interface UsePetResult {
  pet: PetState;
  petLine: string;            // 今日气泡（每次重渲染重新 pick）
  renamePet: (name: string) => void;
  rewardPetForCompletion: () => void;
  markPetMet: () => void;
}
```

### 7.1 关键实现

```ts
const renamePet = (name: string) => {
  const safe = name.trim().slice(0, 8);
  if (!safe) return;
  setState(prev => ({
    ...prev,
    pet: {
      ...prev.pet,
      name: safe,
      renamed: true,
      affection: prev.pet.renamed ? prev.pet.affection : prev.pet.affection + 1,
      lastInteractionAt: todayISO(),
    },
  }));
};

const rewardPetForCompletion = () => {
  if (state.pet.lastRewardDate === todayISO()) return;  // 防重
  setState(prev => ({
    ...prev,
    pet: {
      ...prev.pet,
      affection: prev.pet.affection + 1,
      mood: 'celebrating',
      lastRewardDate: todayISO(),
      lastInteractionAt: todayISO(),
    },
  }));
};
```

### 7.2 与 useTasks 协同

```ts
function handleCompleteTask(taskId: string) {
  // 现有逻辑...
  const task = state.tasks.find(t => t.id === taskId);
  if (!task || task.completedAt) return;

  // ...原 completeTask 行为

  // 触发宠物奖励
  if (state.pet.lastRewardDate !== todayISO()) {
    rewardPetForCompletion();
  }
}
```

**奖励只触发一次/天**，防页面重复点击导致暴涨。

---

## 8. 与安心卡的连接

```ts
// 安心卡自动保护昨日时
pet.mood = 'resting';
// 不增加 affection
// 不生成假云
// 不显示假任务
```

回顾页文案：

```
昨天你休息了，安心卡保护了天空。
小云在云边等你回来。
```

---

## 9. 无障碍

- 装饰态：`<div aria-hidden="true">`
- 可点击：`<button aria-label="查看天空宠物小云">`
- 气泡字号 ≥ 12px
- 对比度满足 WCAG AA
- 动画遵守 `prefers-reduced-motion`

---

## 10. CSS 命名

```css
.sky-pet
.sky-pet--idle
.sky-pet--waiting
.sky-pet--encouraging
.sky-pet--celebrating
.sky-pet--resting
.sky-pet--sleeping
.sky-pet__body
.sky-pet__tail
.sky-pet__bubble
.sky-pet__shadow
```

reduced-motion：

```css
@media (prefers-reduced-motion: reduce) {
  .sky-pet,
  .sky-pet__body,
  .sky-pet__tail {
    animation: none !important;
    transform: none !important;
  }
}
```

---

## 11. 测试清单

### 11.1 新用户

```
清空 localStorage
打开 App
生成第一张今日卡 → 看到云猫
完成 → 庆祝 + 弹改名弹窗
改名 "豆豆" → 保存
affection = 1
```

### 11.2 老用户

```
旧 localStorage 无 pet 字段
打开 App
自动补 pet 默认状态
不白屏
```

### 11.3 重复完成

```
完成今日卡 → affection +1
刷新
再次点完成态 → 亲密度不重复
```

### 11.4 改名

```
"小云朵" → 保存
空字符串 → 不保存
超长 → 截断到 8 字
```

### 11.5 关闭宠物

```
设置页关闭 → TodayPage/SkyPage 不显示
重新开启 → 恢复（名字保留）
```

### 11.6 安心卡

```
模拟昨日漏签 → 安心卡保护
云猫显示 resting
affection 不变
回顾页显示"昨天你休息了..."
```

### 11.7 reduced-motion

```
系统开启减少动态
云猫不跳、不飘、无粒子
功能可用
```

### 11.8 文案反 PUA

```
grep -r "宠物.*饿\|快回来\|失望\|催促" app/src/components/pet/ app/src/hooks/usePet.ts
→ 必须 0 匹配
```

### 11.9 原测试不退化

```
npm test
→ 24 个原测试全过
→ 新增 pet 测试全过
```

---

## 12. 实施步骤（建议 7 个 commit）

```
1. feat(pet): add PetState, defaultPetState, storage migration
2. feat(pet): add usePet hook (renamePet, rewardPetForCompletion, markPetMet)
3. feat(pet): add SkyPet, PetBubble, PetNameModal, PetStatusChip
4. feat(today): render SkyPet in TodayPage SkyScene
5. feat(sky): render SkyPet in SkyPage
6. feat(settings): pet rename + visibility controls
7. feat(review): add gentle pet recap line
8. test(pet): add pet QA checklist tests
```

---

## 13. 最终验收（10 条铁律）

1. ✅ 宠物不抢今日卡主角
2. ✅ 宠物不制造焦虑
3. ✅ 宠物不惩罚漏签
4. ✅ 宠物不伪造完成记录
5. ✅ 宠物完成后只做轻庆祝
6. ✅ 宠物能被关闭（数据保留）
7. ✅ 宠物名字能修改（≤8 字）
8. ✅ reduced-motion 下无强动画
9. ✅ 旧数据能平滑迁移
10. ✅ README/SPEC 明示宠物是**陪伴者，不是监工**

---

## 14. 范围外（本轮不做）

- 宠物商店
- 付费 / 抽卡 / 稀有度
- 饥饿 / 生命值 / 死亡 / 生病
- 复杂养成数值
- 多宠物切换
- 排行榜
- 强通知
- 复杂 Live2D / 骨骼动画

---

## 15. 哲学总结

> 宠物不是来让用户更焦虑地打卡的。
> 宠物是来告诉用户：
> **你今天做的一小步，我看见了。**
