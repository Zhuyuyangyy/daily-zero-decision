# Changelog

## Round 8 (2026-06-08) — 仓库收口
- 根目录新增 README.md（产品门面 + 仓库结构 + 快速开始）
- 根目录新增 LICENSE（MIT）
- 根目录新增 CHANGELOG.md（产品演化记录）
- 仓库顶层 .gitignore 已忽略所有 sibling 子项目

## Round 7 (2026-06-08) — 收口
- `MAX_TASKS_PER_DAY` 从 5 改为 1，代码与产品定位"今天只做这一小步"对齐

## Round 6 (2026-06-08) — 文档同步
- app/README.md 顶部定位改为"每天不知道从哪开始？/ 把想坚持的事…"
- app/README.md 功能列表收敛为 4 大模块（今日卡 / 我的天空 / 回顾 / 设置）
- SPEC.md §0 定位更新、§2 重写核心循环、§8 补 2 项完成标准

## Round 5 (2026-06-08) — 产品定位打穿 ⭐
- **核心修复**：客户第一眼不知道这 App 是干嘛的
- Onboarding A-lite 一屏激活（NN/G 反对多页教程）
- 价值主张头"今天只做这一小步"
- 今日卡改"主题型壳 + 任务型核"（阅读云/读 2 页书）
- 奖励闭环"完成后，天空会多一朵阅读云"
- 番茄钟降级为卡片内小按钮
- Tab 改名"今日卡 / 我的天空 / 回顾 / 设置"

## Round 4 (2026-06-07) — 简化设置
- SettingsPage 删 PresetManager（预设管理移到添加任务二级入口）
- 字体 / 数据 / 重置 / 关于 4 块

## Round 3 (2026-06-07) — 沉浸天空
- SkyPage 大天空画布 + 漂浮云朵（点击看当天任务）
- StatsPage 改名"云迹"，自然语言总结代替数字表格
- 弱化搜索/历史表

## Round 2 (2026-06-07) — 基础组件
- 抽 5 个基础组件：SoftButton / PillChip / CloudCard / FloatingInput / PageShell
- clay.css 扩充组件 class
- inline style 大幅减少

## Round 1 (2026-06-07) — 零决策主页
- 去掉分类 chip
- 移除 FAB 主入口
- TodayDecisionCard 主角卡 + EmptyCloudCard 等待发芽
- handleEasier 智能降难度

## Earlier (Rounds before numbered)
- 滚动优化（max-w-md 拆分为 header + 滚动主体）
- 字体切换 L2（圆润/书卷/现代/极客）
- HeroSky + 进度合体
- 深度重构（hook 提取）
- 初始化每日零决策卡应用
