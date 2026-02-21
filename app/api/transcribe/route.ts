import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY no está configurada en .env.local" },
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
