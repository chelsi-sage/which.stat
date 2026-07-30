export interface GroupNormality {
  w: number
  p: number
  n: number
}

export interface NormalityResult {
  group_a: GroupNormality
  group_b: GroupNormality
  normal: boolean
}

export interface NormalityGuidance {
  /** The answer we recommend for the distribution question. */
  recommended: 'yes' | 'no'
  /** Plain-English explanation of the numbers and the recommendation. */
  text: string
}

function fmtP(p: number): string {
  return p < 0.001 ? '< 0.001' : p.toFixed(3)
}

/**
 * Turn a Shapiro-Wilk result into plain-English guidance: show the numbers,
 * explain them, and recommend an answer. The user still decides.
 */
export function normalityGuidance(
  result: NormalityResult,
  labelA: string,
  labelB: string,
): NormalityGuidance {
  const a = result.group_a
  const b = result.group_b
  const recommended = result.normal ? 'yes' : 'no'

  const numbers =
    `Shapiro-Wilk tests how bell-shaped each group is. A p-value above 0.05 ` +
    `means we can't detect a departure from a normal shape. ` +
    `"${labelA}": p = ${fmtP(a.p)} (n = ${a.n}). ` +
    `"${labelB}": p = ${fmtP(b.p)} (n = ${b.n}).`

  const verdict = result.normal
    ? `Both are above 0.05, so your data looks roughly normal — we'd suggest answering "yes".`
    : `At least one is below 0.05, so the data looks non-normal — we'd suggest answering "no" (a non-parametric test would be safer).`

  const caveat =
    `Note: with large samples Shapiro-Wilk flags even tiny, harmless departures, ` +
    `so treat this as guidance — the final call is yours.`

  return { recommended, text: `${numbers} ${verdict} ${caveat}` }
}
