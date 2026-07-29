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

  it('non-continuous outcome → not covered yet', () => {
    const rec = recommendTwoGroupTest({ outcomeContinuous: 'no' })
    expect(rec.covered).toBe(false)
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
