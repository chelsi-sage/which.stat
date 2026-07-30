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


def normality_check(group_a: list[float], group_b: list[float]) -> dict:
    """Shapiro-Wilk normality test on each of two groups.

    Used to help a user answer "is my data roughly normally distributed?" when
    they aren't sure. Reports each group's W statistic and p-value, and an overall
    ``normal`` flag that is True only when BOTH groups have p >= 0.05.

    Args:
        group_a: outcome values for the first group.
        group_b: outcome values for the second group.

    Returns:
        A dict: ``{"group_a": {"w", "p", "n"}, "group_b": {...}, "normal": bool}``.

    Raises:
        ValueError: if either group has fewer than three values (Shapiro's minimum).
    """
    if len(group_a) < 3 or len(group_b) < 3:
        raise ValueError("each group needs at least three values for Shapiro-Wilk")

    a = stats.shapiro(group_a)
    b = stats.shapiro(group_b)
    return {
        "group_a": {"w": float(a.statistic), "p": float(a.pvalue), "n": len(group_a)},
        "group_b": {"w": float(b.statistic), "p": float(b.pvalue), "n": len(group_b)},
        "normal": bool(a.pvalue >= 0.05 and b.pvalue >= 0.05),
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
