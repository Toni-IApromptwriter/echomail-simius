import { NextResponse } from "next/server"
import { loadTokensFromFile } from "@/lib/google-oauth-server"

/**
 * GET /api/google/status
 * Indica si hay tokens de Google guardados (usuario conectado).
 */
export async function GET() {
  try {
    const tokens = loadTokensFromFile()
    return NextResponse.json({ connected: Boolean(tokens?.access_token) })
  } catch {
    return NextResponse.json({ connected: false })
  }
}
