"use client"

import { useState } from "react"
import Image from "next/image"
import { Check, Shield, Handshake } from "lucide-react"

interface IntegrationCardProps {
  name: string
  description: string
  /** Logo como ReactNode (fallback si no hay logoFile) */
  logo?: React.ReactNode
  /** Ruta al logo en /logos/ (ej: google-drive.png). Si existe, se usa en lugar de logo. */
  logoFile?: string
  platform: "google" | "external"
  isConnected: boolean
  onConnect?: () => void
  /** Badge de confianza */
  badge?: "partner" | "secure"
}

export function IntegrationCard({
  name,
  description,
  logo,
  logoFile,
  platform,
  isConnected,
  onConnect,
  badge,
}: IntegrationCardProps) {
  const [logoError, setLogoError] = useState(false)

  const handleClick = () => {
    if (platform === "google" && onConnect) {
      onConnect()
    }
  }

  const logoSrc = logoFile && !logoError ? `/logos/${logoFile}` : null
  const fallbackLogo = logo ?? null

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-200 ${
        platform === "google" && onConnect
          ? "cursor-pointer border-[#262626] bg-[#171717] hover:border-[#facc15]/50 hover:shadow-lg hover:shadow-[#facc15]/5"
          : "border-[#262626] bg-[#171717]/80"
      }`}
      onClick={platform === "google" && onConnect ? handleClick : undefined}
      role={platform === "google" && onConnect ? "button" : undefined}
    >
      <div className="flex flex-col p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#262626] text-[#ededed]">
            {logoSrc ? (
              <Image
                src={logoSrc}
                alt=""
                width={56}
                height={56}
                className="h-14 w-14 object-contain p-2"
                unoptimized
                onError={() => setLogoError(true)}
              />
            ) : (
              fallbackLogo
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            {badge && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                {badge === "partner" ? (
                  <>
                    <Handshake className="h-3 w-3" />
                    Partner Oficial
                  </>
                ) : (
                  <>
                    <Shield className="h-3 w-3" />
                    Conexión Segura
                  </>
                )}
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider ${
                isConnected
                  ? "bg-[#22c55e]/20 text-[#22c55e]"
                  : "bg-[#facc15]/20 text-[#facc15]"
              }`}
            >
              {isConnected ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Conectado
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-[#facc15] animate-pulse" />
                  Pendiente
                </>
              )}
            </span>
          </div>
        </div>

        <h3 className="mb-1 text-lg font-semibold tracking-tight text-[#ededed]">
          {name}
        </h3>
        <p className="mb-4 text-sm text-[#a3a3a3]">{description}</p>

        {platform === "google" && onConnect && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onConnect()
            }}
            disabled={isConnected}
            className={`mt-auto w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              isConnected
                ? "cursor-default bg-[#262626] text-[#737373]"
                : "bg-[#facc15] text-[#0a0a0a] hover:bg-[#facc15]/90 active:scale-[0.98]"
            }`}
          >
            {isConnected ? "Conectado" : "Conectar"}
          </button>
        )}

        {platform === "external" && (
          <div className="mt-auto">
            <span className="inline-block rounded-lg bg-[#262626] px-4 py-2.5 text-sm text-[#737373]">
              Próximamente
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
