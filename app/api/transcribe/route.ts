import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

export async function POST(request: NextRequest) {
  try {
    // Prioridad: header del usuario > variable de entorno
    const userKey = request.headers.get("x-openai-api-key")
    const envKey = process.env.OPENAI_API_KEY
    const apiKey = userKey?.trim() || envKey
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY no está configurada. Usa Configuración para introducir tu clave o configura .env.local." },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const audioFile = formData.get("audio") as File | null

    if (!audioFile) {
      return NextResponse.json(
        { error: "No se recibió ningún archivo de audio" },
        { status: 400 }
      )
    }

    const openai = new OpenAI({ apiKey })

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
    })

    return NextResponse.json({ text: transcription.text })
  } catch (error) {
    console.error("Error en transcribe:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Error al transcribir el audio",
      },
      { status: 500 }
    )
  }
}
