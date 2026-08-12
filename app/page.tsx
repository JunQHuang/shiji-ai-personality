'use client'

import { FormEvent, useReducer, useState } from 'react'

import { minimizeProfile } from '@/lib/privacy'
import { initialReportJob, reportJobReducer, validateReport } from '@/lib/pipeline'
import type { DimensionKey, DimensionScores, RawProfileInput } from '@/lib/types'

const LABELS: Record<DimensionKey, string> = {
  openness: '我愿意尝试新的观点与体验',
  structure: '我偏好清晰计划与稳定结构',
  socialEnergy: '与人互动通常会给我能量',
  pace: '我倾向快速行动并从反馈中调整',
}

const DEFAULT_SCORES: DimensionScores = {
  openness: 3,
  structure: 3,
  socialEnergy: 3,
  pace: 3,
}

export default function HomePage() {
  const [job, dispatch] = useReducer(reportJobReducer, initialReportJob)
  const [scores, setScores] = useState(DEFAULT_SCORES)
  const [birthDate, setBirthDate] = useState('2000-01-01')
  const [birthTime, setBirthTime] = useState('12:00')
  const [longitude, setLongitude] = useState(120)
  const [timezone, setTimezone] = useState('Asia/Shanghai')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      dispatch({ type: 'RESET' })
      dispatch({ type: 'START' })
      const [year, month, day] = birthDate.split('-').map(Number)
      const [hour, minute] = birthTime.split(':').map(Number)
      const raw: RawProfileInput = {
        birthDate: { year, month, day, hour, minute },
        location: { longitude, timezone },
        dimensions: scores,
      }
      const minimized = minimizeProfile(raw)
      dispatch({ type: 'MINIMIZED' })
      dispatch({ type: 'GENERATING' })
      const response = await fetch('/api/demo-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(minimized),
      })
      if (!response.ok) throw new Error('演示报告生成失败')
      dispatch({ type: 'VALIDATING' })
      const report = validateReport(await response.json())
      dispatch({ type: 'SUCCEEDED', report })
    } catch (error) {
      dispatch({ type: 'FAILED', error: error instanceof Error ? error.message : '未知错误' })
    }
  }

  return (
    <main>
      <section className="hero">
        <p className="eyebrow">Privacy-first product paradigm</p>
        <h1>识己</h1>
        <p className="lead">一个可运行的 AI 性格画像工程范式：原始时间与位置只在浏览器处理，服务端只接收最小化后的结构信号。</p>
      </section>

      <section className="grid">
        <form className="card form" onSubmit={submit}>
          <div>
            <p className="step">01 · 本地派生</p>
            <h2>输入演示参数</h2>
            <p className="muted">没有姓名、联络资料、账号或持久化存储。</p>
          </div>

          <div className="row">
            <label>日期<input type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} required /></label>
            <label>时间<input type="time" value={birthTime} onChange={(event) => setBirthTime(event.target.value)} required /></label>
          </div>
          <div className="row">
            <label>经度<input type="number" min="-180" max="180" step="0.01" value={longitude} onChange={(event) => setLongitude(Number(event.target.value))} /></label>
            <label>时区<input value={timezone} onChange={(event) => setTimezone(event.target.value)} /></label>
          </div>

          {(Object.keys(scores) as DimensionKey[]).map((key) => (
            <label className="range" key={key}>
              <span>{LABELS[key]}</span>
              <strong>{scores[key]}</strong>
              <input
                type="range"
                min="1"
                max="5"
                value={scores[key]}
                onChange={(event) => setScores((current) => ({ ...current, [key]: Number(event.target.value) }))}
              />
            </label>
          ))}

          <button disabled={!['idle', 'complete', 'error'].includes(job.stage)}>
            {['idle', 'complete', 'error'].includes(job.stage) ? '生成本地演示报告' : '处理中…'}
          </button>
          <p className="privacy-note">提交时只发送：时辰索引、边界标记和四个 1–5 分维度。精确日期、时间、经度和时区不会离开浏览器。</p>
        </form>

        <article className="card report" aria-live="polite">
          <div>
            <p className="step">02 · 结构化报告</p>
            <h2>运行状态：{job.stage}</h2>
          </div>
          {job.error && <p className="error">{job.error}</p>}
          {!job.report && !job.error && <p className="empty">调整左侧参数，查看隐私最小化、状态机、Provider 和报告校验如何协作。</p>}
          {job.report && (
            <div className="report-body">
              <h3>{job.report.headline}</h3>
              {job.report.sections.map((section) => (
                <section key={section.id}>
                  <h4>{section.title}</h4>
                  <p>{section.summary}</p>
                  <ul>{section.reflectionPrompts.map((prompt) => <li key={prompt}>{prompt}</li>)}</ul>
                </section>
              ))}
              <p className="disclaimer">{job.report.disclaimer}</p>
            </div>
          )}
        </article>
      </section>
    </main>
  )
}
