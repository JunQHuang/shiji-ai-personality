import { describe, expect, it } from 'vitest'

import { generateDemoReport } from '../lib/demo-provider'
import { buildPromptBlueprint, initialReportJob, reportJobReducer, validateReport } from '../lib/pipeline'
import type { AnalysisContext } from '../lib/types'

const context: AnalysisContext = {
  schemaVersion: 1,
  solarBranch: 6,
  nearTimeBoundary: false,
  dimensions: { openness: 4, structure: 3, socialEnergy: 2, pace: 5 },
}

describe('report pipeline', () => {
  it('enforces explicit job transitions', async () => {
    const report = await generateDemoReport(context)
    const minimizing = reportJobReducer(initialReportJob, { type: 'START' })
    const queued = reportJobReducer(minimizing, { type: 'MINIMIZED' })
    const generating = reportJobReducer(queued, { type: 'GENERATING' })
    const validating = reportJobReducer(generating, { type: 'VALIDATING' })
    const complete = reportJobReducer(validating, { type: 'SUCCEEDED', report })
    expect(complete.stage).toBe('complete')
    expect(() => reportJobReducer(initialReportJob, { type: 'VALIDATING' })).toThrow('invalid transition')
  })

  it('builds a minimized prompt and validates the demo report', async () => {
    const prompt = buildPromptBlueprint(context)
    expect(prompt).toContain('Derived context')
    expect(prompt).not.toContain('birthDate')
    expect(validateReport(await generateDemoReport(context)).sections).toHaveLength(5)
  })
})
