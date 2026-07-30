// Plain-English "what this test does & what it means" content, keyed by testId.
// Kept in the UI layer so it does not change the SPEC-001 decision logic.
// Written to trace to Field, Discovering Statistics Using IBM SPSS Statistics (SAGE).

export const testExplanations: Record<string, string> = {
  independent_t_test:
    'It compares the average outcome of your two separate groups and checks ' +
    'whether the gap between them is bigger than you would expect from chance ' +
    'alone. A small p-value (usually below 0.05) suggests the groups really do ' +
    'differ.',
  mann_whitney_u:
    'It compares your two separate groups by ranking all the values instead of ' +
    'using their averages, so it still works when the data is skewed or has ' +
    'outliers. A small p-value suggests the groups differ.',
  paired_t_test:
    'It looks at the change within the same people or items measured twice (for ' +
    'example, before and after) and checks whether the average change is bigger ' +
    'than chance would produce. A small p-value suggests a real change.',
  wilcoxon_signed_rank:
    'It compares the two measurements from the same people or items using ranked ' +
    'differences rather than averages, so it works when the data is not ' +
    'bell-shaped. A small p-value suggests a real change.',
  chi_square_independence:
    'It checks whether which group someone is in is associated with the ' +
    'category they fall into (for example, whether group membership relates to ' +
    'converting or not). A small p-value (usually below 0.05) suggests the two ' +
    'are related rather than independent.',
  fishers_exact:
    'It answers the same question as the chi-square test — is group membership ' +
    'linked to the outcome — but calculates exact probabilities, so it stays ' +
    'reliable when your sample is small. A small p-value suggests a real link.',
  mcnemar:
    'It looks at how many of the same people/items changed category between the ' +
    'two measurements (for example, from “no” to “yes”) and checks whether that ' +
    'change is bigger than chance. It assumes a two-category (yes/no) outcome. A ' +
    'small p-value suggests a real change.',
  not_covered:
    'This situation is not covered yet. A branch for categorical outcomes (like ' +
    '“clicked / didn’t click”) is planned for a later update.',
}
