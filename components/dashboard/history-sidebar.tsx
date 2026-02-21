"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Trash2,
  X,
  Zap,
  Target,
  Heart,
  Minus,
  Sparkles,
  BookOpen,
  GraduationCap,
  TrendingUp,
  Cpu,
  Flame,
  type LucideIcon,
} from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import {
  loadHistory,
  clearHistory,
  deleteFromHistory,
  type HistoryEntry,
} from "@/lib/history"
import { TECHNIQUE_KEY_TO_API } from "@/lib/i18n"

const TECHNIQUE_ICONS: Record<string, LucideIcon> = {
  [TECHNIQUE_KEY_TO_API["direct-sale"]]: Zap,
  [TECHNIQUE_KEY_TO_API["hormozi"]]: Target,
  [TECHNIQUE_KEY_TO_API["empathy"]]: Heart,
  [TECHNIQUE_KEY_TO_API["minimalist"]]: Minus,
  [TECHNIQUE_KEY_TO_API["informative"]]: Sparkles,
  [TECHNIQUE_KEY_TO_API["storytelling"]]: BookOpen,
  [TECHNIQUE_KEY_TO_API["educational"]]: GraduationCap,
  [TECHNIQUE_KEY_TO_API["strategic"]]: TrendingUp,
  [TECHNIQUE_KEY_TO_API["technical"]]: Cpu,
  [TECHNIQUE_KEY_TO_API["aggressive"]]: Flame,
}

function getTechniqueIcon(technique: string): LucideIcon {
  return TECHNIQUE_ICONS[technique] ?? Zap
}

interface HistorySidebarProps {
  onSelectEntry: (entry: HistoryEntry | null) => void
  currentEntryId: string | null
  refreshTrigger?: number // increment to force refresh
  onHistoryCleared?: () => void
}

function formatDate(
  iso: string,
  t: { now: string; minutesAgo: string; hoursAgo: string; daysAgo: string },
  locale: string
): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return t.now
  if (diffMins < 60) return t.minutesAgo.replace("{n}", String(diffMins))
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return t.hoursAgo.replace("{n}", String(diffHours))
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return t.daysAgo.replace("{n}", String(diffDays))

  const localeMap: Record<string, string> = {
    ca: "ca-ES",
    pt: "pt-BR",
    es: "es-ES",
    "es-LA": "es-419",
    "en-US": "en-US",
    "en-GB": "en-GB",
    fr: "fr-FR",
    de: "de-DE",
  }
  return d.toLocaleDateString(localeMap[locale] ?? "en-US", {
    day: "numeric",
    month: "short",
  })
}

export function HistorySidebar({
  onSelectEntry,
  currentEntryId,
  refreshTrigger = 0,
  onHistoryCleared,
}: HistorySidebarProps) {
  const { t, language } = useLanguage()
  const [entries, setEntries] = useState<HistoryEntry[]>([])

  const refresh = useCallback(() => {
    setEntries(loadHistory())
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh, refreshTrigger])

  const handleClear = () => {
    if (window.confirm(t.confirmClearHistory)) {
      clearHistory()
      refresh()
      onSelectEntry(null)
      onHistoryCleared?.()
    }
  }

  const handleDeleteEntry = (e: React.MouseEvent, entry: HistoryEntry) => {
    e.stopPropagation()
    if (window.confirm(t.confirmDeleteEntry)) {
      deleteFromHistory(entry.id)
      if (currentEntryId === entry.id) {
        onSelectEntry(null)
      }
      refresh()
    }
  }

  return (
    <aside className="hidden w-64 flex-col border-l border-border bg-card/40 lg:flex">
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        <h3 className="text-sm font-semibold text-foreground">
          {t.historyTitle}
        </h3>
        {entries.length > 0 && (
          <button
            onClick={handleClear}
            className="rounded p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-red-600"
            title={t.clearHistory}
            aria-label={t.clearHistory}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {entries.length === 0 ? (
          <p className="px-2 py-4 text-center text-sm text-muted-foreground">
            {t.noHistory}
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {entries.map((entry) => {
              const preview =
                entry.email.length > 80 ? entry.email.slice(0, 80) + "…" : entry.email
              const isSelected = entry.id === currentEntryId

              const TechniqueIcon = getTechniqueIcon(entry.technique)

              return (
                <li key={entry.id} className="group relative">
                  <button
                    onClick={() => onSelectEntry(entry)}
                    className={`flex w-full flex-col rounded-lg px-3 py-2 pr-10 text-left text-sm transition-colors ${
                      isSelected
                        ? "bg-primary/15 text-foreground ring-1 ring-primary/30"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-2 font-medium tabular-nums text-muted-foreground">
                      <TechniqueIcon className="h-3.5 w-3.5 shrink-0" />
                      {formatDate(entry.date, t, language)}
                    </span>
                    <span className="mt-0.5 line-clamp-2 block">
                      {preview}
                    </span>
                  </button>
                  <button
                    onClick={(e) => handleDeleteEntry(e, entry)}
                    className="absolute right-2 top-2 rounded p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-red-500/20 hover:text-red-600 group-hover:opacity-100"
                    title={t.deleteEntry}
                    aria-label={t.deleteEntry}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </aside>
  )
}
