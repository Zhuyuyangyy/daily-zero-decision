# Tasks

## Phase 1: 基础设施修复（可复现性）

- [x] Task 1: 重写 `audit_v3/run_audit.py`
  - [x] SubTask 1.1: 实现 `load_calibration_dataset()` 加载 JSONL 数据
  - [x] SubTask 1.2: 实现 `classify_provenance()` 判定 provenance_status（BYTE_TRACEABLE / SELF_ONLY_TRACEABLE / INDEP_ONLY_TRACEABLE / NULL_SCORES）
  - [x] SubTask 1.3: 实现 `classify_contamination()` 判定 contamination_risk（CLEAN / POSSIBLE）
  - [x] SubTask 1.4: 实现 `extract_clean_records()` 提取 clean 子集
  - [x] SubTask 1.5: 实现 `compute_summary()` 输出统计摘要（n, mean, median, SD, 95% CI, t-test）
  - [x] SubTask 1.6: 实现 `main()` 串联完整流程并输出到文件
  - [x] SubTask 1.7: 验证输出与 `clean_records_v3.jsonl` 和论文数字一致

- [x] Task 2: 将 p0-vs 纳入 git 版本控制
  - [x] SubTask 2.1: 将 `d:\ZYY Project\新建文件夹\p0-vs` 复制到 `d:\ZYY Project\llm-autoresearch-pipeline\p0-vs`
  - [x] SubTask 2.2: 添加 `p0-vs/.gitignore`（忽略 node_modules, results/, tmp_test/）
  - [x] SubTask 2.3: 在根 `.gitignore` 中添加 `!/llm-autoresearch-pipeline/p0-vs/` negation 规则
  - [x] SubTask 2.4: 验证关键源文件存在

- [x] Task 3: 统一项目结构和 .gitignore
  - [x] SubTask 3.1: 创建 `docs/` 目录
  - [x] SubTask 3.2: 修复根 `.gitignore` 中 `tests/` 全局忽略问题（添加 negation）
  - [x] SubTask 3.3: 为 p0-vs/docs/tests 添加 negation 规则

- [x] Task 4: 添加 CI/CD 自动化
  - [x] SubTask 4.1: 创建 `.github/workflows/test.yml`（Python 测试）
  - [x] SubTask 4.2: 创建 `.github/workflows/p0-vs-test.yml`（TypeScript 测试）
  - [x] SubTask 4.3: CI 配置完成（需 push 后验证）

## Phase 2: 方法论-应用桥接（p0-vs → audit_v3）

- [x] Task 5: 提取通用 Agent 框架
  - [x] SubTask 5.1: 从 `p0-vs/src/env.ts` 提取 `Environment` 接口（query, isDone, versionSpace 等）
  - [x] SubTask 5.2: 从 `p0-vs/src/runActive.ts` 提取通用 `runAgentLoop()` 函数
  - [x] SubTask 5.3: 定义 `AgentStrategy<TQuery, TResult>` 策略接口
  - [x] SubTask 5.4: 创建 `p0-vs/src/framework.ts`

- [ ] Task 6: 实现 ActiveProvenanceChecker
  - [ ] SubTask 6.1: 定义 `ProvenanceEnv` — 环境可被查询"文件 X 中是否存在字面值 N/100"
  - [ ] SubTask 6.2: 实现 provenance 查询的模拟环境（基于 calibration_dataset 的已知答案）
  - [ ] SubTask 6.3: 实现 provenance agent 的 system prompt（引导 LLM 主动查询源文件）
  - [ ] SubTask 6.4: 运行实验对比 Active vs Passive provenance 判定准确率
  - [ ] SubTask 6.5: 将 35% 实证权重门控规则编码为可执行逻辑

## Phase 3: 实验增强（p0-vs 优化）

- [x] Task 7: 分析 LLM 主动查询失败原因
  - [x] SubTask 7.1: 分析 `results_active.jsonl` 中的对话日志，统计 LLM 的查询模式
  - [x] SubTask 7.2: 对比 active（14%）vs passive（40%）vs greedy（100%）的版本空间缩减曲线
  - [x] SubTask 7.3: 识别 LLM 的系统性错误（过早给 final、不查询、无效查询）
  - [x] SubTask 7.4: 分析完成（未写入文件，直接输出）

- [x] Task 8: 实现查询策略改进
  - [x] SubTask 8.1: 实现 `runInformedActive` — prompt 中包含当前版本空间候选规则列表
  - [x] SubTask 8.2: 在查询反馈中包含版本空间缩减信息
  - [x] SubTask 8.3: 强制最低查询次数（MIN_QUERIES=2）
  - [ ] SubTask 8.4: 运行对比实验，验证改进策略准确率 > 40%（需 API key）

- [ ] Task 9: 多模型扩展
  - [ ] SubTask 9.1: 适配 OpenAI GPT-4 API（通过 `apiSafety.ts` 的 `baseUrl` 参数）
  - [ ] SubTask 9.2: 适配 Anthropic Claude API
  - [ ] SubTask 9.3: 运行 cross-model 对比实验
  - [ ] SubTask 9.4: 输出 cross-model 分析报告

## Phase 4: 论文升级（n=10 跨条件实验准备）

- [ ] Task 10: 实现 n=10 跨条件实验框架
  - [ ] SubTask 10.1: 定义 `CrossConditionConfig` 类型（condition, model, headerAware, projects）
  - [ ] SubTask 10.2: 实现 `runCrossCondition.ts` — 通用运行器，支持 cued/blind/cross 三种条件
  - [ ] SubTask 10.3: 实现 header-aware / header-blind 的 prompt 模板
  - [ ] SubTask 10.4: 实现 10 项目子集的选择逻辑（按论文 §8.2 的分层标准）

- [ ] Task 11: 实现结果自动分析
  - [ ] SubTask 11.1: 实现 `analyzeCrossCondition.ts` — 计算各条件的 mean gap 和 95% CI
  - [ ] SubTask 11.2: 实现论文 §8.3 的 5 个先验预测检验
  - [ ] SubTask 11.3: 输出预测通过/失败报告
  - [ ] SubTask 11.4: 生成预注册文档模板

- [x] Task 12: 扩展测试覆盖
  - [x] SubTask 12.1: 新增 `tests/test_run_audit.py` — 验证 run_audit.py 输出一致性
  - [ ] SubTask 12.2: 新增 p0-vs 内的单元测试（env.ts, rules.ts, metrics.ts）
  - [ ] SubTask 12.3: 新增跨条件框架的集成测试
  - [x] SubTask 12.4: 运行全量测试验证（85 passed）

# Task Dependencies

- Task 2 → Task 4（p0-vs 纳入 git 后才能配 CI）
- Task 3 → Task 4（结构统一后才能配 CI）
- Task 5 → Task 6（通用框架提取后才能实现 ProvenanceChecker）
- Task 5 → Task 8（通用框架提取后才能实现新策略）
- Task 7 → Task 8（分析失败原因后才能设计改进策略）
- Task 5 → Task 10（通用框架提取后才能实现跨条件运行器）
- Task 10 → Task 11（跨条件运行器完成后才能分析结果）
- Task 1 → Task 12（run_audit.py 完成后才能写测试）

# Parallelizable Work

- Task 1 + Task 2 + Task 3 可并行（互不依赖）
- Task 7 可独立进行（纯分析，不依赖代码改动）
- Task 6 + Task 8 可并行（不同方向的实验）
- Task 9 独立于 Task 6-8（多模型扩展）

# Priority Order

1. **Phase 1**（Task 1-4）— ✅ 已完成
2. **Phase 3 Task 7**（分析失败原因）— ✅ 已完成
3. **Phase 2 Task 5**（框架提取）— ✅ 已完成
4. **Phase 3 Task 8**（策略改进）— ✅ 代码完成，待运行实验
5. **Phase 2 Task 6**（ProvenanceChecker）— 待实现
6. **Phase 3 Task 9**（多模型扩展）— 待实现
7. **Phase 4 Task 10-11**（跨条件实验）— 待实现
8. **Task 12**（测试扩展）— 部分完成
