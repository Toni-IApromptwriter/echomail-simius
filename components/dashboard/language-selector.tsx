"use client"

import { useState } from "react"
import { ChevronDown, Globe } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import { LANGUAGES, type Language } from "@/lib/i18n"

export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const current = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground hover:bg-muted/50"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t.language}
      >
        <Globe className="h-4 w-4 text-muted-foreground" />
        <span>{current.label}</span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <ul
            className="absolute right-0 top-full z-20 mt-1 min-w-[140px] rounded-lg border border-border bg-card py-1 shadow-lg"
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
