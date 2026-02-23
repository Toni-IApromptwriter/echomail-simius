/**
 * Almacenamiento local para la API key de OpenAI del usuario (opcional).
 * Si el usuario introduce su propia clave, se usa para transcribe y generate.
 */

const STORAGE_KEY = "echomail-openai-api-key"

export function loadOpenAIKey(): string | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw?.trim() || null
  } catch {
    return null
  }
}

export function saveOpenAIKey(key: string | null): boolean {
  if (typeof window === "undefined") return false
  try {
    if (!key?.trim()) {
      localStorage.removeItem(STORAGE_KEY)
    } else {
      localStorage.setItem(STORAGE_KEY, key.trim())
    }
    return true
  } catch {
    return false
  }
}
