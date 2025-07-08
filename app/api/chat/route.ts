export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"

/**
 * Utility – derive the backend URL in the following order:
 * 1. BACKEND_URL (server-only)
 * 2. NEXT_PUBLIC_BACKEND_URL (works on both server & client)
 * 3. Same origin but port 5000 (handy during local dev)
 */
function resolveBackendUrl(req: NextRequest) {
  // 1) Explicit env vars
  if (process.env.NEXT_PUBLIC_BACKEND_URL) return process.env.NEXT_PUBLIC_BACKEND_URL
  if (process.env.BACKEND_URL) return process.env.BACKEND_URL

  // 2) Try same host on :5000
  try {
    const origin = req.headers.get("origin") || req.nextUrl.origin
    const url = new URL(origin)
    url.port = "5000"
    url.protocol = "http:" // Flask usually runs on http
    return url.toString().replace(/\/$/, "")
  } catch {
    // 3) Generic localhost fallback
    return "http://127.0.0.1:5000"
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, user_id } = await request.json()

    if (!message || !user_id) {
      return NextResponse.json({ error: "Both 'message' and 'user_id' are required." }, { status: 400 })
    }

    const backendUrl = resolveBackendUrl(request)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30_000)

    const response = await fetch(`${backendUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, user_id }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      const text = await response.text()
      console.error(`Backend error ${response.status}: ${text}`)
      return NextResponse.json({ error: "Backend responded with an error." }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error(
      "Chat API proxy error:",
      err,
      "Tried:",
      process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL,
    )
    return NextResponse.json({ error: "Failed to reach the chatbot backend." }, { status: 502 })
  }
}
