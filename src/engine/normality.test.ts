import { describe, it, expect } from 'vitest'
import { normalityGuidance, type NormalityResult } from './normality'

const normal: NormalityResult = {
  group_a: { w: 0.97, p: 0.4, n: 10 },
  group_b: { w: 0.96, p: 0.3, n: 10 },
  normal: true,
}

const notNormal: NormalityResult = {
  group_a: { w: 0.97, p: 0.4, n: 10 },
  group_b: { w: 0.6, p: 0.0001, n: 10 },
  normal: false,
}

describe('normalityGuidance', () => {
  it('recommends "yes" and shows both p-values when data looks normal', () => {
    const g = normalityGuidance(normal, 'control', 'variant')
    expect(g.recommended).toBe('yes')
    expect(g.text).toMatch(/0\.400/)
    expect(g.text).toMatch(/0\.300/)
    expect(g.text).toMatch(/roughly normal/i)
  })

  it('recommends "no" when a group is non-normal', () => {
    const g = normalityGuidance(notNormal, 'control', 'variant')
    expect(g.recommended).toBe('no')
    expect(g.text).toMatch(/non-normal/i)
    expect(g.text).toMatch(/< 0\.001/)
  })

  it('always includes the large-sample caveat', () => {
    expect(normalityGuidance(normal, 'a', 'b').text).toMatch(/large samples/i)
  })
})
