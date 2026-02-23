"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { WelcomeModal } from "@/components/welcome-modal"

const CONSENT_KEY = "echomail-legal-consent"
const MARKETING_KEY = "echomail-marketing-consent"
const ONBOARDING_LANGUAGE_KEY = "echomail-onboarding-language-done"

export function loadConsent(): { legal: boolean; marketing: boolean } {
  if (typeof window === "undefined") return { legal: false, marketing: false }
  try {
    const raw = localStorage.getItem(CONSENT_KEY)
    const marketing = localStorage.getItem(MARKETING_KEY) === "true"
    if (!raw) return { legal: false, marketing }
    const parsed = JSON.parse(raw)
    return { legal: parsed === true || parsed?.legal === true, marketing }
  } catch {
    return { legal: false, marketing: false }
  }
}

type OnboardingStep = "consent" | "language" | "done"

export function ConsentGate({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState<OnboardingStep>("consent")
  const [legalChecked, setLegalChecked] = useState(false)
  const [marketingChecked, setMarketingChecked] = useState(false)

  useEffect(() => {
    const { legal } = loadConsent()
    const langDone =
      typeof window !== "undefined" &&
      localStorage.getItem(ONBOARDING_LANGUAGE_KEY) === "true"
    if (legal && langDone) {
      setStep("done")
    } else if (legal) {
      setStep("language")
    }
    setMounted(true)
  }, [])

  const handleAcceptConsent = () => {
    if (!legalChecked) return
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(true))
      localStorage.setItem(MARKETING_KEY, String(marketingChecked))
      setStep("language")
    } catch {
      // ignore
    }
  }

  const handleWelcomeComplete = () => {
    try {
      localStorage.setItem(ONBOARDING_LANGUAGE_KEY, "true")
      setStep("done")
    } catch {
      // ignore
    }
  }

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (step === "done") {
    return <>{children}</>
  }

  if (step === "language") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <WelcomeModal isOpen onComplete={handleWelcomeComplete} />
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <h1 className="mb-2 text-xl font-semibold text-foreground">
          Bienvenido a EchoMail
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Para continuar, por favor acepta los siguientes términos:
        </p>

        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={legalChecked}
              onChange={(e) => setLegalChecked(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm text-foreground">
              He leído y acepto el{" "}
              <Link
                href="/legal/aviso-legal"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:no-underline"
              >
                Aviso Legal
              </Link>
              {" "}y la{" "}
              <Link
                href="/legal/privacidad"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:no-underline"
              >
                Política de Privacidad
              </Link>
              {" "}de Petit Restauració S.L.
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={marketingChecked}
              onChange={(e) => setMarketingChecked(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm text-muted-foreground">
              Acepto recibir comunicaciones comerciales de EchoMail{" "}
              <span className="text-muted-foreground/80">(opcional)</span>
            </span>
          </label>
        </div>

        <button
          onClick={handleAcceptConsent}
          disabled={!legalChecked}
          className={`mt-6 w-full rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
            legalChecked
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "cursor-not-allowed bg-muted text-muted-foreground"
          }`}
        >
          Aceptar y continuar
        </button>
      </div>
    </main>
  )
}
