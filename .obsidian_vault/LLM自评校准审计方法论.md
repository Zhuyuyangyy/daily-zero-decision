# LLM自评校准审计方法论

> 核心：从生成→审稿→实验→数据采集的全链路对抗式审计

---

## 核心原则

### 1. 审稿agent必须hardened
- 35% empirical-evidence weight
- Default stance: REJECT
- Verdict: SUBMIT-READY / REAL-REVISION / ARCHIVE

### 2. 数字必须byte-traced
- 来源文件必须有 "N/100" 字面匹配
- NO format conversion (6.33/10 ≠ 63/100)
- NO reverse-fitting

### 3. 实验必须真实执行
- `REFUTED` = 成功，不是失败
- 报告 SUPPORTED / PARTIAL / REFUTED / BLOCKED

---

## 三角色Agent

| Role | Prompt | Output |
|------|--------|--------|
| Reviewer | `prompts/reviewer.md` | 65/100, REAL-REVISION |
| Experiment Runner | `prompts/experiment_runner.md` | 32.65/100, REFUTED |
| Calibration Collector | `prompts/calibration_collector.md` | JSONL record |

---

## 实证发现

| 指标 | 值 |
|------|---|
| 平均gap (n=28) | +31.57 |
| HEADER-AWARE污染 | 20/28 (71.4%) |
| Both-MATCH (v2-rebuild) | 7/33 (21%) |
| 真fabrication | 1 (AutoDataFlow) |

---

## 反模式

### "[Verified]"标签
- LLM给假引用贴"已验证"标签
- 标签本身就是自我认证
- 必须人工核对arXiv/DOI

### 路径拟合
- 找不到数字 → 换文件 → 换量表 → "凑上了"
- 这就是provenance-level p-hacking

---

## 修复步骤

1. 规则先定（不能从结果反推）
2. 逐条trace（固定路径+字面匹配）
3. 分类：MATCH / MISMATCH / UNTRACEABLE
4. 重建数据采集层
5. 用干净数据写论文

---

标签: #方法论 #audit #llm-evaluation
