import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Check if we can reach the backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:5000"

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(`${backendUrl}/health`, {
      method: "GET",
      signal: controller.signal,
    })

    clearTimeout(timeout)

    const backendStatus = response.ok ? await response.json() : null

    return NextResponse.json({
      status: "healthy",
      frontend: "connected",
      backend: response.ok ? "connected" : "disconnected",
      backendStatus,
      backendUrl,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        frontend: "connected",
        backend: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
        backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:5000",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    )
  }
}
