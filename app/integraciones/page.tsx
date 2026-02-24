"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ChevronLeft, Menu, HardDrive, Calendar } from "lucide-react"
import { ConsentGate } from "@/components/consent-gate"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import {
  loadGoogleIntegrations,
  saveGoogleIntegrations,
  type GoogleIntegrationsData,
} from "@/lib/google-integrations"
import { IntegrationCard } from "@/components/integrations/integration-card"
import { INTEGRATIONS_CONFIG } from "@/lib/integrations-config"
import { useLanguage } from "@/components/providers/language-provider"

const FALLBACK_LOGOS: Record<string, React.ReactNode> = {
  "google-drive": (
    <svg viewBox="0 0 87.3 78" className="h-12 w-12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.6 66.85L3.3 58.9v-38.7l3.3-7.95 11.4 20.5v36.2z" fill="#0066DA" />
      <path d="M43.65 25.95l-11.4-20.5L40.35 0l24.3 14.2-21 36.75z" fill="#00AC47" />
      <path d="M43.65 25.95v40.9l21 11.05 21-36.75V14.2L43.65 25.95z" fill="#EA4335" />
      <path d="M6.6 12.25l11.4 20.5H43.65L22.65-4.5 6.6 12.25z" fill="#00832D" />
      <path d="M22.65 78l21-11.05v-40.9L22.65 14.25V78z" fill="#2684FC" />
      <path d="M43.65 66.95l21 11.05 15.05-26.5-21-36.75-15.05 12.25v39.95z" fill="#FFBA00" />
    </svg>
  ),
  "google-calendar": (
    <svg viewBox="0 0 24 24" className="h-12 w-12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" fill="#4285F4" />
    </svg>
  ),
  getresponse: (
    <svg viewBox="0 0 24 24" className="h-12 w-12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#00B4D8" />
    </svg>
  ),
  mailerlite: (
    <svg viewBox="0 0 24 24" className="h-12 w-12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="#FFBE00" />
    </svg>
  ),
}

export default function IntegracionesPage() {
  const { t } = useLanguage()
  const [googleConnected, setGoogleConnected] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [integrations, setIntegrations] = useState<GoogleIntegrationsData>(
    () => loadGoogleIntegrations()
  )
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
    refreshStatus()
  }, [refreshStatus])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("google_connected") === "1") {
      saveGoogleIntegrations({ googleConnected: true })
      refreshStatus()
      window.history.replaceState({}, "", "/integraciones")
    }
  }, [refreshStatus])

  useEffect(() => {
    const onChanged = () => {
      setIntegrations(loadGoogleIntegrations())
    }
    window.addEventListener("google-integrations-changed", onChanged)
    return () =>
      window.removeEventListener("google-integrations-changed", onChanged)
  }, [])

  const handleConnectGoogle = () => {
    window.location.href = "/api/auth/google?returnTo=/integraciones"
  }

  const handleDriveSyncToggle = () => {
    const next = !integrations.driveSyncEnabled
    if (next && !googleConnected) {
      handleConnectGoogle()
      return
    }
    saveGoogleIntegrations({ driveSyncEnabled: next })
    setIntegrations((p) => ({ ...p, driveSyncEnabled: next }))
    window.dispatchEvent(new CustomEvent("google-integrations-changed"))
  }

  const handleCalendarSelect = (id: string, summary: string) => {
    saveGoogleIntegrations({ calendarId: id, calendarName: summary })
    setIntegrations((p) => ({ ...p, calendarId: id, calendarName: summary }))
    window.dispatchEvent(new CustomEvent("google-integrations-changed"))
  }

  return (
    <ConsentGate>
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <DashboardSidebar />
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden
          />
          <div className="fixed inset-y-0 left-0 z-40 lg:hidden">
            <DashboardSidebar overlay onNavClick={() => setMobileMenuOpen(false)} />
          </div>
        </>
      )}
      <div className="flex flex-1 flex-col">
      <header className="border-b border-[#262626] bg-[#171717]/80 px-4 py-4 backdrop-blur-sm sm:px-6 lg:px-12">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-lg p-2 text-[#ededed] hover:bg-[#262626] lg:hidden"
            aria-label="Menú"
          >
            <Menu className="h-6 w-6" />
          </button>
          <Link
            href="/"
            className="flex items-center gap-1 rounded-lg p-2 text-[#a3a3a3] transition-colors hover:bg-[#262626] hover:text-[#ededed]"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Volver</span>
          </Link>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-[#ededed] sm:text-xl">
              Integraciones
            </h1>
            <p className="text-sm text-[#a3a3a3]">
              Conecta tus herramientas para potenciar EchoMail
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-12">
        <div className="grid gap-6 sm:grid-cols-2">
          {INTEGRATIONS_CONFIG.map((integration) => (
            <IntegrationCard
              key={integration.id}
              name={integration.name}
              description={integration.description}
              logo={FALLBACK_LOGOS[integration.id]}
              logoFile={integration.logoFile}
              platform={integration.platform}
              badge={integration.badge}
              isConnected={
                integration.platform === "google"
                  ? googleConnected
                  : false
              }
              onConnect={
                integration.platform === "google"
                  ? handleConnectGoogle
                  : undefined
              }
            />
          ))}
        </div>

        {googleConnected && (
          <section className="mt-10 rounded-2xl border border-[#262626] bg-[#171717]/80 p-6">
            <h2 className="mb-4 text-base font-semibold tracking-tight text-[#ededed]">
              Configuración de Google
            </h2>
            <div className="space-y-6">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#ededed]">
                  <HardDrive className="h-4 w-4" />
                  {t.connectGoogleDrive}
                </label>
                <div className="flex items-center justify-between rounded-lg border border-[#262626] bg-[#0a0a0a]/50 px-4 py-3">
                  <span className="text-sm text-[#a3a3a3]">
                    {t.driveSyncEnabled}
                  </span>
                  <button
                    role="switch"
                    aria-checked={integrations.driveSyncEnabled}
                    onClick={handleDriveSyncToggle}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                      integrations.driveSyncEnabled ? "bg-[#facc15]" : "bg-[#262626]"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        integrations.driveSyncEnabled ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#ededed]">
                  <Calendar className="h-4 w-4" />
                  {t.connectGoogleCalendar}
                </label>
                <div className="rounded-lg border border-[#262626] bg-[#0a0a0a]/50 px-4 py-3">
                  <p className="mb-2 text-xs font-medium text-[#a3a3a3]">
                    {t.calendarController}
                  </p>
                  {loadingCalendars ? (
                    <p className="text-sm text-[#a3a3a3]">Cargando…</p>
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
                      className="w-full rounded-lg border border-[#262626] bg-[#0a0a0a] px-3 py-2 text-sm text-[#ededed]"
                    >
                      <option value="">{t.selectCalendar}</option>
                      {calendars.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.summary}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm text-[#a3a3a3]">No hay calendarios</p>
                  )}
                  <p className="mt-2 text-xs text-[#737373]">
                    Los eventos con etiqueta [EchoMail] programan el envío.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      </div>
    </div>
    </ConsentGate>
  )
}
