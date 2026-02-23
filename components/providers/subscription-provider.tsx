"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"
import { loadProfile } from "@/lib/profile"
import {
  type Tier,
  getEffectiveTier,
  loadStoredTier,
  saveTier,
  canAccessPro,
} from "@/lib/subscription"
import {
  loadStripeSubscriptionId,
  saveStripeSubscriptionId,
} from "@/lib/stripe-client"
import { ProTrialModal } from "@/components/pro-trial-modal"

type SubscriptionContextType = {
  tier: Tier
  isPro: boolean
  openProTrial: () => void
  closeProTrial: () => void
  isProTrialOpen: boolean
  startProTrial: () => void
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null)

function refreshTier(): Tier {
  const profile = loadProfile()
  const stored = loadStoredTier()
  return getEffectiveTier(profile.email, stored)
}

/**
 * Pase Maestro: hola@tonimont.com tiene ADMIN_LIFETIME y acceso total sin Stripe.
 * Ver lib/subscription.ts isFounder()
 */
export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [tier, setTier] = useState<Tier>("BASIC")
  const [stripePro, setStripePro] = useState(false)
  const [isProTrialOpen, setIsProTrialOpen] = useState(false)

  useEffect(() => {
    setTier(refreshTier())
  }, [])

  // Verificar Stripe status si tenemos subscription_id
  useEffect(() => {
    const subId = loadStripeSubscriptionId()
    if (!subId) {
      setStripePro(false)
      return
    }
    fetch("/api/stripe/subscription-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription_id: subId }),
    })
      .then((res) => res.json())
      .then((data) => setStripePro(Boolean(data.isPro)))
      .catch(() => setStripePro(false))
  }, [tier])

  // Handle redirect tras Stripe Checkout success
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get("session_id")
    const success = params.get("stripe_success") === "1"
    if (!success || !sessionId) return

    fetch("/api/stripe/verify-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.subscription_id) {
          saveStripeSubscriptionId(data.subscription_id)
          setStripePro(Boolean(data.isPro))
          setTier(refreshTier())
          window.dispatchEvent(new CustomEvent("subscription-updated"))
        }
      })
      .catch(console.error)
      .finally(() => {
        window.history.replaceState({}, "", window.location.pathname)
      })
  }, [])

  useEffect(() => {
    const refresh = () => setTier(refreshTier())
    window.addEventListener("profile-saved", refresh)
    window.addEventListener("subscription-updated", refresh)
    return () => {
      window.removeEventListener("profile-saved", refresh)
      window.removeEventListener("subscription-updated", refresh)
    }
  }, [])

  const openProTrial = useCallback(() => setIsProTrialOpen(true), [])
  const closeProTrial = useCallback(() => setIsProTrialOpen(false), [])

  const startProTrial = useCallback(() => {
    if (saveTier("PRO")) {
      setTier(refreshTier())
      closeProTrial()
      window.dispatchEvent(new CustomEvent("subscription-updated"))
    }
  }, [closeProTrial])

  const effectiveTier = tier
  const isPro = canAccessPro(effectiveTier) || stripePro

  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        isPro,
        openProTrial,
        closeProTrial,
        isProTrialOpen,
        startProTrial,
      }}
    >
      {children}
      <ProTrialModal
        isOpen={isProTrialOpen}
        onClose={closeProTrial}
        onStartTrial={startProTrial}
      />
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext)
  if (!ctx)
    throw new Error("useSubscription must be used within SubscriptionProvider")
  return ctx
}
