"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { LogOut } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import { useSubscription } from "@/components/providers/subscription-provider"
import { loadProfile, saveProfile } from "@/lib/profile"
import { setTrialStartedAt } from "@/lib/trial"
import { ONBOARDING_LANGUAGES, type Language } from "@/lib/i18n"
import { isFounder } from "@/lib/subscription"

interface WelcomeModalProps {
  isOpen: boolean
  onComplete: () => void
}

export function WelcomeModal({ isOpen, onComplete }: WelcomeModalProps) {
  const { language, setLanguage } = useLanguage()
  const { startProTrial } = useSubscription()
  const [profile, setProfile] = useState(loadProfile())
  const [phoneInput, setPhoneInput] = useState(profile.phone ?? "")
  const [acceptTrial, setAcceptTrial] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const p = loadProfile()
      setProfile(p)
      setPhoneInput(p.phone ?? "")
    }
  }, [isOpen])

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang)
  }

  const handleConfirm = () => {
    const phone = phoneInput.trim()
    if (!phone) {
      alert("El teléfono es obligatorio para evitar el fraude de multicuentas.")
      return
    }
    try {
      const p = loadProfile()
      saveProfile({
        ...p,
        phone,
      })
      if (acceptTrial && !isFounder(p.email)) {
        setTrialStartedAt()
        startProTrial()
      }
      onComplete()
    } catch {
      onComplete()
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      localStorage.removeItem("echomail-legal-consent")
      localStorage.removeItem("echomail-marketing-consent")
      window.location.href = "/"
    } catch {
      window.location.href = "/"
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div
        className="fixed left-1/2 top-1/2 z-[70] max-h-[90vh] w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border bg-card shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-modal-title"
      >
        <div className="relative p-6">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="absolute right-4 top-4 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-70"
            aria-label="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>

          <div className="mb-4 flex justify-center">
            <Image
              src="/logo-simius.jpg"
              alt="Simius"
              width={200}
              height={200}
              className="h-24 w-auto object-contain"
            />
          </div>
          <h2
            id="welcome-modal-title"
            className="mb-6 text-xl font-semibold text-foreground"
          >
            Bienvenido a EchoMail
          </h2>

          {/* 1. Idioma */}
          <section className="mb-6">
            <label className="mb-3 block text-sm font-medium text-foreground">
              Idioma
            </label>
            <div className="flex flex-col gap-2">
              {ONBOARDING_LANGUAGES.map((opt) => (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => handleSelectLanguage(opt.code)}
                  className={`rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors ${
                    language === opt.code
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted/30 text-foreground hover:border-primary/50 hover:bg-muted/50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          {/* 2. Teléfono (obligatorio) */}
          <section className="mb-6">
            <label
              htmlFor="welcome-phone"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Teléfono <span className="text-red-500">*</span>
            </label>
            <input
              id="welcome-phone"
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="+34 600 000 000"
              required
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Obligatorio para verificación y prevención de fraude.
            </p>
          </section>

          {/* 3. Aceptar Trial */}
          {!isFounder(profile.email) && (
            <section className="mb-6">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={acceptTrial}
                  onChange={(e) => setAcceptTrial(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">
                  Tengo 5 días de prueba PRO gratis. Hoy no pago nada. Pasados los 5
                  días tendré que suscribirme o configurar mi propia API Key de OpenAI
                  para seguir usando la app. Te avisaremos 3 días antes de finalizar.
                </span>
              </label>
            </section>
          )}

          <button
            type="button"
            onClick={handleConfirm}
            className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {isFounder(profile.email)
              ? "Continuar"
              : acceptTrial
                ? "Aceptar e iniciar prueba gratis"
                : "Continuar sin prueba"}
          </button>
        </div>
      </div>
    </>
  )
}
