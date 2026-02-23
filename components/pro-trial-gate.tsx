"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Lock } from "lucide-react"
import { useSubscription } from "@/components/providers/subscription-provider"

interface ProTrialGateProps {
  feature: string
}

/**
 * Página de bloqueo cuando el usuario intenta acceder a una función PRO
 * sin tener el plan activo. Muestra mensaje y abre automáticamente el modal
 * de prueba gratuita.
 */
export function ProTrialGate({ feature }: ProTrialGateProps) {
  const { openProTrial } = useSubscription()

  useEffect(() => {
    openProTrial()
  }, [openProTrial])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6">
      <Lock className="h-16 w-16 text-amber-500" />
      <h1 className="text-center text-xl font-semibold text-foreground">
        {feature} es una función PRO
      </h1>
      <p className="max-w-md text-center text-sm text-muted-foreground">
        Prueba EchoMail Pro gratis durante 15 días para acceder a {feature} y
        todas las funciones premium.
      </p>
      <p className="text-xs text-muted-foreground">
        Si has cerrado el modal, haz clic en Catálogo en el menú para iniciar tu
        prueba.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Volver al Dashboard
      </Link>
    </main>
  )
}
