"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Mail, Settings, User, HelpCircle, FolderOpen, Lock, LogOut, Plug2, MessageSquare, Sparkles } from "lucide-react"
import { SidebarLanguageSelector } from "./sidebar-language-selector"
import { useLanguage } from "@/components/providers/language-provider"
import { useSettings } from "@/components/providers/settings-provider"
import { useSubscription } from "@/components/providers/subscription-provider"
import { useProfile } from "@/components/providers/profile-provider"
import { tierLabel } from "@/lib/subscription"
import { getProfileColorHex } from "@/lib/profiles"
import { saveGoogleIntegrations } from "@/lib/google-integrations"
import { FeedbackModal } from "@/components/feedback-modal"

interface DashboardSidebarProps {
  /** Si es true, se usa en modo overlay (mobile); si false, sidebar fijo en desktop */
  overlay?: boolean
  /** Llamado al hacer clic en cualquier elemento de navegación (para cerrar menú móvil) */
  onNavClick?: () => void
}

export function DashboardSidebar({ overlay = false, onNavClick }: DashboardSidebarProps) {
  const { t } = useLanguage()
  const { openSettings, openProfile } = useSettings()
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const { tier, isPro, openProTrial } = useSubscription()
  const { activeProfile } = useProfile()

  const handleNav = (fn?: () => void) => () => {
    onNavClick?.()
    fn?.()
  }

  const handleLogout = () => {
    // Limpiar sesión y estado local primero
    saveGoogleIntegrations({
      googleConnected: false,
      driveSyncEnabled: false,
      calendarId: null,
      calendarName: null,
    })
    localStorage.removeItem("echomail-profile")
    localStorage.removeItem("echomail-onboarding-language-done")
    localStorage.removeItem("echomail-legal-consent")
    localStorage.removeItem("echomail-marketing-consent")
    localStorage.removeItem("echomail-subscription-tier")
    localStorage.removeItem("echomail-stripe-subscription-id")
    localStorage.removeItem("echomail-trial-started-at")
    localStorage.removeItem("echomail-profiles")
    localStorage.removeItem("echomail-active-profile-id")
    window.dispatchEvent(new CustomEvent("google-integrations-changed"))
    // API en background (no bloquear la redirección)
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {})
    // Redirigir a / de inmediato (replace evita volver atrás al dashboard)
    window.location.replace("/")
  }

  const baseClass = overlay
    ? "fixed inset-y-0 left-0 z-40 w-56 flex-col border-r border-border bg-card shadow-xl lg:hidden"
    : "hidden w-56 flex-col border-r border-border bg-card/40 lg:flex"

  return (
    <aside className={`${baseClass} flex`}>
      <div className="flex h-16 flex-col justify-center gap-0.5 border-b border-border px-6">
        <div className="flex items-center gap-3">
          {activeProfile?.photoBase64 ? (
            <img
              src={activeProfile.photoBase64}
              alt=""
              className="h-9 w-9 shrink-0 rounded-full object-cover"
            />
          ) : activeProfile?.logoBase64 ? (
            <img
              src={activeProfile.logoBase64}
              alt=""
              className="h-8 w-10 shrink-0 object-contain"
            />
          ) : (
            <span
              className="h-9 w-9 shrink-0 rounded-full"
              style={{
                backgroundColor: activeProfile
                  ? getProfileColorHex(activeProfile.color)
                  : "#3B82F6",
              }}
            />
          )}
          <span className="truncate text-lg font-semibold text-foreground">
            {activeProfile?.name || activeProfile?.brand || "EchoMail"}
          </span>
        </div>
        <span
          className={`truncate text-[10px] font-medium uppercase tracking-wider ${
            tier === "ADMIN_LIFETIME"
              ? "text-amber-500"
              : tier === "PRO"
                ? "text-primary"
                : "text-muted-foreground"
          }`}
        >
          {tierLabel(tier)}
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-4">
        <Link
          href="/"
          onClick={onNavClick}
          className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-sm font-medium text-foreground"
        >
          <Mail className="h-5 w-5" />
          {t.dashboard}
        </Link>
        {isPro ? (
          <Link
            href="/catalogo"
            onClick={onNavClick}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <FolderOpen className="h-5 w-5" />
            Catálogo
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleNav(openProTrial)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Lock className="h-5 w-5 shrink-0" />
            <span className="flex-1">Catálogo</span>
            <span className="text-[10px] uppercase text-amber-500">PRO</span>
          </button>
        )}
        <Link
          href="/integraciones"
          onClick={onNavClick}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Plug2 className="h-5 w-5" />
          Integraciones
        </Link>
        <Link
          href="/upgrade"
          onClick={onNavClick}
          className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
        >
          <Sparkles className="h-5 w-5" />
          Ver planes
        </Link>
        <button
          onClick={handleNav(openSettings)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Settings className="h-5 w-5" />
          {t.settings}
        </button>
        <button
          onClick={handleNav(openProfile)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <User className="h-5 w-5" />
          {t.profile}
        </button>
        <button
          onClick={handleNav(handleLogout)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-5 w-5" />
          {t.logout}
        </button>
        <SidebarLanguageSelector />
        <Link
          href="/help"
          onClick={onNavClick}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <HelpCircle className="h-5 w-5" />
          {t.help}
        </Link>

        <div className="mt-auto border-t border-border pt-4">
          <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Legales
          </p>
          <div className="flex flex-col gap-1">
            <a
              href="/legal/aviso-legal"
              target="_blank"
              rel="noopener noreferrer"
              onClick={onNavClick}
              className="px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground hover:underline"
            >
              Aviso Legal
            </a>
            <a
              href="/legal/privacidad"
              target="_blank"
              rel="noopener noreferrer"
              onClick={onNavClick}
              className="px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground hover:underline"
            >
              Política de Privacidad
            </a>
            <a
              href="/legal/cookies"
              target="_blank"
              rel="noopener noreferrer"
              onClick={onNavClick}
              className="px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground hover:underline"
            >
              Política de Cookies
            </a>
            <button
              type="button"
              onClick={handleNav(() => setFeedbackOpen(true))}
              className="mt-2 flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:text-foreground hover:underline"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Feedback
            </button>
          </div>
        </div>
      </nav>
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </aside>
  )
}
