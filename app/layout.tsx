import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Unilorin Student Support - AI Assistant",
  description:
    "AI-powered student support assistant for University of Ilorin students. Get help with academic procedures, campus resources, and student services.",
  keywords: "UNILORIN, University of Ilorin, student support, AI assistant, academic help",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
