import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

/**
 * Webhook de Stripe para eventos de suscripción.
 * En una app sin BD, el cliente sigue verificando status vía /api/stripe/subscription-status.
 * Este webhook sirve para logging y futuras ampliaciones (ej. enviar email al cancelar).
 */
export async function POST(request: NextRequest) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!secretKey || !webhookSecret) {
      return NextResponse.json(
        { error: "Stripe webhook no configurado" },
        { status: 500 }
      )
    }

    const body = await request.text()
    const sig = request.headers.get("stripe-signature")
    if (!sig) {
      return NextResponse.json({ error: "Falta firma" }, { status: 400 })
    }

    const stripe = new Stripe(secretKey)
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Invalid signature"
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    switch (event.type) {
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "customer.subscription.trial_will_end":
        // Aquí podrías: enviar email, invalidar cache, etc.
        break
      default:
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error en webhook Stripe:", error)
    return NextResponse.json(
      { error: "Webhook error" },
      { status: 500 }
    )
  }
}
