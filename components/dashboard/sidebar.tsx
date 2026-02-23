"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Mail, Settings, User, HelpCircle, FolderOpen, Lock } from "lucide-react"
import { SidebarLanguageSelector } from "./sidebar-language-selector"
import { useLanguage } from "@/components/providers/language-provider"
import { useSettings } from "@/components/providers/settings-provider"
import { useSubscription } from "@/components/providers/subscription-provider"
import { loadProfile } from "@/lib/profile"
import { tierLabel } from "@/lib/subscription"

interface DashboardSidebarProps {
  /** Si es true, se usa en modo overlay (mobile); si false, sidebar fijo en desktop */
  overlay?: boolean
  /** Llamado al hacer clic en cualquier elemento de navegación (para cerrar menú móvil) */
  onNavClick?: () => void
}

export function DashboardSidebar({ overlay = false, onNavClick }: DashboardSidebarProps) {
  const { t } = useLanguage()
  const { openSettings, openProfile } = useSettings()
  const { tier, isPro, openProTrial } = useSubscription()
  const [profile, setProfile] = useState<ReturnType<typeof loadProfile> | null>(null)

  useEffect(() => {
    const refresh = () => setProfile(loadProfile())
    refresh()
    window.addEventListener("profile-saved", refresh)
    return () => window.removeEventListener("profile-saved", refresh)
  }, [])

  const handleNav = (fn?: () => void) => () => {
    onNavClick?.()
    fn?.()
  }

  const baseClass = overlay
    ? "fixed inset-y-0 left-0 z-40 w-56 flex-col border-r border-border bg-card shadow-xl lg:hidden"
    : "hidden w-56 flex-col border-r border-border bg-card/40 lg:flex"

  return (
    <aside className={`${baseClass} flex`}>
      <div className="flex h-16 flex-col justify-center gap-0.5 border-b border-border px-6">
        <div className="flex items-center gap-3">
          {profile?.photoBase64 ? (
            <img
              src={profile.photoBase64}
              alt=""
              className="h-9 w-9 shrink-0 rounded-full object-cover"
            />
          ) : profile?.logoBase64 ? (
            <img
              src={profile.logoBase64}
              alt=""
              className="h-8 w-10 shrink-0 object-contain"
            />
          ) : null}
          <span className="truncate text-lg font-semibold text-foreground">
            {profile?.name || profile?.brand || "EchoMail"}
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
          </div>
        </div>
      </nav>
    </aside>
  )
}
