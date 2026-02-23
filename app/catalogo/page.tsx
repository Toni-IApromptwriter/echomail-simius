"use client"

import Link from "next/link"
import { FolderOpen } from "lucide-react"
import { ConsentGate } from "@/components/consent-gate"
import { useSubscription } from "@/components/providers/subscription-provider"
import { ProTrialGate } from "@/components/pro-trial-gate"

function CatalogoContent() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6">
      <FolderOpen className="h-16 w-16 text-muted-foreground" />
      <h1 className="text-2xl font-semibold text-foreground">Módulo Catálogo</h1>
      <p className="max-w-md text-center text-sm text-muted-foreground">
        El módulo catálogo está disponible para usuarios PRO. Pronto podrás
        gestionar tus productos y servicios aquí.
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

export default function CatalogoPage() {
  const { isPro } = useSubscription()

  if (!isPro) {
    return (
      <ConsentGate>
        <ProTrialGate feature="Catálogo" />
      </ConsentGate>
    )
  }

  return (
    <ConsentGate>
      <CatalogoContent />
    </ConsentGate>
  )
}
