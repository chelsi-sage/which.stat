"""Golden tests for the two-group engine.

Expected values are worked out by hand for a tiny dataset so they are a genuine,
independent check on scipy's output (not just "scipy equals scipy").

Dataset: group_a = [2, 4, 6], group_b = [4, 6, 8]
  mean_a = 4, mean_b = 6
  sample variance of each = 4  -> pooled sd = 2
  standard error = 2 * sqrt(1/3 + 1/3) = 1.632993...
  t = (4 - 6) / 1.632993... = -1.224744871
  df = n_a + n_b - 2 = 4
  Cohen's d = (4 - 6) / 2 = -1.0
  two-tailed p (t=-1.2247, df=4) ~= 0.2885
"""

import pytest

from stats_engine.two_group import independent_t_test


GROUP_A = [2.0, 4.0, 6.0]
GROUP_B = [4.0, 6.0, 8.0]


def test_statistic_matches_hand_calculation():
    result = independent_t_test(GROUP_A, GROUP_B)
    assert result["statistic"] == pytest.approx(-1.224744871, abs=1e-6)


def test_degrees_of_freedom():
    assert independent_t_test(GROUP_A, GROUP_B)["df"] == 4


def test_p_value_matches_hand_calculation():
    result = independent_t_test(GROUP_A, GROUP_B)
    assert result["p_value"] == pytest.approx(0.2885, abs=1e-3)


def test_effect_size_cohens_d():
    result = independent_t_test(GROUP_A, GROUP_B)
    assert result["effect_size_d"] == pytest.approx(-1.0, abs=1e-9)


def test_group_means_and_sizes():
    result = independent_t_test(GROUP_A, GROUP_B)
    assert result["mean_a"] == pytest.approx(4.0)
    assert result["mean_b"] == pytest.approx(6.0)
    assert result["n_a"] == 3
    assert result["n_b"] == 3


def test_too_few_values_raises():
    with pytest.raises(ValueError):
        independent_t_test([1.0], [2.0, 3.0])
