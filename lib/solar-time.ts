export interface SolarTimeInput {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  longitude: number
  timezone: string
}

export function getUtcOffsetMinutes(
  timezone: string,
  year: number,
  month: number,
  day: number,
): number {
  const date = new Date(Date.UTC(year, month - 1, day, 12))
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'longOffset',
  })
  const offset = formatter.formatToParts(date).find((part) => part.type === 'timeZoneName')?.value
  if (offset === 'GMT' || offset === 'UTC') return 0
  const match = offset?.match(/GMT([+-])(\d{1,2}):?(\d{2})?/)
  if (!match) throw new Error('Unable to resolve timezone offset')
  const sign = match[1] === '+' ? 1 : -1
  return sign * (Number(match[2]) * 60 + Number(match[3] ?? 0))
}

export function equationOfTimeMinutes(year: number, month: number, day: number): number {
  const date = new Date(Date.UTC(year, month - 1, day))
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 0))
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86_400_000)
  const angle = (2 * Math.PI * (dayOfYear - 81)) / 365
  return 9.87 * Math.sin(2 * angle) - 7.53 * Math.cos(angle) - 1.5 * Math.sin(angle)
}

export function solarMinutes(input: SolarTimeInput): number {
  const clockMinutes = input.hour * 60 + input.minute
  const utcOffset = getUtcOffsetMinutes(input.timezone, input.year, input.month, input.day)
  const longitudeCorrection = input.longitude * 4
  const equation = equationOfTimeMinutes(input.year, input.month, input.day)
  const result = clockMinutes - utcOffset + longitudeCorrection + equation
  return ((result % 1440) + 1440) % 1440
}

export function solarBranch(minutes: number): number {
  if (!Number.isFinite(minutes) || minutes < 0 || minutes >= 1440) {
    throw new Error('Solar minutes must be within one day')
  }
  if (minutes >= 1380 || minutes < 60) return 0
  return Math.floor((minutes - 60) / 120) + 1
}

export function boundaryDistance(minutes: number): number {
  const boundaries = [60, 180, 300, 420, 540, 660, 780, 900, 1020, 1140, 1260, 1380]
  return Math.min(...boundaries.map((boundary) => {
    const direct = Math.abs(minutes - boundary)
    return Math.min(direct, 1440 - direct)
  }))
}
