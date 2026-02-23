/**
 * Servidor: OAuth2 de Google y almacenamiento de tokens.
 * Los tokens se guardan en .data/google-tokens.json (gitignored).
 */

import { google } from "googleapis"
import { cookies } from "next/headers"
import path from "path"
import fs from "fs"

// Deben coincidir con los Scopes habilitados en Google Cloud Console
const SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/drive.file",
]

export interface GoogleTokens {
  access_token: string
  refresh_token?: string
  scope?: string
  token_type?: string
  expiry_date?: number
}

const TOKEN_FILE = path.join(process.cwd(), ".data", "google-tokens.json")
const COOKIE_NAME = "echomail_google_oauth_state"

function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  // En producción: usa GOOGLE_REDIRECT_URI o deriva de NEXT_PUBLIC_APP_URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    (baseUrl ? `${baseUrl.replace(/\/$/, "")}/api/auth/google/callback` : undefined)

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET y GOOGLE_REDIRECT_URI (o NEXT_PUBLIC_APP_URL) deben estar configurados"
    )
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri)
}

export function getAuthUrl(state: string): string {
  const oauth2 = getOAuth2Client()
  return oauth2.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
    state,
  })
}

export async function saveStateToCookie(state: string): Promise<void> {
  const c = await cookies()
  c.set(COOKIE_NAME, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 min
    path: "/",
  })
}

export async function getStateFromCookie(): Promise<string | null> {
  const c = await cookies()
  const cookie = c.get(COOKIE_NAME)
  return cookie?.value ?? null
}

export async function clearStateCookie(): Promise<void> {
  const c = await cookies()
  c.delete(COOKIE_NAME)
}

function ensureDataDir(): void {
  const dir = path.dirname(TOKEN_FILE)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

export function loadTokensFromFile(): GoogleTokens | null {
  try {
    ensureDataDir()
    if (!fs.existsSync(TOKEN_FILE)) return null
    const raw = fs.readFileSync(TOKEN_FILE, "utf-8")
    const parsed = JSON.parse(raw) as GoogleTokens
    if (!parsed.access_token) return null
    return parsed
  } catch {
    return null
  }
}

export function saveTokensToFile(tokens: GoogleTokens): void {
  ensureDataDir()
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2), "utf-8")
}

export function clearTokensFile(): void {
  if (fs.existsSync(TOKEN_FILE)) {
    fs.unlinkSync(TOKEN_FILE)
  }
}

export async function exchangeCodeForTokens(code: string): Promise<GoogleTokens> {
  const oauth2 = getOAuth2Client()
  const { tokens } = await oauth2.getToken(code)
  const result: GoogleTokens = {
    access_token: tokens.access_token!,
    refresh_token: tokens.refresh_token ?? undefined,
    scope: tokens.scope ?? undefined,
    token_type: tokens.token_type ?? "Bearer",
    expiry_date: tokens.expiry_date ?? undefined,
  }
  saveTokensToFile(result)
  return result
}

/**
 * Obtiene un cliente OAuth2 autenticado listo para Calendar/Drive.
 * Refresca el token si está expirado.
 */
export async function getAuthenticatedClient() {
  const oauth2 = getOAuth2Client()
  const tokens = loadTokensFromFile()
  if (!tokens) {
    throw new Error("No hay tokens de Google. Conecta primero en Configuración.")
  }
  oauth2.setCredentials(tokens)

  // Refrescar si está próximo a expirar (5 min de margen)
  const expiry = tokens.expiry_date ?? 0
  if (expiry && Date.now() > expiry - 5 * 60 * 1000 && tokens.refresh_token) {
    const { credentials } = await oauth2.refreshAccessToken()
    const refreshed: GoogleTokens = {
      access_token: credentials.access_token!,
      refresh_token: credentials.refresh_token ?? tokens.refresh_token,
      scope: credentials.scope ?? tokens.scope,
      token_type: credentials.token_type ?? tokens.token_type,
      expiry_date: credentials.expiry_date ?? tokens.expiry_date,
    }
    saveTokensToFile(refreshed)
    oauth2.setCredentials(refreshed)
  }

  return oauth2
}
