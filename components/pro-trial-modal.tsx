"use client"

import { useState } from "react"
import { X, Sparkles, Loader2 } from "lucide-react"

interface ProTrialModalProps {
  isOpen: boolean
  onClose: () => void
  onStartTrial?: () => void
}

export function ProTrialModal({
  isOpen,
  onClose,
}: ProTrialModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStartTrial = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Error al iniciar la prueba")
      if (data.url) {
        window.location.href = data.url
        return
      }
      throw new Error("No se recibió URL de checkout")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al conectar con Stripe")
    } finally {
      setLoading(false)
    }
  }
  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed left-1/2 top-1/2 z-[60] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pro-trial-title"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2
            id="pro-trial-title"
            className="flex items-center gap-2 text-lg font-semibold text-foreground"
          >
            <Sparkles className="h-5 w-5 text-amber-500" />
            EchoMail Pro
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          <p className="text-sm leading-relaxed text-foreground">
            Prueba EchoMail Pro gratis durante 15 días. Hoy pagas 0,00€. Te
            avisaremos 3 días antes de finalizar para tu total tranquilidad.
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="text-primary">✓</span>
              Múltiples identidades verbales
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">✓</span>
              Módulo catálogo
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">✓</span>
              Todas las funciones PRO
            </li>
          </ul>
        </div>

        <div className="border-t border-border px-6 py-4 space-y-2">
          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}
          <button
            onClick={handleStartTrial}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Iniciar mi prueba de 15 días"
            )}
          </button>
          <p className="text-xs text-center text-muted-foreground">
            Si cancelas durante la prueba, mantienes acceso PRO hasta el final de los 15 días.
          </p>
        </div>
      </div>
    </>
  )
}
