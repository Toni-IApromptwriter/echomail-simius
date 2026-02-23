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

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [tier, setTier] = useState<Tier>("BASIC")
  const [isProTrialOpen, setIsProTrialOpen] = useState(false)

  useEffect(() => {
    setTier(refreshTier())
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

  const isPro = canAccessPro(tier)

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
