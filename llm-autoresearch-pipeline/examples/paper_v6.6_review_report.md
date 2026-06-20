# paper_v6.6_review_report.md

Generated: 2026-06-14  
Reviewer: AI assistant (rules-first provenance check)  
Scope: Check whether claims are overstated; NOT a grammar/style review.

---

## 1. Overall Verdict

**Conditional pass — ready for data-release prep, but two sections need patching before submission.**

The paper's core narrative is now consistent:
- Abstract / §3.1 / Conclusion all use **n=7 / +35.4** as primary result ✓
- n=2 / +26.00 only appears as **v6.5 historical record** ✓
- n=28 / +31.6 is demoted to **legacy contaminated upper bound** ✓
- n=7 contaminated / +39.1 is clearly marked as **supplementary, not independent-review evidence** ✓
- Limitations explicitly retain: n=7 still small; reviewer is LLM; not a population-level estimate; human-expert arm is future work ✓

**However**, two sections still have overclaim risk:
1. **§3.2–§3.5** (domain breakdown, calibration curve, real-experiment comparison, feature correlation) are all computed on the **n=28 legacy subset**, but the section headers and opening sentences do **not** say this explicitly. A reader skimming §3 after reading §3.1 may assume these analyses are on the n=7 clean subset.
2. **Appendix B per-project table** (line 606-633) still shows the **v1 jsonl values** (with 10 MISMATCHes) without a prominent note that the v2-rebuild values supersede them. The table is useful for reference, but the "self/indep" columns should flag the 10 MISMATCH records.

---

## 2. Remaining Overclaim Risks

### RISK 1 (Medium): §3.2–§3.5 implicitly use n=28 without saying so

| Section | What it says | What it should say |
|---|---|---|
| §3.2 title "Gap by domain" | No mention of n=28 | Add "(n=28 legacy subset)" to title |
| §3.2 first sentence | "The inflation is present in every domain" | "In the legacy n=28 subset, the inflation is present in every domain" |
| §3.3 title "Calibration curve and regression" | No mention of n=28 | Add "(n=28 legacy subset)" to title |
| §3.4 title "Real-experiment vs no-real-experiment gap" | No mention of n=28 | Add "(n=28 legacy subset)" to title |

**Why this matters:** A reviewer who reads §3.1 (n=7 primary) and then skims §3.2 may think the domain breakdown is based on n=7. It is not — the n=7 clean subset has only 7 records, not enough for a per-domain breakdown. The paper should make this explicit to avoid misleading.

**Suggested fix:** Add a 1-sentence note at the start of §3.2:

> *Note: The following subsections (§3.2–§3.5) report descriptive statistics on the legacy n=28 mixed subset, because the n=7 strict clean subset is too small for sub-group analyses. The n=7 result is the primary estimate; the n=28 analyses are supplementary.*

### RISK 2 (Low): Appendix B table uses v1 jsonl values

The per-project table (Appendix B, line 606-633) shows self/indep values from the v1 jsonl, which has 10 MISMATCHes vs the v2-rebuild. The table is useful for reference, but a reader may treat the numbers as authoritative.

**Suggested fix:** Add a column "v2 status" (MATCH / MISMATCH / UNTRACEABLE) to the table, or add a prominent note above the table:

> *Values in this table are from the v1 jsonl. 10 of 33 records have v2-rebuild MISMATCHes (see §3.6.4). Use `calibration_dataset_v2.jsonl` for replication.*

### RISK 3 (Very low): §2.6.2 table still shows n=8 +25.88 as a comparable statistic

The table in §2.6.2 (line 161-177) still shows n=8 +25.88 alongside n=28 +31.6. The table is marked "[historical]" in the header, but the numbers are still there. This is fine as a historical reference, but a reviewer may ask why the paper retains a statistic that the v3 audit has superseded.

**Suggested fix:** This is optional. The paper already says the n=8 result is "historical intermediate". If you want to be more aggressive, you could move the n=8 table to an appendix and replace it in §2.6.2 with a forward pointer to §3.6.5.

---

## 3. Internal Consistency Issues

### ISSUE 1 (Fixed): Abstract / §3.1 / Conclusion now consistent ✓

- Abstract: uses n=7 / +35.4 ✓
- §3.1: uses n=7 / +35.4 ✓
- Conclusion: uses n=7 / +35.4 ✓
- n=28 only appears as legacy upper bound ✓

### ISSUE 2 (Fixed): §3.6.5 self-correction narrative ✓

- Clearly says v6.5 was conservative (n=2) because only 2 records had been fully reconstructed ✓
- Clearly says v6.6 expanded to n=7 via v3 audit, not to maximize effect size ✓
- "This revision is not a post-hoc attempt to maximize the effect size" ✓

### ISSUE 3 (Fixed): n=7 contaminated subset properly framed ✓

- §3.1 line 226: "cannot be interpreted as an independent-review estimate" ✓
- §3.6.5 line 378: "cannot be interpreted as an independent-review estimate" ✓

### ISSUE 4 (New, minor): §4.2 line 411 self-correction narrative wording

Line 411 says:

> "The fact that the v6.5 n=2 clean estimate (+26.00) was expanded to n=7 (+35.4 mean) via the v3 rules-first provenance audit, while the n=28 contaminated upper bound was demoted, is itself an instance of the same failure mode"

This is correct, but the phrase "expanded to n=7 (+35.4 mean)" could be read as "the estimate got larger, so the audit inflated it". The paper already explains (§3.6.5) that the expansion happened because the v3 audit *corrected under-reported independent scores* in several records (§3.6.4 MISMATCHes). This is correct, but the wording in §4.2 could be slightly clearer.

**Suggested fix (optional):** Change to:

> "The fact that the v3 audit *expanded* the strict clean subset from n=2 to n=7, and *corrected* the mean gap from +26.00 to +35.4 (by fixing under-reported independent scores in several records), while demoting the n=28 contaminated upper bound, is itself an instance of the same failure mode"

This makes it clearer that the gap got larger because of *corrections*, not because of a change in inclusion criteria.

---

## 4. Numbers and Terminology Check

| Keyword | Count in main text | Status |
|---|---|---|
| `n=7` (primary result) | 18 | ✓ All correctly used as primary result |
| `n=28` | 30 | ✓ All correctly marked as "legacy contaminated upper bound" or "mixed subset (historical)" |
| `n=8` | 17 | ✓ All correctly marked as "historical intermediate result" or "v6.5 intermediate" |
| `n=2` | 8 | ✓ All in historical context (v6.5 conservative; expanded to n=7) |
| `+35.4` | 12 | ✓ All in primary result context |
| `+39.1` | 5 | ✓ All in "contaminated subset (supplementary)" context |
| `+31.6` | 11 | ✓ All in "legacy upper bound" context |
| `+26.00` | 6 | ✓ All in "v6.5 historical" context |
| `+25.88` | 4 | ✓ All in "historical intermediate" context |
| "population-level estimate" | 4 | ✓ All in "NOT a population-level estimate" context |

**Nota bene:** The terminology is now consistent. The paper does not over-claim.

---

## 5. Sections That Are Ready

| Section | Status | Notes |
|---|---|---|
| Abstract | ✓ Ready | Correctly uses n=7 as primary; clearly demotes n=28 and n=8 |
| §1 Introduction | ✓ Ready | Contribution 5 and 8 correctly updated |
| §2.1–§2.4 Methods | ✓ Ready | No overclaim issues |
| §2.5 Contamination audit (v2, superseded) | ✓ Ready | Correctly marked as superseded by §2.6 and §3.6.4 |
| §2.6 Header-awareness | ✓ Ready | Correctly frames n=8 as historical; points to §3.6.5 for primary result |
| §3.1 Aggregate gap statistics | ✓ Ready | Correctly prioritizes n=7 clean; demotes n=28 |
| §3.6.5 V3 audit | ✓ Ready | Self-correction narrative is clear and honest |
| §5 Threats to Validity | ✓ Ready | All threats retained; no overclaim |
| §6 Limitations | ✓ Ready | All four required limitations present (n=7 small; LLM reviewer; not population estimate; human-expert future work) |
| §7 Conclusion | ✓ Ready | Four caveats clearly listed; not overclaimed |
| §8 Roadmap | ✓ Ready | Correctly framed as separate paper; not overclaimed |
| Appendix A Figure Index | ✓ Ready | No issues |
| Appendix C Data Availability | ✓ Ready | Correctly points to v2-rebuild as authoritative |

---

## 6. Sections That Still Need Patching

| Section | Issue | Severity | Suggested fix |
|---|---|---|---|
| **§3.2 Gap by domain** | Header and first sentence do not say this is n=28 legacy subset | Medium | Add note at start of §3.2 saying these subsections use n=28 because n=7 is too small for sub-group analysis |
| **§3.3 Calibration curve** | Same as above | Medium | Add "(n=28 legacy subset)" to section title |
| **§3.4 Real-experiment comparison** | Same as above | Medium | Add "(n=28 legacy subset)" to section title |
| **§3.5 Feature correlation** | Same as above | Medium | Add "(n=28 legacy subset)" to section title |
| **Appendix B per-project table** | Uses v1 jsonl values (10 MISMATCHes) without prominent flag | Low | Add "v2 status" column or prominent note above table |
| **§4.2 line 411** | Wording could be clearer about why gap got larger | Very low | Optional rewording (see §3 Issue 4 above) |

---

## 7. Final Recommendation

### Recommendation: **Patch §3.2–§3.5 headers, then ready for data-release prep.**

The paper's core claims are now consistent and not overstated. The remaining issues are all about **making explicit what the paper already implies** — that §3.2–§3.5 use the n=28 legacy subset, not the n=7 clean subset.

**Why this matters for submission:** A reviewer who skims §3 may miss the transition from §3.1 (n=7 primary) to §3.2 (n=28 legacy). Adding explicit notes at the start of §3.2 will prevent this confusion and show that the authors have carefully thought about what each analysis is measuring.

**After patching §3.2–§3.5, the paper is ready for:**
1. **v3 dataset release preparation** (the next step you planned)
2. **Submission to workshop / methods track** (as recommended in §6.4)

**Not yet ready for:**
- Submission to a full research article track (n=7 is too small, as the paper honestly acknowledges)
- Claims about population-level magnitude (the paper honestly disclaims this)

---

## 8. Detailed Section-by-Section Notes

### Abstract ✓
- Line 32: Correctly uses n=7 / +35.4 as primary result
- Correctly demotes n=7 contaminated to "supplementary observation"
- Correctly demotes n=28 to "legacy contaminated upper bound"
- No overclaim

### §1 Introduction ✓
- Contribution 5 (line 57): Correctly updated to v6.6 narrative (n=2 → n=7 expansion)
- Contribution 8 (line 60): Correctly updated to n=7 primary result

### §2 Methods ✓
- No overclaim issues
- §2.5 correctly marked as superseded
- §2.6 correctly frames n=8 as historical

### §3 Results ⚠️ (needs patching)
- §3.1 ✓: Correctly prioritizes n=7
- **§3.2 ⚠️**: Needs explicit note that this uses n=28
- **§3.3 ⚠️**: Needs explicit note that this uses n=28
- **§3.4 ⚠️**: Needs explicit note that this uses n=28
- **§3.5 ⚠️**: Needs explicit note that this uses n=28
- §3.6 ✓: All five case studies correctly framed

### §4 Discussion ✓
- §4.2 line 411: Wording could be slightly clearer (optional fix)
- No overclaim

### §5 Threats to Validity ✓
- All threats retained
- §5.7 correctly discusses header-awareness as confounder
- §5.8 correctly discusses reviewer-score measurement error

### §6 Limitations ✓
- §6.1: Correctly says reviewer is LLM, not human
- §6.3: Correctly says n=7 is too small for population-level estimation
- §6.4: Correctly recommends workshop/methods track, not full article

### §7 Conclusion ✓
- Four caveats clearly listed
- Not overclaimed

### Appendix B ⚠️ (needs patching)
- Table uses v1 jsonl values without prominent MISMATCH flag
- Suggested fix: add note or column

---

*End of review report*
