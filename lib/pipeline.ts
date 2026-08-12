import type { AnalysisContext, PersonalityReport } from './types'

export type JobStage = 'idle' | 'minimizing' | 'queued' | 'generating' | 'validating' | 'complete' | 'error'

export interface ReportJob {
  stage: JobStage
  report?: PersonalityReport
  error?: string
}

export type JobEvent =
  | { type: 'START' }
  | { type: 'MINIMIZED' }
  | { type: 'GENERATING' }
  | { type: 'VALIDATING' }
  | { type: 'SUCCEEDED'; report: PersonalityReport }
  | { type: 'FAILED'; error: string }
  | { type: 'RESET' }

export const initialReportJob: ReportJob = { stage: 'idle' }

export function reportJobReducer(state: ReportJob, event: JobEvent): ReportJob {
  if (event.type === 'RESET') return initialReportJob
  if (event.type === 'FAILED') return { stage: 'error', error: event.error }
  const transitions: Partial<Record<JobStage, JobEvent['type']>> = {
    idle: 'START',
    minimizing: 'MINIMIZED',
    queued: 'GENERATING',
    generating: 'VALIDATING',
    validating: 'SUCCEEDED',
  }
  if (transitions[state.stage] !== event.type) {
    throw new Error(`invalid transition: ${state.stage} -> ${event.type}`)
  }
  if (event.type === 'START') return { stage: 'minimizing' }
  if (event.type === 'MINIMIZED') return { stage: 'queued' }
  if (event.type === 'GENERATING') return { stage: 'generating' }
  if (event.type === 'VALIDATING') return { stage: 'validating' }
  return { stage: 'complete', report: event.report }
}

export function buildPromptBlueprint(context: AnalysisContext): string {
  return [
    'Role: self-reflection assistant.',
    'Use tentative language and distinguish observation from interpretation.',
    'Do not make medical, legal, financial, or deterministic predictions.',
    'Return structured sections with practical reflection questions.',
    `Derived context: ${JSON.stringify(context)}`,
  ].join('\n')
}

export function validateReport(value: unknown): PersonalityReport {
  if (!value || typeof value !== 'object') throw new Error('report must be an object')
  const report = value as PersonalityReport
  if (report.schemaVersion !== 1 || report.provider !== 'demo') throw new Error('report metadata is invalid')
  if (!Array.isArray(report.sections) || report.sections.length < 3) throw new Error('report is incomplete')
  if (!report.disclaimer) throw new Error('report disclaimer is required')
  const combined = [report.headline, ...report.sections.map((section) => section.summary)].join('')
  if (/(注定|绝对会|医学诊断|治疗方案)/u.test(combined)) {
    throw new Error('report contains deterministic or professional claims')
  }
  for (const section of report.sections) {
    if (!section.id || !section.title || !section.summary || section.reflectionPrompts.length < 1) {
      throw new Error('report section is invalid')
    }
  }
  return report
}
