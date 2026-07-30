export interface IndependentTResult {
  statistic: number
  df: number
  p_value: number
  effect_size_d: number
  mean_a: number
  mean_b: number
  n_a: number
  n_b: number
}

const ALPHA = 0.05

function fmt(n: number, dp = 2): string {
  return n.toFixed(dp)
}

function fmtP(p: number): string {
  return p < 0.001 ? '< 0.001' : `= ${p.toFixed(3)}`
}

/** Cohen's conventional labels for effect size magnitude. */
export function effectSizeLabel(d: number): string {
  const a = Math.abs(d)
  if (a < 0.2) return 'very small'
  if (a < 0.5) return 'small'
  if (a < 0.8) return 'medium'
  return 'large'
}

/**
 * Turn an independent-samples t-test result into a plain-English verdict for a
 * non-statistician. Alpha is fixed at 0.05 and stated explicitly.
 */
export function independentTVerdict(
  result: IndependentTResult,
  labelA: string,
  labelB: string,
): string {
  const significant = result.p_value < ALPHA
  const d = result.effect_size_d
  const magnitude = effectSizeLabel(d)
  const effect = `The effect size is ${magnitude} (Cohen's d = ${fmt(Math.abs(d))}).`

  if (significant) {
    return (
      `"${labelA}" (mean ${fmt(result.mean_a)}) and "${labelB}" ` +
      `(mean ${fmt(result.mean_b)}) differ significantly: there's less than a 5% ` +
      `chance a gap this size is down to random variation (p ${fmtP(result.p_value)}). ` +
      effect
    )
  }
  return (
    `There's no statistically significant difference between "${labelA}" ` +
    `(mean ${fmt(result.mean_a)}) and "${labelB}" (mean ${fmt(result.mean_b)}): a gap ` +
    `this size could easily arise by chance (p ${fmtP(result.p_value)}, above the ` +
    `0.05 threshold). ` +
    effect
  )
}
