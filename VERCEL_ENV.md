# Variables de entorno para Vercel (Producción)

Configura estas variables en **Vercel → Project → Settings → Environment Variables** (Production, Preview, Development según corresponda).

> **Nota**: Esta app usa OAuth de Google propio (no NextAuth). No existe `middleware.ts`, por lo que no hay riesgo de bucles de redirección. `NEXTAUTH_URL` no es necesario.

## Listado obligatorio

| Variable | Descripción | Ejemplo producción |
|----------|-------------|--------------------|
| `OPENAI_API_KEY` | Clave API de OpenAI | `sk-proj-...` |
| `NEXT_PUBLIC_APP_URL` | URL base de la app | `https://echomail.vercel.app` |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe | `sk_live_...` o `sk_test_...` |
| `STRIPE_PUBLISHABLE_KEY` | Clave pública de Stripe | `pk_live_...` o `pk_test_...` |
| `STRIPE_PRICE_ID` | ID del precio/producto en Stripe | `price_...` |
| `STRIPE_WEBHOOK_SECRET` | Secreto del webhook de Stripe | `whsec_...` |
| `GOOGLE_CLIENT_ID` | Client ID de Google OAuth | `...apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Client Secret de Google OAuth | `GOCSPX-...` |
| `RESEND_API_KEY` | API key de Resend (feedback) | `re_...` |

## Opcionales (derivados)

| Variable | Descripción | Si no se define |
|----------|-------------|-----------------|
| `GOOGLE_REDIRECT_URI` | URI de callback OAuth Google | Se usa `NEXT_PUBLIC_APP_URL` + `/api/auth/google/callback` |

## Pasos adicionales

1. **Google Cloud Console**: Añade `https://tu-dominio.vercel.app/api/auth/google/callback` a las URIs de redirección autorizadas.

2. **Stripe Webhook**: Crea un webhook apuntando a `https://tu-dominio.vercel.app/api/stripe/webhook` con evento `checkout.session.completed` y `customer.subscription.*`. Copia el Signing Secret a `STRIPE_WEBHOOK_SECRET`.

3. **Resend**: Crea cuenta en [resend.com](https://resend.com) con `tmm.tfkdigital@gmail.com` para que los emails de feedback lleguen a ese correo (sandbox `onboarding@resend.dev` solo envía al email de la cuenta).
