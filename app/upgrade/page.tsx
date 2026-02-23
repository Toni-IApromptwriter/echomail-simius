"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Check, Zap, Crown, Building2, Key, Loader2 } from "lucide-react"
import { ConsentGate } from "@/components/consent-gate"
import { getApiGateStatus } from "@/lib/api-gate"
import { loadOpenAIKey, saveOpenAIKey } from "@/lib/openai-settings"

const PLANS = [
  {
    id: "starter" as const,
    name: "Starter",
    price: 27,
    icon: Zap,
    benefits: [
      "1 perfil y 1 documento verbal",
      "Generación de emails con IA",
      "Transcripción de voz",
      "Integración Google Drive",
    ],
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: 47,
    icon: Crown,
    popular: true,
    benefits: [
      "3 perfiles y 3 documentos verbales",
      "Módulo Catálogo de productos",
      "Contexto de empresa para la IA",
      "Todo lo de Starter",
    ],
  },
  {
    id: "enterprise" as const,
    name: "Enterprise",
    price: 99,
    icon: Building2,
    benefits: [
      "5 perfiles",
      "Integración BYOK (tu propia API Key)",
      "Uso ilimitado con tu clave OpenAI/Anthropic",
      "Todo lo de Pro",
    ],
  },
]

function UpgradeContent() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [apiGateStatus, setApiGateStatus] = useState<ReturnType<typeof getApiGateStatus>>("ok")
  const [enterpriseApiKey, setEnterpriseApiKey] = useState("")
  const [enterpriseKeySaved, setEnterpriseKeySaved] = useState(false)

  useEffect(() => {
    setApiGateStatus(getApiGateStatus())
  }, [])

  useEffect(() => {
    const handler = () => setApiGateStatus(getApiGateStatus())
    window.addEventListener("openai-key-saved", handler)
    return () => window.removeEventListener("openai-key-saved", handler)
  }, [])

  useEffect(() => {
    if (apiGateStatus === "trial_expired") {
      setEnterpriseApiKey(loadOpenAIKey() ?? "")
    }
  }, [apiGateStatus])

  const handleCheckout = async (planId: "starter" | "pro" | "enterprise") => {
    setLoadingPlan(planId)
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
        return
      }
      throw new Error(data.error || "Error al iniciar checkout")
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al procesar")
    } finally {
      setLoadingPlan(null)
    }
  }

  const handleSaveEnterpriseKey = () => {
    if (saveOpenAIKey(enterpriseApiKey.trim() || null)) {
      setEnterpriseKeySaved(true)
      window.dispatchEvent(new CustomEvent("openai-key-saved"))
      setTimeout(() => setEnterpriseKeySaved(false), 2000)
    }
  }

  const showEnterpriseByok = apiGateStatus === "trial_expired"

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Elige tu plan
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Más perfiles, más contexto, más control.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
          >
            ← Volver al Dashboard
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {PLANS.map((plan) => {
            const Icon = plan.icon
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md ${
                  plan.popular
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
                    Más popular
                  </span>
                )}
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      plan.popular ? "bg-primary/15" : "bg-muted"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        plan.popular ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {plan.name}
                  </h2>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">
                    {plan.price}€
                  </span>
                  <span className="text-muted-foreground">/mes</span>
                </div>
                <ul className="mb-6 space-y-3 flex-1">
                  {plan.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      {b}
                    </li>
                  ))}
                </ul>

                {plan.id === "enterprise" && showEnterpriseByok && (
                  <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                      <Key className="h-4 w-4 text-amber-600" />
                      Sin minutos de servidor: usa tu API Key
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={enterpriseApiKey}
                        onChange={(e) => setEnterpriseApiKey(e.target.value)}
                        placeholder="sk-... (OpenAI o Anthropic)"
                        className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                        autoComplete="off"
                      />
                      <button
                        onClick={handleSaveEnterpriseKey}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        {enterpriseKeySaved ? "Guardado" : "Guardar"}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Introduce tu clave para usar la IA sin límites.
                    </p>
                  </div>
                )}

                <button
                  onClick={() => handleCheckout(plan.id)}
                  disabled={!!loadingPlan}
                  className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-border bg-background text-foreground hover:bg-muted"
                  } disabled:opacity-60`}
                >
                  {loadingPlan === plan.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  {loadingPlan === plan.id ? "Procesando…" : "Comprar"}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}

export default function UpgradePage() {
  return (
    <ConsentGate>
      <UpgradeContent />
    </ConsentGate>
  )
}
