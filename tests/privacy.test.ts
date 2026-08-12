import { describe, expect, it } from 'vitest'

import { minimizeProfile, parseAnalysisContext } from '../lib/privacy'
import type { RawProfileInput } from '../lib/types'

const raw: RawProfileInput = {
  birthDate: { year: 2000, month: 1, day: 1, hour: 12, minute: 0 },
  location: { longitude: 120, timezone: 'Asia/Shanghai' },
  dimensions: { openness: 4, structure: 3, socialEnergy: 2, pace: 5 },
}

describe('privacy boundary', () => {
  it('removes exact date, time, longitude, and timezone', () => {
    const minimized = minimizeProfile(raw)
    const serialized = JSON.stringify(minimized)
    expect(serialized).not.toContain('2000')
    expect(serialized).not.toContain('Asia/Shanghai')
    expect(serialized).not.toContain('longitude')
    expect(Object.keys(minimized)).toEqual(['schemaVersion', 'solarBranch', 'nearTimeBoundary', 'dimensions'])
  })

  it('rejects unexpected server fields', () => {
    const minimized = minimizeProfile(raw)
    expect(() => parseAnalysisContext({ ...minimized, name: 'unexpected' })).toThrow('unexpected')
  })
})
