/**
 * Lógica del trial de 5 días: urgencia y bloqueo post-trial.
 * Para usuarios con Stripe: trial_end viene del API.
 * Para usuarios locales (PRO sin Stripe): trial_started_at en localStorage.
 */

const TRIAL_STARTED_KEY = "echomail-trial-started-at"
const TRIAL_DAYS = 5
const MS_PER_DAY = 24 * 60 * 60 * 1000

export function getTrialStartedAt(): number | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(TRIAL_STARTED_KEY)
    if (!raw) return null
    const ts = parseInt(raw, 10)
    return Number.isFinite(ts) ? ts : null
  } catch {
    return null
  }
}

export function setTrialStartedAt(): boolean {
  if (typeof window === "undefined") return false
  try {
    localStorage.setItem(TRIAL_STARTED_KEY, String(Date.now()))
    return true
  } catch {
    return false
  }
}

export function getTrialDayNumber(trialStartTs: number | null): number | null {
  if (!trialStartTs) return null
  const now = Date.now()
  const elapsedDays = Math.floor((now - trialStartTs) / MS_PER_DAY)
  if (elapsedDays < 0) return 1
  if (elapsedDays >= TRIAL_DAYS) return TRIAL_DAYS
  return Math.min(elapsedDays + 1, TRIAL_DAYS)
}

export function isTrialExpired(trialStartTs: number | null): boolean {
  if (!trialStartTs) return false
  const elapsed = Date.now() - trialStartTs
  return elapsed >= TRIAL_DAYS * MS_PER_DAY
}

export function getTrialDaysRemaining(trialStartTs: number | null): number {
  if (!trialStartTs) return 0
  const elapsed = Date.now() - trialStartTs
  const remaining = TRIAL_DAYS * MS_PER_DAY - elapsed
  return Math.max(0, Math.ceil(remaining / MS_PER_DAY))
}

export { TRIAL_DAYS }
