"""Tests for JSONL data integrity — format, fields, consistency."""
import json
from pathlib import Path

import pytest

REQUIRED_FIELDS = [
    "project",
    "self_score",
    "independent_score",
    "gap",
    "provenance_status",
    "contamination_risk",
]


class TestJsonlFormat:
    """Verify JSONL files are well-formed."""

    @pytest.mark.data
    def test_calibration_dataset_valid_jsonl(self, audit_v3_dir):
        path = audit_v3_dir / "calibration_dataset_v3.jsonl"
        assert path.exists(), f"Missing file: {path}"
        with open(path, encoding="utf-8") as f:
            for line_no, line in enumerate(f, 1):
                line = line.strip()
                if not line:
                    continue
                json.loads(line)  # raises if invalid

    @pytest.mark.data
    def test_clean_records_valid_jsonl(self, audit_v3_dir):
        path = audit_v3_dir / "clean_records_v3.jsonl"
        assert path.exists(), f"Missing file: {path}"
        with open(path, encoding="utf-8") as f:
            for line_no, line in enumerate(f, 1):
                line = line.strip()
                if not line:
                    continue
                json.loads(line)

    @pytest.mark.data
    def test_validated_clean_records_valid_jsonl(self, audit_v3_dir):
        path = audit_v3_dir / "manual_validation" / "validated_clean_records_v3.jsonl"
        assert path.exists(), f"Missing file: {path}"
        with open(path, encoding="utf-8") as f:
            for line_no, line in enumerate(f, 1):
                line = line.strip()
                if not line:
                    continue
                json.loads(line)

    @pytest.mark.data
    def test_validated_excluded_records_valid_jsonl(self, audit_v3_dir):
        path = audit_v3_dir / "manual_validation" / "validated_excluded_records_v3.jsonl"
        assert path.exists(), f"Missing file: {path}"
        with open(path, encoding="utf-8") as f:
            for line_no, line in enumerate(f, 1):
                line = line.strip()
                if not line:
                    continue
                json.loads(line)


class TestRequiredFields:
    """Verify all records have required fields with correct types."""

    @pytest.mark.data
    def test_calibration_dataset_required_fields(self, calibration_dataset):
        for i, rec in enumerate(calibration_dataset):
            for field in REQUIRED_FIELDS:
                assert field in rec, f"Record {i} ({rec.get('project', '?')}) missing field: {field}"

    @pytest.mark.data
    def test_clean_records_required_fields(self, clean_records):
        for i, rec in enumerate(clean_records):
            for field in REQUIRED_FIELDS:
                assert field in rec, f"Record {i} ({rec.get('project', '?')}) missing field: {field}"

    @pytest.mark.data
    def test_score_types_are_numeric(self, calibration_dataset):
        for i, rec in enumerate(calibration_dataset):
            if rec.get("self_score") is None or rec.get("independent_score") is None:
                continue  # skip NULL_SCORES records
            assert isinstance(rec["self_score"], (int, float)), \
                f"Record {i} self_score is not numeric: {type(rec['self_score'])}"
            assert isinstance(rec["independent_score"], (int, float)), \
                f"Record {i} independent_score is not numeric: {type(rec['independent_score'])}"
            if rec.get("gap") is not None:
                assert isinstance(rec["gap"], (int, float)), \
                    f"Record {i} gap is not numeric: {type(rec['gap'])}"


class TestGapConsistency:
    """Verify gap = self_score - independent_score."""

    @pytest.mark.data
    def test_calibration_dataset_gap_consistency(self, calibration_dataset):
        for i, rec in enumerate(calibration_dataset):
            if rec.get("gap") is None or rec.get("self_score") is None or rec.get("independent_score") is None:
                continue  # skip NULL_SCORES records
            expected_gap = rec["self_score"] - rec["independent_score"]
            actual_gap = rec["gap"]
            assert abs(actual_gap - expected_gap) < 0.01, \
                f"Record {i} ({rec['project']}): gap={actual_gap}, expected={expected_gap}"

    @pytest.mark.data
    def test_clean_records_gap_consistency(self, clean_records):
        for i, rec in enumerate(clean_records):
            expected_gap = rec["self_score"] - rec["independent_score"]
            actual_gap = rec["gap"]
            assert abs(actual_gap - expected_gap) < 0.01, \
                f"Record {i} ({rec['project']}): gap={actual_gap}, expected={expected_gap}"


class TestSubsetRelationships:
    """Verify subset relationships between datasets."""

    @pytest.mark.data
    def test_clean_records_are_subset_of_calibration(self, clean_records, calibration_dataset):
        cal_projects = {r["project"] for r in calibration_dataset}
        for rec in clean_records:
            assert rec["project"] in cal_projects, \
                f"Clean record {rec['project']} not in calibration dataset"

    @pytest.mark.data
    def test_clean_records_only_contain_clean(self, clean_records):
        for rec in clean_records:
            assert rec["contamination_risk"] == "CLEAN", \
                f"Record {rec['project']} has contamination_risk={rec['contamination_risk']}, expected CLEAN"

    @pytest.mark.data
    def test_validated_clean_matches_clean_records(self, validated_clean_records, clean_records):
        val_projects = {r["project"] for r in validated_clean_records}
        clean_projects = {r["project"] for r in clean_records}
        assert val_projects == clean_projects, \
            f"Validated clean projects differ from clean records: extra={val_projects - clean_projects}, missing={clean_projects - val_projects}"

    @pytest.mark.data
    def test_validated_excluded_records_is_empty(self, validated_excluded_records):
        assert len(validated_excluded_records) == 0, \
            f"Expected 0 excluded records, got {len(validated_excluded_records)}"


class TestStatisticalReproducibility:
    """Verify key statistical figures from the data."""

    @pytest.mark.data
    def test_clean_n_equals_7(self, clean_records):
        assert len(clean_records) == 7

    @pytest.mark.data
    def test_clean_mean_gap_approx_35_4(self, clean_gaps):
        mean_gap = sum(clean_gaps) / len(clean_gaps)
        assert abs(mean_gap - 35.4) < 1.0, \
            f"Clean mean gap={mean_gap:.2f}, expected ~35.4"

    @pytest.mark.data
    def test_clean_median_gap_approx_37(self, clean_gaps):
        sorted_gaps = sorted(clean_gaps)
        n = len(sorted_gaps)
        if n % 2 == 0:
            median = (sorted_gaps[n // 2 - 1] + sorted_gaps[n // 2]) / 2
        else:
            median = sorted_gaps[n // 2]
        assert abs(median - 37.0) < 1.0, \
            f"Clean median gap={median:.2f}, expected ~37.0"

    @pytest.mark.data
    def test_contaminated_n_equals_7(self, contaminated_gaps):
        assert len(contaminated_gaps) == 7

    @pytest.mark.data
    def test_contaminated_mean_gap_approx_39_1(self, contaminated_gaps):
        mean_gap = sum(contaminated_gaps) / len(contaminated_gaps)
        assert abs(mean_gap - 39.1) < 2.0, \
            f"Contaminated mean gap={mean_gap:.2f}, expected ~39.1"

    @pytest.mark.data
    def test_contaminated_median_gap_approx_43(self, contaminated_gaps):
        sorted_gaps = sorted(contaminated_gaps)
        n = len(sorted_gaps)
        if n % 2 == 0:
            median = (sorted_gaps[n // 2 - 1] + sorted_gaps[n // 2]) / 2
        else:
            median = sorted_gaps[n // 2]
        assert abs(median - 43.0) < 2.0, \
            f"Contaminated median gap={median:.2f}, expected ~43.0"
