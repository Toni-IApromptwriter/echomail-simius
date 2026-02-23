/**
 * Configuración de niveles (Tiers) y lógica de acceso profesional.
 * BASIC: 1 identidad verbal | PRO: múltiples identidades + módulo catálogo
 */

export type Tier = "BASIC" | "PRO" | "ADMIN_LIFETIME"

const STORAGE_KEY = "echomail-subscription-tier"
const FOUNDER_EMAIL = "hola@tonimont.com"

/**
 * Comprueba si el email pertenece al fundador (Toni Mont VIP).
 * Bypass: todos los candados desaparecen y plan = ADMIN/LIFETIME.
 */
export function isFounder(email: string | null | undefined): boolean {
  return (email ?? "").trim().toLowerCase() === FOUNDER_EMAIL.toLowerCase()
}

/**
 * Devuelve el tier efectivo según email y almacenamiento.
 */
export function getEffectiveTier(
  userEmail: string | null | undefined,
  storedTier: Tier | null
): Tier {
  if (isFounder(userEmail)) return "ADMIN_LIFETIME"
  return storedTier ?? "BASIC"
}

/**
 * Indica si el usuario puede acceder a funciones PRO (múltiples identidades, catálogo).
 */
export function canAccessPro(tier: Tier): boolean {
  return tier === "PRO" || tier === "ADMIN_LIFETIME"
}

/**
 * Límite de identidades verbales según tier.
 * BASIC: 1 | PRO/ADMIN: 3
 */
export function maxVerbalIdentities(tier: Tier): number {
  return tier === "BASIC" ? 1 : 3
}

/**
 * Carga el tier almacenado (BASIC o PRO).
 */
export function loadStoredTier(): Tier | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const t = raw as Tier
    if (t === "BASIC" || t === "PRO") return t
    return null
  } catch {
    return null
  }
}

/**
 * Guarda el tier (solo PRO; BASIC es el default).
 * Usado tras iniciar la prueba gratuita.
 */
export function saveTier(tier: Tier): boolean {
  if (typeof window === "undefined") return false
  try {
    localStorage.setItem(STORAGE_KEY, tier)
    return true
  } catch {
    return false
  }
}

/**
 * Etiqueta legible del plan para mostrar en UI.
 */
export function tierLabel(tier: Tier): string {
  switch (tier) {
    case "ADMIN_LIFETIME":
      return "ADMIN/LIFETIME"
    case "PRO":
      return "PRO"
    case "BASIC":
    default:
      return "BASIC"
  }
}
