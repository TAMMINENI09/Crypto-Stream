import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Crypto Stream - Crypto Price Tracker',
  description: 'Real-time cryptocurrency price streaming',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
