# 项目优化路线图 Spec

## Why

项目存在三层断层：(1) 方法论层 `p0-vs`（规则归纳实验）和应用层 `audit_v3`（33 项目审计）之间没有代码连接；(2) 核心审计脚本 `run_audit.py` 丢失导致不可复现；(3) p0-vs 实验显示 LLM 主动查询准确率仅 14%（不如被动 40%，远低于贪心基线 100%），但论文未分析这一关键发现。优化路线旨在将项目从"手工编排 + 事后审计"升级为"可复现 pipeline + 闭环验证"，同时将 p0-vs 的发现反哺到审计流程中。

## What Changes

### Phase 1: 基础设施修复（可复现性）
- 重写 `audit_v3/run_audit.py`，恢复审计可复现性
- 将 `p0-vs` 纳入 git 版本控制
- 统一项目结构，消除 `.gitignore` 互相干扰
- 添加 CI/CD 自动化测试

### Phase 2: 方法论-应用桥接（p0-vs → audit_v3）
- 从 p0-vs 提取通用 Agent 框架（环境接口、查询策略、结果记录）
- 实现 `ActiveProvenanceChecker`：用主动查询策略自动做 provenance 追踪
- 将 35% 实证权重门控规则化并集成到 pipeline

### Phase 3: 实验增强（p0-vs 优化）
- 分析并修复 LLM 主动查询策略失败原因（14% vs 贪心 100%）
- 实现 query strategy 改进（信息增益引导、版本空间感知 prompt）
- 扩展实验到更多模型（GPT-4、Claude、Gemini）

### Phase 4: 论文升级（n=10 跨条件实验准备）
- 实现 §8 Roadmap 中的 4 条件实验框架
- 自动化 LLM-CUED / LLM-BLIND / LLM-CROSS 三条 LLM 臂
- 生成预注册文档模板

## Impact

- Affected specs: 审计可复现性、p0-vs 实验有效性、论文 §8 roadmap 可执行性
- Affected code: `audit_v3/`（新增 run_audit.py）、`p0-vs/`（纳入 git + 优化）、项目根目录（结构重组）

## ADDED Requirements

### Requirement: 审计 Pipeline 可复现

系统 SHALL 提供 `audit_v3/run_audit.py`，可一键复现 v3 审计的完整流程。

#### Scenario: 一键复现审计
- **WHEN** 执行 `python -m audit_v3.run_audit`
- **THEN** 从 `calibration_dataset_v3.jsonl` 读取数据
- **AND** 执行 provenance 判定（BYTE_TRACEABLE / SELF_ONLY_TRACEABLE / INDEP_ONLY_TRACEABLE / NULL_SCORES）
- **AND** 执行 contamination_risk 判定（CLEAN / POSSIBLE）
- **AND** 输出 `clean_records_v3.jsonl` 和统计摘要
- **AND** 统计摘要与论文 v6.6 报告的数字一致（n=7, mean=35.4, median=37.0）

#### Scenario: provenance 判定规则透明
- **WHEN** 查看 `run_audit.py` 源码
- **THEN** 每条判定规则都有注释说明其语义
- **AND** BYTE_TRACEABLE 要求 self_match_to_original=True 且 indep_match_to_original=True
- **AND** SELF_ONLY_TRACEABLE 要求 self_match_to_original=True 且 indep_match_to_original=False

### Requirement: p0-vs 纳入版本控制

系统 SHALL 将 `p0-vs` 代码纳入 `llm-autoresearch-pipeline` 仓库的版本控制。

#### Scenario: p0-vs 代码可追溯
- **WHEN** 在 `llm-autoresearch-pipeline` 仓库中查看 git log
- **THEN** 能看到 p0-vs 相关的提交历史
- **AND** `p0-vs/` 目录在仓库根目录下

#### Scenario: p0-vs 实验可复现
- **WHEN** 执行 `cd p0-vs && npm install && npx tsx src/runActive.ts`
- **THEN** 实验正常运行并产出结果
- **AND** 结果格式与 `results/analysis_report.json` 一致

### Requirement: Agent 框架通用化

系统 SHALL 从 p0-vs 提取通用 Agent 实验框架，支持不同任务类型的 Agent 对比实验。

#### Scenario: 框架可扩展到新任务
- **WHEN** 定义新的 `Environment` 接口实现（如 ProvenanceCheckEnv）
- **THEN** 可复用现有的 `runActive` / `runPassive` / `runScaffold` 运行器
- **AND** 可复用 `apiSafety.ts` 的请求审计链
- **AND** 可复用 `analyzeResults.ts` 的指标计算

#### Scenario: Active Provenance Checker
- **WHEN** 对 calibration_dataset 中的记录运行 Active Provenance Checker
- **THEN** Agent 主动查询源文件中的分数位置
- **AND** 自动判定 provenance_status
- **AND** 准确率 ≥ 被动基线（40%）

### Requirement: LLM 主动查询策略优化

系统 SHALL 改进 LLM 的主动查询策略，使其在规则归纳任务上超过被动基线。

#### Scenario: 改进策略超过被动基线
- **WHEN** 运行改进后的 active 策略
- **THEN** 准确率 > 40%（当前被动基线）
- **AND** 平均查询次数 ≤ 4（不超过当前 active_budget_reminder 的 3.76）

#### Scenario: 版本空间感知 prompt
- **WHEN** LLM 收到查询反馈
- **THEN** prompt 中包含当前版本空间大小和候选规则列表
- **AND** LLM 被引导选择能最大缩减版本空间的查询

### Requirement: n=10 跨条件实验框架

系统 SHALL 实现论文 §8 描述的 4 条件实验框架，自动化 LLM 臂的运行。

#### Scenario: LLM-CUED 条件运行
- **WHEN** 执行 `npx tsx src/runCrossCondition.ts --condition cued --projects 10`
- **THEN** 对 10 个项目运行 header-aware 的 hardened review
- **AND** 结果记录包含 self_score 和 independent_score

#### Scenario: LLM-BLIND 条件运行
- **WHEN** 执行 `npx tsx src/runCrossCondition.ts --condition blind --projects 10`
- **THEN** 对 10 个项目运行 header-blind 的 hardened review
- **AND** reviewer 输入中不包含 self_score

#### Scenario: LLM-CROSS 条件运行
- **WHEN** 执行 `npx tsx src/runCrossCondition.ts --condition cross --model gpt-4 --projects 10`
- **THEN** 使用不同模型家族的 LLM 做 hardened review
- **AND** reviewer 输入中不包含 self_score

#### Scenario: 结果自动分析
- **WHEN** 3 条 LLM 臂全部完成
- **THEN** 自动计算各条件的 mean gap 和 95% CI
- **AND** 自动执行论文 §8.3 的 5 个先验预测检验
- **AND** 输出预测通过/失败报告

### Requirement: 项目结构统一

系统 SHALL 统一项目目录结构，消除多仓库混乱。

#### Scenario: 清晰的目录结构
- **WHEN** 查看 `llm-autoresearch-pipeline` 根目录
- **THEN** 目录结构为：
  ```
  llm-autoresearch-pipeline/
  ├── audit_v3/          # 审计数据 + 脚本
  ├── p0-vs/             # 规则归纳实验框架
  ├── examples/          # 论文 + 修改脚本
  ├── tests/             # 全局测试
  ├── docs/              # 文档
  └── pytest.ini
  ```
- **AND** `.gitignore` 不再互相干扰（每个子目录有自己的 negation 规则）

## MODIFIED Requirements

### Requirement: 测试体系扩展

原 `add-comprehensive-testing` spec 的测试 SHALL 扩展覆盖 `p0-vs/` 和 `run_audit.py`。

- 新增 `tests/test_run_audit.py`：验证 `run_audit.py` 的输出与已知数据一致
- 新增 `p0-vs/` 内的单元测试（env.ts, rules.ts, taskGenerator.ts）

## REMOVED Requirements

无
