import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const MASTER_INSTRUCTION = `Tu prioridad número uno es usar el vocabulario exacto, las expresiones y el tono base de la transcripción del usuario. El usuario debe sonar como él mismo. Aplica la TÉCNICA DE COPYWRITING solicitada ÚNICAMENTE como estructura mental y ritmo, pero nunca suenes a IA corporativa. Adapta el texto a la LONGITUD solicitada.`

const TECHNIQUE_PROMPTS: Record<string, string> = {
  "Venta Directa y Provocadora":
    "Estilo direct response clásico. Afirmaciones provocadoras. Gancho que rompe el patrón. Llamada a la acción sin rodeos. Sin disculpas ni excusas.",
  "Valor Lógico y Oferta Irresistible":
    "Estilo Alex Hormozi. Problema doloroso → Solución obvia → Oferta irresistible. Usa viñetas y foco en el ROI. Cuantifica el valor siempre que sea posible.",
  "Empatía y Conexión Emocional":
    "Estilo Brené Brown / Simon Sinek. Reconoce el dolor o frustración del lector. Construye puentes emocionales. Tono cálido y humano. Validación antes de propuesta.",
  "Reflexión Minimalista":
    "Estilo James Clear. Breve, elegante. 3 ideas o puntos máximo. Sin relleno. Cada palabra cuenta. Ritmo pausado.",
  "Informativo con Chispa":
    "Estilo The Hustle / Morning Brew. Datos y hechos con personalidad. Toques de humor o ironía sutil. Mantén al lector curioso.",
  "Historia Inspiracional":
    "Estilo Seth Godin. Arco narrativo: situación inicial → conflicto/obstáculo → transformación. El email cuenta una mini historia con moraleja aplicable.",
  "Guía Educativa y Cercana":
    "Estilo profesor amigable. Pasos claros, ejemplos concretos. Tono cercano sin ser condescendiente. 'Aquí te muestro cómo'.",
  "Análisis Estratégico Profundo":
    "Estilo consultor senior. Insights basados en datos o experiencia. Estructura: contexto → análisis → conclusión → recomendación. Profesional pero accesible.",
  "Al Grano y Tecnológico":
    "Estilo desarrollador/Product Manager. Frases cortas. Sin floreos. Bullets o listas. Lenguaje técnico cuando aporte. Eficiencia verbal.",
  "Venta Agresiva y Polarizante (Sin Filtros)":
    "Estilo bofetada de realidad (Dan Kennedy / Monge Malo). Tono arrogante pero justificado. Señala un error estúpido que el lector comete. Crea polarización. Frases de una línea. Llamada a la acción dura.",
}

const LENGTH_GUIDE: Record<string, string> = {
  "Corto (Directo al grano)": "Email muy breve: 80-120 palabras máximo. Ir al núcleo sin rodeos.",
  "Medio (Aprox. 300 palabras)": "Email de longitud media: aproximadamente 250-350 palabras. Equilibrio entre impacto y desarrollo.",
  "Largo (Storytelling completo)": "Email largo con espacio para storytelling: 400-600 palabras. Puedes desarrollar contexto, historia y conclusión.",
}

function buildSystemPrompt(
  technique: string,
  length: string,
  languageInstruction: string
): string {
  const techniqueGuide = TECHNIQUE_PROMPTS[technique] ?? TECHNIQUE_PROMPTS["Valor Lógico y Oferta Irresistible"]
  const lengthGuide = LENGTH_GUIDE[length] ?? LENGTH_GUIDE["Medio (Aprox. 300 palabras)"]

  return `${MASTER_INSTRUCTION}

${languageInstruction}

Técnica aplicada: ${technique}
Directrices de la técnica: ${techniqueGuide}

Longitud solicitada: ${length}
Guía de longitud: ${lengthGuide}

Transforma la anécdota transcrita en un email persuasivo. Usa la estructura: Gancho → Desarrollo (historia/argumento) → Llamada a la acción. No suenes a robot corporativo.

FORMATO OBLIGATORIO: Devuelve el email en Markdown. Usa **negritas** en las frases clave (gancho, beneficio principal, llamada a la acción) para mejorar la legibilidad. Ejemplo: **Esta es la idea más importante**. No uses ningún otro formato Markdown (ni listas, ni encabezados), solo negritas con **.`
}

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

    const body = await request.json()
    const {
      transcript,
      technique,
      length,
      language = "es",
    } = body as {
      transcript?: string
      technique?: string
      length?: string
      language?: string
    }

    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json(
        { error: "Falta el texto transcrito" },
        { status: 400 }
      )
    }

    const languageNames: Record<string, string> = {
      ca: "catalán",
      pt: "portugués",
      es: "español de España",
      "es-LA": "español de Latinoamérica",
      "en-US": "inglés americano (USA)",
      "en-GB": "inglés británico (UK)",
      fr: "francés",
      de: "alemán",
    }
    const langName =
      languageNames[String(language)] ?? "español de España"
    const languageInstruction = `INSTRUCCIÓN CRÍTICA Y OBLIGATORIA: El email final DEBE estar escrito ÚNICAMENTE en ${langName}. Usa vocabulario, expresiones y convenciones propias de ese idioma/región. Mantén el tono y estructura de la técnica de copywriting elegida, pero adapta cada frase para que suene 100% nativa. Cero mezcla de idiomas.`

    const systemPrompt = buildSystemPrompt(
      technique || "Valor Lógico y Oferta Irresistible",
      length || "Medio (Aprox. 300 palabras)",
      languageInstruction
    )

    const openai = new OpenAI({ apiKey })

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Anécdota transcrita del usuario:\n\n${transcript}`,
        },
      ],
    })

    const emailContent =
      completion.choices[0]?.message?.content ?? "No se pudo generar el email."

    return NextResponse.json({ email: emailContent })
  } catch (error) {
    console.error("Error en generate:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Error al generar el email",
      },
      { status: 500 }
    )
  }
}
