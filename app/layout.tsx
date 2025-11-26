import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Medical Record System',
  description: 'Medical Record System Emulator',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}


