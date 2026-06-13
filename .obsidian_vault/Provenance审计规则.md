# Provenance审计规则

> Rules FIRST, then trace. NO reverse-fitting.

---

## 6条铁律

### Rule 1: 固定源路径
```
self_source = <project>/_Q2_v1.md OR <project>/<project>_Q2_v1.md
indep_source = REVIEWS/<project>_Q2_Review*.md OR REVIEWS/<project>_Q2_v*.md
```

### Rule 2: MATCH标准
数字必须以 `"N/100"` (允许空格) 出现在源文件前200行

### Rule 3: MISMATCH标准
源文件存在且数字在，但值不同 → 报告两个值

### Rule 4: UNTRACEABLE标准
没有任何canonical源包含该数字

### Rule 5: 禁止format conversion
`6.33/10` ≠ `63.3/100` ≠ `60/100`

### Rule 6: 禁止reverse-fitting
找不到 → 停止尝试 → 报告UNTRACEABLE

---

## 三分类

| 分类 | 含义 | 行动 |
|------|------|------|
| MATCH | byte-level traceable | 使用 |
| MISMATCH | 数字在但值不对 | 报告两个值 |
| UNTRACEABLE | 找不到 | 重建数据采集 |

---

## 实际结果

| 项目 | self | indep | 分类 |
|------|------|-------|------|
| NeuralSim2Real | 84 | 53 | MATCH |
| BioSynth-DBTL | 80 | 65 vs 32.65 | MISMATCH |
| Cross-Lingual-TCM | 60 | 30 | UNTRACEABLE |

---

## 案例: BioSynth-DBTL

- jsonl: indep = 65
- 源文件: `32.65/100`
- **65 ≠ 32.65 = MISMATCH (不是UNTRACEABLE)**
- MISMATCH比UNTRACEABLE更严重

标签: #audit #provenance #rules
