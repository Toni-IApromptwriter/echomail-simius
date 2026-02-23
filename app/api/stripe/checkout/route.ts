import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

export async function POST(request: NextRequest) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY
    const priceId = process.env.STRIPE_PRICE_ID

    if (!secretKey || !priceId) {
      return NextResponse.json(
        {
          error: "Stripe no está configurado (STRIPE_SECRET_KEY o STRIPE_PRICE_ID faltantes)",
        },
        { status: 500 }
      )
    }

    const stripe = new Stripe(secretKey)
    const origin = request.headers.get("origin") ?? request.nextUrl.origin

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 15,
      },
      success_url: `${origin}/?stripe_success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?stripe_cancel=1`,
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
