import { NextResponse } from "next/server"
import { clearTokensFile, clearStateCookie } from "@/lib/google-oauth-server"

export async function POST() {
  try {
    clearTokensFile()
    await clearStateCookie()
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Error al cerrar sesión:", err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
