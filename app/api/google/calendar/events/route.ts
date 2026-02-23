import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedClient } from "@/lib/google-oauth-server"
import { google } from "googleapis"

const ECHO_MAIL_TAG = "[EchoMail]"

/**
 * GET /api/google/calendar/events?calendarId=...
 * Devuelve eventos que contienen el tag [EchoMail] en título o descripción.
 * Útil para programar envíos según la hora del evento.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const calendarId = searchParams.get("calendarId")
    if (!calendarId) {
      return NextResponse.json(
        { error: "Falta calendarId" },
        { status: 400 }
      )
    }

    const auth = await getAuthenticatedClient()
    const calendar = google.calendar({ version: "v3", auth })

    const timeMin = new Date().toISOString()
    const timeMax = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 días

    const { data } = await calendar.events.list({
      calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: "startTime",
    })

    const items = (data.items ?? []).filter((e) => {
      const title = (e.summary ?? "").includes(ECHO_MAIL_TAG)
      const desc = (e.description ?? "").includes(ECHO_MAIL_TAG)
      return title || desc
    })

    const events = items.map((e) => ({
      id: e.id,
      summary: e.summary ?? "",
      description: e.description ?? "",
      start: e.start?.dateTime ?? e.start?.date ?? null,
      end: e.end?.dateTime ?? e.end?.date ?? null,
    }))

    return NextResponse.json({ events })
  } catch (error) {
    console.error("Error listando eventos Calendar:", error)
    const message =
      error instanceof Error ? error.message : "Error al listar eventos"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
