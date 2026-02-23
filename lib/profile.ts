import type { Language } from "@/lib/i18n"

const STORAGE_KEY = "echomail-profile"

export interface ProfileData {
  name: string
  brand: string
  /** Email del usuario (para bypass fundador hola@tonimont.com) */
  email: string
  photoBase64: string | null
  logoBase64: string | null
  verbalIdentityDocs: (string | null)[] // base64 content of up to 3 docs
  /** Preferencia de idioma (sincronizada con echomail-language) */
  language?: Language
}

const DEFAULT: ProfileData = {
  name: "",
  brand: "",
  email: "",
  photoBase64: null,
  logoBase64: null,
  verbalIdentityDocs: [null, null, null],
}

export function loadProfile(): ProfileData {
  if (typeof window === "undefined") return DEFAULT
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT
    const parsed = JSON.parse(raw) as Partial<ProfileData>
    const valid: Language[] = ["ca", "pt", "es", "es-LA", "en-US", "en-GB", "fr", "de", "zh-CN", "zh-TW", "ja"]
    const lang = parsed.language as Language | undefined
    return {
      name: parsed.name ?? DEFAULT.name,
      brand: parsed.brand ?? DEFAULT.brand,
      email: typeof parsed.email === "string" ? parsed.email : DEFAULT.email,
      photoBase64: parsed.photoBase64 ?? DEFAULT.photoBase64,
      logoBase64: parsed.logoBase64 ?? DEFAULT.logoBase64,
      verbalIdentityDocs: Array.isArray(parsed.verbalIdentityDocs)
        ? [...parsed.verbalIdentityDocs, null, null, null].slice(0, 3)
        : DEFAULT.verbalIdentityDocs,
      language: lang && valid.includes(lang) ? lang : undefined,
    }
  } catch {
    return DEFAULT
  }
}

export function saveProfile(data: ProfileData): boolean {
  if (typeof window === "undefined") return false
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      console.warn("EchoMail: No se pudo guardar el perfil (quota excedida). Reducir tamaño de imágenes.")
    }
    return false
  }
}

const MAX_PHOTO_SIZE = 256
const MAX_LOGO_SIZE = 200
const JPEG_QUALITY = 0.85

/**
 * Comprime una imagen para reducir su tamaño en base64 y evitar exceder la cuota de localStorage.
 */
async function compressImage(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement("canvas")
      let { width, height } = img
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round((height * maxSize) / width)
          width = maxSize
        } else {
          width = Math.round((width * maxSize) / height)
          height = maxSize
        }
      }
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("No canvas context"))
        return
      }
      ctx.drawImage(img, 0, 0, width, height)
      const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY)
      resolve(dataUrl)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Failed to load image"))
    }
    img.src = url
  })
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export function fileToBase64(file: File, options?: { forLogo?: boolean }): Promise<string> {
  if (!file.type.startsWith("image/")) return readFileAsDataURL(file)
  if (file.type === "image/svg+xml") return readFileAsDataURL(file)
  const maxSize = options?.forLogo ? MAX_LOGO_SIZE : MAX_PHOTO_SIZE
  return compressImage(file, maxSize)
}
