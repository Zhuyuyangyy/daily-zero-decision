# Changelog

## v0.1.0 — 2026-06-14 — 每天只做这一小步

### 新增

- 一屏式 Onboarding
- 今日卡重塑为最小行动卡（4 种云主题）
- 完成后天空长出一朵云
- SkyScene 天空场景基础（density/variant/reduced-motion）
- SkyHeaderContent + SkyProgressMini 顶部信息层
- CloudGarden mode='today' 重构（记忆云 5→7）
- toCloudGardenMood 工具
- useReducedMotion hook + 全局 CSS 兜底
- parseTaskFromInput time 推算（6 用例全支持）
- handleEasier 四态 MAX 守卫
- importState / loadState 老用户 backfill + onboarded 三态
- handleOnboardingFinish 显式 saveState
- GitHub Actions CI（typecheck + test + build）
- 仓库根 vercel.json 部署配置
- window.onerror 最小监控

### 修复

- 老用户 type='other' 误归类被 handleEasier 误判
- 完成 1 张卡后再点"换一朵轻一点的"会生成第 2 张
- 完成后出现"再养一朵"违反产品定位

### 文档

- README 重写为"最小行动"定位
- 番茄钟降级为可选小工具

## 上线验收

- 11 条上线验收标准全部通过
- 5 个并发分支无冲突合并
- CI 通过