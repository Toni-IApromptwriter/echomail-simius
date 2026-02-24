import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const PRICE_IDS = {
  starter: process.env.STRIPE_PRICE_STARTER,
  pro: process.env.STRIPE_PRICE_PRO,
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE,
} as const

const DEFAULT_PRICE_ID = process.env.STRIPE_PRICE_ID

export async function POST(request: NextRequest) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      return NextResponse.json(
        { error: "Stripe no está configurado (STRIPE_SECRET_KEY faltante)" },
        { status: 500 }
      )
    }

    let priceId = DEFAULT_PRICE_ID
    try {
      const body = await request.json().catch(() => ({}))
      const plan = body.plan as "starter" | "pro" | "enterprise" | undefined
      if (plan && PRICE_IDS[plan]) {
        priceId = PRICE_IDS[plan]
      } else if (typeof body.price_id === "string" && body.price_id.startsWith("price_")) {
        priceId = body.price_id
      }
    } catch {
      // usar default
    }

    if (!priceId) {
      return NextResponse.json(
        { error: "Stripe no configurado: falta STRIPE_PRICE_ID o price_id para el plan" },
        { status: 500 }
      )
    }

    const stripe = new Stripe(secretKey)
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ??
      request.headers.get("origin") ??
      request.nextUrl.origin

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      allow_promotion_codes: true,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 5,
      },
      success_url: `${baseUrl}/dashboard?stripe_success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?stripe_cancel=1`,
    })

    if (!session.url) {
      return NextResponse.json(
        { error: "No se pudo crear la sesión de Stripe" },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Error en Stripe checkout:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Error al iniciar el checkout",
      },
      { status: 500 }
    )
  }
}
