"""audit_v3 审计流水线 — 完整自包含脚本，复现 v3 审计结果。

用法:
    python -m audit_v3.run_audit
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

from audit_v3.stats import compute_stats, confidence_interval, one_sample_ttest

# ── 数据目录 ──────────────────────────────────────────────
_DATA_DIR = Path(__file__).resolve().parent


# ── 1. 加载数据 ───────────────────────────────────────────
def load_calibration_dataset(path: str | Path) -> list[dict]:
    """加载 JSONL 格式的校准数据集，返回字典列表。"""
    records: list[dict] = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                records.append(json.loads(line))
    return records


# ── 2. 来源分类 ───────────────────────────────────────────
def classify_provenance(record: dict) -> str:
    """根据 self_match / indep_match 判定来源状态。

    规则:
        BYTE_TRACEABLE       — 双方分数均可追溯到原始文件
        SELF_ONLY_TRACEABLE  — 仅自评可追溯
        INDEP_ONLY_TRACEABLE — 仅独立评估可追溯
        NULL_SCORES          — 任一方分数缺失
    """
    self_score = record.get("self_score")
    indep_score = record.get("independent_score")

    # 任一方分数为 None → NULL_SCORES
    if self_score is None or indep_score is None:
        return "NULL_SCORES"

    self_match = record.get("self_match_to_original")
    indep_match = record.get("indep_match_to_original")

    if self_match is True and indep_match is True:
        return "BYTE_TRACEABLE"
    if self_match is True and indep_match is False:
        return "SELF_ONLY_TRACEABLE"
    if self_match is False and indep_match is True:
        return "INDEP_ONLY_TRACEABLE"

    # 兜底：双方均不可追溯但仍非 NULL_SCORES → 归入 NULL_SCORES
    return "NULL_SCORES"


# ── 3. 污染分类 ───────────────────────────────────────────
def classify_contamination(record: dict) -> str | None:
    """判定污染风险等级。

    规则:
        CLEAN   — indep_match_to_original=True（独立评估可追溯）
        POSSIBLE— indep_match_to_original=False
        None    — indep_match_to_original 为 None
    """
    indep_match = record.get("indep_match_to_original")
    if indep_match is None:
        return None
    if indep_match is True:
        return "CLEAN"
    return "POSSIBLE"


# ── 4. 提取干净记录 ───────────────────────────────────────
def extract_clean_records(records: list[dict]) -> list[dict]:
    """筛选满足以下全部条件的记录:
        - provenance_status == "BYTE_TRACEABLE"
        - contamination_risk == "CLEAN"
        - usable_clean == True
    """
    return [
        r for r in records
        if r.get("provenance_status") == "BYTE_TRACEABLE"
        and r.get("contamination_risk") == "CLEAN"
        and r.get("usable_clean") is True
    ]


# ── 5. 汇总统计 ───────────────────────────────────────────
def compute_summary(records: list[dict]) -> dict:
    """对干净记录计算描述性统计 + 95% CI + 单样本 t 检验 (H0: μ=0)。"""
    gaps = [r["gap"] for r in records]
    stats = compute_stats(gaps)
    ci_lo, ci_hi = confidence_interval(gaps, confidence=0.95)
    t_stat, p_value = one_sample_ttest(gaps, mu=0.0)

    return {
        "n": stats.n,
        "mean": stats.mean,
        "median": stats.median,
        "sd": stats.sd,
        "min": stats.min_val,
        "max": stats.max_val,
        "ci_95": (ci_lo, ci_hi),
        "t_stat": t_stat,
        "p_value": p_value,
    }


# ── 6. 主流程 ─────────────────────────────────────────────
def main() -> None:
    # 加载数据
    data_path = _DATA_DIR / "calibration_dataset_v3.jsonl"
    records = load_calibration_dataset(data_path)
    print(f"[1] 加载完成: {len(records)} 条记录")

    # 逐条分类来源与污染
    for rec in records:
        rec["provenance_status"] = classify_provenance(rec)
        rec["contamination_risk"] = classify_contamination(rec)

    # 统计各来源类别
    prov_counts: dict[str, int] = {}
    for rec in records:
        key = rec["provenance_status"]
        prov_counts[key] = prov_counts.get(key, 0) + 1
    print(f"[2] 来源分类: {prov_counts}")

    # 统计各污染等级
    cont_counts: dict[str, int] = {}
    for rec in records:
        key = rec.get("contamination_risk") or "None"
        cont_counts[key] = cont_counts.get(key, 0) + 1
    print(f"[3] 污染分类: {cont_counts}")

    # 提取干净记录
    clean = extract_clean_records(records)
    print(f"[4] 干净记录: {len(clean)} 条")

    # 计算汇总统计
    summary = compute_summary(clean)

    # 写出干净记录
    out_path = _DATA_DIR / "clean_records_v3.jsonl"
    with open(out_path, "w", encoding="utf-8") as f:
        for rec in clean:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")
    print(f"[5] 已写出: {out_path}")

    # 打印汇总
    print("\n===== audit_v3 汇总 =====")
    print(f"  n          = {summary['n']}")
    print(f"  mean       = {summary['mean']:.2f}")
    print(f"  median     = {summary['median']:.1f}")
    print(f"  SD         = {summary['sd']:.2f}")
    print(f"  range      = [{summary['min']}, {summary['max']}]")
    print(f"  95% CI     = ({summary['ci_95'][0]:.2f}, {summary['ci_95'][1]:.2f})")
    print(f"  t(0)       = {summary['t_stat']:.3f}")
    print(f"  p-value    = {summary['p_value']:.4f}")


if __name__ == "__main__":
    main()
