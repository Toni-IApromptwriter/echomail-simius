"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, Plus, Check } from "lucide-react"
import { useProfile } from "@/components/providers/profile-provider"
import { useSubscription } from "@/components/providers/subscription-provider"
import { getProfileColorHex } from "@/lib/profiles"

export function ProfileSwitcher() {
  const {
    profiles,
    activeProfile,
    setActiveProfileId,
    addProfile,
    canAddProfile,
    maxProfilesAllowed,
  } = useProfile()
  const { openProTrial } = useSubscription()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener("click", handler)
    return () => document.removeEventListener("click", handler)
  }, [open])

  const colorHex = getProfileColorHex(activeProfile.color)

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-left transition-colors hover:bg-muted/50"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Perfil activo: ${activeProfile.name}`}
      >
        <span
          className="h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: colorHex }}
          aria-hidden
        />
        <span className="max-w-[120px] truncate text-sm font-medium text-foreground">
          {activeProfile.name}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1 min-w-[200px] rounded-lg border border-border bg-card py-1 shadow-lg"
          role="listbox"
        >
          {profiles.map((p) => {
            const hex = getProfileColorHex(p.color)
            const isActive = p.id === activeProfile.id
            return (
              <button
                key={p.id}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => {
                  setActiveProfileId(p.id)
                  setOpen(false)
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-muted/70"
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: hex }}
                />
                <span className="flex-1 truncate text-foreground">{p.name}</span>
                {isActive && <Check className="h-4 w-4 shrink-0 text-primary" />}
              </button>
            )
          })}
          {canAddProfile ? (
            <button
              type="button"
              onClick={() => {
                addProfile()
                setOpen(false)
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-primary transition-colors hover:bg-muted/70"
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span>Nuevo perfil</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                openProTrial()
                setOpen(false)
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-amber-600 dark:text-amber-400 transition-colors hover:bg-muted/70"
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span>Desbloquear más ({profiles.length}/{maxProfilesAllowed})</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
