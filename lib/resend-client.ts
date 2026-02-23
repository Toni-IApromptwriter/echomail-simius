/**
 * Cliente centralizado de Resend para enviar emails (feedback, etc.).
 * Requiere RESEND_API_KEY en .env.local
 */

import { Resend } from "resend"

function getResendApiKey(): string | undefined {
  return process.env.RESEND_API_KEY
}

export function getResendClient(): Resend | null {
  const apiKey = getResendApiKey()
  if (!apiKey) return null
  return new Resend(apiKey)
}

export function isResendConfigured(): boolean {
  return !!getResendApiKey()
}
