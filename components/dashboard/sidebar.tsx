"use client"

import Link from "next/link"
import { Mail, Settings, HelpCircle } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import { useSettings } from "@/components/providers/settings-provider"

export function DashboardSidebar() {
  const { t } = useLanguage()
  const { openSettings } = useSettings()

  return (
    <aside className="hidden w-56 flex-col border-r border-border bg-card/40 lg:flex">
        <div className="flex h-16 items-center border-b border-border px-6">
          <span className="text-lg font-semibold text-foreground">EchoMail</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-sm font-medium text-foreground"
          >
            <Mail className="h-5 w-5" />
            {t.dashboard}
          </Link>
          <button
            onClick={openSettings}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Settings className="h-5 w-5" />
            {t.settings}
          </button>
          <Link
            href="/help"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <HelpCircle className="h-5 w-5" />
            {t.help}
          </Link>
        </nav>
      </aside>
  )
}
