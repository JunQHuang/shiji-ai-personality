import { boundaryDistance, solarBranch, solarMinutes } from './solar-time'
import type { AnalysisContext, DimensionKey, RawProfileInput } from './types'

const DIMENSIONS: DimensionKey[] = ['openness', 'structure', 'socialEnergy', 'pace']

function assertInteger(value: number, minimum: number, maximum: number, label: string): void {
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new Error(`${label} is outside the supported range`)
  }
}

function validateRawInput(input: RawProfileInput): void {
  assertInteger(input.birthDate.year, 1900, 2100, 'year')
  assertInteger(input.birthDate.month, 1, 12, 'month')
  assertInteger(input.birthDate.day, 1, 31, 'day')
  assertInteger(input.birthDate.hour, 0, 23, 'hour')
  assertInteger(input.birthDate.minute, 0, 59, 'minute')
  if (!Number.isFinite(input.location.longitude) || Math.abs(input.location.longitude) > 180) {
    throw new Error('longitude is outside the supported range')
  }
  if (!input.location.timezone || input.location.timezone.length > 64) {
    throw new Error('timezone is invalid')
  }
  for (const dimension of DIMENSIONS) {
    assertInteger(input.dimensions[dimension], 1, 5, dimension)
  }
}

export function minimizeProfile(input: RawProfileInput): AnalysisContext {
  validateRawInput(input)
  const minutes = solarMinutes({ ...input.birthDate, ...input.location })
  return {
    schemaVersion: 1,
    solarBranch: solarBranch(minutes),
    nearTimeBoundary: boundaryDistance(minutes) <= 15,
    dimensions: { ...input.dimensions },
  }
}

export function parseAnalysisContext(value: unknown): AnalysisContext {
  if (!value || typeof value !== 'object') throw new Error('context must be an object')
  const candidate = value as Record<string, unknown>
  const allowed = new Set(['schemaVersion', 'solarBranch', 'nearTimeBoundary', 'dimensions'])
  if (Object.keys(candidate).some((key) => !allowed.has(key))) {
    throw new Error('context contains unexpected fields')
  }
  if (candidate.schemaVersion !== 1) throw new Error('unsupported context schema')
  assertInteger(candidate.solarBranch as number, 0, 11, 'solarBranch')
  if (typeof candidate.nearTimeBoundary !== 'boolean') throw new Error('boundary flag is invalid')
  if (!candidate.dimensions || typeof candidate.dimensions !== 'object') {
    throw new Error('dimensions are invalid')
  }
  const dimensions = candidate.dimensions as Record<string, unknown>
  if (Object.keys(dimensions).length !== DIMENSIONS.length) {
    throw new Error('dimensions contain unexpected fields')
  }
  for (const dimension of DIMENSIONS) {
    assertInteger(dimensions[dimension] as number, 1, 5, dimension)
  }
  return candidate as unknown as AnalysisContext
}
