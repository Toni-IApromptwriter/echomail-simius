"use client"

import { useEffect } from "react"
import { X, Sun, Moon, Monitor } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import { useTheme } from "next-themes"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

type ThemeValue = "light" | "dark" | "system"

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { t } = useLanguage()
  const { theme, setTheme } = useTheme()

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

  const themeOptions: { value: ThemeValue; label: string; icon: React.ReactNode }[] = [
    { value: "light", label: t.themeLight, icon: <Sun className="h-4 w-4" /> },
    { value: "dark", label: t.themeDark, icon: <Moon className="h-4 w-4" /> },
    { value: "system", label: t.themeSystem, icon: <Monitor className="h-4 w-4" /> },
  ]

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
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

        <div className="p-6">
          <label className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
            {t.tabTheme}
          </label>
          <ul className="flex flex-col gap-1 rounded-lg border border-border bg-background/50">
            {themeOptions.map((opt) => (
              <li key={opt.value}>
                <button
                  onClick={() => setTheme(opt.value)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-muted/50 ${
                    theme === opt.value
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-foreground"
                  }`}
                >
                  {opt.icon}
                  <span className="flex-1">{opt.label}</span>
                  {theme === opt.value && (
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
