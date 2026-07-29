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
  // Gate: this slice only covers continuous outcomes.
  if (answers.outcomeContinuous !== 'yes') {
    return {
      testId: 'not_covered',
      testName: 'Not covered yet',
      rationale:
        'Comparing two groups on a non-continuous (categorical) outcome is not ' +
        'covered yet — a chi-square branch is planned for a later slice.',
      citation: CITATION,
      covered: false,
    }
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
