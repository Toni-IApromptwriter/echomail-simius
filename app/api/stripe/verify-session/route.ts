import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

/**
 * Verifica una sesión de Checkout tras el redirect de éxito.
 * Devuelve subscription_id, status, trial_end para guardar en cliente.
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
    const sessionId = body.session_id as string | undefined

    if (!sessionId) {
      return NextResponse.json(
        { error: "Falta session_id" },
        { status: 400 }
      )
    }

    const stripe = new Stripe(secretKey)
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    })

    const sub = session.subscription as Stripe.Subscription | null
    if (typeof sub !== "object" || !sub) {
      return NextResponse.json(
        { error: "No se encontró suscripción" },
        { status: 400 }
      )
    }

    const status = sub.status
    const trialEnd = sub.trial_end ?? null
    const firstItem = sub.items.data[0]
    const currentPeriodEnd = firstItem?.current_period_end ?? trialEnd ?? null

    // trialing, active, o canceled con cancel_at_period_end: acceso PRO hasta current_period_end
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
  } catch (error) {
    console.error("Error verificando sesión Stripe:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Error al verificar la sesión",
      },
      { status: 500 }
    )
  }
}
