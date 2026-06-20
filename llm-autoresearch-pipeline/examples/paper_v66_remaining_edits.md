# paper_v66.md 剩余修改清单

生成时间：2026-06-14  
生成人：AI agent（rules-first audit + manual validation）  
状态：关键修改已完成，以下为剩余需人工判断的修改点  

---

## ✅ 已完成的关键修改

| 位置 | 修改内容 | 状态 |
|---|---|---|
| Changelog | 新增 v6.6 entry | ✅ |
| Abstract | n=2 → n=7（+35.4 mean, +37.0 median） | ✅ |
| Abstract | 新增 n=7 contaminated subset（+39.1） | ✅ |
| Abstract | n=28 降级为 legacy contaminated upper-bound | ✅ |
| §3.1 | 主结果：n=7 clean → +35.4 | ✅ |
| §3.1 | 次要结果：n=7 contaminated → +39.1 | ✅ |
| §3.1 | n=28 降级为 legacy | ✅ |
| §7 Conclusion | 更新为 n=7 主结果 | ✅ |

---

## ⚠️ 剩余需人工判断的修改（共 37 处）

### 类型 A：§3.6.5 历史讨论（约 15 处）

**现状**：§3.6.5 仍在讲 "v6.5 的 n=2 +26.00 是唯一定干净估计"  
**应改为**： "v6.6 的 rules-first audit 将干净估计从 n=2 扩展到 n=7（+35.4）"

**具体位置**（需逐段检查）：
- §3.6.5 全文（约 L380-L395）
- §3.6.5 的 verdict 段落

**修改建议**：
```
旧：The clean estimate is n=2 +26.00; the n=8 +25.88 is a hypothesis-generating observation...
新：The v6.6 audit expands the clean estimate from n=2 +26.00 to n=7 +35.4 (mean) / +37.0 (median). This is now the primary headline.
```

---

### 类型 B：§5/s/6/s/7 中对 n=2 的引用（约 10 处）

**现状**：部分 Limitations / Conclusion 仍引用 "n=2" 作为 caveats  
**应改为**： "n=7 (still a small sample, but more robust than n=2)"

**具体位置**：
- §6.3（Sample-size caveat）：仍说 "n=2 is well within workshop scope"
- §7 Conclusion：部分 caveats 仍引用 n=2

---

### 类型 C：Changelog v6.5 条目（约 5 处）

**现状**：v6.5 changelog 里说 "n=2 +26.00 是唯一定干净估计"  
**判断**：✅ **可以保留不动**——changelog 是历史记录，n=2 是 v6.5 的真实状态

---

### 类型 D：Appendix B 逐项目表格（约 7 处）

**现状**：逐项目表格里仍标注 HEADER-BLIND / AWARE  
**判断**：✅ **可以保留不动**——这些标注是数据层的真实状态，与 n=7/n=28 不冲突

---

## 📋 建议的人工修改顺序

1. **先改 §3.6.5**（最核心，讲清楚从 n=8 → n=2 → n=7 的故事）
2. **再改 §6.3 / §7 的 caveats**（n=2 → n=7）
3. **最后全文搜索 `n=2` 和 `+26.00`**，逐处判断保留还是修改

---

## 🔬 修改时的关键原则

> **n=7 clean 是新主结果；n=7 contaminated 不是替代 n=28，而是另一个更严格的"可追溯污染子集"。**

这个区别一定要写清楚，不然后面论文逻辑会乱。

---

## 📤 修改完成后

1. 重命名 `paper_v66.md` → `paper_v6.6.md`
2. 运行 `audit_v3/README.md` 里的复现指令，确认审计产物与论文数字一致
3. 再决定是否公开 `audit_v3/`

---

**生成者注**：本文件由 AI agent 在 rules-first audit 后自动生成。剩余修改需人工判断，请逐处核实后再使用 `paper_v66.md`。
