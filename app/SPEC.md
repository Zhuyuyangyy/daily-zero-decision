# SPEC — 每日零决策卡 (Daily Zero-Decision Card)

> **本文件已被拆分为三个独立文档**。本入口保留作为目录与产品一句话定义。

---

## 0. 一句话

**每日零决策卡 = 一张最小的当日行动卡 + 一片会慢慢长出云的天空。**

把想坚持的事，变成今天能完成的一小步。完成这一小步，天空就多一朵云。

---

## 1. 文档结构

| 文件 | 回答的问题 |
| --- | --- |
| [`PRODUCT_SPEC.md`](./PRODUCT_SPEC.md) | 产品**是什么、不是什么**（边界、语气、Anti-Scope、Anti-PUA） |
| [`TECH_SPEC.md`](./TECH_SPEC.md) | 用**什么技术、为什么**（栈选型、数据模型、模块契约、性能预算） |
| [`DELIVERY_STANDARD.md`](./DELIVERY_STANDARD.md) | 什么算"**企业级可交付**"（可测试、可审计、可安装、零 PUA、零废话） |

阅读顺序建议：**PRODUCT_SPEC → DELIVERY_STANDARD → TECH_SPEC**。先理解产品边界，再看交付门槛，最后看实现。

---

## 2. 核心边界（速查）

- **做**：今日卡、天空花园、自然语言回顾、安心卡、天空宠物（cloud_cat MVP）、番茄钟（降级为可选小工具）。
- **不做**：账号、云端同步、社交、推送、积分、排行榜、数据看板、主题商城、跨应用集成。
- **绝不引入**：催办文案、红点徽章、连续天数显眼展示、奖励弹窗。

详见 `PRODUCT_SPEC.md` §3 Anti-Scope 与 §4 反 PUA 铁律。

---

## 3. 仓库结构

```
app/
├── SPEC.md                   ← 本文件（入口）
├── PRODUCT_SPEC.md           ← 产品定义
├── TECH_SPEC.md              ← 技术定义
├── DELIVERY_STANDARD.md      ← 交付标准
├── README.md                 ← 用户视角快速开始
├── CHANGELOG.md              ← 变更日志
├── src/                      ← 源码
├── public/                   ← 静态资源（含 PWA manifest + SW）
├── docs/                     ← 设计文档
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── .github/workflows/        ← CI
```

---

## 4. 维护约定

- 任何**产品边界**变更 → 同步更新 `PRODUCT_SPEC.md`，并在 PR 描述引用具体小节。
- 任何**技术选型**变更 → 同步更新 `TECH_SPEC.md`。
- 任何**交付门槛**变更（如新增门禁）→ 同步更新 `DELIVERY_STANDARD.md`。
- 三个文档互相引用时使用相对路径，不写绝对路径。

---

## 5. 许可证

MIT。详见仓库根 `LICENSE`。
