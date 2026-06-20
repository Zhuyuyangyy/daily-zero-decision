## Phase 1: 基础设施修复

- [x] `audit_v3/run_audit.py` 存在且可执行，输出 `clean_records_v3.jsonl` 与现有文件一致
- [x] `run_audit.py` 输出的统计摘要与论文 v6.6 数字一致（n=7, mean=35.4, median=37.0）
- [x] `p0-vs/` 目录存在于 `llm-autoresearch-pipeline` 仓库内且被 git 追踪
- [x] `p0-vs/` 关键源文件已复制到新位置
- [x] 根 `.gitignore` 不再阻止 `tests/` 和 `p0-vs/` 的 git 追踪
- [x] CI workflow 配置完成（需 push 后验证运行）

## Phase 2: 方法论-应用桥接

- [x] 通用 Agent 框架的 `Environment` 接口定义清晰，支持扩展新任务类型
- [ ] `ActiveProvenanceChecker` 可运行并产出 provenance 判定结果
- [ ] Active Provenance Checker 准确率 ≥ 被动基线（40%）
- [ ] 35% 实证权重门控规则编码为可执行逻辑，与论文描述一致

## Phase 3: 实验增强

- [x] LLM 主动查询失败原因分析完成：LLM 过早给 final（avg 0.9/6 查询）、不理解版本空间、scaffold 更差（0.1/6 查询）
- [x] 改进策略 `runInformedActive` 已实现：版本空间信息注入 + 强制最低查询次数 + 策略引导
- [ ] 改进策略准确率 > 40%（需 API key 运行实验验证）
- [ ] 改进策略的平均查询次数 ≤ 4
- [ ] 至少 2 个不同模型家族的实验结果存在

## Phase 4: 论文升级

- [ ] `runCrossCondition.ts` 支持 cued / blind / cross 三种条件运行
- [ ] 10 项目子集的选择逻辑与论文 §8.2 一致
- [ ] 5 个先验预测检验自动执行并输出通过/失败报告
- [ ] 预注册文档模板已生成
- [x] 全量 Python 测试通过（85 passed）
