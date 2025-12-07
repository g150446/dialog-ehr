import type { Metadata, Viewport } from 'next'
import './globals.css'
import FloatingButton from './components/FloatingButton'

export const metadata: Metadata = {
  title: 'Medical Record System',
  description: 'Medical Record System Emulator',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        {children}
        <FloatingButton />
      </body>
    </html>
  )
}


