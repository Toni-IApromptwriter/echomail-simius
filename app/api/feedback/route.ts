import { NextRequest, NextResponse } from "next/server"
import { getResendClient, isResendConfigured } from "@/lib/resend-client"

const FEEDBACK_TO = "tmm.tfkdigital@gmail.com"

export async function POST(request: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY
  console.log("[Feedback] Enviando con llave:", apiKey ? apiKey.substring(0, 5) + "..." : "(no configurada)")

  try {
    const resend = getResendClient()
    if (!resend || !isResendConfigured()) {
      return NextResponse.json(
        { error: "Servicio de feedback no configurado (RESEND_API_KEY)" },
        { status: 500 }
      )
    }

    const body = await request.json()
    const subject =
      typeof body.subject === "string" && body.subject.trim()
        ? body.subject.trim()
        : "Feedback EchoMail"
    const message =
      typeof body.message === "string" && body.message.trim()
        ? body.message.trim()
        : ""

    if (!message) {
      return NextResponse.json(
        { error: "El mensaje es obligatorio" },
        { status: 400 }
      )
    }

    const { data, error } = await resend.emails.send({
      from: "EchoMail <onboarding@resend.dev>",
      to: [FEEDBACK_TO],
      subject: `[EchoMail] ${subject}`,
      html: `
        <h2>Nuevo feedback EchoMail</h2>
        <p><strong>Asunto:</strong> ${escapeHtml(subject)}</p>
        <p><strong>Mensaje:</strong></p>
        <pre style="white-space: pre-wrap; background: #f4f4f4; padding: 1rem; border-radius: 8px;">${escapeHtml(message)}</pre>
        <p style="margin-top: 1rem; font-size: 12px; color: #666;">
          Enviado desde ${escapeHtml(request.headers.get("referer") ?? "EchoMail")}
        </p>
      `,
    })

    if (error) {
      console.error("[Feedback] Resend error:", error)
      return NextResponse.json(
        { error: "No se pudo enviar el mensaje. Inténtalo más tarde." },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, id: data?.id })
  } catch (err) {
    console.error("[Feedback] Error:", err)
    return NextResponse.json(
      { error: "Error interno al procesar el feedback" },
      { status: 500 }
    )
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}
