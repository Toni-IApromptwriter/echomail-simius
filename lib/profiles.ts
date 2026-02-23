/**
 * Sistema multi-perfil: Pro (3) / Enterprise (5).
 * Cada perfil tiene color, nombre editable y documentos aislados.
 */

const PROFILES_KEY = "echomail-profiles"
const ACTIVE_PROFILE_KEY = "echomail-active-profile-id"
const LEGACY_PROFILE_KEY = "echomail-profile"

export const PROFILE_COLORS = [
  { id: "blue", hex: "#3B82F6", label: "Azul" },
  { id: "orange", hex: "#F97316", label: "Naranja" },
  { id: "emerald", hex: "#10B981", label: "Esmeralda" },
  { id: "violet", hex: "#8B5CF6", label: "Violeta" },
  { id: "rose", hex: "#F43F5E", label: "Rosa" },
] as const

export type ProfileColorId = (typeof PROFILE_COLORS)[number]["id"]

export interface IdentityProfile {
  id: string
  name: string
  color: ProfileColorId
  brand: string
  photoBase64: string | null
  logoBase64: string | null
  verbalIdentityDocs: (string | null)[]
  /** Nombres de archivo para cada documento verbal (usa "Documento N" si falta) */
  verbalIdentityDocNames?: (string | null)[]
  /** Información de empresa/catálogo para contexto IA (URL, descripción de servicios) */
  companyContext?: string
  /** Si true, la IA usará companyContext antes de redactar */
  useCompanyContext?: boolean
}

export interface ProfilesData {
  profiles: IdentityProfile[]
}

function generateId(): string {
  return crypto.randomUUID()
}

function createDefaultProfile(color: ProfileColorId = "blue"): IdentityProfile {
  return {
    id: generateId(),
    name: "Nuevo perfil",
    color,
    brand: "",
    photoBase64: null,
    logoBase64: null,
    verbalIdentityDocs: [null, null, null],
    verbalIdentityDocNames: [null, null, null],
  }
}

function migrateFromLegacy(): IdentityProfile[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(LEGACY_PROFILE_KEY)
    if (!raw) return [createDefaultProfile()]
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const profile: IdentityProfile = {
      id: generateId(),
      name: (parsed.name as string) || "Mi perfil",
      color: "blue",
      brand: (parsed.brand as string) || "",
      photoBase64: (parsed.photoBase64 as string | null) ?? null,
      logoBase64: (parsed.logoBase64 as string | null) ?? null,
      verbalIdentityDocs: Array.isArray(parsed.verbalIdentityDocs)
        ? [...(parsed.verbalIdentityDocs as (string | null)[]), null, null, null].slice(0, 3)
        : [null, null, null],
    }
    return [profile]
  } catch {
    return [createDefaultProfile()]
  }
}

export function loadProfiles(): ProfilesData {
  if (typeof window === "undefined") {
    return { profiles: [createDefaultProfile()] }
  }
  try {
    const raw = localStorage.getItem(PROFILES_KEY)
    if (!raw) {
      const migrated = migrateFromLegacy()
      return { profiles: migrated }
    }
    const parsed = JSON.parse(raw) as Partial<ProfilesData>
    const list = Array.isArray(parsed.profiles) ? parsed.profiles : migrateFromLegacy()
    const valid: IdentityProfile[] = list.filter(
      (p): p is IdentityProfile =>
        p &&
        typeof p === "object" &&
        typeof p.id === "string" &&
        typeof p.name === "string" &&
        Array.isArray(p.verbalIdentityDocs)
    )
    if (valid.length === 0) return { profiles: [createDefaultProfile()] }
    return {
      profiles: valid.map((p) => {
        const docs = [...(p.verbalIdentityDocs || [null, null, null]), null, null, null].slice(0, 3)
        const existingNames = p.verbalIdentityDocNames ?? []
        const docNames = docs.map((d, i) =>
          d ? (existingNames[i] ?? `Documento ${i + 1}`) : null
        )
        return {
          ...createDefaultProfile(),
          ...p,
          id: p.id || generateId(),
          color: PROFILE_COLORS.some((c) => c.id === p.color) ? p.color : "blue",
          verbalIdentityDocs: docs,
          verbalIdentityDocNames: docNames,
        }
      }),
    }
  } catch {
    return { profiles: [createDefaultProfile()] }
  }
}

export function saveProfiles(data: ProfilesData): boolean {
  if (typeof window === "undefined") return false
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(data))
    window.dispatchEvent(new CustomEvent("profiles-changed"))
    return true
  } catch {
    return false
  }
}

export function loadActiveProfileId(): string | null {
  if (typeof window === "undefined") return null
  try {
    return localStorage.getItem(ACTIVE_PROFILE_KEY) || null
  } catch {
    return null
  }
}

export function saveActiveProfileId(id: string): boolean {
  if (typeof window === "undefined") return false
  try {
    localStorage.setItem(ACTIVE_PROFILE_KEY, id)
    window.dispatchEvent(new CustomEvent("active-profile-changed"))
    return true
  } catch {
    return false
  }
}

export function getActiveProfile(data: ProfilesData): IdentityProfile {
  const activeId = loadActiveProfileId()
  if (activeId) {
    const found = data.profiles.find((p) => p.id === activeId)
    if (found) return found
  }
  return data.profiles[0] ?? createDefaultProfile()
}

export function getProfileColorHex(colorId: ProfileColorId): string {
  return PROFILE_COLORS.find((c) => c.id === colorId)?.hex ?? PROFILE_COLORS[0].hex
}
