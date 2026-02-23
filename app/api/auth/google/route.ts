import { NextRequest, NextResponse } from "next/server"
import { getAuthUrl, saveStateToCookie } from "@/lib/google-oauth-server"
import crypto from "crypto"

export async function GET(request: NextRequest) {
  try {
    const state = crypto.randomBytes(24).toString("hex")
    await saveStateToCookie(state)

    const authUrl = getAuthUrl(state)

    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error("Error iniciando OAuth Google:", error)
    const message =
      error instanceof Error ? error.message : "Error al conectar con Google"
    const url = new URL("/", request.nextUrl.origin)
    url.searchParams.set("error", message)
    return NextResponse.redirect(url.toString())
  }
}
