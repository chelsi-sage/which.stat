import { describe, it, expect } from 'vitest'
import { parseCsv, distinctValues } from './csv'
import { prepareIndependentTTest } from './prepareIndependentTTest'
import { independentTVerdict, effectSizeLabel } from './verdict'

describe('parseCsv', () => {
  it('reads headers and rows, handling quoted commas', () => {
    const csv = 'group,score\nA,1\n"B, the second",2\n'
    const parsed = parseCsv(csv)
    expect(parsed.headers).toEqual(['group', 'score'])
    expect(parsed.rows).toHaveLength(2)
    expect(parsed.rows[1].group).toBe('B, the second')
  })
})

describe('distinctValues', () => {
  it('returns distinct non-empty values in first-seen order', () => {
    const rows = [{ g: 'x' }, { g: 'y' }, { g: 'x' }, { g: '' }]
    expect(distinctValues(rows, 'g')).toEqual(['x', 'y'])
  })
})

describe('prepareIndependentTTest', () => {
  const rows = [
    { group: 'control', score: '2' },
    { group: 'control', score: '4' },
    { group: 'control', score: '6' },
    { group: 'variant', score: '4' },
    { group: 'variant', score: '6' },
    { group: 'variant', score: '8' },
  ]

  it('splits rows into two numeric groups', () => {
    const result = prepareIndependentTTest(rows, 'group', 'score')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.groupA).toEqual([2, 4, 6])
      expect(result.data.groupB).toEqual([4, 6, 8])
      expect(result.warnings).toHaveLength(0)
    }
  })

  it('rejects a group column that does not have exactly two groups', () => {
    const three = [...rows, { group: 'third', score: '5' }, { group: 'third', score: '7' }]
    const result = prepareIndependentTTest(three, 'group', 'score')
    expect(result.ok).toBe(false)
  })

  it('excludes blank/non-numeric outcomes with a warning', () => {
    const messy = [
      ...rows,
      { group: 'control', score: '' },
      { group: 'variant', score: 'oops' },
    ]
    const result = prepareIndependentTTest(messy, 'group', 'score')
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.warnings.length).toBe(2)
  })

  it('errors when a group has fewer than two usable values', () => {
    const tiny = [
      { group: 'a', score: '1' },
      { group: 'b', score: '2' },
      { group: 'b', score: '3' },
    ]
    const result = prepareIndependentTTest(tiny, 'group', 'score')
    expect(result.ok).toBe(false)
  })
})

describe('effectSizeLabel', () => {
  it('maps magnitudes to Cohen labels', () => {
    expect(effectSizeLabel(0.1)).toBe('very small')
    expect(effectSizeLabel(-0.3)).toBe('small')
    expect(effectSizeLabel(0.6)).toBe('medium')
    expect(effectSizeLabel(1.2)).toBe('large')
  })
})

describe('independentTVerdict', () => {
  const base = {
    statistic: -1.2,
    df: 4,
    mean_a: 4,
    mean_b: 6,
    n_a: 3,
    n_b: 3,
    effect_size_d: -1.0,
  }

  it('states a significant difference when p < 0.05', () => {
    const v = independentTVerdict({ ...base, p_value: 0.01 }, 'control', 'variant')
    expect(v).toMatch(/differ significantly/i)
    expect(v).toMatch(/control/)
    expect(v).toMatch(/large/) // |d| = 1.0
  })

  it('states no significant difference when p >= 0.05', () => {
    const v = independentTVerdict({ ...base, p_value: 0.29 }, 'control', 'variant')
    expect(v).toMatch(/no statistically significant difference/i)
  })
})
