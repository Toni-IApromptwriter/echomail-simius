import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedClient } from "@/lib/google-oauth-server"
import { google } from "googleapis"
import type { OAuth2Client } from "google-auth-library"

const ECHOMAIL_LOG_FOLDER = "EchoMail_Log"

async function findOrCreateFolder(auth: OAuth2Client): Promise<string> {
  const drive = google.drive({ version: "v3", auth })

  const { data: list } = await drive.files.list({
    q: "mimeType='application/vnd.google-apps.folder' and name='" + ECHOMAIL_LOG_FOLDER + "' and trashed=false",
    fields: "files(id, name)",
    spaces: "drive",
  })

  const folder = list.files?.[0]
  if (folder?.id) return folder.id

  const { data: created } = await drive.files.create({
    requestBody: {
      name: ECHOMAIL_LOG_FOLDER,
      mimeType: "application/vnd.google-apps.folder",
    },
    fields: "id",
  })

  return created.id!
}

/**
 * POST /api/google/drive/save
 * Guarda un email generado en la carpeta EchoMail_Log del Drive del usuario.
 * Body: { email: string, transcription?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, transcription } = body as {
      email?: string
      transcription?: string
    }

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Falta el contenido del email" },
        { status: 400 }
      )
    }

    const auth = await getAuthenticatedClient()
    const drive = google.drive({ version: "v3", auth })
    const folderId = await findOrCreateFolder(auth)

    const now = new Date()
    const fileName = `EchoMail_${now.toISOString().slice(0, 19).replace(/[:T]/g, "-")}.md`
    const content = transcription
      ? `# Transcripción\n\n${transcription}\n\n---\n\n# Email generado\n\n${email}`
      : email

    const { data } = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [folderId],
        mimeType: "text/markdown",
      },
      media: {
        mimeType: "text/markdown",
        body: content,
      },
      fields: "id, webViewLink",
    })

    return NextResponse.json({
      success: true,
      fileId: data.id,
      webViewLink: data.webViewLink,
      fileName,
    })
  } catch (error) {
    console.error("Error guardando en Drive:", error)
    const message =
      error instanceof Error ? error.message : "Error al guardar en Drive"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
