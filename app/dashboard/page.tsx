"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ConsentGate } from "@/components/consent-gate"

function DashboardRedirect() {
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

/**
 * Página /dashboard: redirige al inicio preservando params (Stripe success, etc.)
 * Protegida con ConsentGate (sesión = consentimiento legal + onboarding completado).
 * Suspense necesario para useSearchParams (requisito de prerendering Next.js).
 */
export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <p className="text-sm text-muted-foreground">Cargando…</p>
        </div>
      }
    >
      <DashboardRedirect />
    </Suspense>
  )
}
