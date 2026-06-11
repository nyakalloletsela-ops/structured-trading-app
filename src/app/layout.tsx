import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Apex Terminal — Structured Trading Platform",
  description:
    "Institutional-grade Smart Money Concepts analysis for GOLD (XAUUSD) and US500. Automatic BOS, CHoCH, Order Blocks, FVG and liquidity detection with signal scoring, risk management and backtesting.",
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: "#0c0f17",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-background font-sans antialiased">{children}</body>
    </html>
  )
}
