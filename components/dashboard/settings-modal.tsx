"use client"

import { useEffect, useState, useCallback } from "react"
import { X, Sun, Moon, Monitor, HardDrive, Calendar, Key } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import { useTheme } from "next-themes"
import {
  loadGoogleIntegrations,
  saveGoogleIntegrations,
  type GoogleIntegrationsData,
} from "@/lib/google-integrations"
import {
  loadOpenAIKey,
  saveOpenAIKey,
} from "@/lib/openai-settings"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

type ThemeValue = "light" | "dark" | "system"

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { t } = useLanguage()
  const { theme, setTheme } = useTheme()
  const [integrations, setIntegrations] = useState<GoogleIntegrationsData>(
    loadGoogleIntegrations
  )
  const [openAIKey, setOpenAIKey] = useState<string>("")
  const [openAIKeySaved, setOpenAIKeySaved] = useState(false)
  const [googleConnected, setGoogleConnected] = useState(false)
  const [calendars, setCalendars] = useState<{ id: string; summary: string }[]>([])
  const [loadingCalendars, setLoadingCalendars] = useState(false)

  const refreshStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/google/status")
      const { connected } = await res.json()
      setGoogleConnected(Boolean(connected))
      setIntegrations(loadGoogleIntegrations())
      if (connected) {
        setLoadingCalendars(true)
        const calRes = await fetch("/api/google/calendar/list")
        if (calRes.ok) {
          const { calendars: list } = await calRes.json()
          setCalendars(list ?? [])
        }
      } else {
        setCalendars([])
      }
    } catch {
      setGoogleConnected(false)
      setCalendars([])
    } finally {
      setLoadingCalendars(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      refreshStatus()
      const key = loadOpenAIKey()
      setOpenAIKey(key ?? "")
    }
  }, [isOpen, refreshStatus])

  useEffect(() => {
    const onChanged = () => {
      setIntegrations(loadGoogleIntegrations())
    }
    window.addEventListener("google-integrations-changed", onChanged)
    return () => window.removeEventListener("google-integrations-changed", onChanged)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("google_connected") === "1") {
      saveGoogleIntegrations({ googleConnected: true })
      refreshStatus()
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [refreshStatus])

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

  const handleConnectGoogle = () => {
    window.location.href = "/api/auth/google"
  }

  const handleDriveSyncToggle = () => {
    const next = !integrations.driveSyncEnabled
    if (next && !googleConnected) {
      handleConnectGoogle()
      return
    }
    saveGoogleIntegrations({ driveSyncEnabled: next })
    setIntegrations((p) => ({ ...p, driveSyncEnabled: next }))
  }

  const handleCalendarConnect = () => {
    if (!googleConnected) {
      handleConnectGoogle()
      return
    }
  }

  const handleCalendarSelect = (id: string, summary: string) => {
    saveGoogleIntegrations({ calendarId: id, calendarName: summary })
    setIntegrations((p) => ({ ...p, calendarId: id, calendarName: summary }))
  }

  const handleSaveOpenAIKey = () => {
    if (saveOpenAIKey(openAIKey.trim() || null)) {
      setOpenAIKeySaved(true)
      window.dispatchEvent(new CustomEvent("openai-key-saved"))
      setTimeout(() => setOpenAIKeySaved(false), 2000)
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border bg-card shadow-xl"
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

        <div className="space-y-6 p-6">
          <section>
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
          </section>

          <section>
            <label className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
              <Key className="h-4 w-4" />
              API OpenAI (opcional)
            </label>
            <div className="flex flex-col gap-3 rounded-lg border border-border bg-background/50 px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Introduce tu propia clave API de OpenAI para usar tu consumo.
                Si está vacío, se usa la clave del servidor.
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={openAIKey}
                  onChange={(e) => setOpenAIKey(e.target.value)}
                  placeholder="sk-..."
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                  autoComplete="off"
                />
                <button
                  onClick={handleSaveOpenAIKey}
                  className="rounded-lg border border-primary bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                >
                  {openAIKeySaved ? "Guardado" : "Guardar"}
                </button>
              </div>
            </div>
          </section>

          <section>
            <label className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
              <HardDrive className="h-4 w-4" />
              {t.connectGoogleDrive}
            </label>
            <div className="flex flex-col gap-3 rounded-lg border border-border bg-background/50 px-4 py-3">
              {googleConnected ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {t.googleConnected}
                    </span>
                    <span className="text-xs text-primary">✓</span>
                  </div>
                  <label className="flex cursor-pointer items-center justify-between gap-3">
                    <span className="text-sm text-foreground">
                      {t.driveSyncEnabled}
                    </span>
                    <button
                      role="switch"
                      aria-checked={integrations.driveSyncEnabled}
                      onClick={handleDriveSyncToggle}
                      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                        integrations.driveSyncEnabled ? "bg-primary" : "bg-muted"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                          integrations.driveSyncEnabled ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  </label>
                </>
              ) : (
                <button
                  onClick={handleConnectGoogle}
                  className="w-full rounded-lg border border-primary bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                >
                  {t.connectGoogleDrive}
                </button>
              )}
            </div>
          </section>

          <section>
            <label className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
              <Calendar className="h-4 w-4" />
              {t.connectGoogleCalendar}
            </label>
            <div className="flex flex-col gap-3 rounded-lg border border-border bg-background/50 px-4 py-3">
              {googleConnected ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {t.googleConnected}
                    </span>
                    <span className="text-xs text-primary">✓</span>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      {t.calendarController}
                    </p>
                    {loadingCalendars ? (
                      <p className="text-sm text-muted-foreground">Cargando…</p>
                    ) : calendars.length > 0 ? (
                      <select
                        value={integrations.calendarId ?? ""}
                        onChange={(e) => {
                          const opt = e.target.selectedOptions[0]
                          handleCalendarSelect(
                            e.target.value,
                            opt?.textContent ?? ""
                          )
                        }}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                      >
                        <option value="">{t.selectCalendar}</option>
                        {calendars.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.summary}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No hay calendarios
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Los eventos con etiqueta [EchoMail] programan el envío.
                  </p>
                </>
              ) : (
                <button
                  onClick={handleCalendarConnect}
                  className="w-full rounded-lg border border-primary bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                >
                  {t.connectGoogleCalendar}
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
