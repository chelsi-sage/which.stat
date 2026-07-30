import { describe, it, expect } from 'vitest'
import { recommendTwoGroupTest } from './recommendTwoGroupTest'

// Tests come straight from SPEC-001's worked examples.
// Source of truth: Field, Discovering Statistics Using IBM SPSS Statistics (SAGE).
describe('recommendTwoGroupTest (SPEC-001)', () => {
  it('different groups + bell-shaped → independent-samples t-test', () => {
    const rec = recommendTwoGroupTest({
      outcomeContinuous: 'yes',
      sameEntities: 'different',
      assumptionsMet: 'yes',
    })
    expect(rec.testId).toBe('independent_t_test')
    expect(rec.covered).toBe(true)
  })

  it('different groups + not bell-shaped → Mann–Whitney U', () => {
    const rec = recommendTwoGroupTest({
      outcomeContinuous: 'yes',
      sameEntities: 'different',
      assumptionsMet: 'no',
    })
    expect(rec.testId).toBe('mann_whitney_u')
    expect(rec.covered).toBe(true)
  })

  it('same entities + bell-shaped → paired-samples t-test', () => {
    const rec = recommendTwoGroupTest({
      outcomeContinuous: 'yes',
      sameEntities: 'same',
      assumptionsMet: 'yes',
    })
    expect(rec.testId).toBe('paired_t_test')
    expect(rec.covered).toBe(true)
  })

  it('same entities + not bell-shaped → Wilcoxon signed-rank', () => {
    const rec = recommendTwoGroupTest({
      outcomeContinuous: 'yes',
      sameEntities: 'same',
      assumptionsMet: 'no',
    })
    expect(rec.testId).toBe('wilcoxon_signed_rank')
    expect(rec.covered).toBe(true)
  })

  it('categorical outcome without enough info → not covered', () => {
    const rec = recommendTwoGroupTest({ outcomeContinuous: 'no' })
    expect(rec.covered).toBe(false)
  })

  // SPEC-003 — categorical outcome (chi-square family).
  it('categorical + different groups + not small → chi-square test of independence', () => {
    const rec = recommendTwoGroupTest({
      outcomeContinuous: 'no',
      sameEntities: 'different',
      smallSample: 'no',
    })
    expect(rec.testId).toBe('chi_square_independence')
    expect(rec.covered).toBe(true)
  })

  it('categorical + different groups + small sample → Fisher’s exact test', () => {
    const rec = recommendTwoGroupTest({
      outcomeContinuous: 'no',
      sameEntities: 'different',
      smallSample: 'yes',
    })
    expect(rec.testId).toBe('fishers_exact')
    expect(rec.covered).toBe(true)
  })

  it('categorical + same entities → McNemar’s test', () => {
    const rec = recommendTwoGroupTest({
      outcomeContinuous: 'no',
      sameEntities: 'same',
    })
    expect(rec.testId).toBe('mcnemar')
    expect(rec.covered).toBe(true)
  })

  it('every recommendation carries a rationale and a citation', () => {
    const rec = recommendTwoGroupTest({
      outcomeContinuous: 'yes',
      sameEntities: 'different',
      assumptionsMet: 'yes',
    })
    expect(rec.rationale.length).toBeGreaterThan(0)
    expect(rec.citation).toMatch(/Field/)
  })
})
