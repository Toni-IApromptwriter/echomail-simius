import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

/**
 * Obtiene el estado actual de una suscripción Stripe.
 * Usado para verificar si el usuario sigue con acceso PRO (incl. periodo de prueba).
 * Si cancela durante el trial, Stripe mantiene el acceso hasta trial_end.
 */
export async function POST(request: NextRequest) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      return NextResponse.json(
        { error: "Stripe no está configurado" },
        { status: 500 }
      )
    }

    const body = await request.json()
    const subscriptionId = body.subscription_id as string | undefined

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Falta subscription_id" },
        { status: 400 }
      )
    }

    const stripe = new Stripe(secretKey)
    const sub = await stripe.subscriptions.retrieve(subscriptionId)

    const status = sub.status
    const trialEnd = sub.trial_end ?? null
    const firstItem = sub.items.data[0]
    const currentPeriodEnd = firstItem?.current_period_end ?? trialEnd ?? null

    // trialing, active, o canceled con cancel_at_period_end = acceso hasta current_period_end
    const isPro =
      status === "trialing" ||
      status === "active" ||
      (status === "canceled" && sub.cancel_at_period_end)

    return NextResponse.json({
      subscription_id: sub.id,
      status,
      isPro,
      trial_end: trialEnd,
      current_period_end: currentPeriodEnd,
    })
  } catch (error: unknown) {
    const stripeErr = error as { code?: string } | null
    if (stripeErr?.code === "resource_missing") {
      return NextResponse.json(
        { isPro: false, status: "not_found", error: "Suscripción no encontrada" },
        { status: 200 }
      )
    }
    console.error("Error obteniendo status de suscripción:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Error al obtener el estado",
      },
      { status: 500 }
    )
  }
}
