import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Structured Trading Platform',
  description: 'Professional GOLD and US500 Trading Terminal',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-trading-bg text-white">
        {children}
      </body>
    </html>
  )
}
