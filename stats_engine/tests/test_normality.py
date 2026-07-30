"""Golden tests for the normality check (Shapiro-Wilk per group).

We don't hand-compute Shapiro-Wilk W (it's involved), so instead we assert the
*decisions* the check makes on datasets whose shape is unambiguous:
- symmetric, evenly-spread data -> both groups look normal -> normal is True
- a group with an extreme outlier / heavy skew -> not normal -> normal is False
plus the documented error for too-few values.
"""

import pytest

from stats_engine.two_group import normality_check


# Roughly symmetric, no extreme values.
NORMALISH_A = [10, 11, 12, 12, 13, 13, 14, 14, 15, 16]
NORMALISH_B = [20, 21, 22, 22, 23, 23, 24, 24, 25, 26]

# Strongly skewed: many small values, one huge outlier.
SKEWED = [1, 1, 1, 1, 1, 1, 1, 1, 1, 100]


def test_reports_stats_for_each_group():
    result = normality_check(NORMALISH_A, NORMALISH_B)
    assert set(result["group_a"]) == {"w", "p", "n"}
    assert result["group_a"]["n"] == 10
    assert 0.0 <= result["group_a"]["p"] <= 1.0


def test_normalish_data_flagged_normal():
    result = normality_check(NORMALISH_A, NORMALISH_B)
    assert result["normal"] is True


def test_skewed_group_flagged_not_normal():
    result = normality_check(NORMALISH_A, SKEWED)
    assert result["normal"] is False
    assert result["group_b"]["p"] < 0.05


def test_too_few_values_raises():
    with pytest.raises(ValueError):
        normality_check([1, 2], [1, 2, 3, 4])
