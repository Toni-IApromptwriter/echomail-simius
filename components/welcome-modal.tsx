"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/components/providers/language-provider"
import { useSubscription } from "@/components/providers/subscription-provider"
import { loadProfile, saveProfile } from "@/lib/profile"
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
  const [emailInput, setEmailInput] = useState("")

  const isMaster = isFounder(profile.email) || isFounder(emailInput.trim())

  useEffect(() => {
    if (isOpen) setProfile(loadProfile())
  }, [isOpen])

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang)
  }

  const handleConfirm = () => {
    if (isMaster) {
      if (emailInput.trim()) {
        const p = loadProfile()
        saveProfile({ ...p, email: emailInput.trim() })
      }
      onComplete()
    } else {
      startProTrial()
      onComplete()
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
        <div className="p-6">
          <h2
            id="welcome-modal-title"
            className="mb-6 text-xl font-semibold text-foreground"
          >
            Bienvenido a EchoMail. Vamos a configurar tu espacio de trabajo.
          </h2>

          <div className="mb-6">
            <label
              htmlFor="welcome-email"
              className="mb-2 block text-sm font-medium text-muted-foreground"
            >
              Correo electrónico{" "}
              <span className="text-muted-foreground/70">(opcional)</span>
            </label>
            <input
              id="welcome-email"
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="tu@email.com"
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Sección 1: Idioma */}
          <section className="mb-6">
            <h3 className="mb-3 text-sm font-medium text-foreground">
              ¿En qué idioma prefieres la interfaz?
            </h3>
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

          {/* Secciones 2 y 3: Solo si no es Toni Mont */}
          {!isMaster && (
            <>
              {/* Sección 2: Oferta Pro */}
              <section className="mb-6">
                <h3 className="mb-2 text-sm font-medium text-foreground">
                  Disfruta de 15 días de acceso PRO gratis
                </h3>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    Identidades verbales ilimitadas
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    Módulo de catálogo
                  </li>
                </ul>
              </section>

              {/* Sección 3: Transparencia */}
              <section className="mb-6">
                <p className="text-sm text-muted-foreground">
                  Hoy pagas 0,00€. Te avisaremos 3 días antes de finalizar la
                  prueba.
                </p>
              </section>
            </>
          )}

          {isMaster && (
            <section className="mb-6">
              <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-200">
                Tienes acceso Maestro de por vida. Sin pasos de pago.
              </p>
            </section>
          )}

          {/* Botón principal */}
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {isMaster
              ? "Acceso Maestro Activado"
              : "Configurar idioma e iniciar prueba gratis"}
          </button>
        </div>
      </div>
    </>
  )
}
