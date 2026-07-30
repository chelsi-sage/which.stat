// Decision logic for SPEC-001 — Comparing Two Groups.
// Pure, deterministic: same answers always give the same recommendation.
// This module only RECOMMENDS which test to use; it never runs the maths.
// Source of truth: Field, Discovering Statistics Using IBM SPSS Statistics (SAGE).

export type YesNo = 'yes' | 'no'
export type Entities = 'same' | 'different'

export interface TwoGroupAnswers {
  /** Is the outcome measured on a continuous scale (time, score, revenue)? */
  outcomeContinuous: YesNo
  /** Same people/items measured twice, or different people/items? */
  sameEntities?: Entities
  /** Is the data roughly normally distributed (bell-shaped, no big outliers)? */
  assumptionsMet?: YesNo
  /** Categorical branch only: are some categories likely to have very few (~5-) responses? */
  smallSample?: YesNo
}

export interface Recommendation {
  /** Stable code for the test (or 'not_covered'). */
  testId: string
  /** Human-readable test name. */
  testName: string
  /** One plain-English sentence on why this test fits the answers. */
  rationale: string
  /** The citable source the recommendation traces to. */
  citation: string
  /** False when this slice does not yet cover the user's situation. */
  covered: boolean
}

const CITATION = 'Field, Discovering Statistics Using IBM SPSS Statistics (SAGE)'

export function recommendTwoGroupTest(answers: TwoGroupAnswers): Recommendation {
  // Categorical outcome → chi-square family (SPEC-003).
  if (answers.outcomeContinuous === 'no') {
    return recommendCategorical(answers)
  }

  const independent = answers.sameEntities === 'different'
  const parametric = answers.assumptionsMet === 'yes'

  if (independent && parametric) {
    return {
      testId: 'independent_t_test',
      testName: 'Independent-samples t-test',
      rationale:
        'Two different groups, a continuous outcome, and roughly bell-shaped ' +
        'data point to the independent-samples t-test.',
      citation: CITATION,
      covered: true,
    }
  }

  if (independent && !parametric) {
    return {
      testId: 'mann_whitney_u',
      testName: 'Mann–Whitney U test',
      rationale:
        'Two different groups with a continuous outcome that is not bell-shaped ' +
        'call for the non-parametric Mann–Whitney U test.',
      citation: CITATION,
      covered: true,
    }
  }

  if (!independent && parametric) {
    return {
      testId: 'paired_t_test',
      testName: 'Paired-samples t-test',
      rationale:
        'The same entities measured twice, a continuous outcome, and roughly ' +
        'bell-shaped data point to the paired-samples t-test.',
      citation: CITATION,
      covered: true,
    }
  }

  return {
    testId: 'wilcoxon_signed_rank',
    testName: 'Wilcoxon signed-rank test',
    rationale:
      'The same entities measured twice with a continuous outcome that is not ' +
      'bell-shaped call for the non-parametric Wilcoxon signed-rank test.',
    citation: CITATION,
    covered: true,
  }
}

// SPEC-003 — categorical outcome (chi-square family).
function recommendCategorical(answers: TwoGroupAnswers): Recommendation {
  // Need to know whether the two sets come from the same or different entities.
  if (answers.sameEntities === undefined) {
    return {
      testId: 'not_covered',
      testName: 'Not covered yet',
      rationale:
        'To recommend a test for a categorical outcome we still need to know ' +
        'whether the two sets of results come from the same or different entities.',
      citation: CITATION,
      covered: false,
    }
  }

  // Same entities measured twice → McNemar's test (assumes a two-category outcome).
  if (answers.sameEntities === 'same') {
    return {
      testId: 'mcnemar',
      testName: "McNemar's test",
      rationale:
        'The same entities measured twice on a yes/no categorical outcome call ' +
        "for McNemar's test (it assumes a two-category outcome).",
      citation: CITATION,
      covered: true,
    }
  }

  // Different groups + small sample → Fisher's exact test.
  if (answers.smallSample === 'yes') {
    return {
      testId: 'fishers_exact',
      testName: "Fisher's exact test",
      rationale:
        'Two different groups on a categorical outcome with a small sample call ' +
        "for Fisher's exact test, which stays reliable when categories have few " +
        'responses.',
      citation: CITATION,
      covered: true,
    }
  }

  // Different groups + adequate sample → chi-square test of independence.
  return {
    testId: 'chi_square_independence',
    testName: 'Chi-square test of independence',
    rationale:
      'Two different groups on a categorical outcome with an adequate sample ' +
      'point to the chi-square test of independence.',
    citation: CITATION,
    covered: true,
  }
}
