/**
 * Lógica de bloqueo de API: tras 5 días de trial, requiere BYOK (Bring Your Own Key).
 * Si el usuario tiene su propia API Key, no se bloquea.
 */

import { loadOpenAIKey } from "./openai-settings"
import { getTrialStartedAt, isTrialExpired } from "./trial"
import { loadStripeSubscriptionId } from "./stripe-client"

export type ApiGateStatus =
  | "ok"           // Puede usar API (tiene key o trial activo)
  | "trial_expired" // Trial vencido, necesita BYOK

/**
 * Comprueba si el usuario puede usar la API de EchoMail (transcripción/generación).
 * - Si tiene API Key propia: ok
 * - Si tiene suscripción Stripe activa: ok (el backend verifica)
 * - Si está en trial (días 1-5): ok
 * - Si trial expirado y sin BYOK: trial_expired
 */
export function getApiGateStatus(): ApiGateStatus {
  const userKey = loadOpenAIKey()
  if (userKey?.trim()) return "ok"

  const subId = loadStripeSubscriptionId()
  if (subId) return "ok" // Stripe maneja el trial; asumimos activo si tienen sub

  const trialStart = getTrialStartedAt()
  if (!trialStart) return "ok" // Sin trial local = puede ser usuario legacy o BASIC
  if (!isTrialExpired(trialStart)) return "ok"

  return "trial_expired"
}
