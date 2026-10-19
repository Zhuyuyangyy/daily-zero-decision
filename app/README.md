# 每日零决策卡 ☁️

> 每天不知道从哪开始？
> 把想坚持的事，变成今天能完成的一小步。
> 完成这一小步，你的天空就多一朵云。

这不是 Todo，不是番茄钟，也不是习惯统计器。
它每天帮你把想坚持的事，压成一张小到不会抗拒的行动卡。

## 功能

- **今日卡**：把想坚持的事变成最小行动
- **我的天空**：完成后长出一朵云
- **统计**：连续天数、成就与坚持数据的温和回顾
- **回顾**：用自然语言看见自己慢慢坚持
- **设置**：字体、数据导入导出、重置

## 可选小工具

- **番茄钟**：需要时开始计时，不打扰主流程。
- **心情便签 / 天空宠物 / 分享卡**：均为可选装饰，不影响主流程。

## 快速开始

### 环境要求

- Node.js 20+
- npm

### 安装与开发

```bash
cd app
npm install
npm run dev          # http://localhost:5173
```

### 测试与构建

```bash
npm test             # 运行所有测试
npm run typecheck    # TypeScript 类型检查
npm run build        # → dist/
```

## 技术栈

- React 18 + TypeScript
- Vite 5
- Tailwind CSS
- Vitest + Testing Library
- Dexie（IndexedDB）+ Zod（schema 校验）—— 见 `docs/DECISIONS/0001`

## 文档

- [SPEC.md](SPEC.md) — 文档入口与核心边界
- [PRODUCT_SPEC.md](PRODUCT_SPEC.md) — 产品定义
- [TECH_SPEC.md](TECH_SPEC.md) — 技术定义
- [DELIVERY_STANDARD.md](DELIVERY_STANDARD.md) — 交付标准
- [DATA_MODEL.md](DATA_MODEL.md) — 数据模型
- [CHANGELOG.md](CHANGELOG.md) — 变更日志
- [docs/DECISIONS/](docs/DECISIONS/) — 架构决策记录（ADR）

## 设计系统

- **暖奶油画布** — 柔和背景
- **软圆 3D** — claymorphism
- **主题型壳 + 任务型核** — 阅读云 / 散步云 / 编码云 / 日常云

## 许可证

MIT