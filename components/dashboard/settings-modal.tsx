"use client"

import { useEffect } from "react"
import { X, Globe } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import { LANGUAGES, type Language } from "@/lib/i18n"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { language, setLanguage, t } = useLanguage()

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="settings-title" className="text-lg font-semibold text-foreground">
            {t.settings}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={t.close}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Globe className="h-4 w-4 text-muted-foreground" />
            {t.language}
          </label>
          <ul className="flex flex-col gap-1 rounded-lg border border-border bg-background/50">
            {LANGUAGES.map((opt) => (
              <li key={opt.code}>
                <button
                  onClick={() => {
                    setLanguage(opt.code as Language)
                  }}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-muted/50 ${
                    language === opt.code
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-foreground"
                  }`}
                >
                  <span className="flex-1">{opt.label}</span>
                  {language === opt.code && (
                    <span className="text-primary">✓</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}
