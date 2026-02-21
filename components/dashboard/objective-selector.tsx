"use client"

import { ChevronDown } from "lucide-react"
import { useState } from "react"

export const OBJECTIVES = [
  "Email de ventas",
  "Email informativo",
  "Email de seguimiento",
  "Newsletter",
  "Email de presentación",
] as const

interface ObjectiveSelectorProps {
  value: string
  onChange: (objective: string) => void
}

export function ObjectiveSelector({ value: selected, onChange }: ObjectiveSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative w-full max-w-md">
      <label className="mb-2 block text-sm font-medium text-foreground">
        Objetivo del email
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-4 py-3 text-left text-sm text-foreground hover:bg-muted/50"
      >
        <span>{selected}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <ul className="absolute top-full left-0 right-0 z-20 mt-1 max-h-60 overflow-auto rounded-lg border border-border bg-card py-1 shadow-lg">
            {OBJECTIVES.map((obj) => (
              <li key={obj}>
                <button
                  onClick={() => {
                    onChange(obj)
                    setIsOpen(false)
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-muted ${
                    selected === obj ? "bg-muted font-medium" : ""
                  }`}
                >
                  {obj}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
