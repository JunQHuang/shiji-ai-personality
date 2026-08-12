import type { AnalysisContext, DimensionKey, PersonalityReport, ReportSection } from './types'

const LABELS: Record<DimensionKey, string> = {
  openness: '开放探索',
  structure: '秩序结构',
  socialEnergy: '社交能量',
  pace: '行动节奏',
}

function describeDimension(key: DimensionKey, score: number): ReportSection {
  const level = score >= 4 ? '偏高' : score <= 2 ? '偏低' : '居中'
  const interpretations: Record<DimensionKey, string> = {
    openness: score >= 4 ? '你可能更容易被新观点和新体验吸引。' : '你可能更看重熟悉经验与可验证路径。',
    structure: score >= 4 ? '明确边界和计划可能让你更有安全感。' : '你可能更愿意保留临场调整的空间。',
    socialEnergy: score >= 4 ? '互动可能帮助你整理思路并恢复能量。' : '独处可能更有利于你恢复注意力。',
    pace: score >= 4 ? '你可能倾向先行动，再通过反馈校准。' : '你可能倾向先观察，再选择投入时点。',
  }
  return {
    id: key,
    title: `${LABELS[key]} · ${level}`,
    summary: interpretations[key],
    reflectionPrompts: [
      `最近一次体现“${LABELS[key]}”倾向的具体情境是什么？`,
      '这种倾向在什么环境中帮助了你，又在什么环境中形成限制？',
    ],
  }
}

export async function generateDemoReport(context: AnalysisContext): Promise<PersonalityReport> {
  const keys = Object.keys(context.dimensions) as DimensionKey[]
  const strongest = keys.reduce((best, key) => (
    context.dimensions[key] > context.dimensions[best] ? key : best
  ))
  const boundaryNote = context.nearTimeBoundary
    ? '时间派生结果接近边界，解释时应保留更多不确定性。'
    : '时间派生结果未处于边界附近，但仍只应作为反思线索。'

  return {
    schemaVersion: 1,
    provider: 'demo',
    generatedAt: new Date().toISOString(),
    headline: `当前最突出的自评维度是“${LABELS[strongest]}”。`,
    sections: [
      ...keys.map((key) => describeDimension(key, context.dimensions[key])),
      {
        id: 'uncertainty',
        title: '边界与不确定性',
        summary: boundaryNote,
        reflectionPrompts: ['哪些描述与你的真实经历不一致？', '如果情境改变，你的行为是否也会改变？'],
      },
    ],
    disclaimer: '本报告由本地演示规则生成，仅用于产品工程示例与自我反思，不构成专业建议。',
  }
}
