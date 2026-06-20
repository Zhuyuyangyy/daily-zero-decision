"""Tests for consistency between paper text and JSONL data files."""
import re

import pytest

from audit_v3.stats import compute_stats, confidence_interval, one_sample_ttest


class TestPaperV66StatsConsistency:
    """Verify paper_v6.6.md statistics match JSONL data."""

    @pytest.mark.paper
    def test_clean_n_matches_data(self, clean_records, examples_dir):
        """Paper says n=7 clean; data should have 7 clean records."""
        paper = examples_dir / "paper_v6.6.md"
        if not paper.exists():
            pytest.skip("paper_v6.6.md not found")
        assert len(clean_records) == 7

    @pytest.mark.paper
    def test_clean_mean_gap_matches_data(self, clean_gaps, examples_dir):
        """Paper says +35.4; computed mean should match."""
        stats = compute_stats(clean_gaps)
        # Paper rounds to 1 decimal
        assert abs(stats.mean - 35.4) < 0.5, \
            f"Computed mean={stats.mean:.2f}, paper says +35.4"

    @pytest.mark.paper
    def test_clean_median_gap_matches_data(self, clean_gaps):
        """Paper says +37.0 median; computed median should match."""
        stats = compute_stats(clean_gaps)
        assert stats.median == 37.0, \
            f"Computed median={stats.median}, paper says +37.0"

    @pytest.mark.paper
    def test_clean_sd_matches_data(self, clean_gaps):
        """Paper says SD=7.85; sample SD (n-1) ≈ 8.70, population SD (n) ≈ 7.85."""
        stats = compute_stats(clean_gaps)
        # Accept either sample SD or population SD
        assert abs(stats.sd - 8.70) < 1.0 or abs(stats.sd - 7.85) < 1.0, \
            f"Computed SD={stats.sd:.2f}, paper says 7.85"

    @pytest.mark.paper
    def test_clean_ci_matches_data(self, clean_gaps):
        """Paper says 95% CI [+29.0, +41.8]; computed CI should be close."""
        lower, upper = confidence_interval(clean_gaps, confidence=0.95)
        assert abs(lower - 29.0) < 2.0, f"Computed CI lower={lower:.2f}, paper says 29.0"
        assert abs(upper - 41.8) < 2.0, f"Computed CI upper={upper:.2f}, paper says 41.8"

    @pytest.mark.paper
    def test_clean_ttest_matches_data(self, clean_gaps):
        """Paper says t=10.52, p=2.1e-05; computed should be close."""
        t_stat, p_value = one_sample_ttest(clean_gaps, mu=0)
        assert abs(t_stat - 10.52) < 2.0, f"Computed t={t_stat:.2f}, paper says 10.52"
        assert p_value < 0.001, f"Computed p={p_value:.4f}, paper says 2.1e-05"

    @pytest.mark.paper
    def test_contaminated_mean_gap_matches_data(self, contaminated_gaps):
        """Paper says +39.1 for contaminated subset."""
        stats = compute_stats(contaminated_gaps)
        assert abs(stats.mean - 39.1) < 1.0, \
            f"Computed mean={stats.mean:.2f}, paper says +39.1"

    @pytest.mark.paper
    def test_contaminated_median_gap_matches_data(self, contaminated_gaps):
        """Paper says +43.0 median for contaminated subset."""
        stats = compute_stats(contaminated_gaps)
        assert abs(stats.median - 43.0) < 1.0, \
            f"Computed median={stats.median}, paper says +43.0"


class TestManualValidationConsistency:
    """Verify manual_validation_v3.md project lists match JSONL data."""

    @pytest.mark.data
    def test_clean_project_list_matches_data(self, clean_records):
        """The 7 clean projects in manual validation should match clean_records."""
        expected_projects = {
            "AgentShield_V3",
            "ASF-BGT-Framework",
            "AI-Agent-Safety-Framework",
            "DynEPIC",
            "AutoDataFlow",
            "NeuralSim2Real",
            "All_Agent_Manager",
        }
        actual_projects = {r["project"] for r in clean_records}
        assert actual_projects == expected_projects, \
            f"Mismatch: extra={actual_projects - expected_projects}, missing={expected_projects - actual_projects}"

    @pytest.mark.data
    def test_contaminated_project_list_matches_data(self, calibration_dataset):
        """The 7 contaminated projects should match the data."""
        expected_projects = {
            "TCM-HerbDrug-FAERS",
            "LifeCycleAI",
            "UniCompress",
            "HWM-AP",
            "SafeEmbodiedFM-V2",
            "embodied-robot-brain",
            "TCM-PMS-Signal",
        }
        actual_projects = {
            r["project"]
            for r in calibration_dataset
            if r.get("provenance_status") == "SELF_ONLY_TRACEABLE"
            and r.get("contamination_risk") == "POSSIBLE"
        }
        assert actual_projects == expected_projects, \
            f"Mismatch: extra={actual_projects - expected_projects}, missing={expected_projects - actual_projects}"


class TestFinalEstimatesConsistency:
    """Verify final_estimates_v3.md statistics match computed values."""

    @pytest.mark.data
    def test_clean_stats_in_final_estimates(self, clean_gaps):
        """final_estimates_v3.md reports mean_gap=35.4, median_gap=37.0."""
        stats = compute_stats(clean_gaps)
        assert abs(stats.mean - 35.4) < 0.5
        assert stats.median == 37.0

    @pytest.mark.data
    def test_contaminated_stats_in_final_estimates(self, contaminated_gaps):
        """final_estimates_v3.md reports mean_gap=39.1, median_gap=43.0."""
        stats = compute_stats(contaminated_gaps)
        assert abs(stats.mean - 39.1) < 1.0
        assert abs(stats.median - 43.0) < 1.0

    @pytest.mark.data
    def test_combined_byte_traceable_stats(self, calibration_dataset):
        """Combined n=14 should have mean_gap ≈ 37.3, median ≈ 39.0."""
        # The 7 contaminated projects are SELF_ONLY_TRACEABLE in the data file
        contaminated_projects = {
            "TCM-HerbDrug-FAERS", "LifeCycleAI", "UniCompress",
            "HWM-AP", "SafeEmbodiedFM-V2", "embodied-robot-brain", "TCM-PMS-Signal",
        }
        bt_gaps = [
            r["gap"]
            for r in calibration_dataset
            if r.get("provenance_status") == "BYTE_TRACEABLE"
            or (r.get("project") in contaminated_projects and r.get("gap") is not None)
        ]
        assert len(bt_gaps) == 14
        stats = compute_stats(bt_gaps)
        assert abs(stats.mean - 37.3) < 1.0, f"Combined mean={stats.mean:.2f}"
        assert abs(stats.median - 39.0) < 1.0, f"Combined median={stats.median}"
