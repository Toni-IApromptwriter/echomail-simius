"use client"

import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { useLanguage } from "@/components/providers/language-provider"
import {
  TECHNIQUE_KEYS,
  LENGTH_KEYS,
  getTechniqueLabel,
  getLengthLabel,
  type Language,
} from "@/lib/i18n"

export type TechniqueKey = (typeof TECHNIQUE_KEYS)[number]
export type LengthKey = (typeof LENGTH_KEYS)[number]

interface CopywritingSelectorsProps {
  technique: TechniqueKey
  length: LengthKey
  onTechniqueChange: (technique: TechniqueKey) => void
  onLengthChange: (length: LengthKey) => void
}

function Dropdown<T extends string>({
  label,
  value,
  options,
  getLabel,
  lang,
  onChange,
}: {
  label: string
  value: T
  options: readonly T[]
  getLabel: (opt: T, lang: Language) => string
  lang: Language
  onChange: (v: T) => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative w-full max-w-md">
      <label className="mb-2 block text-sm font-medium text-foreground">
        {label}
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-4 py-3 text-left text-sm text-foreground hover:bg-muted/50"
      >
        <span>{getLabel(value, lang)}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <ul className="absolute top-full left-0 right-0 z-20 mt-1 max-h-60 overflow-auto rounded-lg border border-border bg-card py-1 shadow-lg">
            {options.map((opt) => (
              <li key={opt}>
                <button
                  onClick={() => {
                    onChange(opt)
                    setIsOpen(false)
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-muted ${
                    value === opt ? "bg-muted font-medium" : ""
                  }`}
                >
                  {getLabel(opt, lang)}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

export function CopywritingSelectors({
  technique,
  length,
  onTechniqueChange,
  onLengthChange,
}: CopywritingSelectorsProps) {
  const { language, t } = useLanguage()

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <Dropdown
        label={t.techniqueLabel}
        value={technique}
        options={TECHNIQUE_KEYS}
        getLabel={getTechniqueLabel}
        lang={language}
        onChange={onTechniqueChange}
      />
      <Dropdown
        label={t.lengthLabel}
        value={length}
        options={LENGTH_KEYS}
        getLabel={getLengthLabel}
        lang={language}
        onChange={onLengthChange}
      />
    </div>
  )
}
