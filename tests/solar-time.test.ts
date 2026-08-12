import { describe, expect, it } from 'vitest'

import { boundaryDistance, getUtcOffsetMinutes, solarBranch, solarMinutes } from '../lib/solar-time'

describe('solar time utilities', () => {
  it('resolves UTC without exposing location data', () => {
    expect(getUtcOffsetMinutes('UTC', 2024, 6, 1)).toBe(0)
  })

  it('returns a normalized minute and branch', () => {
    const minutes = solarMinutes({
      year: 2000, month: 1, day: 1, hour: 12, minute: 0,
      longitude: 120, timezone: 'Asia/Shanghai',
    })
    expect(minutes).toBeGreaterThanOrEqual(0)
    expect(minutes).toBeLessThan(1440)
    expect(solarBranch(minutes)).toBeGreaterThanOrEqual(0)
    expect(solarBranch(minutes)).toBeLessThan(12)
  })

  it('handles the midnight wrap when checking boundaries', () => {
    expect(boundaryDistance(10)).toBe(50)
    expect(boundaryDistance(1375)).toBe(5)
  })
})
