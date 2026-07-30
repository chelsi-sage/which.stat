"""Deterministic two-group statistical tests.

Pure functions built on scipy. Same input -> same output, every time.
No AI is ever involved in this computation (see docs/ARCHITECTURE.md).

Method choice traces to Field, *Discovering Statistics* (SAGE); the numbers are
produced by scipy.stats and cross-checked against known values in the tests.
"""

from __future__ import annotations

from math import sqrt

from scipy import stats


def independent_t_test(group_a: list[float], group_b: list[float]) -> dict:
    """Student's independent-samples t-test comparing two group means.

    Args:
        group_a: outcome values for the first group.
        group_b: outcome values for the second group.

    Returns:
        A dict with the statistic, degrees of freedom, two-tailed p-value,
        Cohen's d effect size, and each group's mean and size.

    Raises:
        ValueError: if either group has fewer than two values.
    """
    n_a = len(group_a)
    n_b = len(group_b)
    if n_a < 2 or n_b < 2:
        raise ValueError("each group needs at least two values")

    # Student's t-test (equal-variance). Welch's is a later option.
    result = stats.ttest_ind(group_a, group_b, equal_var=True)

    mean_a = sum(group_a) / n_a
    mean_b = sum(group_b) / n_b

    return {
        "statistic": float(result.statistic),
        "df": n_a + n_b - 2,
        "p_value": float(result.pvalue),
        "effect_size_d": _cohens_d(group_a, group_b),
        "mean_a": mean_a,
        "mean_b": mean_b,
        "n_a": n_a,
        "n_b": n_b,
    }


def _cohens_d(group_a: list[float], group_b: list[float]) -> float:
    """Cohen's d using the pooled standard deviation."""
    n_a = len(group_a)
    n_b = len(group_b)
    mean_a = sum(group_a) / n_a
    mean_b = sum(group_b) / n_b
    # Sample variances (ddof=1).
    var_a = sum((x - mean_a) ** 2 for x in group_a) / (n_a - 1)
    var_b = sum((x - mean_b) ** 2 for x in group_b) / (n_b - 1)
    pooled_sd = sqrt(((n_a - 1) * var_a + (n_b - 1) * var_b) / (n_a + n_b - 2))
    if pooled_sd == 0:
        return 0.0
    return (mean_a - mean_b) / pooled_sd
