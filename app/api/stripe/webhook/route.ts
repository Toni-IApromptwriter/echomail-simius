import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import path from "path"
import fs from "fs"

const SUBSCRIPTIONS_FILE = path.join(process.cwd(), ".data", "stripe-subscriptions.json")

interface SubscriptionRecord {
  subscription_id: string
  customer_email: string | null
  customer_id: string
  status: string
  activated_at: string
}

function ensureDataDir(): void {
  const dir = path.dirname(SUBSCRIPTIONS_FILE)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function loadSubscriptions(): SubscriptionRecord[] {
  try {
    ensureDataDir()
    if (!fs.existsSync(SUBSCRIPTIONS_FILE)) return []
    const raw = fs.readFileSync(SUBSCRIPTIONS_FILE, "utf-8")
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveSubscription(record: SubscriptionRecord): void {
  ensureDataDir()
  const list = loadSubscriptions()
  const existing = list.findIndex((r) => r.subscription_id === record.subscription_id)
  const next = existing >= 0
    ? list.map((r, i) => (i === existing ? record : r))
    : [...list, record]
  fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(next, null, 2), "utf-8")
}

/**
 * Webhook de Stripe para eventos de suscripción.
 * checkout.session.completed: activa la cuenta PRO del usuario.
 * En app sin BD tradicional, persistimos en .data/stripe-subscriptions.json.
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
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const subId = session.subscription as string | null
        const customerId = session.customer as string | null
        const customerEmail = session.customer_email ?? session.customer_details?.email ?? null

        if (subId && customerId) {
          saveSubscription({
            subscription_id: subId,
            customer_email: customerEmail,
            customer_id: typeof customerId === "string" ? customerId : "",
            status: "active",
            activated_at: new Date().toISOString(),
          })
          console.log("[Stripe Webhook] checkout.session.completed:", { subId, customerEmail })
        }
        break
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "customer.subscription.trial_will_end":
        // Futuro: actualizar estado en .data si hay BD
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
