import { NextResponse } from 'next/server'

import { generateDemoReport } from '@/lib/demo-provider'
import { parseAnalysisContext } from '@/lib/privacy'
import { validateReport } from '@/lib/pipeline'

export async function POST(request: Request) {
  try {
    const context = parseAnalysisContext(await request.json())
    const report = validateReport(await generateDemoReport(context))
    return NextResponse.json(report, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch {
    return NextResponse.json({ error: 'Invalid demo request' }, { status: 400 })
  }
}
