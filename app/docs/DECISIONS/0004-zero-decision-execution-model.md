# ADR-0004: 产品模型转向 — one action per day → one visible action at a time

## Context

现模型(v0.1 起):一天一张当日行动卡,`MAX_TASKS_PER_DAY = 1`,完成即归档进
`history`,天空按 `log` 日期长云。它的优点是极致简单,但把系统锁死在
「每天只做一件事」上:用户脑子里同时有论文、高数作业、比赛代码、洗衣粉……
的时候,除了当天那一卡,其余事情没有入口。

v0.3 的用户调研与开源参考(CairnOS / DoubleDone / ADHD Daily Planner /
task-breakdown / Context Preserver)确认了真正的痛点:任务过载时
**不知道先碰哪一件**,而不是「每天只能做一件」。P1.5 的
`zeroDecisionEngine` 已具备 parseDump 结构化、意图阶梯、断点续接能力,
缺的是产品模型层面的松绑。

同时必须守住的不变铁律:反 PUA(pet 亲密度只增不减、不伪造 log、
禁羞辱文案)、本地优先(无账号、无云同步)、天空即世界。

## Decision

从「one action per day」升级为「one visible action at a time」:

- **任何时刻,屏幕上只有一个主动作**(Max Visible Actions = 1)——
  这是 Zero Decision 的硬约束,不变。
- **一天可以完成多个小动作**;完成一个后,用户可以选择离开,
  也可以拿下一个。屏幕永远不出现多选一。
- `useTasks.ts` 的 `MAX_TASKS_PER_DAY = 1` 在 P3.5 废弃,
  改为 `MAX_ACTIVE_ACTIONS = 1`(唯一可见动作,而非每日唯一动作)。
- P2 数据模型为**加法迁移**:新增 `projects` + `actionReceipts` + `resume`;
  **不存完整 steps 列表**(避免退化成 Todo App);
  `log / streak / history / pet / peace / atlas` 零改动。
- 天空兼容:`log` 继续按「当天有任意小动作完成」记录,
  历史每日云不丢;项目云(P4)由 `actionReceipts` 派生成长,无 XP、无百分比。
- P5 之前不接大模型;引擎保持纯本地规则,
  AI 只作为「自然语言 → 微任务候选」的可选增强。

本 ADR 修订 `SPEC.md §2.1`(今日页单卡循环)与 `PRODUCT_SPEC.md`
「一张最小的当日行动卡」的 Hard Boundary 表述——这是有计划的产品模型
升级,不是功能蔓延。

## Consequences

**正面:**

- 受众从「每天打卡一小步的人」扩到:学生 / 写论文 / 做项目 / 程序员 /
  自由职业 / 任务容易过载的人,产品特色(温柔、不 PUA、云朵世界观)不变。
- `actionReceipts`(真正完成过的小动作)成为数据护城河:
  它沉淀的是行为痕迹,不是待办清单。
- 引擎的「只给一个动作 + 带上下文 + 断点续接」与 ChatGPT 类对话形成
  结构性差异:对话给建议,我们给执行环境。

**代价 / 风险:**

- `TodayPage` 需要三态重构(P3):无任务(脑内卸载)/ 已生成动作(唯一动作卡)/
  刚完成(反馈 + 云变化);心情提问后移,未选过 mood 时默认 `mid`。
- 旧数据路径不变,但「一天一卡 → 一卡多动作」的心智转换需要在
  Onboarding / ChangelogOverlay 里交代(P3 范围)。
- 引擎质量成为产品命门:动作带不带用户上下文,直接决定
  「这我问 AI  不就行了」这道题——P1.5 的意图阶梯是对它的第一笔投资。
