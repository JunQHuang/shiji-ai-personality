import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import './globals.css'

export const metadata: Metadata = {
  title: '识己 · 隐私优先的 AI 性格画像范式',
  description: '一个无需密钥即可运行的 AI 性格画像产品工程参考实现。',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
