"use client"

import { useState, useEffect } from "react"
import { Flame } from "lucide-react"
import { useSubscription } from "@/components/providers/subscription-provider"
import { loadStripeSubscriptionId } from "@/lib/stripe-client"
import {
  getTrialStartedAt,
  getTrialDayNumber,
  getTrialDaysRemaining,
  TRIAL_DAYS,
} from "@/lib/trial"

const MS_PER_DAY = 24 * 60 * 60 * 1000

export function TrialUrgencyBar() {
  const { isPro, tier } = useSubscription()
  const [trialDay, setTrialDay] = useState<number | null>(null)
  const [daysRemaining, setDaysRemaining] = useState(0)

  useEffect(() => {
    const subId = loadStripeSubscriptionId()
    const localStart = getTrialStartedAt()

    if (tier === "ADMIN_LIFETIME") {
      setTrialDay(null)
      return
    }

    // Usuario Stripe: mostrar barra solo si status === 'trialing'
    if (subId && isPro) {
      fetch("/api/stripe/subscription-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription_id: subId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status !== "trialing") {
            setTrialDay(null)
            return
          }
          const end = data.trial_end ?? data.current_period_end
          if (end && typeof end === "number") {
            const endMs = end * 1000
            const now = Date.now()
            if (now < endMs) {
              const startMs = endMs - TRIAL_DAYS * MS_PER_DAY
              const day = getTrialDayNumber(startMs)
              setTrialDay(day ?? 1)
              setDaysRemaining(Math.max(0, Math.ceil((endMs - now) / MS_PER_DAY)))
            } else {
              setTrialDay(null)
            }
          }
        })
        .catch(() => {
          if (localStart && isPro) {
            setTrialDay(getTrialDayNumber(localStart))
            setDaysRemaining(getTrialDaysRemaining(localStart))
          }
        })
      return
    }

    // Usuario local (PRO sin Stripe)
    if (localStart && isPro) {
      setTrialDay(getTrialDayNumber(localStart))
      setDaysRemaining(getTrialDaysRemaining(localStart))
    } else {
      setTrialDay(null)
    }
  }, [isPro, tier])

  if (!trialDay || trialDay > TRIAL_DAYS || daysRemaining <= 0) return null

  const progress = (trialDay / TRIAL_DAYS) * 100

  return (
    <div
      className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5"
      role="status"
      aria-label={`Día ${trialDay} de ${TRIAL_DAYS} de tu Prueba Gratuita`}
    >
      <Flame className="h-5 w-5 shrink-0 text-amber-500" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
          Día {trialDay} de {TRIAL_DAYS} de tu Prueba Gratuita
        </p>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-amber-500/20">
          <div
            className="h-full rounded-full bg-amber-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <span className="shrink-0 text-xs font-semibold text-amber-700 dark:text-amber-300">
        {daysRemaining}d restantes
      </span>
    </div>
  )
}
