# 项目全面测试体系 Spec

## Why

`llm-autoresearch-pipeline` 项目当前**没有任何自动化测试**。核心审计脚本 `run_audit.py`（README 中引用但已丢失）、3 个论文修改脚本（`fix_paper_v66.py`、`apply_v66_patch.py`、`generate_paper_v66.py`）以及 JSONL 数据文件均无测试覆盖。作为一个以"数据可信度审计"为核心贡献的学术项目，缺乏可复现的自动化测试会严重削弱其可信度和可维护性。

## What Changes

- 新增 `tests/` 目录，包含所有测试模块
- 新增 `conftest.py`（pytest 共享 fixture）
- 新增 `pytest.ini` 配置文件
- 新增 `requirements-dev.txt` 开发依赖
- 为 `audit_v3/` 审计逻辑编写单元测试（数据验证、统计计算、provenance 判定）
- 为 `examples/` 下的 3 个论文修改脚本编写集成测试
- 为 JSONL 数据文件编写数据完整性测试
- 新增统计计算工具模块 `audit_v3/stats.py`（从脚本中提取可测试的纯函数）

## Impact

- Affected specs: 审计流程的可复现性、论文修改脚本的正确性、数据文件完整性
- Affected code: `audit_v3/`（新增 `stats.py`）、`examples/`（3 个 .py 脚本）、JSONL 数据文件

## ADDED Requirements

### Requirement: 审计数据完整性验证

系统 SHALL 提供自动化测试，验证所有 JSONL 数据文件的结构完整性和语义一致性。

#### Scenario: JSONL 文件格式正确
- **WHEN** 运行数据完整性测试
- **THEN** `calibration_dataset_v3.jsonl` 和 `clean_records_v3.jsonl` 中每条记录都是合法 JSON
- **AND** 每条记录包含必需字段：`project`, `self_score`, `independent_score`, `gap`, `provenance_status`, `contamination_risk`
- **AND** `gap` 字段等于 `self_score - independent_score`

#### Scenario: 数据集一致性
- **WHEN** 对比 `clean_records_v3.jsonl` 和 `calibration_dataset_v3.jsonl`
- **THEN** clean_records 中的每条记录都存在于 calibration_dataset 中
- **AND** clean_records 中只包含 `contamination_risk == "CLEAN"` 的记录

#### Scenario: 统计数值可复现
- **WHEN** 从 `clean_records_v3.jsonl` 计算 n=7 的统计量
- **THEN** mean_gap ≈ 35.4, median_gap ≈ 37.0, n == 7
- **AND** 从 contaminated 子集计算 mean_gap ≈ 39.1, median_gap ≈ 43.0, n == 7

### Requirement: 审计统计计算模块

系统 SHALL 提供 `audit_v3/stats.py` 模块，包含可独立测试的纯函数用于统计计算。

#### Scenario: 计算均值和标准差
- **WHEN** 调用 `compute_stats([32, 38, 40, 49, 37, 31, 21])`
- **THEN** 返回 `Stats(n=7, mean=35.428..., median=37.0, sd=...)`

#### Scenario: 计算 95% 置信区间
- **WHEN** 调用 `confidence_interval(gaps, confidence=0.95)`
- **THEN** 返回 `(lower, upper)` 元组，对 n=7 clean 数据约 `[29.0, 41.8]`

#### Scenario: 单样本 t 检验
- **WHEN** 调用 `one_sample_ttest(gaps, mu=0)`
- **THEN** 返回 `(t_stat, p_value)` 元组

### Requirement: Provenance 判定逻辑测试

系统 SHALL 提供测试验证 provenance 判定规则的正确性。

#### Scenario: BYTE_TRACEABLE 判定
- **WHEN** 一条记录的 `self_score` 和 `independent_score` 都在源文件中以 `N/100` 字面值出现
- **THEN** `provenance_status` 应为 `BYTE_TRACEABLE`

#### Scenario: SELF_ONLY_TRACEABLE 判定
- **WHEN** 一条记录只有 `self_score` 在源文件中可追溯
- **THEN** `provenance_status` 应为 `SELF_ONLY_TRACEABLE`

#### Scenario: 污染风险判定
- **WHEN** `indep_match_to_original == false`
- **THEN** `contamination_risk` 应为 `POSSIBLE`
- **WHEN** `indep_match_to_original == true`
- **THEN** `contamination_risk` 应为 `CLEAN`

### Requirement: 论文修改脚本集成测试

系统 SHALL 提供集成测试，验证 `examples/` 下的论文修改脚本在给定输入时产生正确输出。

#### Scenario: fix_paper_v66.py 正确替换
- **WHEN** 运行 `fix_paper_v66.py` 处理包含 v6.5 内容的 paper_v6.6.md
- **THEN** 所有 8 个替换都成功执行
- **AND** 输出文件包含 v6.6 的关键数字（n=7, +35.4, +37.0）
- **AND** 输出文件不包含旧的 v6.5 关键数字（n=2 +26.00 作为 primary headline）

#### Scenario: apply_v66_patch.py 正确应用补丁
- **WHEN** 运行 `apply_v66_patch.py` 处理 paper_v6.5.md
- **THEN** 生成 paper_v66.md，包含 v6.6 changelog 条目
- **AND** Abstract 中的 primary headline 更新为 n=7 +35.4

#### Scenario: generate_paper_v66.py 正确生成
- **WHEN** 运行 `generate_paper_v66.py`
- **THEN** 生成 paper_v66_draft.md，包含所有 v6.6 更新

### Requirement: 测试基础设施

系统 SHALL 提供 pytest 配置和开发依赖声明。

#### Scenario: pytest 可运行
- **WHEN** 执行 `pytest tests/`
- **THEN** 所有测试被发现并执行
- **AND** 测试输出包含通过/失败统计

#### Scenario: 开发依赖可安装
- **WHEN** 执行 `pip install -r requirements-dev.txt`
- **THEN** pytest 及相关依赖被安装

## MODIFIED Requirements

无（本项目之前无测试相关需求）

## REMOVED Requirements

无
