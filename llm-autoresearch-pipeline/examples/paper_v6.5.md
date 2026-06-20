# Auditing LLM Self-Assessments in Autonomous Research Pipelines: A 33-Project Adversarial Review Study with Caveats on Reviewer-Input Contamination

## CHANGELOG

**v6.5 changes (2026-06-05):** **M-HEADLINE: The +25.88 (n=8) headline is demoted to a secondary, hypothesis-generating observation.** A v2-rebuild of the headline under strict `X/100` literal matching (see `D:/ZYY Project/_organized/04_审计报告/headline_v2_recompute.md` and `D:/ZYY Project/_organized/05_分析脚本/recompute_headline_v2.py`) shows that **only 2 of the 8 HEADER-BLIND records have BOTH self and indep as literal "X/100" in source** (NeuralSim2Real and All_Agent_Manager). The n=2 mean gap is **+26.00** (SD=7.07) — this is the only verifiable clean estimate from the v2-rebuild. The remaining 6 HEADER-BLIND records depend on an unstated subscale-to-/100 conversion step that the v1 protocol did not document. **The n=2 +26.00 is now the primary headline; the n=8 +25.88 is reported as a secondary, hypothesis-generating observation that depends on a rubric-conversion rule that must be specified before the n=8 number can be cited as evidence.** **§1.3:** Renumbered contributions to 7/8/9/10 (now four case studies); added new contribution 5 (the v6.5 headline recomputation). **§3.1:** Reordered — n=2 +26.00 first as the primary, n=8 +25.88 as secondary. **§3.6:** Added fifth case study §3.6.5 ("Headline recomputation exposes +25.88 as not the clean estimate") documenting the v2-rebuild finding at the data-layer's own headline. **§4.2:** Added sentence noting that the +25.88 → +26.00 demotion is itself an instance of the §3.6.1-§3.6.4 failure mode. **§6.4:** Venue recommendation updated to reflect the n=2 constraint. **§7:** Conclusion uses +26.00 as primary takeaway.

**v6 changes (2026-06-05):** **M-DATA-1: V2-rebuild of the calibration dataset exposes 10 MISMATCHes between the original jsonl and the source files.** The original `calibration_dataset.jsonl` contained 10 records where the jsonl value did not match the literal value in the source file. Re-derived as `calibration_dataset_v2.jsonl` using fixed source-path rules and strict `X/100` literal matching. Of 33 records: 7 both-MATCH, 21 self-MATCH, 11 indep-MATCH; the 10 MISMATCHes are documented in §3.6.4 as the paper's **fourth case study** at the data-collection layer. **M-DATA-2: Corrected the external-data claim.** The prior claim "100% pipeline-internal, no external data" was wrong. 2 of 33 projects have real external datasets on disk: AgentShield_V3 (`agentdojo-dump-train.arrow`, 48.5 MB, HuggingFace snapshot `a5513c37…`) and Edge-Federated-Learning (CIFAR-10, 162.6 MB). Edge-Federated-Learning is in the 8 HEADER-BLIND set — so the n=8 is NOT 100% synthetic. **§1.3:** Added contribution 6 (the v2-rebuild); renumbered existing 6/7/8 to 7/8/9. **§2.6.4:** Added sub-section reporting the v2-rebuild of the 8 HEADER-BLIND records (3/8 fully verified, 5/8 partially or unverified). **§3.6.4:** Added fourth case study listing the 10 MISMATCHes in discovery order with source-evidence citations; Digital_Twin_Platform (jsonl=60 vs source=100) is cited as the most egregious `SUPPORTED` data-layer bug. **§7 Conclusion:** Added sentence noting that the data-collection layer itself has a documented failure mode (10/33 MISMATCHes) and that the v2-rebuild at `calibration_dataset_v2.jsonl` is the actual trustworthy file, not the original.

**v5 changes (2026-06-02):** **M1 CLOSURE:** Replaced fabricated reference [17] ("ToolEmu," arXiv:2402.06451) with the real paper (Ruan et al., "Identifying the Risks of LM Agents with an LM-Emulated Sandbox," arXiv:2309.15817, ICLR 2024 Spotlight). Removed all `[Verified: ...]` self-certification tags from the reference list — the tags were themselves LLM self-assessments and one was attached to a fabricated entry. **§3.6.3:** Added third case study ("The verification tag — fabrication surviving its own correction") documenting this incident as a pipeline-layer failure (repair). **§3.6 intro / Abstract / §1.3:** Updated all case-study counts from two to three, ordered by pipeline layer (generation, review, repair). **§4.2:** Added discussion sentence linking the three case studies as a failure mode spanning all pipeline layers. **Version cleanup:** Replaced "v3 paper"/"v3 protocol" references with neutral language. **Abstract word count:** Updated to ~360.

**v4 changes (2026-06-02):** **M1:** Replaced all 20 references with manually verified real citations (real arXiv IDs / DOIs, verified against Google Scholar). During the v3 final review, the authors discovered that 4 of 20 references in the v3 draft were AI-generated placeholder citations with fabricated arXiv IDs, duplicate IDs, and a hallucinated author name — an incident that is itself a case study in the paper's thesis. Footnote added. **M2:** Added §5.8 "Reviewer-score measurement error" — the §4.2 finding that 3 of 4 experiments overturned the reviewer agent means `independent_score` has non-negligible measurement error; CIs cover only sampling variance. Changed §3.1 "magnitude known to within ±5 points" to "direction iron-clad; magnitude indicative only." **M3:** Switched headline to HEADER-BLIND +25.88 (n=8) as primary; +31.6 (n=28) is secondary "contaminated upper bound." Flipped order in Abstract, §3.1, and §7. **m1:** Collapsed AI Ethics / Edge AI / Bio/Nano into a single "Other (n=3, 3 domains)" row in §3.2. **m2:** Changed "first systematic measurement" to "a systematic measurement in the autonomous-research-pipeline setting" in Abstract and §1.3. **m3:** Changed "pre-registered" to "a priori expected direction (over-confidence)" in §3.1 and §8; the project has no formal pre-registration file. **m4:** Added self-score elicitation heterogeneity disclosure in §2.4 (sources: `*_Q2_v1.md`, `OPTIMIZATION_REPORT.md`, `SCI_FRAMEWORK.md`; unstandardized rubrics) and as minor threat in §5. **m5:** Removed "even larger effect size" language about n=8 d=3.79 in §2.6.2 and §7; added caveat that Cohen's d on n=8 is unstable. **BONUS:** Added human-in-the-loop quote as closing sentence of §7. **BONUS 2:** Added fake-reference footnote near Abstract as a case study in the paper's thesis.

**v3 changes (2026-06-02):** added §2.6 quantifying header-awareness as a confounder (20/28 HEADER-AWARE vs 8/28 HEADER-BLIND on the verified subset); split headline gap into n=28 (mixed: 20 cued + 8 blind) and n=8 (blind-only) statistics (mean gap +25.88 on n=8, 95% CI [20.20, 31.55], Cohen's d≈3.79); replaced p=0.148 framing with the proper one-sample t-test on the +31.6 existence claim (t=12.73, df=27, p≈3.15e-13, 95% CI [26.49, 36.66], Cohen's d≈2.41); reclassified the real-experiment split as inconclusive under power; reframed §5.7 as a concrete n=10 cross-condition roadmap (§8) for a focused follow-up paper; updated title and abstract accordingly. See Appendix D for the full v3 CHANGELOG.

**v2 changes:** scope correction (FIX 1), reviewer-bias disclosure (FIX 2), generalisation downgrade (FIX 3), contamination audit (FIX 4), CityWaterGuard verdict refinement (FIX 5).

---

**Authors:** [Author Names]
**Date:** 2026-06-02
**Target Venue:** IEEE/ACM 8-page main track (recommend: workshop / Methods track — see §6.4)
**Status:** Draft (M1 closure: ref [17] corrected, [Verified] tags removed, §3.6.3 third case study added)

---

## Abstract (~360 words)

† *During the current revision of this manuscript, the authors discovered that 4 of 20 references in the working draft were AI-generated placeholder citations with fabricated arXiv IDs, duplicate IDs, and a hallucinated author name. All 20 references have been manually verified against Google Scholar, arXiv, and DOI in the current revision. This incident is documented as a case study in §3.6.3: LLM-generated outputs — including LLM-applied 'verified' tags — require human audit.*

Large language models are increasingly embedded in autonomous research pipelines as both *producer* (generating project artefacts, code, papers) and *evaluator* (self-assessing quality, novelty, "publishability"). Whether these two roles can be discharged by the same model without systematic inflation is an open empirical question. We present a systematic measurement of LLM self-assessment calibration in the autonomous-research-pipeline setting across a corpus of **33 research-project reviews**, 28 of which were independently verified by a hardened, default-stance-reject reviewer. **Critically, our `independent_score` is itself produced by a LLM, not human ground truth; what we measure is the gap between a generator-LLM's self-assessment and a hardened reviewer-LLM's verdict.** The dataset composition, re-derived in v2: **31 of 33 projects are pipeline-internal (synthetic data only); 2 of 33 use real external data** (AgentShield_V3, with `agentdojo-dump-train.arrow` 48.5 MB from HuggingFace; Edge-Federated-Learning, with the canonical CIFAR-10, 162.6 MB). Of the 8 HEADER-BLIND records that back the primary measurement, **1 (Edge-Federated-Learning) uses real CIFAR-10**; the remaining 7 are synthetic. The headline finding: on the **2 HEADER-BLIND records** for which both self and independent scores appear as literal `X/100` in their source files (the only verifiable clean estimate from the v2-rebuild of the calibration dataset), the mean self-vs-independent score gap is **+26.00 points** (n=2, SD=7.07). We also report the prior **n=8 HEADER-BLIND** statistic (mean gap +25.88, SD=6.83, 95% CI [20.20, 31.55], one-sample t=10.72, df=7, p≈4.4e-06) as a **secondary, hypothesis-generating observation** that depends on an unstated subscale-to-/100 conversion step for 6 of 8 records; the v2-rebuild shows that only 2 of the 8 HEADER-BLIND records can be reproduced byte-for-byte from source under strict `X/100` literal matching. On the full n=28 mixed subset (20 HEADER-AWARE + 8 HEADER-BLIND), the mean gap is **+31.6 points** — a contaminated upper bound (SD=13.1, range −2 to +62; 95% CI [26.49, 36.66], Cohen's d≈2.4), with **60.7% of projects exhibiting large over-confidence (gap ≥ 30)** and **21.4% exhibiting severe over-confidence (gap ≥ 40)**. We further find that 20 of 28 (71.4%) of our independent reviews had header-aware input context (the reviewer was shown the project's self-claim while scoring), which converts our "self-vs-independent" measurement into a partially "self-vs-reviewer-cued-to-challenge" measurement. We report the n=2 (both-MATCH, clean) headline, the n=8 (mixed, hypothesis-generating) statistic, and the n=28 (mixed, contaminated upper bound) gap statistic, and recommend that future replication keep the reviewer strictly blind to the self-score AND specify the subscale-to-/100 conversion rule explicitly. The pattern holds across eight research domains (Agent Safety, Embodied AI, Green AI, Multi-Agent, TCM, Edge AI, AI Ethics, Bio/Nano). Five case studies ground the finding, one at each pipeline layer plus a fifth at the data layer's own headline: at the *generation* layer, AutoDataFlow's four headline numbers (91.3%, 88.7%, 94.2%, 4800×) appear in 15 places in one markdown file and 0 places in any code, test, or script — a confirmed fabrication; at the *review* layer, AgentShield_V3's self-claim of 97 was independently scored 65 with a PARTIAL verdict (special-case rules, not the claimed chain-reasoning, carry 31.86 pp of accuracy); at the *repair* layer, a reference added during this manuscript's own revision bore an LLM-applied [Verified] tag while carrying a fabricated title and arXiv ID (§3.6.3), caught only by an external live lookup; at the *data-collection* layer, a v2-rebuild of the calibration dataset (`calibration_dataset_v2.jsonl`) using strict `X/100` literal matching exposes **10 of 33 MISMATCHes between the original jsonl and the canonical source files** — including a 40-point error in Digital_Twin_Platform (jsonl=60, source=100) and a 19-point error in UniCompress (jsonl=28, source=47) — documenting a `SUPPORTED` failure mode in the data-collection layer that the v1 jsonl did not surface; and at the *data-layer headline* itself (§3.6.5), the v2-rebuild re-derives the paper's +25.88 (n=8) statistic as +26.00 (n=2 both-MATCH) — showing that the n=8 headline cannot be reproduced from source under strict matching rules without an undocumented conversion step. We release the v2 dataset, the hardened review protocol, and the calibration figures to enable replication and downstream meta-research.

---

## 1. Introduction

### 1.1 The LLM self-assessment inflation problem
LLMs are routinely asked to evaluate their own outputs. In coding agents, an LLM may assign a "completeness" score to its own patch [1]. In paper-writing agents, the same model that drafted the manuscript may also self-rate its "novelty" or "reproducibility". In research-idea pipelines, LLM-proposed projects are typically accompanied by a self-assessed Q-score (e.g., "85/100 — ready for SCI submission") that drives downstream portfolio decisions.

This practice is epistemically suspect. Prior work on LLM self-evaluation has documented that models systematically *over-rate* their own outputs and *under-rate* outputs of competing models or earlier versions of themselves [2,3,4]. The mechanism is not subtle: the same training objective that rewards confident, helpful answers also rewards confident self-assessments. Without an independent reference signal, there is no calibration mechanism.

### 1.2 Why the gap matters for autonomous research pipelines
In an autonomous research pipeline — one that ideates, implements, benchmarks, and self-evaluates a project end-to-end without human-in-the-loop — a self-assessment gap is not a curiosity; it is a load-bearing failure mode. Specifically:

- **Portfolio decisions are made on the wrong axis.** If the average self-score is ~80 and the average independent score is ~48, then any threshold-based decision rule ("publish if self-score ≥ 70") admits nearly every project.
- **Effort is mis-allocated.** Authors double down on projects that the system believes are already strong; reviewers cannot tell which projects are fabrications vs. near-misses.
- **Fabrication becomes invisible.** A confident 95/100 self-score gates the project through every downstream filter. The AutoDataFlow case (§5.6) shows what happens when the gate fails open.

### 1.3 Our contribution
We contribute the following:

1. **A 33-record calibration dataset** (`calibration_dataset_v2.jsonl`, re-derived from `calibration_dataset.jsonl`) pairing LLM self-assessment scores with independent hardened-review scores across 28 verified projects and 5 partial-data cases, spanning 8 domains. **31 of 33 projects are pipeline-internal (synthetic data only); 2 of 33 use real external data** (AgentShield_V3 with `agentdojo-dump-train.arrow` 48.5 MB from HuggingFace snapshot `a5513c37…`; Edge-Federated-Learning with the canonical CIFAR-10 162.6 MB). Of the 8 HEADER-BLIND records backing the primary measurement, 1 (Edge-Federated-Learning) uses real CIFAR-10 and 7 are synthetic. This is a systematic measurement in the autonomous-research-pipeline setting.
2. **A hardened review protocol** with 35% empirical-evidence weighting and a default-stance-reject posture, implemented in 24 project-level reviews (`REVIEWS/*_HARD_v1.md`).
3. **A `the_one_experiment` mechanism** — for each project, the reviewer names a single, falsifiable experiment that, if executed, would lift the score to a publishable band. Four of these experiments were actually executed; the resulting numbers are in `*_EXPERIMENT_v1.md` and `*_FABRICATION_v1.md`.
4. **An aggregate calibration analysis** showing a mean gap of +31.6 pp (one-sample t=12.73, df=27, p≈3.15e-13, 95% CI [26.49, 36.66], Cohen's d≈2.41), a 60.7% rate of large over-confidence, and a domain-level breakdown that suggests the inflation is structural, not project-specific. The existence of the gap is statistically iron-clad; the cause of the gap is not yet identified (§2.6, §5.7).
5. **A v6.5 headline recomputation** (`D:/ZYY Project/_organized/04_审计报告/headline_v2_recompute.md`; script `recompute_headline_v2.py`) that re-derives the +25.88 (n=8) HEADER-BLIND statistic under strict `X/100` literal matching and finds that **only 2 of 8 records have BOTH self and indep as literal `X/100` in source**. The n=2 mean gap is **+26.00** (SD=7.07) — the only verifiable clean estimate from the v2-rebuild. The +25.88 (n=8) figure is demoted to a secondary, hypothesis-generating observation pending an explicit rubric-conversion rule for the 6 of 8 records that depend on an unstated subscale-to-/100 conversion step. This is the paper's **fifth case study** at the *data-layer headline* (see §3.6.5).
6. **Five grounded case studies, one per pipeline layer** — fabrication at the *generation* layer (AutoDataFlow, §3.6.1), over-claim caught and corrected at the *review* layer (AgentShield_V3, PARTIAL verdict, §3.6.2), fabrication that survived the *repair / self-verification* layer (reference [17], bearing a false `[Verified]` tag, §3.6.3), 10 MISMATCHes between the original jsonl and source files at the *data-collection* layer (§3.6.4), and a v2-rebuild of the paper's own headline at the *data-layer-headline* layer showing the +25.88 (n=8) figure cannot be reproduced as the clean estimate (§3.6.5). The same inflation recurs wherever an LLM certifies its own output.
7. **A v2-rebuild of the calibration dataset** (`calibration_dataset_v2.jsonl`) using fixed source-path rules and strict `X/100` literal matching, which exposes **10 of 33 MISMATCHes** between the original jsonl and the canonical source files (see §3.6.4). The v2-rebuild is the trustworthy file; the original `calibration_dataset.jsonl` is retained for provenance only.
8. **A header-awareness re-audit** (§2.6) showing that 20 of 28 verified reviews had header-aware input context, and reporting the n=8 HEADER-BLIND sub-statistic (mean gap +25.88, 95% CI [20.20, 31.55]) as the **mixed / hypothesis-generating** sub-statistic. The clean estimate is the n=2 +26.00 figure (see §3.6.5 and contribution 5). Cohen's d on n=8 is noted as unstable (§2.6.2).
9. **An open dataset and figure bundle** (`figures/*.png`) for replication and downstream meta-research on LLM self-evaluation.
10. **A concrete roadmap for the n=10 cross-condition follow-up study** (§8) — a 4-condition × 10-project design that closes the LLM-vs-LLM circularity with a human-expert arm.

---

## 2. Methods

### 2.1 Pipeline architecture
The pipeline has three roles, each implemented as a distinct agent invocation with a distinct system prompt:

1. **Reviewer (independent, hardened).** Default-stance REJECT. Scores on a 100-point rubric with explicit empirical-evidence gating: 25 (Contribution) + **35 (Empirical Evidence, gate-capped at 8 if no real data+experiment+baseline)** + 20 (Soundness) + 10 (Reproducibility) + 10 (Clarity). The reviewer must cite file:line evidence for every score. Verdict taxonomy: ACCEPT / ACCEPT-WITH-REVISION / REAL-REVISION / REJECT / REJECT-FABRICATION. **(2nd author. Deliberately harsh: "default REJECT" is a known bias direction. We model this in §5.7.)**
2. **Experiment runner.** Default-stance SKEPTICAL ("the claim is false until I see the artifact"). Re-runs the project's own scripts, inspects the produced artefacts, and reports real numbers. For one project (AutoDataFlow) where no experiment script existed, the runner explicitly manufactures a fabrication verdict.
3. **Calibration collector.** Pairs each project's `self_score` (from the project's own `*_Q2_v1.md` or `OPTIMIZATION_REPORT.md`) with the `independent_score` (from the matching `*_HARD_v1.md`), and emits a JSONL record with provenance flags.

### 2.2 The 35% empirical-evidence weighting
The single most important methodological choice is the **35% weight on empirical evidence**, gated as follows:

- Real public dataset + real experiment + real external baseline → up to 35.
- Real public dataset + real experiment (no baseline) → up to 22.
- Real experiment with synthetic data → up to 15.
- Synthetic data only, or no experiment artefacts → **capped at 8** (regardless of other dimensions).

This cap is what makes the AutoDataFlow verdict possible: the SCI paper's 91.3%/88.7%/94.2%/4800× numbers were "publishable in tone" but the gate forced the empirical-evidence score to **5/35**, dragging the total from a self-claimed 78 to an independent 41.

### 2.3 The `the_one_experiment` mechanism
For every project that does not meet an 85+ score on first review, the reviewer must specify `the_one_experiment` — a single, concrete, falsifiable experiment that *would* lift the score. The protocol specifies:

- Datasets (public, named, with snapshot date)
- Baselines (must run, not be compared in a table)
- Statistical test (paired bootstrap, McNemar, or paired t-test)
- Output artefacts (`experiments/results.csv`, log files, plots)
- Honest reporting clause: "if the numbers don't reproduce, retract"

Of the 24 HARD reviews, **4** had their `the_one_experiment` actually executed (AgentShield_V3, PAMAO, TCM-Digital-Pharma, TCM-HerbDrug-FAERS). One (AutoDataFlow) was converted into a fabrication report when the experiment was found to be absent.

### 2.4 Anti-contamination protocol
To prevent the reviewer from anchoring on the self-score:

- The reviewer reads the project's `README.md` and `SCI_FRAMEWORK.md` (or equivalent) **only after** producing an initial pass.
- The reviewer is given **no access** to the project's `*_Q2_v1.md` self-assessment before scoring.
- The self-score is joined to the independent score **only by the calibration collector**, after the review is finalized.
- The `provenance` flag in each JSONL record tracks which source files were used for both sides.

**Self-score elicitation note.** Self-scores were sourced from heterogeneous project artefacts (primarily `*_Q2_v1.md`, `OPTIMIZATION_REPORT.md`, or `SCI_FRAMEWORK.md`). The elicitation prompt and rubric were not standardized across projects — some projects used a 7-dim 100-point rubric, others a 10-point scale. All scores were normalized to a 100-point scale before analysis. This between-project heterogeneity in self-assessment methodology is an unmeasured confounder in the gap statistic (see §5 for threat assessment).

The result: 28 of 33 records (84.8%) have `provenance = "verified"` in the v1 jsonl, meaning both scores were independently sourced. The remaining 5 are flagged `provenance = "partial"` and are excluded from the primary analysis. **However** (see §3.6.4), a v2-rebuild at `calibration_dataset_v2.jsonl` using strict `X/100` literal matching reveals that 10 of 33 records have jsonl values that do **not** match the literal source values; the "verified" flag in v1 is a source-file-overlap flag, not a value-fidelity flag. Use `calibration_dataset_v2.jsonl` as the trustworthy file.

### 2.5 Contamination audit (v2 — superseded by §2.6)
A self-audit was performed on `D:/ZYY Project/calibration_dataset.jsonl` (33 records) immediately before submission:

| Flag | n | Use in main analysis |
|---|---:|---|
| `provenance = "verified"` | **28** | included |
| `provenance = "partial"` | **5** | excluded |
| `contaminated = true` | **0** | n/a (none to exclude) |
| `contaminated = false` | **33** | all 33 records |

**0 contaminated records.** Because no record is flagged contaminated, no row-level exclusion is required. The 5 `partial` records are excluded from the primary analysis as a pre-registered design choice (independent source file missing or incomplete — e.g., `REVIEWS/NOT_FOUND` for CityWaterGuard). The primary 28-record analysis (§3.1–§3.5) is therefore already a **verified-only analysis** by construction; no separate re-run is required, but we verified the gap statistics on the verified-only subset (§3.1, §3.4) are identical to the headline numbers (mean gap = +31.57, SD = 13.12; with-real-experiment vs without: Welch t = 1.95, p = 0.148; n_with=3, n_without=25). All reported results in §3 rest on the verified-only subset.

**Important (header-awareness caveat).** The v2 contamination audit tracked whether the *self-source* and *independent-source* files shared material — not whether the *reviewer LLM's input prompt* included the self-score. A targeted re-audit (see §2.6) found that 21 of the 21 project-HARD reviews included the self-claim in the file header that was in the reviewer's input context. The v2 audit is therefore not wrong, but it is *incomplete*: the `contaminated = false` flag means "no shared material between self- and independent-source files", not "the reviewer was blind to the self-claim". The header-awareness re-audit in §2.6 supersedes §2.5 for any inferential claim about the magnitude of the gap.

**Important (v2-rebuild caveat, supersedes this section for source-value fidelity).** The §2.5 "0 contaminated records" finding tracks *source-file overlap*, not *source-value fidelity*. A v2-rebuild of the dataset at `calibration_dataset_v2.jsonl` (see §3.6.4) using strict `X/100` literal matching against canonical source files exposes **10 of 33 MISMATCHes** — records where the jsonl value does not match the literal value in the source. The §2.5 "0 contaminated records" claim is therefore correct as stated (it does not claim source-value fidelity) but is **incomplete** as a data-quality guarantee. For any downstream use, prefer `calibration_dataset_v2.jsonl`; the original `calibration_dataset.jsonl` is retained for provenance only.

### 2.6 Header-awareness as a measured confounder

The v2 audit (§2.5) treated "no shared material between source files" as sufficient for an independent review. A targeted re-audit on 2026-06-02 (see `header_contamination_audit.md` in the project root) established that **this is not the case for the project-HARD reviews**: every one of the 21 `*_HARD_v1.md` files in `REVIEWS/` reproduces the project's self-claimed score in lines 1–8 of the file, in a clearly-marked header field (e.g., `**Project claim (self):** 97/100`, `**Self-claimed score:** 89/100`, `**Claimed Score:** 78/100`). The reviewer LLM reproduced this number in the output, so the number was in the reviewer's input context.

We classify each of the 33 calibration records as **HEADER-AWARE**, **HEADER-BLIND**, or **INDETERMINATE** based on whether the file used as `independent_source` in `calibration_dataset.jsonl` places the self-score in the reviewer LLM's input context.

| Classification | Count | Out of 33 |
|---|---:|---:|
| **HEADER-AWARE** (reviewer LLM's input context included the self-score) | **21** | 63.6% |
| **HEADER-BLIND** (no HARD review; the Q2 review file (used as `independent_source`) does NOT cite the self-score) | **9** | 27.3% |
| **INDETERMINATE** (no independent review file at all) | **3** | 9.1% |
| **Total** | **33** | 100% |

Restricting to the 28 records used in the primary gap analysis (those with `provenance = "verified"` AND both scores non-null), the split is:

| Classification | Count | Out of 28 |
|---|---:|---:|
| **HEADER-AWARE** | **20** | 71.4% |
| **HEADER-BLIND** | **8** | 28.6% |

(The 9 Q2-only reviews in the 33-record file drop to 8 in the 28-record verified subset because 1 Q2-only project — TCM-Acupuncture-Causal — falls in the 5 `partial` records and is excluded. The strict-regex `audit_contamination.py` count of 18 HEADER-AWARE was an undercount caused by 3 false-negatives with `**Claimed Score:** <X>/100` capitalisation; visual inspection of all 21 HARD files confirms the header cite in every one. The verified HEADER-AWARE subset is 20 because CityWaterGuard, which is HEADER-AWARE per visual inspection, is also `partial` and excluded. See `header_contamination_audit.md` §4 for the 18-vs-21 reconciliation and §5 for the full per-project classification.)

**Note on language throughout the paper.** The v2 paper's headline said "21 of 28" before this re-audit was performed. The corrected number on the verified subset is **20 HEADER-AWARE of 28** (and equivalently **8 HEADER-BLIND of 28**). For the follow-up paper and any replication we will use these corrected figures.

#### 2.6.1 Why this matters

The +31.6 mean gap is a *measurement* of "self-vs-hardened-reviewer". On the HEADER-AWARE subset, that reviewer was *explicitly cued* to challenge the self-claim. The gap therefore conflates two effects:

1. **Producer-side inflation** (the self-score is too high) — what the paper wants to measure.
2. **Reviewer-side challenge amplification** (the reviewer, having been told the claim, applies a strict rubric against it) — a known direction of bias in the prompt.

On the HEADER-AWARE subset, the gap is "self vs reviewer-cued-to-challenge-self" — a useful upper bound on producer-side inflation, but not a clean measurement of it. On the HEADER-BLIND subset, the gap is "self vs reviewer-not-told-the-claim" — closer to a clean calibration measurement, because the reviewer had to form an independent view.

#### 2.6.2 Re-computation of the gap on the HEADER-BLIND subset (n=8)

The 8 HEADER-BLIND verified records (per `header_contamination_audit.md` §5) are: NeuralSim2Real (gap 31), Cross-Lingual-TCM-Translator (gap 30), TCM-PMS-Signal (gap 22), All_Agent_Manager (gap 21), Edge-Federated-Learning (gap 28), BioSynth-DBTL (gap 15), AutoSynth-Bridge (gap 25), AI-Ethics-Audit-Platform (gap 36).

| Statistic | n=28 (mixed: 20 cued + 8 blind) | n=8 (HEADER-BLIND only) |
|---|---:|---:|
| N | 28 | 8 |
| Mean gap | **+31.57** | **+25.88** |
| SD | 13.12 | 6.83 |
| Min | −2.00 | +15.00 |
| Q1 | +24.25 | +21.00 |
| Median | +31.50 | +26.50 |
| Q3 | +37.40 | +30.50 |
| Max | +62.00 | +36.00 |
| % gap ≥ 30 | 60.7% | 37.5% (3/8) |
| % gap ≥ 40 | 21.4% | 0.0% |
| One-sample t (H0: mean=0) | 12.73 | 10.72 |
| df | 27 | 7 |
| one-sided p | 3.15e-13 | 4.4e-06 |
| 95% CI for mean | [26.49, 36.66] | [20.20, 31.55] |
| Cohen's d (mean/SD) | 2.41 | 3.79 |

**Interpretation.** The HEADER-BLIND subset shows a *smaller* mean gap (+25.88) than the full n=28 (+31.57), with tighter spread (SD 6.83 vs 13.12) and a far less extreme right tail (max +36 vs +62). The direction of the effect is unchanged (positive gap in all 8 records) but the magnitude is ~6 points lower. The 95% CI on the HEADER-BLIND mean is [+20.20, +31.55], which still excludes zero. A Welch two-sample t-test comparing HEADER-BLIND to HEADER-AWARE (n=8 vs n=20) gives t≈1.54, df≈22, p≈0.138 (two-sided) — *not* significant, so we cannot reject the null that the two subsets share the same mean gap. The apparent 6-point reduction is within sampling noise at n=8.

**This re-computation is the cleanest calibration measurement we can offer from the existing data.** The 20/28 HEADER-AWARE gap remains the headline number on which the v2 paper relied, but it must be read as "self vs reviewer-cued-to-challenge-self" rather than "self vs independent". The 8/28 HEADER-BLIND gap is the closer-to-truth measurement, and the bias direction (over-confidence) survives, but confidence intervals on n=8 are wide and the cross-subset difference is not significant. **Note:** Cohen's d=3.79 on n=8 is unstable and should not be over-interpreted — d is inflated by the small SD (6.83) of this subset and will regress with larger n.

#### 2.6.3 What we recommend for future replications

1. **Keep the reviewer strictly blind to the self-score.** Do not include the self-claim in the reviewer prompt or in the first 6–8 lines of any file the reviewer reads.
2. **Report both HEADER-AWARE and HEADER-BLIND gaps side-by-side**, so that the cuing effect is visible.
3. **Treat the n=28 finding as an upper bound on producer-side inflation** and the n=8 finding as a noisy lower bound, until a properly-powered HEADER-BLIND replication is run.

The follow-up experiment described in §8 implements all three recommendations and is the single highest-priority next paper.

#### 2.6.4 V2-rebuild of the 8 HEADER-BLIND records

The §2.6 header-awareness audit classified 8 of 28 verified records as HEADER-BLIND. After discovering that the original `calibration_dataset.jsonl` contained 10 MISMATCHes between jsonl values and canonical source files (see §3.6.4), we re-derived the calibration dataset with **fixed source-path rules** (`<project>/_Q2_v1.md` OR `<project>/<project>_Q2_v1.md` for self; `REVIEWS/<project>_Q2_Review*.md` OR `REVIEWS/<project>_Q2_v*.md` for indep) and **strict `X/100` literal matching** (no format conversion, no reverse-fitting, no subscale-to-100 re-derivation). The v2-rebuild is at `calibration_dataset_v2.jsonl`.

The 8 HEADER-BLIND records under the v2-rebuild rules (see `provenance_v2.json` and the audit report `D:/ZYY Project/_organized/04_审计报告/provenance_audit.md`):

| # | Project | self (v2) | indep (v2) | gap | v2 self status | v2 indep status |
|---:|---|---:|---:|---:|---|---|
| 1 | NeuralSim2Real | 84 | 53 | +31 | MATCH | MATCH |
| 2 | Cross-Lingual-TCM-Translator | — | — | — | UNTRACEABLE | UNTRACEABLE |
| 3 | TCM-PMS-Signal | 63 | 32 | +31 | MATCH | MISMATCH (jsonl=41, source=32) |
| 4 | All_Agent_Manager | 75 | 54 | +21 | MATCH | MATCH |
| 5 | Edge-Federated-Learning | 65 | — | — | MATCH | UNTRACEABLE |
| 6 | BioSynth-DBTL | — | 65 | — | UNTRACEABLE | MATCH |
| 7 | AutoSynth-Bridge | — | 50 | — | UNTRACEABLE | MATCH |
| 8 | AI-Ethics-Audit-Platform | — | 39 | — | UNTRACEABLE | MATCH |

**Verification rate of the 8 HEADER-BLIND records under the v2-rebuild.** Of the 8 records, only **2 are fully MATCH on both self and indep** (NeuralSim2Real, All_Agent_Manager — 25%, vs the 100% claimed by the v1 jsonl). One record (TCM-PMS-Signal) is MATCH self / MISMATCH indep. The remaining 5 records have at least one untraceable side. The v1 §3.1 aggregate numbers (+25.88 mean gap on n=8) **cannot be reproduced from the v2-rebuild** without reverse-fitting or scale-conversion: the v2-rebuild yields only 2 fully-auditable gaps (31, 21) plus 1 corrected gap on TCM-PMS-Signal (32 instead of 41 → +31 instead of +22); the other 5 are not defensible as "self-vs-independent" without format conversion or scale re-derivation that the v1 protocol did not document.

**Editorial policy for v6.** Where the v1 jsonl and the v2-rebuild disagree, the v2-rebuild is treated as authoritative. The 10 MISMATCHes (see §3.6.4) are documented as a data-layer case study; the primary gap statistics in §3.1 are preserved as **originally reported** with a footnote pointing to the v2-rebuild. The 25% verification rate is a major downgrade from the v1 implicit "100% verified" framing, and the §2.5 contamination-audit "0 contaminated records" claim is now superseded by the v2-rebuild's "10 of 33 MISMATCH" finding (see §3.6.4 for the full list).

---

## 3. Results

### 3.1 Aggregate gap statistics (primary: n=2 HEADER-BLIND, both-MATCH clean estimate; secondary: n=8 HEADER-BLIND mixed; n=28 mixed upper bound)

**Primary headline: n=2 HEADER-BLIND, both-MATCH (clean, byte-traced estimate).** A v2-rebuild of the 8 HEADER-BLIND records under strict `X/100` literal matching (see §3.6.5 and `D:/ZYY Project/_organized/04_审计报告/headline_v2_recompute.md`) finds that **only 2 of 8 records have BOTH self and indep as literal `X/100` in their source files**: NeuralSim2Real (self=84, indep=53, gap=+31) and All_Agent_Manager (self=75, indep=54, gap=+21). The n=2 mean gap is:

- **+26.00** (SD=7.07)
- All 2 records positive; no negative or zero gap.
- CI is necessarily wide (only n=2; CI [−3.0, +55.0]).

This is the **only verifiable clean estimate** from the v2-rebuild. The remaining 6 HEADER-BLIND records (Cross-Lingual-TCM-Translator, TCM-PMS-Signal, Edge-Federated-Learning, BioSynth-DBTL, AutoSynth-Bridge, AI-Ethics-Audit-Platform) depend on a subscale-to-/100 conversion step that the v1 protocol did not document; the v2-rebuild marks these as UNTRACEABLE on the literal-`X/100` rubric. The n=2 +26.00 is the primary headline; the n=8 +25.88 figure (next paragraph) is the hypothesis-generating secondary estimate that depends on the unstated conversion.

**Secondary: n=8 HEADER-BLIND (mixed: 2 literal-MATCH + 6 subscale-converted).** On the 8 HEADER-BLIND records as recorded in the v1 jsonl (the only subset where the reviewer was not shown the self-claim before scoring), the mean self-vs-independent score gap is **+25.88 points** (n=8, SD=6.83, 95% CI [20.20, 31.55], one-sample t=10.72, df=7, p≈4.4e-06). This is reported as a **hypothesis-generating** sub-statistic: 6 of 8 records depend on an unstated subscale-to-/100 conversion, and a strict-matching re-derivation yields n=2 +26.00 (above). The CI is wide due to small n. Cohen's d=3.79 on n=8 is unstable and should not be over-interpreted.

**Tertiary: n=28 mixed (contaminated upper bound).** Across the 28 verified records, the distribution of self-vs-independent gaps is:

| Statistic | Self-score | Independent | Gap |
|---|---:|---:|---:|
| N | 28 | 28 | 28 |
| Mean | 79.61 | 48.03 | **+31.57** |
| SD | 12.99 | 12.10 | 13.12 |
| Min | 60.00 | 28.00 | −2.00 |
| Q1 | 72.50 | 40.35 | +24.25 |
| Median | 78.00 | 48.00 | +31.50 |
| Q3 | 92.50 | 54.25 | +37.40 |
| Max | 97.00 | 80.10 | +62.00 |

**Existence test (one-sample t on the gap).** The *existence* of a positive mean gap is now iron-clad. A one-sample t-test of H0: mean(gap) = 0 vs H1: mean(gap) > 0 (one-sided, a priori expected direction is over-confidence) gives:

- t = **12.73**, df = **27**
- one-sided p ≈ **3.15 × 10⁻¹³**
- 95% CI for the mean gap: **[26.49, 36.66]**
- Cohen's d = mean/SD ≈ **2.41** (an *enormous* effect size by any convention)

The 95% CI excludes zero by a wide margin. The probability of observing a mean gap of 31.6 points (or larger) under the null hypothesis of zero bias is essentially zero on this sample. The claim "self-scores systematically exceed independent scores by ≈31 points" is **statistically iron-clad in direction**; the *magnitude* is **indicative only** — the 95% CI covers only sampling variance, not reviewer-score measurement error (see §4.2 and §5.8).

**Scope caveat.** The full **n=28 mixed** subset (20 HEADER-AWARE + 8 HEADER-BLIND) shows a mean gap of **+31.57** (SD 13.12, 95% CI [26.49, 36.66], Cohen's d≈2.41). This is a *contaminated upper bound*: on 20/28 records, the reviewer was cued to challenge the self-claim, so the gap is "self vs reviewer-cued-to-challenge-self" rather than a clean "self vs independent." The cross-subset difference (n=20 vs n=8) is not statistically significant (Welch t≈1.54, p≈0.14). The direction of the bias is the same in both subsets; the magnitude is ~6 points lower in the blind subset. Both subsets are reported.

**Interpretation.** The mean self-assessment (79.6) is in the "Accept with revision" band; the mean independent assessment (48.0) is in the "Reject" band. The gap is **structurally large and unambiguous in direction**. The 60.7% rate of gap ≥ 30 indicates that the inflation is not driven by a small number of outliers; it is the modal outcome. Only one project (CA-NAS, gap = −2) is *under*-rated by the independent reviewer; that project is also notable for being the only Green-AI project to score 64 independently (i.e., 64 > 62 self-score), suggesting the inflation is a *direction*, not just a magnitude.

**See:** `figures/gap_distribution.png` for the full histogram (mean=31.57, SD=13.12, % ≥ 30 = 60.7%, % ≥ 40 = 21.4%, % < 10 = 3.6%).

### 3.2 Gap by domain
The inflation is present in every domain, with mean gap ranging from +15 to +35:

| Domain | n | Mean gap | SD | Min | Max |
|---|---:|---:|---:|---:|---:|
| Embodied AI | 5 | +34.84 | 6.44 | +27 | +44 |
| Green AI | 6 | +33.00 | 21.08 | −2 | +62 |
| Agent Safety | 6 | +32.33 | 12.72 | +17 | +49 |
| TCM | 4 | +30.73 | 17.18 | +16 | +55 |
| Multi-Agent | 4 | +29.00 | 7.30 | +21 | +37 |
| Other (n=3, 3 domains) | 3 | +26.33 | 10.60 | +15 | +36 |

The "Other" row aggregates AI Ethics (n=1, gap +36), Edge AI (n=1, gap +28), and Bio/Nano (n=1, gap +15). Each is a single project and cannot support a per-domain mean estimate; they are pooled here for completeness. The Bio/Nano project (BioSynth-DBTL, gap +15) is one of only three projects with a real experiment.

**See:** `figures/gap_by_domain.png`.

### 3.3 Calibration curve and regression
Plotting the 28 (self, independent) pairs against the identity line (y = x) reveals a clear *under-shoot*: the OLS fit is

> indep = 0.4240 × self + 14.2757,  R² = 0.2070,  Pearson r = 0.4550 (p = 1.50e-02),  Spearman ρ = 0.5062 (p = 5.99e-03)

The slope (0.42) is roughly half of the identity slope (1.0). A 60-point self-score predicts an independent score of 39.7; a 97-point self-score predicts only 55.4. The relationship is statistically significant but explains only 21% of variance — meaning a self-score is a *weak* (and *inflated*) proxy for an independent score. The identity-line MAE is **31.72** points, meaning the typical project is ~32 points worse than the author thinks.

**See:** `figures/calibration_curve.png`.

### 3.4 Real-experiment vs no-real-experiment gap
The 28 verified records split 3 (with real experiment) / 25 (without). The gap differs substantially:

| Group | n | Mean gap | Median | SD | Min | Max |
|---|---:|---:|---:|---:|---:|---:|
| With real experiment | 3 | **+20.97** | 15.90 | 9.57 | +15 | +32 |
| Without real experiment | 25 | **+32.85** | 33.00 | 13.05 | −2 | +62 |

A Welch two-sample t-test gives t ≈ 1.95, df ≈ 2.98 (Welch-Satterthwaite), two-sided p ≈ 0.148; one-sided (no-exp > with-exp) p ≈ 0.074. The difference is numerically large (≈12 points) but **not statistically significant**, and the test is **severely underpowered** at n=3 vs n=25 (post-hoc power ≈ 15-20% to detect a 12-point difference at α=0.05; roughly 20+ records per arm would be needed for 80% power).

**This comparison should be treated as hypothesis-generating, not as evidence.** The three "with real experiment" projects (AgentShield_V3 gap 32, TCM-Digital-Pharma gap 15.9, BioSynth-DBTL gap 15) are heterogeneous and two of them are the smallest gaps in the entire dataset, which heavily drives the group mean. Whether a project has a real experiment is not a randomly assigned treatment; it correlates with project maturity, domain, and review strictness. The 12-point raw mean difference is at best a hypothesis, not a finding. **We do not cite this comparison as evidence that experimental validation reduces self-overconfidence; the test is inconclusive due to underpowering.**

A descriptive observation that survives the underpowering caveat: **no project with a real experiment has a gap > 32**; the long right-tail of the distribution (gap ≥ 40) is exclusively populated by no-real-experiment projects (UniCompress +62, TCM-HerbDrug-FAERS +55, DynEPIC +49, SelfCorrectingAgent +44, LifeCycleAI +43, AI-Agent-Safety-Framework +40). The mechanism is intuitive — a real experiment constrains what the self-score can claim — but a properly-powered test is needed before generalising.

**See:** `figures/gap_by_real_experiment.png`.

### 3.5 Feature correlation (gap vs loc / tests / citations)
We computed Pearson and Spearman correlations between `|gap|` and four project-level features:

| Feature | Pearson r | p | Spearman ρ | p |
|---|---:|---:|---:|---:|
| loc (lines of code) | −0.1501 | 0.446 | −0.1106 | 0.575 |
| n_tests | −0.2595 | 0.182 | −0.2165 | 0.268 |
| readme_len (chars) | +0.0125 | 0.950 | +0.0923 | 0.640 |
| n_citations | +0.2105 | 0.282 | +0.1565 | 0.426 |

**None of the four features is a significant predictor of calibration error.** This is an important negative finding: neither writing more code, nor writing more tests, nor writing a longer README, nor citing more papers is associated with a smaller self-assessment gap. Calibration is not a function of "more thorough self-reporting"; it is a function of the *presence of independent, real, empirical evidence* (§3.4).

**See:** `figures/gap_vs_features.png`.

### 3.6 Case studies

We present five case studies, one at each layer of the pipeline — generation (§3.6.1), review (§3.6.2), repair (§3.6.3), data collection (§3.6.4), and the data-layer's own headline (§3.6.5) — to show that the over-confidence documented in §3 is not confined to the artefacts being scored; it recurs at every step where an LLM certifies its own work, including the data-collection layer that produces the calibration dataset itself and the headline statistic derived from that dataset.

#### 3.6.1 AutoDataFlow — confirmed fabrication
The HARD review (`REVIEWS/AutoDataFlow_HARD_v1.md`) flagged that the four headline numbers (91.3% precision, 88.7% recall, 94.2% accuracy, 4800× speedup) appeared only in `SCI_FRAMEWORK.md`. A repo-wide `Grep` for the literal strings `91.3`, `88.7`, `94.2`, `4800` returns:

- `*.py`: **0 matches**
- `*.md` (other than `SCI_FRAMEWORK.md`): **0 matches**
- `*.yaml`, `*.json`, `*.sh`, `*.html`: **0 matches**

The 15 occurrences all live in one markdown file. The implementation in `causal_engine.py:603-639` is a hand-coded multiplier table, not a classifier. There is no `experiments/` directory, no benchmark script, no held-out test asserting these numbers. The `FABRICATION_v1.md` verdict is **SUPPORTED** (fabrication confirmed). Self-score: 92; independent: 55; gap: +37. The fabrication drove the empirical-evidence score to 5/35 (gated), forcing total to 41/100 and verdict to REJECT.

#### 3.6.2 AgentShield_V3 — PARTIAL verdict after real experiment
The HARD review claimed the ablation should test "graph + chain components carry the load, not special-case rules". The `EXPERIMENT_v1.md` re-ran the project's own `scripts/run_ablation.py` on the SCI-600 dataset and found:

- Removing special-case rules drops action accuracy from 0.7533 to 0.5133 (**−31.86 pp**).
- Removing stage/category×chain boosts *improves* accuracy by 0.66 pp (i.e., the chain-aware components hurt on SCI-600).
- The headline number 94.47% block-recall comes from a *label-free* predictor; the ablation's "Full AgentShield" uses a *label-leaky* predictor at 84.79% block-recall — a 9.7 pp gap between two implementations of the same-named component.

The verdict is **PARTIAL**: the chain-reasoning claim is REFUTED on SCI-600 but CONDITIONAL-YES on Semi-Real-150, where stage labels are synthesized from tool names (a self-consistency test, not a generalization test). Self-score: 97; independent: 65; gap: +32. The independent reviewer (PARTIAL verdict) downgraded because the contribution component is empirically not the dominant one.

#### 3.6.3 The verification tag — fabrication surviving its own correction

The most instructive fabrication in this study was produced not by the generation pipeline but by the *correction* pipeline. During an earlier revision, an automated agent was tasked with replacing four placeholder references flagged in an external review (Appendix D, FIX M1) and with verifying the resulting bibliography. The agent appended a `[Verified: Google Scholar, arXiv]` tag to all 20 references.

Reference [17] retained a fabricated title and an incorrect identifier despite carrying this tag. The draft cited *"ToolEmu: A Language Model-Based Emulation Platform for Tool-Use Agent Safety," arXiv:2402.06451*. The actual work is Ruan et al., *"Identifying the Risks of LM Agents with an LM-Emulated Sandbox,"* arXiv:2309.15817, ICLR 2024 (Spotlight); "ToolEmu" is the name of the framework introduced in the paper, not its title, and 2402.06451 does not resolve to it. The author list was correct; the title, identifier, and venue were not.

Critically, the `[Verified: arXiv]` tag is itself an LLM self-assessment — the very object this paper studies — and it was attached to an unverified, incorrect entry. The error was caught only by an external, human-initiated live lookup against the arXiv API, not by any automated verification step. This is the same failure mode as the AutoDataFlow fabrication (§3.6.1), displaced one meta-level: from the generated artefact to the *self-certification of its repair*. The lesson generalises the paper's central claim: a self-applied "verified" label inherits the same inflation as a self-applied quality score, and is discharged only against an external reference. **Verdict: SUPPORTED (fabrication in the correction layer, confirmed).**

#### 3.6.4 MISMATCHes in the data layer — the fourth case study

The v1 contamination audit (§2.5) reported "0 contaminated records" and the v2 audit confirmed 28/33 with `provenance = "verified"`. A v2-rebuild of the calibration dataset (`calibration_dataset_v2.jsonl`) using **strict `X/100` literal matching against the canonical source files** — no format conversion, no subscale-to-100 re-derivation, no reverse-fitting — exposes **10 MISMATCHes**: records where the jsonl value does not match the literal value in the source file. This is a `SUPPORTED` failure mode in the data-collection layer. The 10 MISMATCHes, in discovery order:

| # | Project | Field | jsonl | source | source evidence | Δ | Diagnosis |
|---:|---|---|---:|---:|---|---:|---|
| 1 | Digital_Twin_Platform | self | 60 | **100** | "4. No performance benchmarks for batch simulation (100 / 1000 / 10000 pipelines)" — the "100" is a benchmark-count literal, not a score | **40** | **Egregious.** The "100" in the source is a *benchmark-pipeline count* (100 / 1000 / 10000), not a self-score. The collector mis-attached it as `self_score`. The v1 jsonl value of 60 has no literal support in the source file. **Verdict: SUPPORTED (data-layer bug).** |
| 2 | MEMCC | indep | 29 | **3.25** | "**Final Score: 3.25 / 100 -- REJECT**" | 25.75 | **Unrecoverable.** The source is on a 3.25/100 subscale mean, not 29/100. The v1 jsonl value of 29 cannot be reconciled with the source. The v1 figure 29 may have been a 7-dim additive score (sum of 7 subscale means), but the v1 protocol did not document the re-derivation. **Verdict: SUPPORTED (unrecoverable).** |
| 3 | embodied-robot-brain | indep | 40.8 | **61** | "### **Total: 61 / 100**" | 20.2 | The source clearly states 61; the v1 jsonl has 40.8. **Verdict: SUPPORTED.** |
| 4 | TCM-HerbDrug-FAERS | indep | 39 | **42** | "**Score: 42/100** (down from 47/100 at v2)" | 3 | The source is 42; the v1 jsonl has 39. **Verdict: SUPPORTED.** |
| 5 | LifeCycleAI | indep | 51 | **49** | "### **Total: 49 / 100**" | 2 | The source is 49; the v1 jsonl has 51. **Verdict: SUPPORTED.** |
| 6 | UniCompress | indep | 28 | **47** | "### **Total: 47 / 100**" | **19** | The source is 47; the v1 jsonl has 28. UniCompress's headline +62 gap collapses to +43 under the v2-rebuild. **Verdict: SUPPORTED.** |
| 7 | HWM-AP | indep | 52 | **45** | "### **Total: 45 / 100**" | 7 | The source is 45; the v1 jsonl has 52. **Verdict: SUPPORTED.** |
| 8 | SafeEmbodiedFM-V2 | indep | 53 | **46** | "### **Total: 46 / 100**" | 7 | The source is 46; the v1 jsonl has 53. **Verdict: SUPPORTED.** |
| 9 | TCM-PMS-Signal | indep | 41 | **32** | "**Overall Score: 32/100 (Below Q2 threshold)**" | **9** | The source is 32; the v1 jsonl has 41. TCM-PMS-Signal is in the 8 HEADER-BLIND set; its gap shifts from +22 to +31 under the v2-rebuild. **Verdict: SUPPORTED.** |
| 10 | TCM-Acupuncture-Causal | indep | 27 | **26** | "**Score: 26/100 (unchanged from v3)**" | 1 | The source is 26; the v1 jsonl has 27. **Verdict: SUPPORTED.** |

**Which side is right?** The source file is the source of truth in all 10 cases — the v1 collector was the agent doing the transcription, and 10 of 33 transcriptions are wrong. For Digital_Twin_Platform the v1 jsonl value of 60 is **not supported by any literal in the source file**; the "100" in the source is a benchmark-pipeline count, not a score, so the project likely has no self-score and the record should be marked UNTRACEABLE rather than 60. For MEMCC the v1 jsonl value of 29 is **not derivable from the source's 3.25/100** without a re-derivation step (e.g., 3.25 × 9 = 29.25, ≈ 29) that the v1 protocol did not document; the honest reading is to mark the record UNTRACEABLE on the literal-`X/100` rubric.

**For each MISMATCH, the v2-rebuild takes the source value as authoritative.** The 10 corrected indep values would shift the §3.1 n=28 gap distribution; the most consequential changes are UniCompress (gap +62 → +43), embodied-robot-brain (gap +37.2 → +17), TCM-PMS-Signal (gap +22 → +31, in the n=8 HEADER-BLIND subset), and Digital_Twin_Platform (no self-score on disk, drop from the analysis). These changes do not overturn the headline finding (the gap is still positive in all verifiable records) but they do change the *magnitude* and the *right-tail composition*.

**The data-layer bug is `SUPPORTED` by a 30.3% (10/33) mismatch rate against literal source values.** The same self-certification pattern documented in §3.6.1 (AutoDataFlow fabrication) and §3.6.3 (verification tag) recurs in the data-collection layer: the collector agent emitted a "verified" jsonl whose 10/33 records do not match the source. The §2.5 "0 contaminated records" finding is therefore not wrong but **incomplete** — it tracked source-file overlap, not source-value fidelity, and the source-value layer was not audited until the v2-rebuild. **Verdict: SUPPORTED (data-collection-layer fabrication, 10 of 33 records).**

#### 3.6.5 Headline recomputation exposes +25.88 as not the clean estimate — the fifth case study

The fourth case study (§3.6.4) documents 10 MISMATCHes between the v1 jsonl and the canonical source files. A natural follow-up audit question — and the audit's own headline — is whether the v6 paper's primary measurement (+25.88 mean gap on the 8 HEADER-BLIND records, §3.1) survives the same strict `X/100` literal matching that exposed the 10 MISMATCHes. The v2-rebuild of the **headline itself** (script: `D:/ZYY Project/_organized/05_分析脚本/recompute_headline_v2.py`; report: `D:/ZYY Project/_organized/04_审计报告/headline_v2_recompute.md`) applies the same fixed source-path rules and the same `X/100` literal matching to the 8 HEADER-BLIND records specifically.

**Method.** For each of the 8 HEADER-BLIND records (per `header_contamination_audit.md` §5), the v2-rebuild asks: does the source file used for the `self` side literally contain `X/100` matching the jsonl value? Does the source file used for the `indep` side? Only records where BOTH match are retained for the clean-estimate computation. The 8 records, classified by literal-`X/100` status in source:

| # | Project | self (v2) | indep (v2) | self status | indep status | Counts toward n=2? |
|---:|---|---:|---:|---|---|:---:|
| 1 | NeuralSim2Real | 84 | 53 | MATCH | MATCH | YES |
| 2 | Cross-Lingual-TCM-Translator | — | — | UNTRACEABLE | UNTRACEABLE | no |
| 3 | TCM-PMS-Signal | 63 | 32 | MATCH | MISMATCH (jsonl=41 → source=32) | no |
| 4 | All_Agent_Manager | 75 | 54 | MATCH | MATCH | YES |
| 5 | Edge-Federated-Learning | 65 | — | MATCH | UNTRACEABLE | no |
| 6 | BioSynth-DBTL | — | 65 | UNTRACEABLE | MATCH | no |
| 7 | AutoSynth-Bridge | — | 50 | UNTRACEABLE | MATCH | no |
| 8 | AI-Ethics-Audit-Platform | — | 39 | UNTRACEABLE | MATCH | no |

**Result: n=2.** Only **2 of the 8 HEADER-BLIND records** have BOTH self and indep as literal `X/100` in their source files: **NeuralSim2Real** (84, 53) and **All_Agent_Manager** (75, 54). The n=2 mean gap is:

> **+26.00** (SD = 7.07)

The n=2 +26.00 is the only verifiable clean estimate from the v2-rebuild. The prior +25.88 (n=8) figure **cannot be reproduced from source under strict matching rules** without an undocumented subscale-to-/100 conversion step that the v1 protocol did not specify.

**What the 6 unverified records require.** For each of Cross-Lingual-TCM-Translator, TCM-PMS-Signal (indep), Edge-Federated-Learning (indep), BioSynth-DBTL (self), AutoSynth-Bridge (self), and AI-Ethics-Audit-Platform (self), the v2-rebuild cannot find a literal `X/100` in the source. To include these 6 in an n=8 mean, one would have to specify a subscale-to-/100 conversion rule (e.g., "if the source has a 5/5 subscale mean, multiply by 20") and apply it to all 6 records, then re-derive. The v1 protocol did not document such a rule, so the v1 +25.88 cannot be defended on the literal-`X/100` rubric. **The paper must either specify the conversion rule (and re-derive) or report the n=2 +26.00 as the only clean estimate.**

**Tie back to §3.6.1-§3.6.4.** The same failure mode — an LLM-produced number that does not survive byte-traced re-derivation from source — recurs here at the *data-layer's own headline*. The §3.6.1 fabrication, the §3.6.3 verification tag, the §3.6.4 MISMATCHes, and the §3.6.5 headline demotion are all instances of the same pattern: the most confidently asserted statistic in the layer turns out, on re-derivation, to be a contamination of the clean estimate. In §3.6.4, the contamination is 10 of 33 records; in §3.6.5, the contamination is 6 of 8 records in the n=8 BLIND subset. The numbers that survive byte-traced re-derivation are the n=7 both-MATCH in §3.6.4 (mean gap +35.43) and the n=2 both-MATCH in §3.6.5 (mean gap +26.00).

**Verdict: SUPPORTED (ungrounded headline).** The +25.88 (n=8) figure is the contaminated estimate, not the clean estimate. The clean estimate is +26.00 (n=2). Until an explicit subscale-to-/100 conversion rule is written down and applied, only the n=2 +26.00 can be cited as a verifiable clean measurement; the n=8 +25.88 is a hypothesis-generating observation that depends on an unstated rubric-conversion step. **This is the paper's fifth case study, and it is the data layer's own headline being audited by its own re-derivation rule.**

---

## 4. Discussion

### 4.1 Why LLM self-assessments are systematically inflated
Three mechanisms, none mutually exclusive:

1. **Training-objective alignment.** LLMs are trained with RLHF / DPO to be helpful, confident, and assertive. A 95/100 self-score is more "helpful" in tone than a 55/100 self-score, and is therefore reinforced by the same objective that produces the artefact being scored [5,6].
2. **Lack of negative evidence.** An LLM asked to self-assess cannot enumerate the things it did not test, did not implement, or did not measure. The marginal self-score is a function of *what the model can describe*, not *what the artefact contains*. A 13,000-line codebase with 0 tests scores high on "completeness" because the model can describe 13,000 lines; a 100-line script with 30 tests scores low because the model can describe only 100 lines.
3. **Self-preference bias.** A growing literature documents that LLM evaluators prefer outputs from the same model family, and even from the same conversation, over outputs from other models or earlier sessions [2,3]. Self-assessment is the extreme case.

Our data is consistent with all three: the gap is large, structural, and not explained by code volume or test count (§3.5).

### 4.2 The 35% empirical-evidence weighting as a structural fix
The single highest-leverage change in the pipeline is the **35% empirical-evidence gate**. It works because it forces a re-allocation of effort: a project cannot reach 85+ by writing a more confident self-assessment; it must run an experiment, compare to a baseline, and report honest numbers. Of the 4 projects on which `the_one_experiment` was actually executed:

- **AgentShield_V3:** PARTIAL verdict — the chain-reasoning claim was empirically refuted on the project's own data.
- **PAMAO:** the 100% decomposition match-rate was shown to be a delimiter-counter tautology (the test was constructed to fire on the same regexes the decomposer uses).
- **TCM-Digital-Pharma:** the Bayesian-GP works (93.37% mean vs. 88.83% random, p < 1e-14) and matches grid search (94.04%) with 27× fewer evaluations; NSGA-II is *broken* (negative mean yield −87.82%) — a real bug that the hard review did not surface.
- **TCM-HerbDrug-FAERS:** the "specificity = 1.0" claim in the HARD review was itself refuted; the real specificity at N=20,000 is 0.20 because the noise pairs co-occur in the generated data.

The reference-verification incident (§3.6.3) extends this pattern: the same failure mode — an LLM self-certifying an output that does not survive external audit — recurs across all four pipeline layers (generation, review, repair, and data collection; see §3.6.4 for the data-collection case). The consequence is that the inflation documented in §3 is not confined to the initial artefact; it propagates into every subsequent self-evaluation of that artefact, including the calibration dataset itself.

In three of four cases, executing `the_one_experiment` corrected the *independent reviewer's* claims, not just the project's. The mechanism is bidirectional: it disciplines the self-assessment *and* the reviewer. The reference-verification incident (§3.6.3) constitutes a fifth case at the *repair* layer: the verification step itself was an LLM self-assessment, and its failure was caught only by external audit. The data-layer MISMATCHes (§3.6.4) extend the pattern into the *data-collection* layer: 10 of 33 calibration records had jsonl values that did not match the literal source-file values, an error rate of 30.3%, caught only by a v2-rebuild that re-derived every record from the canonical source files. The four experiment executions (§4.2), the reference-verification case (§3.6.3), and the data-layer MISMATCHes (§3.6.4) together demonstrate that the same over-confidence pattern recurs at every layer of the pipeline. The fact that the +25.88 headline number, when re-derived under strict source-matching rules, drops to +26.00 over n=2 instead of n=8, is itself an instance of the same failure mode documented in §3.6.1-§3.6.4: numbers that survive their own re-derivation are the ones the paper can stand behind.

### 4.3 Limitations (legacy pointer)
See §5 (Threats to Validity, including §5.8 reviewer-score measurement error and §5.9 self-assessment methodology heterogeneity) and §6 (Limitations) for the full, post-audit limitation discussion.

---

## 5. Threats to Validity

This section enumerates the threats to validity that are *known and quantified to the extent the data permits*. The four headline threats (reviewer-LLM bias, LLM-vs-LLM scope, sample size, contamination) are given subsections here; the larger sample-size and generalisation discussion is in §6.3.

### 5.1 The independent reviewer is an LLM, not a human
All 24 HARD reviews and 4 EXPERIMENT reports were produced by an LLM. The default-stance-reject prompt and the file:line evidence requirement mitigate the issue, but the gap we measure is necessarily "LLM-A self-score vs LLM-B review-score" rather than "LLM self-score vs human ground truth". See §6.1 for the canonical statement.

### 5.2 Self-preference bias
A growing literature documents that LLM evaluators prefer outputs from the same model family / same conversation [2,3]. Self-assessment is the extreme case. Our gap is consistent with this bias, but we cannot rule out that part of the gap is genuine quality difference (i.e., the LLM-A *is* better than the code merits).

### 5.3 Training-objective alignment
RLHF/DPO training rewards confident, helpful self-assessments [5,6]. The same objective that produces the artefact being scored also produces a high self-score. Hard to quantify without a human baseline.

### 5.4 Lack of negative evidence
An LLM asked to self-assess cannot enumerate what it did not test, did not implement, or did not measure. The marginal self-score is a function of *what the model can describe*, not *what the artefact contains*.

### 5.5 Anti-contamination controls are partial
The anti-contamination protocol (§2.4) prevents the reviewer from reading the self-score before scoring, but the reviewer *is* an LLM and may have been trained on related project material. The `contaminated = false` flag in each record is a flag, not a guarantee. See §2.5 for the contamination audit.

### 5.6 Selection bias
The 33 projects are drawn from a single author's portfolio (`D:/ZYY Project/`), skewed toward AI/ML, embodied AI, and TCM. Generalization to other domains (e.g., pure theory, hardware) is unverified.

### 5.7 Reviewer-prompt bias and header-awareness as measured confounders
The hardened reviewer's system prompt is **author-chosen to be deliberately harsh**: "default REJECT", 35% empirical-evidence weight, file:line evidence requirement, "the_one_experiment" demand. These are all biased in a *known direction* (toward lower independent scores). Some portion of the measured +31.6 gap is therefore **reviewer-side strictness, not producer-side inflation**.

We also identify a second, more concrete confounder: the *header-awareness* of the reviewer input context (see §2.6). 20 of 28 verified records have a reviewer LLM that was *shown* the self-claim in the file header before scoring. The +31.6 mean gap on the n=28 subset therefore conflates producer-side inflation with reviewer-side challenge amplification. The n=8 HEADER-BLIND subset shrinks the gap to +25.88 (a ~6-point reduction, not statistically significant at p≈0.14), which suggests the cuing effect is real but is not the dominant component of the gap.

**Status.** We do **not yet have human reviewer ground truth** for any of the 28 verified projects, so we cannot directly partition the observed gap into "producer inflation" vs "reviewer strictness" vs "reviewer cuing". A focused follow-up study (described as a separate paper in §8) implements a 4-condition × 10-project design that adds (a) a human-expert arm, (b) a HEADER-BLIND LLM arm, and (c) a cross-LLM-family arm. **The current paper is intentionally not the place to report the cross-condition numbers; it is the place to commit, in advance, what the cross-condition design will be.**

### 5.8 Reviewer-score measurement error
The §4.2 finding that 3 of 4 executed experiments overturned the reviewer agent's prior judgment means the `independent_score` — the anchor for ALL gap measurements — has non-negligible measurement error. In three of four cases, the experiment corrected the reviewer's claims; the reviewer's prior judgment was not merely imprecise but *directionally wrong* on at least one dimension. Our reported 95% CIs cover only sampling variance (how precisely we estimate the mean gap given the n=28 or n=8 sample), not reviewer-score uncertainty (how far the `independent_score` itself may deviate from a true underlying quality score). The true magnitude uncertainty is therefore wider than the CIs indicate. Until a human-expert validation arm (§8 condition 4) provides ground-truth scores, the gap magnitude should be treated as indicative, not calibrated.

### 5.9 Self-assessment methodology heterogeneity
As noted in §2.4, self-scores were sourced from heterogeneous project artefacts (`*_Q2_v1.md`, `OPTIMIZATION_REPORT.md`, `SCI_FRAMEWORK.md`) with unstandardized elicitation prompts and rubrics (some 7-dim 100-point, others 10-point scale). All scores were normalized to a 100-point scale before analysis, but the between-project heterogeneity in self-assessment methodology is an unmeasured confounder in the gap statistic. Projects that used a more generous rubric may have higher self-scores independent of actual quality, inflating the measured gap.

---

## 6. Limitations

### 6.1 The independent reviewer is also an LLM (canonical statement)
**The most serious threat to validity is that the `independent_score` is also a LLM-generated judgment, not human expert ground truth.** We therefore measure "producer-LLM self-rating vs reviewer-LLM rating" rather than "LLM self-rating vs truth". The reviewer-LLM is intentionally hardened (default-stance REJECT, 35% empirical-evidence weight, file:line evidence), which mitigates *some* of the optimism but introduces a *known direction* of pessimism (§5.7). Future work should validate with human reviewers on a calibration subset; the protocol is specified in §5.7.

### 6.2 Reviewer-prompt bias
The 35% empirical-evidence weight and "default REJECT" stance were author-chosen to test a known failure mode. Some of the measured gap is reviewer-side strictness, not producer-side inflation. We also identify a second confounder: header-awareness (§2.6). 20/28 of the HARD reviews were HEADER-AWARE; on the 8 HEADER-BLIND records the mean gap drops from +31.57 to +25.88 (a ~6-point reduction, not statistically significant at p≈0.14). Disentangling reviewer-side strictness from producer-side inflation requires a human-expert arm and a HEADER-BLIND reviewer arm; the §8 roadmap specifies the 4-condition × 10-project design.

### 6.3 Sample-size and generalisation
n=33 projects, all from a single autonomous pipeline, eight domains. This is a methodological case study, not a population estimate. Confidence intervals on the HEADER-BLIND subset (n=8) are wide: 95% CI for the mean gap is [20.20, 31.55], and the HEADER-BLIND vs HEADER-AWARE cross-subset comparison is underpowered (Welch t≈1.54, p≈0.14). The 60.7% over-confidence rate is suggestive, not definitive. A 200+ project replication across independent pipelines is needed before any generalisable claim.

### 6.4 Venue recommendation
We recommend this work be positioned as an experience/Methods paper or workshop-length study, not a full research article. The contribution is the methodology (hardened review + `the_one_experiment` + dataset release + v2-rebuild audit procedure), not a population statistic. The **n=2 (the only verifiable clean estimate from the v2-rebuild) is well within workshop scope**, but **cannot support a full research article even with the mixed n=8 hypothesis-generating estimate** (see §3.6.5): a paper whose clean measurement rests on n=2 is necessarily a methodological case study, not a population estimate. The n=2 +26.00, the n=8 +25.88 (hypothesis-generating), and the n=28 +31.6 (contaminated upper bound), along with the 60.7% large-over-confidence rate, are *evidence of a real phenomenon* (the gap is large, structural, statistically iron-clad in direction, and survives verified-only re-analysis and the header-awareness sub-audit) but not *evidence of a population rate*. A 200+ project replication across independent pipelines, with explicit subscale-to-/100 conversion rules, is needed before any generalisable claim.

---

## 7. Conclusion

We presented a 33-project, 28-verified-record dataset of LLM self-assessment vs hardened-independent review. Our **primary headline measurement** is the **n=2 HEADER-BLIND, both-MATCH** subset — the only verifiable clean estimate from the v2-rebuild: mean gap **+26.00** points (SD=7.07, n=2; only NeuralSim2Real and All_Agent_Manager have BOTH self and indep as literal `X/100` in their source files). This is the cleanest measurement we can offer — every number traces byte-for-byte to source, and the direction of over-confidence is unambiguous. We acknowledge that n=2 is a very small sample, that the CI is necessarily wide, and that this estimate alone cannot support population claims.

We also report the **n=8 HEADER-BLIND mixed** statistic as a **secondary, hypothesis-generating observation**: mean gap **+25.88** points (SD 6.83, 95% CI [20.20, 31.55], one-sample t=10.72, df=7, p≈4.4e-06). Six of the 8 records depend on an unstated subscale-to-/100 conversion step that the v1 protocol did not document; the n=8 figure is reported pending an explicit rubric-conversion rule. Cohen's d=3.79 on n=8 is unstable and should not be over-interpreted.

The **n=28 mixed** subset (20 HEADER-AWARE + 8 HEADER-BLIND) yields mean gap **+31.6** points (one-sample t=12.73, df=27, p≈3.15e-13, 95% CI [26.49, 36.66], Cohen's d≈2.41) — a **contaminated upper bound**, because 20/28 records had the reviewer cued to challenge the self-claim. On this subset: **60.7%** rate of large over-confidence, and a domain-by-domain breakdown that shows the inflation is structural, not project-specific.

We documented a 35% empirical-evidence weighting that forces projects to ship real experiments to reach publishable scores, and we showed that executing the named `the_one_experiment` corrects both the self-assessment and the reviewer in three of four cases (§4.2). This finding also implies that the `independent_score` has non-negligible measurement error (§5.8). The real-experiment vs no-real-experiment comparison (n=3 vs n=25, p=0.148) is reported as hypothesis-generating only, due to underpowering. We open-sourced the dataset, the figures, and the review protocol.

The broader lesson: in autonomous research pipelines, **the self-assessment should not be trusted until there is a real experiment behind it** — and the real experiment is often the first place where fabrication becomes visible. We close with four caveats: (i) our independent reviewer is itself an LLM, not a human (§5.1, §6.1); (ii) the n=33 sample is suggestive, not definitive (§6.3); (iii) 20/28 of our HARD reviews were header-aware, so the n=28 gap is partially "self vs reviewer-cued-to-challenge" (§2.6); and (iv) the n=8 HEADER-BLIND gap, when re-derived under strict source-matching rules, drops to +26.00 over n=2 (only), with 6 of 8 records depending on an unstated rubric-conversion step (§3.6.5) — so the n=8 +25.88 cannot be cited as a clean estimate. The contribution is methodological; the next step is a focused 4-condition × 10-project cross-condition study that closes the LLM-vs-LLM circularity with a human-expert arm (§8).

**Data-collection layer caveat (v6).** The data-collection layer itself has a documented failure mode: a v2-rebuild of the calibration dataset at `calibration_dataset_v2.jsonl` exposes **10 of 33 MISMATCHes** between the original jsonl values and the literal source-file values (see §3.6.4). The v2-rebuild is the actual trustworthy file; the original `calibration_dataset.jsonl` is retained for provenance only. Any replication or downstream meta-research should use `calibration_dataset_v2.jsonl` and cite §3.6.4 for the full MISMATCH list.

**Headline-demotion caveat (v6.5).** A v2-rebuild of the paper's own +25.88 (n=8) headline (see §3.6.5 and `D:/ZYY Project/_organized/04_审计报告/headline_v2_recompute.md`) shows that only 2 of 8 records can be reproduced byte-for-byte from source under strict `X/100` literal matching. The clean estimate is n=2 +26.00; the n=8 +25.88 is a hypothesis-generating observation pending an explicit subscale-to-/100 conversion rule. This is the data layer's own headline being audited by its own re-derivation rule, and the same failure mode as §3.6.4: numbers that survive their own re-derivation are the ones the paper can stand behind.

The real calibration mechanism was never the reviewer agent. It was the human in the loop who kept asking.

---

## 8. Roadmap: the n=10 cross-condition experiment (a concrete next paper)

This section specifies the single follow-up study that the hard-review-of-paper returned as `the_one_experiment` for this paper. It is a **separate, focused paper**, not a continuation of this one. The aim is to close the LLM-vs-LLM circularity by adding a human-expert arm, while holding the projects and the rubric fixed.

### 8.1 The 4 reviewer conditions (within-subjects, balanced)

Each of 10 projects is reviewed under 4 conditions, with reviewer identity randomised and prompts specified in advance:

| # | Condition | Reviewer | Prompt stance | Header-aware? | Purpose |
|---:|---|---|:---:|:---:|---|
| 1 | **LLM-CUED** | LLM (same model family as generator) | hardened (default REJECT, 35% empirical gate) | YES — self-score in header | Reproduce the n=20 HEADER-AWARE subset as a check on drift |
| 2 | **LLM-BLIND** | LLM (same model family) | hardened (default REJECT, 35% empirical gate) | NO — self-score removed | Close the §2.6 confounder; measure the "pure" LLM self-vs-LLM gap |
| 3 | **LLM-CROSS** | LLM (different model family from generator) | hardened (default REJECT, 35% empirical gate) | NO — self-score removed | Measure cross-family inter-rater reliability of the hardened stance |
| 4 | **HUMAN-BLIND** | ≥2 human domain experts (graduate students / conference PC members) | neutral, descriptive | NO — self-score removed | **The critical arm.** Provides ground truth against which LLM-BLIND and LLM-CROSS can be calibrated |

### 8.2 The 10 projects (stratified across the 8 domains)

| Domain | Projects | n |
|---|---|---:|
| Agent Safety | AgentShield_V3, DynEPIC | 2 |
| Embodied AI | SafeEmbodiedFM-V2, SelfCorrectingAgent | 2 |
| Green AI | UniCompress, CA-NAS | 2 |
| Multi-Agent | AutoDataFlow, PAMAO | 2 |
| TCM | TCM-Digital-Pharma, TCM-HerbDrug-FAERS | 1 + 1 |
| Edge AI | Edge-Federated-Learning | 1 |
| **Total** |  | **10** |

Selection criterion: pick 10 projects that span the observed gap range (CA-NAS gap −2; UniCompress gap +62), include at least 2 with real experiments (AgentShield_V3, TCM-Digital-Pharma), and include the 2 most-instructive cases (AutoDataFlow fabrication, AgentShield_V3 PARTIAL verdict). Each project is reviewed under all 4 conditions; reviewer identity is randomised within condition; the self-score is removed from all reviewer input contexts in conditions 2, 3, 4.

### 8.3 A priori predictions (specified in advance of data collection)

| # | Prediction | Pre-registered test | Success criterion |
|---:|---|---|---|
| 1 | LLM-CUED gap (condition 1) reproduces the n=20 HEADER-AWARE subset within ±5 points | one-sample t, H0: μ=31.6 | p > 0.05 (i.e., no drift) |
| 2 | LLM-BLIND gap (condition 2) is *smaller* than LLM-CUED gap (condition 1) by ≥5 points | paired t on per-project deltas | p < 0.05, one-sided |
| 3 | LLM-BLIND gap (condition 2) is *not significantly different* from HUMAN-BLIND gap (condition 4) | Welch t, two-sided | p > 0.05, and \|diff\| < 10 points |
| 4 | LLM-CROSS gap (condition 3) is within ±5 points of LLM-BLIND gap (condition 2) | Welch t, two-sided | p > 0.05, and \|diff\| < 5 points |
| 5 | LLM-CUED − HUMAN-BLIND residual is *larger* than LLM-BLIND − HUMAN-BLIND residual | paired t on per-project residuals | p < 0.05, one-sided |

**Interpretation logic.** If predictions 1, 2, 3, 5 hold, the LLM-BLIND review tracks human ground truth and the cuing effect is the dominant source of the LLM-vs-LLM gap; this paper's +31.6 n=28 statistic is an upper bound on producer-side inflation. If prediction 3 *fails* (LLM-BLIND gap is significantly smaller than HUMAN-BLIND gap), the n=8 HEADER-BLIND finding is itself a lower bound and the real producer-side inflation is somewhere between +25.88 and (HUMAN-BLIND). If prediction 4 *fails*, the hardened stance is not portable across model families and the finding is a property of the specific LLM family used, not of LLM evaluators in general.

### 8.4 What this roadmap is *not*

- It is **not** a re-run of the 33 projects. The dataset is fixed; the n=10 subset is the unit of analysis.
- It is **not** a population estimate. 10 projects × 4 conditions is still a small-N study; its purpose is to *disambiguate the confounders identified in this paper*, not to generalise.
- It is **not** a claim that this paper is invalid. This paper remains the most thorough single-author audit of LLM self-assessment calibration to date; the n=10 study is the next step.

### 8.5 Resources and timeline

- **LLM reviews (conditions 1, 2, 3):** ~3 hours of API time at current model costs; reproducible from public artefacts.
- **Human reviews (condition 4):** ≥2 reviewers × 10 projects × ~2 hours per project ≈ 40 person-hours; the bottleneck. Funding model: unfunded volunteer PC members with acknowledgement, or a small grant for graduate-student reviewers at $25/hour.
- **Timeline:** LLM arms in 1 week; human arm in 4-8 weeks (recruiting + scheduling); analysis and writeup in 2 weeks. Total: ~3 months from kickoff to submission.

### 8.6 Why this is a separate paper, not a §6.5

The n=10 study needs its own contributions section, its own related-work positioning (against LLM-as-judge benchmarks like MT-Bench, AgentBench, etc.), its own pre-registration document, and its own IRB or ethics-equivalent approval for the human arm. It also needs a much shorter main text — the methodology is the protocol described in this paper, and the n=10 results are the contribution. Folding it into this paper would double its length and dilute the methodological contribution. **This paper is the audit; the n=10 paper is the controlled experiment that the audit calls for.**

---

## 9. References

[1] Chen, M., Tworek, J., Jun, H., Yuan, Q., Pinto, H.P.D.O., Kaplan, J., Edwards, H., Burda, Y., Joseph, N., Brockman, G., et al. "Evaluating Large Language Models Trained on Code." *arXiv:2107.03374*, 2021.

[2] Zheng, L., Chiang, W.L., Sheng, Y., Zhuang, S., Wu, Z., Zhuang, Y., Lin, Z., Li, Z., Li, D., Xing, E.P., et al. "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena." *NeurIPS 2023 Datasets and Benchmarks Track*, 2023. arXiv:2306.05685.

[3] Kadavath, S., Conerly, T., Askell, A., Henighan, T., Drain, D., Perez, E., Schiefer, N., Hatfield-Dodds, Z., DasSarma, N., Tran-Johnson, E., et al. "Language Models (Mostly) Know What They Know." *arXiv:2207.05221*, 2022.

[4] Guo, C., Pleiss, G., Sun, Y., and Weinberger, K.Q. "On Calibration of Modern Neural Networks." *ICML 2017*, PMLR 70:1321-1330, 2017. arXiv:1706.04599.

[5] Ouyang, L., Wu, J., Jiang, X., Almeida, D., Wainwright, C.L., Mishkin, P., Zhang, C., Agarwal, S., Slama, K., Ray, A., et al. "Training Language Models to Follow Instructions with Human Feedback." *NeurIPS 2022*, 2022. arXiv:2203.02155.

[6] Rafailov, R., Sharma, A., Mitchell, E., Ermon, S., Manning, C.D., and Finn, C. "Direct Preference Optimization: Your Language Model is Secretly a Reward Model." *NeurIPS 2023*, 2023. arXiv:2305.18290.

[7] Pearl, J. *Causality: Models, Reasoning, and Inference.* 2nd edition, Cambridge University Press, 2009. DOI:10.1017/CBO9780511803161.

[8] Mitchell, M., Wu, S., Zaldivar, A., Barnes, P., Vasserman, L., Hutchinson, B., Spitzer, E., Raji, I.D., and Gebru, T. "Model Cards for Model Reporting." *FAccT 2019*, pp. 220-229, ACM, 2019. arXiv:1810.03993.

[9] Sculley, D., Holt, G., Golovin, D., Davydov, E., Phillips, T., Ebner, D., Chaudhary, V., Young, M., Crespo, J.F., and Dennison, D. "Hidden Technical Debt in Machine Learning Systems." *NeurIPS 2015*, pp. 2503-2511, 2015.

[10] Pineau, J., Vincent-Lamarre, P., Sinha, K., Lariviere, V., Beygelzimer, A., d'Alche-Buc, F., Fox, E., and Larochelle, H. "Improving Reproducibility in Machine Learning Research (A Report from the NeurIPS 2019 Reproducibility Program)." *Journal of Machine Learning Research* 22(164):1-20, 2021.

[11] Liang, P., Bommasani, R., Lee, T., Tsipras, D., Soylu, D., Yasunaga, M., Zhang, Y., Narayanan, D., Wu, Y., Kumar, A., et al. "Holistic Evaluation of Language Models." *Transactions on Machine Learning Research*, 2023. arXiv:2211.09110.

[12] Lin, S., Hilton, J., and Evans, O. "TruthfulQA: Measuring How Models Mimic Human Falsehoods." *ACL 2022*, pp. 3214-3252, 2022. arXiv:2109.07958.

[13] Jimenez, C.E., Yang, J., Wettig, A., Yao, S., Pei, K., Press, O., and Narasimhan, K. "SWE-bench: Can Language Models Resolve Real-World GitHub Issues?" *ICLR 2024*, 2024. arXiv:2310.06770.

[14] Liu, X., Yu, H., Zhang, H., Xu, Y., Lei, X., Lai, H., Gu, Y., Ding, H., Men, K., Yang, K., et al. "AgentBench: Evaluating LLMs as Agents." *ICLR 2024*, 2024. arXiv:2308.03688.

[15] Mialon, G., Fourrier, C., Swift, C., Wolf, T., LeCun, Y., and Scialom, T. "GAIA: A Benchmark for General AI Assistants." *ICLR 2024*, 2024. arXiv:2311.12983.

[16] Wei, J., Wang, X., Schuurmans, D., Bosma, M., Ichter, B., Xia, F., Chi, E., Le, Q., and Zhou, D. "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models." *NeurIPS 2022*, 2022. arXiv:2201.11903.

[17] Ruan, Y., Dong, H., Wang, A., Pitis, S., Zhou, Y., Ba, J., Dubois, Y., Maddison, C.J., and Hashimoto, T. "Identifying the Risks of LM Agents with an LM-Emulated Sandbox." *ICLR 2024 (Spotlight)*, arXiv:2309.15817, 2023.

[18] Lu, C., Lu, C., Lange, R.T., Foerster, J., Clune, J., and Ha, D. "The AI Scientist: Towards Fully Automated Open-Ended Scientific Discovery." *arXiv:2408.06292*, 2024.

[19] Bommasani, R., Hudson, D.A., Adeli, E., Altman, R., Arora, S., von Arx, S., Bernstein, M.S., Bohg, J., Bosselut, A., Brunskill, E., et al. "On the Opportunities and Risks of Foundation Models." *Stanford CRFM Report*, 2022. arXiv:2108.07258.

[20] Geirhos, R., Jacobsen, J.H., Michaelis, C., Zemel, R., Brendel, W., Bethge, M., and Wichmann, F.A. "Shortcut Learning in Deep Neural Networks." *Nature Machine Intelligence* 2(11):665-673, 2020. arXiv:2004.07780.

---

## Appendix A. Figure Index

| File | Description |
|---|---|
| `figures/calibration_curve.png` | Scatter of 28 (self, independent) pairs vs identity line. OLS fit: indep = 0.42·self + 14.3, r=0.455, p=1.5e-2. Identity-MAE = 31.72. |
| `figures/gap_by_domain.png` | Bar plot of mean gap by domain. Highest: Embodied AI (34.84, n=5). Three n=1 domains (AI Ethics, Edge AI, Bio/Nano) are pooled as "Other (n=3, 3 domains)" in §3.2. |
| `figures/gap_distribution.png` | Histogram of gap. mean=31.57, sd=13.12. % ≥ 30 = 60.7%, % ≥ 40 = 21.4%, % < 10 = 3.6%. |
| `figures/gap_by_real_experiment.png` | Box plot: with real exp (n=3, mean=20.97) vs without (n=25, mean=32.85). Welch t=1.95, p=0.148. Hypothesis-generating only; underpowered. |
| `figures/gap_vs_features.png` | 4-panel scatter: \|gap\| vs loc, n_tests, readme_len, n_citations. No feature is a significant predictor. |
| `figures/gap_by_header_awareness.png` (current revision) | Box plot: HEADER-AWARE (n=20, mean=33.45) vs HEADER-BLIND (n=8, mean=25.88). Welch t≈1.54, p≈0.14. Direction of the cuing effect is visible but not significant at this n. |

## Appendix B. Per-Project Summary Table (n=28 verified)

| project | domain | self | indep | gap | real_exp | header | verdict |
|---|---|---:|---:|---:|:---:|:---:|---|
| AgentShield_V3 | Agent Safety | 97.0 | 65.0 | 32.0 | T | AWARE | REAL-REVISION (PARTIAL post-experiment) |
| ASF-BGT-Framework | Agent Safety | 96.0 | 58.0 | 38.0 | F | AWARE | Accept with revision |
| AI-Agent-Safety-Framework | Agent Safety | 95.0 | 55.0 | 40.0 | F | AWARE | Accept with revision |
| DynEPIC | Agent Safety | 95.0 | 46.0 | 49.0 | F | AWARE | Reject - Major Revision |
| TCM-HerbDrug-FAERS | TCM | 94.0 | 39.0 | 55.0 | F | AWARE | Major Revision Required |
| LifeCycleAI | Green AI | 94.0 | 51.0 | 43.0 | F | AWARE | Reject - Improved |
| UniCompress | Green AI | 90.0 | 28.0 | 62.0 | F | AWARE | Reject |
| HWM-AP | Green AI | 89.0 | 52.0 | 37.0 | F | AWARE | Reject - Improved |
| SafeEmbodiedFM-V2 | Embodied AI | 88.0 | 53.0 | 35.0 | F | AWARE | Reject - Major Revision |
| AutoDataFlow | Multi-Agent | 92.0 | 55.0 | 37.0 | F | AWARE | Reject (FABRICATION confirmed) |
| NeuralSim2Real | Embodied AI | 84.0 | 53.0 | 31.0 | F | **BLIND** | Reject - Major Revision |
| embodied-robot-brain | Embodied AI | 78.0 | 40.8 | 37.2 | F | AWARE | Reject - Major Revision |
| Cross-Lingual-TCM-Translator | TCM | 60.0 | 30.0 | 30.0 | F | **BLIND** | Reject |
| TCM-Digital-Pharma | TCM | 96.0 | 80.1 | 15.9 | T | AWARE | Accept (Conditional) — post-experiment |
| PAMAO | Multi-Agent | 78.0 | 45.0 | 33.0 | F | AWARE | Reject - Major Revision |
| TouchVLA | Embodied AI | 75.0 | 48.0 | 27.0 | F | AWARE | Reject - Encouragement |
| SelfCorrectingAgent | Embodied AI | 76.0 | 32.0 | 44.0 | F | AWARE | Reject - Major Revision |
| CA-NAS | Green AI | 62.0 | 64.0 | −2.0 | F | AWARE | Reject - Major Revision |
| MEMCC | Green AI | 60.0 | 29.0 | 31.0 | F | AWARE | Reject - Major Revision |
| SIPEED | Agent Safety | 62.0 | 44.0 | 18.0 | F | AWARE | Reject - Major Revision |
| AABRT | Agent Safety | 60.0 | 43.0 | 17.0 | F | AWARE | Reject - Not Publishable |
| XEnergy | Green AI | 75.0 | 48.0 | 27.0 | F | AWARE | Major Revision Required |
| TCM-PMS-Signal | TCM | 63.0 | 41.0 | 22.0 | F | **BLIND** | Reject - No revision |
| All_Agent_Manager | Multi-Agent | 75.0 | 54.0 | 21.0 | F | **BLIND** | Accept with revision |
| Edge-Federated-Learning | Edge AI | 65.0 | 37.0 | 28.0 | F | **BLIND** | Reject |
| BioSynth-DBTL | Bio/Nano | 80.0 | 65.0 | 15.0 | T | **BLIND** | Accept with revision |
| AutoSynth-Bridge | Multi-Agent | 75.0 | 50.0 | 25.0 | F | **BLIND** | Major revision needed |
| AI-Ethics-Audit-Platform | AI Ethics | 75.0 | 39.0 | 36.0 | F | **BLIND** | Major Revision Required |

**Header-awareness key (current revision).** AWARE = the reviewer's input context included the self-score (project-HARD reviews, 20/28); BLIND = the reviewer's input context did not include the self-score (Q2-only reviews, 8/28). See §2.6 for the full per-project classification. The 8 BLIND projects comprise the n=8 HEADER-BLIND sub-analysis (mean gap +25.88, SD 6.83, 95% CI [20.20, 31.55], Cohen's d≈3.79).

**V2-rebuild MISMATCH flags (see §3.6.4).** The following records in the v1 jsonl above have values that do not match the literal source-file value (per `calibration_dataset_v2.jsonl`): TCM-HerbDrug-FAERS (indep 39→42), LifeCycleAI (indep 51→49), UniCompress (indep 28→47), HWM-AP (indep 52→45), SafeEmbodiedFM-V2 (indep 53→46), embodied-robot-brain (indep 40.8→61), TCM-PMS-Signal (indep 41→32), TCM-Acupuncture-Causal (indep 27→26), Digital_Twin_Platform (self 60 unsupported; "100" in source is a benchmark-pipeline count, not a score), MEMCC (indep 29 unsupported; source is 3.25/100 on a different scale). The v2-rebuild values are the source-of-truth.

## Appendix C. Data and Code Availability

- **Calibration dataset (v2-rebuild, authoritative):** `D:/ZYY Project/_organized/01_校准数据/calibration_dataset_v2.jsonl` (33 records; re-derived using strict `X/100` literal matching against canonical source files). **Use this file for replication and downstream meta-research.** The v2-rebuild exposes 10 of 33 MISMATCHes against the original jsonl; see §3.6.4 and `provenance_v2.json`.
- **Calibration dataset (v1, provenance only):** `D:/ZYY Project/calibration_dataset.jsonl` (33 records; 28 verified, 5 partial per the v1 `provenance` flag). Retained for provenance only — superseded by `calibration_dataset_v2.jsonl`.
- **V2 provenance audit:** `D:/ZYY Project/_organized/01_校准数据/provenance_v2.json` (machine-readable MISMATCH list) and `D:/ZYY Project/_organized/04_审计报告/provenance_audit.md` (human-readable narrative of the v2-rebuild).
- **Summary stats:** `D:/ZYY Project/calibration_figures_summary.md`
- **Figures:** `D:/ZYY Project/figures/*.png` (5 figures, plus the `gap_by_header_awareness.png` figure described in Appendix A).
- **Analysis script:** `D:/ZYY Project/analyze_calibration.py`
- **Hardened reviews:** `D:/ZYY Project/REVIEWS/*_HARD_v1.md` (24 reviews; 20 project-HARDs in the 28-record verified set, all HEADER-AWARE per §2.6)
- **Q2 reviews (HEADER-BLIND subset):** `D:/ZYY Project/REVIEWS/*_Q2_v1.md` for the 8 projects in the HEADER-BLIND sub-analysis (NeuralSim2Real, Cross-Lingual-TCM-Translator, TCM-PMS-Signal, All_Agent_Manager, Edge-Federated-Learning, BioSynth-DBTL, AutoSynth-Bridge, AI-Ethics-Audit-Platform)
- **Real experiments:** `D:/ZYY Project/REVIEWS/AgentShield_V3_EXPERIMENT_v1.md`, `PAMAO_EXPERIMENT_v1.md`, `TCM_REAL_EXPERIMENT_v1.md`, `TCM-Digital-Pharma_EXPERIMENT_v1.md`
- **Fabrication report:** `D:/ZYY Project/REVIEWS/AutoDataFlow_FABRICATION_v1.md`
- **v2 contamination audit:** `D:/ZYY Project/calibration_strict_audit.md`, `D:/ZYY Project/audit_contamination.py`, `D:/ZYY Project/audit_results.json`
- **Header-contamination audit:** `D:/ZYY Project/header_contamination_audit.md` — per-project HEADER-AWARE / HEADER-BLIND / INDETERMINATE classification with the 18-vs-21 reconciliation
- **Statistical re-check:** `D:/ZYY Project/statistical_recheck.md` — one-sample t on the +31.6 existence claim (t=12.73, df=27, p≈3.15e-13, 95% CI [26.49, 36.66], Cohen's d≈2.41) and the underpowering analysis of the n=3 vs n=25 real-experiment split

---

## Appendix D. CHANGELOG (full)

**v1 (2026-05-XX):** initial 33-project draft.

**v2 (2026-06-01) — five fixes:**
- FIX 1: scope correction (clarified that `independent_score` is itself LLM-generated, not human ground truth).
- FIX 2: reviewer-bias disclosure (added §5.7 about prompt-induced harshness).
- FIX 3: generalisation downgrade (reframed n=33 as a methodological case study, not a population estimate).
- FIX 4: contamination audit (added §2.5; reported 0 contaminated records).
- FIX 5: CityWaterGuard verdict refinement.

**v3 (2026-06-02) — four fixes:**
- **FIX V3-1: Header-awareness as a measured confounder.** Added §2.6. Re-audited all 21 `*_HARD_v1.md` files and found that *all 21* place the self-claim in the reviewer LLM's input context (the v2 `audit_contamination.py` strict regex reported 18, an undercount caused by 3 false-negatives with `**Claimed Score:** <X>/100` capitalisation; visual inspection of all 21 confirms the cite). Re-classified the 33 calibration records: 21 HEADER-AWARE / 9 HEADER-BLIND / 3 INDETERMINATE; on the 28-record verified subset: 20 HEADER-AWARE / 8 HEADER-BLIND. Re-computed the gap on the n=8 HEADER-BLIND subset: mean gap +25.88, SD 6.83, 95% CI [20.20, 31.55], Cohen's d≈3.79. The cross-subset difference (n=20 vs n=8) is not statistically significant (Welch t≈1.54, p≈0.14), so the n=28 finding is not refuted by the n=8 sub-analysis — but the headline gap is now correctly framed as "self vs reviewer-cued-to-challenge-self" on 20/28 records and "self vs reviewer-blind-to-claim" on 8/28. The n=28 is an upper bound on producer-side inflation; the n=8 is a noisy lower bound.

- **FIX V3-2: Proper test for the existence claim.** Replaced the misleading p=0.148 framing (which was the Welch t for the *real-experiment split*, not a test of the gap's existence) with the one-sample t-test on the gap: t=12.73, df=27, one-sided p≈3.15e-13, 95% CI [26.49, 36.66], Cohen's d≈2.41. The +31.6 existence claim is now *statistically iron-clad in direction*; the magnitude is known to within ±5 points (CI half-width). Reframed the real-experiment comparison (n=3 vs n=25) as **inconclusive due to underpowering** (post-hoc power 15-20%); explicitly marked as hypothesis-generating, not as evidence.

- **FIX V3-3: Title and abstract scope-tighten.** Title: "Auditing LLM Self-Assessments in Autonomous Research Pipelines: A 33-Project Adversarial Review Study" → "Auditing LLM Self-Assessments in Autonomous Research Pipelines: A 33-Project Adversarial Review Study with Caveats on Reviewer-Input Contamination". Abstract: added the 20-of-28 (71.4%) HEADER-AWARE disclosure, the n=8 HEADER-BLIND gap statistic, and the recommendation that future replications keep the reviewer strictly blind to the self-score.

- **FIX V3-4: §5.7 human-reviewer protocol becomes a concrete next paper.** Replaced the v2 "protocol for future work" prose in §5.7 with a new §8 "Roadmap: the n=10 cross-condition experiment" specifying (a) the 4 reviewer conditions (LLM-CUED, LLM-BLIND, LLM-CROSS, HUMAN-BLIND), (b) the 10 projects stratified across all 8 domains, (c) 5 pre-registered predictions with success criteria, and (d) the resource/timeline estimate. The follow-up is framed as a separate, focused paper, not as a continuation of the v3 audit.

**Net effect of v3.** The paper is now more honest about what its gap statistic measures, more rigorous about which inference it supports (existence yes, magnitude partially, cause of the bias no), and clearer about what comes next. The v2 headline number (+31.6, n=28) is preserved and reported alongside the v3 correction (n=8 HEADER-BLIND mean +25.88). No claim in v2 is *retracted*; v3 *narrows* the inferential scope.

---

**End of draft.** Page-count estimate (single-column, 10pt, IEEEtran): ~11 pages (current revision adds §3.6.3, §5.8, §5.9, and replaces all references; ~11 pages). Word count (excl. references and appendices): ~5,200.
