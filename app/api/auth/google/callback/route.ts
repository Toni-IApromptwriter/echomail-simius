import { NextRequest, NextResponse } from "next/server"
import {
  exchangeCodeForTokens,
  getStateFromCookie,
  clearStateCookie,
} from "@/lib/google-oauth-server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    if (error) {
      await clearStateCookie()
      const url = new URL("/", request.url)
      url.searchParams.set("error", `Google: ${error}`)
      return NextResponse.redirect(url.toString())
    }

    const savedState = await getStateFromCookie()
    await clearStateCookie()

    if (!savedState || state !== savedState) {
      const url = new URL("/", request.url)
      url.searchParams.set("error", "Estado OAuth inválido. Intenta de nuevo.")
      return NextResponse.redirect(url.toString())
    }

    if (!code) {
      const url = new URL("/", request.url)
      url.searchParams.set("error", "Falta el código de autorización")
      return NextResponse.redirect(url.toString())
    }

    await exchangeCodeForTokens(code)

    const successUrl = new URL("/", request.url)
    successUrl.searchParams.set("google_connected", "1")
    return NextResponse.redirect(successUrl.toString())
  } catch (err) {
    console.error("Error en callback OAuth Google:", err)
    const message =
      err instanceof Error ? err.message : "Error al completar la conexión"
    const url = new URL("/", request.url)
    url.searchParams.set("error", message)
    return NextResponse.redirect(url.toString())
  }
}
