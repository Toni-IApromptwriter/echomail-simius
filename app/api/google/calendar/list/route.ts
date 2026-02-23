import { NextResponse } from "next/server"
import { getAuthenticatedClient } from "@/lib/google-oauth-server"
import { google } from "googleapis"

/**
 * GET /api/google/calendar/list
 * Lista los calendarios del usuario para elegir uno como "Controlador de Envíos".
 */
export async function GET() {
  try {
    const auth = await getAuthenticatedClient()
    const calendar = google.calendar({ version: "v3", auth })
    const { data } = await calendar.calendarList.list()
    const calendars = (data.items ?? []).map((c) => ({
      id: c.id,
      summary: c.summary ?? c.id,
      primary: c.primary ?? false,
    }))
    return NextResponse.json({ calendars })
  } catch (error) {
    console.error("Error listando calendarios:", error)
    const message =
      error instanceof Error ? error.message : "Error al listar calendarios"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
