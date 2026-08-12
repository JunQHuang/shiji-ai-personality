export type DimensionKey = 'openness' | 'structure' | 'socialEnergy' | 'pace'

export type DimensionScores = Record<DimensionKey, number>

export interface RawProfileInput {
  birthDate: {
    year: number
    month: number
    day: number
    hour: number
    minute: number
  }
  location: {
    longitude: number
    timezone: string
  }
  dimensions: DimensionScores
}

export interface AnalysisContext {
  schemaVersion: 1
  solarBranch: number
  nearTimeBoundary: boolean
  dimensions: DimensionScores
}

export interface ReportSection {
  id: string
  title: string
  summary: string
  reflectionPrompts: string[]
}

export interface PersonalityReport {
  schemaVersion: 1
  provider: 'demo'
  generatedAt: string
  headline: string
  sections: ReportSection[]
  disclaimer: string
}
