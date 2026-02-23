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
import { t, DEFAULT_LANGUAGE } from "@/lib/i18n"
import { loadProfile, saveProfile } from "@/lib/profile"

const STORAGE_KEY = "echomail-language"

type LangContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: ReturnType<typeof t>
}

const LangContext = createContext<LangContextType | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const profile = loadProfile()
      const valid: Language[] = ["ca", "pt", "es", "es-LA", "en-US", "en-GB", "fr", "de", "zh-CN", "zh-TW", "ja"]
      const migration: Record<string, Language> = {
        en: "en-US",
        fr: "fr",
        de: "de",
      }
      // Prioridad: 1) localStorage, 2) perfil, 3) DEFAULT_LANGUAGE (es)
      let lang: Language | null = null
      if (stored) {
        const migrated = (migration[stored] ?? stored) as Language
        if (valid.includes(migrated)) {
          lang = migrated
          if (stored !== migrated) localStorage.setItem(STORAGE_KEY, migrated)
        }
      }
      if (!lang && profile.language && valid.includes(profile.language)) {
        lang = profile.language
        localStorage.setItem(STORAGE_KEY, profile.language)
      }
      if (lang) setLanguageState(lang)
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
      // Sincronizar con perfil para que el idioma se guarde en el perfil del usuario
      const profile = loadProfile()
      saveProfile({ ...profile, language: lang })
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
    language: mounted ? language : DEFAULT_LANGUAGE,
    setLanguage,
    t: t(mounted ? language : DEFAULT_LANGUAGE),
  }

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider")
  return ctx
}
