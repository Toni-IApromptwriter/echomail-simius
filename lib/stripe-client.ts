/**
 * Cliente para almacenar el subscription_id de Stripe tras un checkout exitoso.
 * El status se obtiene llamando a /api/stripe/subscription-status.
 */

const STORAGE_KEY = "echomail-stripe-subscription-id"

export function loadStripeSubscriptionId(): string | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw || null
  } catch {
    return null
  }
}

export function saveStripeSubscriptionId(id: string): boolean {
  if (typeof window === "undefined") return false
  try {
    localStorage.setItem(STORAGE_KEY, id)
    return true
  } catch {
    return false
  }
}

export function clearStripeSubscriptionId(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
