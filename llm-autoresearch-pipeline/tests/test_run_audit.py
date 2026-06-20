"""Tests for audit_v3/run_audit.py — audit pipeline reproducibility."""
import json
from pathlib import Path

import pytest

from audit_v3.run_audit import (
    load_calibration_dataset,
    classify_provenance,
    classify_contamination,
    extract_clean_records,
    compute_summary,
)


class TestLoadCalibrationDataset:
    @pytest.mark.data
    def test_loads_33_records(self, audit_v3_dir):
        records = load_calibration_dataset(audit_v3_dir / "calibration_dataset_v3.jsonl")
        assert len(records) == 33

    @pytest.mark.data
    def test_each_record_is_dict(self, audit_v3_dir):
        records = load_calibration_dataset(audit_v3_dir / "calibration_dataset_v3.jsonl")
        for rec in records:
            assert isinstance(rec, dict)
            assert "project" in rec


class TestClassifyProvenance:
    @pytest.mark.data
    def test_byte_traceable(self):
        rec = {"self_match_to_original": True, "indep_match_to_original": True, "self_score": 80, "independent_score": 50}
        assert classify_provenance(rec) == "BYTE_TRACEABLE"

    @pytest.mark.data
    def test_self_only_traceable(self):
        rec = {"self_match_to_original": True, "indep_match_to_original": False, "self_score": 80, "independent_score": 50}
        assert classify_provenance(rec) == "SELF_ONLY_TRACEABLE"

    @pytest.mark.data
    def test_indep_only_traceable(self):
        rec = {"self_match_to_original": False, "indep_match_to_original": True, "self_score": 80, "independent_score": 50}
        assert classify_provenance(rec) == "INDEP_ONLY_TRACEABLE"

    @pytest.mark.data
    def test_null_scores(self):
        rec = {"self_match_to_original": None, "indep_match_to_original": None, "self_score": None, "independent_score": None}
        assert classify_provenance(rec) == "NULL_SCORES"

    @pytest.mark.data
    def test_null_score_self(self):
        rec = {"self_match_to_original": None, "indep_match_to_original": None, "self_score": None, "independent_score": 50}
        assert classify_provenance(rec) == "NULL_SCORES"


class TestClassifyContamination:
    @pytest.mark.data
    def test_clean_when_indep_match(self):
        rec = {"indep_match_to_original": True}
        assert classify_contamination(rec) == "CLEAN"

    @pytest.mark.data
    def test_possible_when_no_indep_match(self):
        rec = {"indep_match_to_original": False}
        assert classify_contamination(rec) == "POSSIBLE"

    @pytest.mark.data
    def test_none_when_indep_unknown(self):
        rec = {"indep_match_to_original": None}
        assert classify_contamination(rec) is None


class TestExtractCleanRecords:
    @pytest.mark.data
    def test_extracts_7_clean(self, calibration_dataset):
        clean = extract_clean_records(calibration_dataset)
        assert len(clean) == 7

    @pytest.mark.data
    def test_all_are_byte_traceable(self, calibration_dataset):
        clean = extract_clean_records(calibration_dataset)
        for rec in clean:
            assert rec.get("provenance_status") == "BYTE_TRACEABLE" or (
                rec.get("self_match_to_original") is True and rec.get("indep_match_to_original") is True
            )

    @pytest.mark.data
    def test_all_are_clean_contamination(self, calibration_dataset):
        clean = extract_clean_records(calibration_dataset)
        for rec in clean:
            assert rec.get("contamination_risk") == "CLEAN" or rec.get("indep_match_to_original") is True


class TestComputeSummary:
    @pytest.mark.data
    def test_clean_summary_matches_paper(self, calibration_dataset):
        clean = extract_clean_records(calibration_dataset)
        summary = compute_summary(clean)
        assert summary["n"] == 7
        assert abs(summary["mean"] - 35.4) < 0.5
        assert summary["median"] == 37.0

    @pytest.mark.data
    def test_ci_contains_mean(self, calibration_dataset):
        clean = extract_clean_records(calibration_dataset)
        summary = compute_summary(clean)
        ci_lo, ci_hi = summary["ci_95"]
        assert ci_lo < summary["mean"] < ci_hi

    @pytest.mark.data
    def test_ttest_significant(self, calibration_dataset):
        clean = extract_clean_records(calibration_dataset)
        summary = compute_summary(clean)
        assert summary["p_value"] < 0.01
