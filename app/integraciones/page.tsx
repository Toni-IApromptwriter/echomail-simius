"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, Menu } from "lucide-react"
import { ConsentGate } from "@/components/consent-gate"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import {
  loadGoogleIntegrations,
  saveGoogleIntegrations,
} from "@/lib/google-integrations"
import { IntegrationCard } from "@/components/integrations/integration-card"
import { INTEGRATIONS_CONFIG } from "@/lib/integrations-config"

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
  const [googleConnected, setGoogleConnected] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const refreshStatus = async () => {
    try {
      const res = await fetch("/api/google/status")
      const { connected } = await res.json()
      setGoogleConnected(Boolean(connected))
    } catch {
      setGoogleConnected(false)
    }
  }

  useEffect(() => {
    refreshStatus()
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("google_connected") === "1") {
      saveGoogleIntegrations({ googleConnected: true })
      refreshStatus()
      window.history.replaceState({}, "", "/integraciones")
    }
  }, [])

  useEffect(() => {
    const onChanged = () => refreshStatus()
    window.addEventListener("google-integrations-changed", onChanged)
    return () =>
      window.removeEventListener("google-integrations-changed", onChanged)
  }, [])

  const handleConnectGoogle = () => {
    window.location.href = "/api/auth/google?returnTo=/integraciones"
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
      </main>
      </div>
    </div>
    </ConsentGate>
  )
}
