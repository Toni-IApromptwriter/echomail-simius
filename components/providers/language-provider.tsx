"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"
import type { Language } from "@/lib/i18n"
import { t } from "@/lib/i18n"

const STORAGE_KEY = "echomail-language"

type LangContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: ReturnType<typeof t>
}

const LangContext = createContext<LangContextType | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ca" as Language)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const valid: Language[] = ["ca", "pt", "es", "es-LA", "en-US", "en-GB", "fr", "de", "zh-CN", "zh-TW", "ja"]
      const migration: Record<string, Language> = {
        en: "en-US",
        fr: "fr",
        de: "de",
      }
      if (stored) {
        const lang = (migration[stored] ?? stored) as Language
        if (valid.includes(lang)) {
          setLanguageState(lang)
          if (stored !== lang) localStorage.setItem(STORAGE_KEY, lang)
        }
      }
    } catch {
      // ignore
    }
    setMounted(true)
  }, [])

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    try {
      localStorage.setItem(STORAGE_KEY, lang)
      if (typeof document !== "undefined") {
        document.documentElement.lang = lang === "es-LA" ? "es" : lang.split("-")[0]
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    if (!mounted || typeof document === "undefined") return
    const langAttr = language === "es-LA" ? "es" : language.split("-")[0]
    document.documentElement.lang = langAttr
  }, [mounted, language])

  const value: LangContextType = {
    language: mounted ? language : ("ca" as Language),
    setLanguage,
    t: t(mounted ? language : ("ca" as Language)),
  }

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider")
  return ctx
}
