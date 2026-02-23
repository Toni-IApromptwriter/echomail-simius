"use client"

import { X, Sparkles } from "lucide-react"

interface ProTrialModalProps {
  isOpen: boolean
  onClose: () => void
  onStartTrial: () => void
}

export function ProTrialModal({
  isOpen,
  onClose,
  onStartTrial,
}: ProTrialModalProps) {
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

        <div className="border-t border-border px-6 py-4">
          <button
            onClick={onStartTrial}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Iniciar mi prueba de 15 días
          </button>
        </div>
      </div>
    </>
  )
}
