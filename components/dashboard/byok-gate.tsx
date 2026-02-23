"use client"

import { useState, useEffect } from "react"
import { Key, Sparkles } from "lucide-react"
import { useSettings } from "@/components/providers/settings-provider"
import { getApiGateStatus } from "@/lib/api-gate"

const ENTERPRISE_MESSAGE =
  "Has alcanzado el límite de nuestra API. Introduce tu propia API Key para obtener uso ilimitado y mantener tu ventaja competitiva."

interface ByokGateProps {
  children: React.ReactNode
}

export function ByokGate({ children }: ByokGateProps) {
  const [status, setStatus] = useState<ReturnType<typeof getApiGateStatus>>("ok")
  const { openSettings } = useSettings()

  useEffect(() => {
    setStatus(getApiGateStatus())
  }, [])

  useEffect(() => {
    const handler = () => setStatus(getApiGateStatus())
    window.addEventListener("openai-key-saved", handler)
    return () => window.removeEventListener("openai-key-saved", handler)
  }, [])

  if (status !== "trial_expired") {
    return <>{children}</>
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20">
        <Key className="h-7 w-7 text-amber-600 dark:text-amber-400" />
      </div>
      <div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">
          Uso ilimitado con tu API Key
        </h3>
        <p className="max-w-md text-sm text-muted-foreground">
          {ENTERPRISE_MESSAGE}
        </p>
      </div>
      <button
        onClick={openSettings}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <Sparkles className="h-4 w-4" />
        Configurar API Key
      </button>
    </div>
  )
}
