"use client"

import { useState } from "react"
import { ChevronDown, Globe } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import { LANGUAGES, type Language } from "@/lib/i18n"

/**
 * Selector de idiomas para el sidebar. Abre hacia abajo para evitar solapamiento.
 */
export function SidebarLanguageSelector() {
  const { language, setLanguage, t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const current = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t.language}
      >
        <Globe className="h-5 w-5 shrink-0" />
        <span className="flex-1 truncate">{current.label}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <ul
            className="absolute left-0 top-full z-50 mt-1 w-full min-w-[180px] rounded-lg border border-border bg-card py-1 shadow-lg"
            role="listbox"
          >
            {LANGUAGES.map((opt) => (
              <li key={opt.code} role="option" aria-selected={language === opt.code}>
                <button
                  onClick={() => {
                    setLanguage(opt.code as Language)
                    setIsOpen(false)
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-muted ${
                    language === opt.code ? "bg-muted font-medium" : ""
                  }`}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
