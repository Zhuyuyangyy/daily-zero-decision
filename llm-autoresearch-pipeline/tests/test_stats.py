"""Tests for audit_v3/stats.py — statistical computation functions."""
import math

import pytest

from audit_v3.stats import Stats, compute_stats, confidence_interval, one_sample_ttest


class TestComputeStats:
    """Test compute_stats() function."""

    @pytest.mark.stats
    def test_clean_gaps_mean_approx_35_4(self, clean_gaps):
        stats = compute_stats(clean_gaps)
        assert stats.n == 7
        assert abs(stats.mean - 35.428) < 0.1, f"mean={stats.mean}"
        assert stats.median == 37.0, f"median={stats.median}"

    @pytest.mark.stats
    def test_clean_gaps_sd(self, clean_gaps):
        stats = compute_stats(clean_gaps)
        # SD should be approximately 7.85 (paper reports SD=7.85)
        assert abs(stats.sd - 7.85) < 1.0, f"sd={stats.sd}"

    @pytest.mark.stats
    def test_contaminated_gaps_mean_approx_39_1(self, contaminated_gaps):
        stats = compute_stats(contaminated_gaps)
        assert stats.n == 7
        assert abs(stats.mean - 39.1) < 1.0, f"mean={stats.mean}"
        assert abs(stats.median - 43.0) < 1.0, f"median={stats.median}"

    @pytest.mark.stats
    def test_min_max(self, clean_gaps):
        stats = compute_stats(clean_gaps)
        assert stats.min_val == 21
        assert stats.max_val == 49

    @pytest.mark.stats
    def test_single_value(self):
        stats = compute_stats([42.0])
        assert stats.n == 1
        assert stats.mean == 42.0
        assert stats.median == 42.0
        assert stats.sd == 0.0

    @pytest.mark.stats
    def test_empty_raises(self):
        with pytest.raises(ValueError, match="must not be empty"):
            compute_stats([])

    @pytest.mark.stats
    def test_two_values(self):
        stats = compute_stats([10.0, 20.0])
        assert stats.n == 2
        assert stats.mean == 15.0
        assert stats.median == 15.0
        assert abs(stats.sd - math.sqrt(50)) < 0.01

    @pytest.mark.stats
    def test_all_zero_gaps(self):
        stats = compute_stats([0.0, 0.0, 0.0])
        assert stats.mean == 0.0
        assert stats.sd == 0.0


class TestConfidenceInterval:
    """Test confidence_interval() function."""

    @pytest.mark.stats
    def test_clean_gaps_95_ci(self, clean_gaps):
        lower, upper = confidence_interval(clean_gaps, confidence=0.95)
        # Paper reports 95% CI [29.0, 41.8]
        assert abs(lower - 29.0) < 3.0, f"lower={lower}"
        assert abs(upper - 41.8) < 3.0, f"upper={upper}"
        assert lower < upper

    @pytest.mark.stats
    def test_ci_contains_mean(self, clean_gaps):
        stats = compute_stats(clean_gaps)
        lower, upper = confidence_interval(clean_gaps)
        assert lower < stats.mean < upper

    @pytest.mark.stats
    def test_single_value_raises(self):
        with pytest.raises(ValueError, match="at least 2"):
            confidence_interval([42.0])

    @pytest.mark.stats
    def test_empty_raises(self):
        with pytest.raises(ValueError):
            confidence_interval([])


class TestOneSampleTtest:
    """Test one_sample_ttest() function."""

    @pytest.mark.stats
    def test_clean_gaps_significant(self, clean_gaps):
        t_stat, p_value = one_sample_ttest(clean_gaps, mu=0)
        # Paper reports t=10.52, p=2.1e-05
        assert t_stat > 5, f"t_stat={t_stat} (expected > 5)"
        assert p_value < 0.001, f"p_value={p_value} (expected < 0.001)"

    @pytest.mark.stats
    def test_all_zero_gaps_not_significant(self):
        t_stat, p_value = one_sample_ttest([0.0, 0.0, 0.0, 0.0, 0.0], mu=0)
        # All zeros against mu=0 should not be significant
        # scipy returns (nan, nan) for all-zero input
        assert math.isnan(p_value) or p_value > 0.05 or t_stat == 0.0

    @pytest.mark.stats
    def test_single_value_raises(self):
        with pytest.raises(ValueError, match="at least 2"):
            one_sample_ttest([42.0])

    @pytest.mark.stats
    def test_empty_raises(self):
        with pytest.raises(ValueError):
            one_sample_ttest([])
