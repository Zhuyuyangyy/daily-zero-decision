# Tasks

- [x] Task 1: 创建测试基础设施
  - [x] SubTask 1.1: 创建 `pytest.ini` 配置文件（testpaths, python_files, markers 等）
  - [x] SubTask 1.2: 创建 `requirements-dev.txt`（pytest, scipy 等依赖）
  - [x] SubTask 1.3: 创建 `tests/conftest.py`（共享 fixture：JSONL 数据加载、临时文件路径等）
  - [x] SubTask 1.4: 创建 `tests/__init__.py`

- [x] Task 2: 提取审计统计计算为可测试模块
  - [x] SubTask 2.1: 创建 `audit_v3/stats.py`，包含 `compute_stats()`, `confidence_interval()`, `one_sample_ttest()` 纯函数
  - [x] SubTask 2.2: 创建 `audit_v3/__init__.py`

- [x] Task 3: 编写 JSONL 数据完整性测试
  - [x] SubTask 3.1: 创建 `tests/test_data_integrity.py`，测试 JSONL 格式合法性
  - [x] SubTask 3.2: 测试必需字段存在性和类型正确性
  - [x] SubTask 3.3: 测试 gap = self_score - independent_score 一致性
  - [x] SubTask 3.4: 测试 clean_records 是 calibration_dataset 的子集
  - [x] SubTask 3.5: 测试 clean_records 只含 CLEAN 记录
  - [x] SubTask 3.6: 测试 validated_clean_records 与 clean_records 一致
  - [x] SubTask 3.7: 测试 validated_excluded_records 为空

- [x] Task 4: 编写统计计算单元测试
  - [x] SubTask 4.1: 创建 `tests/test_stats.py`
  - [x] SubTask 4.2: 测试 `compute_stats()` 对 n=7 clean 数据返回 mean≈35.4, median=37.0
  - [x] SubTask 4.3: 测试 `compute_stats()` 对 n=7 contaminated 数据返回 mean≈39.1, median=43.0
  - [x] SubTask 4.4: 测试 `confidence_interval()` 对 clean 数据返回约 [29.0, 41.8]
  - [x] SubTask 4.5: 测试 `one_sample_ttest()` 返回显著 p 值
  - [x] SubTask 4.6: 测试边界情况（空列表、单元素、全零 gap）

- [x] Task 5: 编写 Provenance 判定逻辑测试
  - [x] SubTask 5.1: 创建 `tests/test_provenance.py`
  - [x] SubTask 5.2: 测试 BYTE_TRACEABLE 记录的判定条件（self_match + indep_match）
  - [x] SubTask 5.3: 测试 SELF_ONLY_TRACEABLE 记录的判定条件
  - [x] SubTask 5.4: 测试 contamination_risk 与 indep_match_to_original 的对应关系
  - [x] SubTask 5.5: 测试 usable_clean 与 contamination_risk 的对应关系
  - [x] SubTask 5.6: 测试 calibration_dataset_v3.jsonl 中各 provenance_status 的记录数量

- [x] Task 6: 编写论文修改脚本集成测试
  - [x] SubTask 6.1: 创建 `tests/test_paper_scripts.py`
  - [x] SubTask 6.2: 测试 `fix_paper_v66.py` 的 8 个替换操作（使用 paper_v6.6.md 快照作为输入）
  - [x] SubTask 6.3: 测试 `apply_v66_patch.py` 的 changelog 插入和 Abstract 更新
  - [x] SubTask 6.4: 测试 `generate_paper_v66.py` 的输出生成
  - [x] SubTask 6.5: 测试输出文件中关键数字的存在性（n=7, +35.4, +37.0）
  - [x] SubTask 6.6: 测试旧数字的移除（n=2 +26.00 不再作为 primary headline）

- [x] Task 7: 编写论文数据一致性测试
  - [x] SubTask 7.1: 创建 `tests/test_paper_data_consistency.py`
  - [x] SubTask 7.2: 测试 paper_v6.6.md 中的统计数字与 JSONL 数据文件一致
  - [x] SubTask 7.3: 测试 manual_validation_v3.md 中的项目列表与 JSONL 数据一致
  - [x] SubTask 7.4: 测试 final_estimates_v3.md 中的统计数字与实际计算一致

- [x] Task 8: 运行全量测试并验证
  - [x] SubTask 8.1: 运行 `pytest tests/ -v` 确保全部通过
  - [x] SubTask 8.2: 修复任何失败的测试

# Task Dependencies

- Task 2 依赖 Task 1（需要 conftest.py 中的 fixture）
- Task 3 依赖 Task 1（需要 conftest.py 中的 JSONL 加载 fixture）
- Task 4 依赖 Task 2（需要 stats.py 模块）
- Task 5 依赖 Task 1（需要 conftest.py 中的 JSONL 加载 fixture）
- Task 6 独立（可直接测试 examples/ 下的脚本）
- Task 7 依赖 Task 1 + Task 2（需要数据加载和统计计算）
- Task 8 依赖 Task 1-7（所有测试就绪后验证）

# Parallelizable Work

- Task 3 + Task 5 可并行（都是数据测试，互不依赖）
- Task 6 独立于 Task 3-5，可并行
