# audit_v3/

**v3 数据可信度重构审计产物（2026-06-14）**

本目录包含 `llm-autoresearch-pipeline` 的 v3 数据可信度重构全部审计产物。  
**在修改 `examples/paper_v6.5.md` 之前，本目录内容应视为冻结快照。**

---

## 目录结构

```
audit_v3/
├── README.md                          ← 本文件
├── run_audit.py                      ← v3 审计脚本（可复现）
├── audit_summary_v3.md               ← 自动审计总结
├── calibration_dataset_v3.jsonl      ← v3 数据集（含 provenance_status）
├── clean_records_v3.jsonl            ← 7 条干净记录（BYTE_TRACEABLE + 无污染）
├── mismatch_ledger_v3.csv            ← 记录级审计结果（CSV）
├── mismatch_ledger_v3.md            ← 记录级审计结果（Markdown）
└── manual_validation/
    ├── manual_validation_v3.csv            ← 人工验证结果（CSV）
    ├── manual_validation_v3.md            ← 人工验证详情（Markdown）
    ├── validated_clean_records_v3.jsonl   ← 7 条已验证干净记录
    ├── validated_excluded_records_v3.jsonl ← 空（0 条排除）
    └── final_estimates_v3.md             ← 最终估计统计
```

---

## 核心概念

### 什么是 BYTE_TRACEABLE？

一条记录是 `BYTE_TRACEABLE`，当且仅当：

1. `self_score` 在 `self_source_path` 指向的源文件中**逐字节出现** `N/100` 字面值；
2. `independent_score` 在 `independent_source_path` 指向的源文件中**逐字节出现** `N/100` 字面值；
3. 两个分数都是**最终评分**（不是 rubric、示例、候选分数、旧版本）；
4. `self_source_path` 和 `independent_source_path` 都是**仓库相对路径**，可复现。

### 什么是 VALIDATED_CLEAN？

一条 `BYTE_TRACEABLE` 记录通过人工验证成为 `VALIDATED_CLEAN`，当且仅当：

1. 自动审计脚本确认字节可追溯；
2. 人工逐条验证源文件上下文，确认分数是最终评分；
3. 独立审稿人输入**没有看到**项目自评（无污染）；
4. 不是重复记录；
5. 分数不是来自 markdown-only summary claim。

### 为什么 n=7 clean estimate 可以替代旧的 n=2？

| | 旧（paper_v6.5） | 新（v3 审计） |
|---|---|---|
| 干净估计 n | 2 | **7** |
| 干净估计 gap | +26.00 | **+35.4（均值）, +37.0（中位数）** |
| 来源 | `provenance_audit.md` 初步重构 | 14 条 BYTE_TRACEABLE 记录人工验证 |

**n=7 是通过 rules-first 审计 + 人工验证双重确认的，比 n=2 更稳健。**

### 为什么 contaminated n=7 只能叫 "validated contaminated traceable subset"？

contaminated 子集中的独立审稿人输入**可能看到了项目自评**，因此：

- ❌ 不能作为独立评审效应量解释；
- ✅ 可以作为"审计框架能发现污染"的证据；
- ✅ 可以作为辅助结果，但必须标注污染状态。

### n=28 / +31.6 怎么办？

保留为 **"legacy contaminated upper-bound"**，但降级：

- 不再作为主结果；
- 标注为"非独立探索性信号"；
- 在论文中说明这是早期更大集合的受污染上限。

---

## 哪些数字可以进论文 headline，哪些不能

### ✅ 可以进主结果（headline）

```
In the strict manually validated subset (n=7), the mean self-review score was 90.6,
the mean independent-review score was 55.1, and the mean gap was +35.4 points,
with a median gap of +37.0 points.
```

### ⚠️ 可以进辅助结果，但必须标注污染

```
A separate contaminated but byte-traceable subset (n=7) showed a mean gap of +39.1 points,
but cannot be interpreted as an independent-review estimate due to possible reviewer-input contamination.
```

### ❌ 不能作为主结果，必须降级

```
The original n=28 contaminated upper-bound estimate (+31.6 points) is retained only as a legacy,
non-independent exploratory signal and should not be interpreted as a population-level estimate.
```

---

## 如何运行 `run_audit.py`

### 依赖

- Python 3.8+
- 无第三方库依赖（仅用标准库）

### 输入

- `calibration_dataset_v2.jsonl`：需放在 `data/` 目录（本仓库未包含，被 `.gitignore` 了）
- 所有 `self_source_path` 和 `independent_source_path` 必须是**仓库相对路径**

### 运行

```bash
cd llm-autoresearch-pipeline
python audit_v3/run_audit.py \
  --dataset data/calibration_dataset_v2.jsonl \
  --root . \
  --out-dir audit_v3
```

### 输出

运行后会在 `audit_v3/` 目录下生成：

- `audit_summary_v3.md`：可读审计总结
- `mismatch_ledger_v3.csv`：机器可读记录级结果
- `mismatch_ledger_v3.md`：人可读记录级结果
- `calibration_dataset_v3.jsonl`：v3 数据集（含 `provenance_status`）
- `clean_records_v3.jsonl`：仅干净记录

---

## 数据来源说明

- `calibration_dataset_v2.jsonl` **不在本仓库中**（被 `.gitignore` 了）
- 如需复现，请从原始数据目录获取，并手动将绝对路径改为仓库相对路径
- 所有源文件路径在 v3 中已统一为仓库相对路径，不再包含本地绝对路径

---

## 版本历史

| 版本 | 日期 | 说明 |
|---|---|---|
| v1 | 2026-06-13 | 初步审计，n=2 clean estimate |
| v2 | 2026-06-14 | 重构审计，发现 10/33 数据层不匹配 |
| **v3** | **2026-06-14** | **人工验证 14 条 BYTE_TRACEABLE，n=7 clean estimate** |

---

## 下一步

1. ✅ v3 审计产物已冻结（本目录）
2. ⏳ 修改 `examples/paper_v6.5.md` → `examples/paper_v6.6.md`
3. ⏳ 完成 `paper_v6.6.md` 后，再决定是否公开 `audit_v3/`

---

**最后更新：2026-06-14**  
**审计完成人：automated rules-first trace + manual validation**
