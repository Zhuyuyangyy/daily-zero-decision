"""Statistical computation utilities for audit_v3.

Pure functions for computing descriptive statistics, confidence intervals,
and hypothesis tests on audit gap data.
"""
from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Sequence


@dataclass(frozen=True)
class Stats:
    """Descriptive statistics for a sample of gap values."""

    n: int
    mean: float
    median: float
    sd: float
    min_val: float
    max_val: float


def compute_stats(gaps: Sequence[float]) -> Stats:
    """Compute descriptive statistics for a sequence of gap values.

    Args:
        gaps: Sequence of self_score - independent_score gap values.

    Returns:
        Stats dataclass with n, mean, median, sd, min, max.

    Raises:
        ValueError: If gaps is empty.
    """
    if not gaps:
        raise ValueError("gaps sequence must not be empty")

    n = len(gaps)
    sorted_gaps = sorted(gaps)
    mean = sum(gaps) / n

    if n == 1:
        median = sorted_gaps[0]
    elif n % 2 == 0:
        median = (sorted_gaps[n // 2 - 1] + sorted_gaps[n // 2]) / 2
    else:
        median = sorted_gaps[n // 2]

    if n == 1:
        sd = 0.0
    else:
        variance = sum((x - mean) ** 2 for x in gaps) / (n - 1)
        sd = math.sqrt(variance)

    return Stats(
        n=n,
        mean=mean,
        median=median,
        sd=sd,
        min_val=min(gaps),
        max_val=max(gaps),
    )


def confidence_interval(
    gaps: Sequence[float], confidence: float = 0.95
) -> tuple[float, float]:
    """Compute confidence interval for the mean of gaps.

    Uses the t-distribution for small samples.

    Args:
        gaps: Sequence of gap values.
        confidence: Confidence level (default 0.95).

    Returns:
        (lower, upper) bounds of the confidence interval.

    Raises:
        ValueError: If gaps has fewer than 2 elements.
    """
    if len(gaps) < 2:
        raise ValueError("Need at least 2 values for confidence interval")

    try:
        from scipy import stats as scipy_stats

        stats = compute_stats(gaps)
        se = stats.sd / math.sqrt(stats.n)
        t_crit = scipy_stats.t.ppf((1 + confidence) / 2, df=stats.n - 1)
        margin = t_crit * se
        return (stats.mean - margin, stats.mean + margin)
    except ImportError:
        # Fallback: use normal approximation (less accurate for small n)
        stats = compute_stats(gaps)
        se = stats.sd / math.sqrt(stats.n)
        # z ≈ 1.96 for 95% CI
        z = {0.90: 1.645, 0.95: 1.960, 0.99: 2.576}.get(confidence, 1.960)
        margin = z * se
        return (stats.mean - margin, stats.mean + margin)


def one_sample_ttest(
    gaps: Sequence[float], mu: float = 0.0
) -> tuple[float, float]:
    """Perform a one-sample t-test on gaps against a null hypothesis mean.

    Args:
        gaps: Sequence of gap values.
        mu: Null hypothesis mean (default 0).

    Returns:
        (t_statistic, p_value) tuple.

    Raises:
        ValueError: If gaps has fewer than 2 elements.
    """
    if len(gaps) < 2:
        raise ValueError("Need at least 2 values for t-test")

    try:
        from scipy import stats as scipy_stats

        t_stat, p_value = scipy_stats.ttest_1samp(gaps, mu)
        return (float(t_stat), float(p_value))
    except ImportError:
        # Manual calculation fallback
        stats = compute_stats(gaps)
        se = stats.sd / math.sqrt(stats.n)
        t_stat = (stats.mean - mu) / se
        # Approximate p-value using normal distribution for large n
        # For small n this is less accurate
        import math as m

        # Two-tailed p-value approximation
        abs_t = abs(t_stat)
        df = stats.n - 1
        # Very rough approximation
        p_value = 2 * (1 - _t_cdf_approx(abs_t, df))
        return (float(t_stat), float(p_value))


def _t_cdf_approx(t: float, df: int) -> float:
    """Approximate CDF of t-distribution using the normal approximation
    with a correction for small df. Not as accurate as scipy but usable
    as a fallback.
    """
    try:
        from scipy import stats as scipy_stats

        return float(scipy_stats.t.cdf(t, df))
    except ImportError:
        # Simple normal approximation (overestimates p for small df)
        # Use the approximation: t ~ normal(0, 1) for df > 30
        # For df < 30, apply a conservative correction
        if df >= 30:
            z = t
        else:
            # Cornish-Fisher expansion approximation
            z = t * (1 - 1 / (4 * df)) / math.sqrt(1 + t * t / (2 * df))
        # Standard normal CDF approximation
        return 0.5 * (1 + math.erf(z / math.sqrt(2)))
