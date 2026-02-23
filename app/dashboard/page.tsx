"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ConsentGate } from "@/components/consent-gate"

/**
 * Página /dashboard: redirige al inicio preservando params (Stripe success, etc.)
 * Protegida con ConsentGate (sesión = consentimiento legal + onboarding completado).
 */
export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const qs = searchParams.toString()
    router.replace(qs ? `/?${qs}` : "/")
  }, [router, searchParams])

  return (
    <ConsentGate>
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Redirigiendo al dashboard…</p>
      </div>
    </ConsentGate>
  )
}
