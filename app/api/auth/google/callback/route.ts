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
    // Nota: No se obtienen userinfo (picture, email) de Google; el perfil se gestiona
    // localmente. Si en el futuro se añade oauth2.userinfo, manejar picture como opcional
    // (algunos usuarios no tienen foto) para evitar fallos en el flujo.

    let returnTo = "/"
    try {
      const payload = JSON.parse(
        Buffer.from(savedState, "base64url").toString("utf8")
      )
      if (typeof payload?.r === "string" && payload.r.startsWith("/")) {
        returnTo = payload.r
      }
    } catch {
      // usar "/" si falla el parse
    }

    const successUrl = new URL(returnTo, request.url)
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
