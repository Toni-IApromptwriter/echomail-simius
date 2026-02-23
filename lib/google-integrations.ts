/**
 * Configuración de integraciones Google (Drive, Calendar).
 * Persistida en localStorage del cliente.
 */

const STORAGE_KEY = "echomail-google-integrations"

export interface GoogleIntegrationsData {
  /** Usuario ha completado OAuth con Google (acceso a Drive + Calendar) */
  googleConnected: boolean
  /** Activar guardado automático en Drive al generar email */
  driveSyncEnabled: boolean
  /** ID del calendario seleccionado como "Controlador de Envíos" */
  calendarId: string | null
  /** Nombre legible del calendario seleccionado (ej: "IA 360º") */
  calendarName: string | null
}

const DEFAULT: GoogleIntegrationsData = {
  googleConnected: false,
  driveSyncEnabled: false,
  calendarId: null,
  calendarName: null,
}

export function loadGoogleIntegrations(): GoogleIntegrationsData {
  if (typeof window === "undefined") return DEFAULT
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT
    const parsed = JSON.parse(raw) as Partial<GoogleIntegrationsData>
    return {
      googleConnected: Boolean(parsed.googleConnected),
      driveSyncEnabled: Boolean(parsed.driveSyncEnabled),
      calendarId:
        typeof parsed.calendarId === "string" && parsed.calendarId
          ? parsed.calendarId
          : null,
      calendarName:
        typeof parsed.calendarName === "string" ? parsed.calendarName : null,
    }
  } catch {
    return DEFAULT
  }
}

export function saveGoogleIntegrations(data: Partial<GoogleIntegrationsData>): boolean {
  if (typeof window === "undefined") return false
  try {
    const current = loadGoogleIntegrations()
    const merged = { ...current, ...data }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
    window.dispatchEvent(new CustomEvent("google-integrations-changed"))
    return true
  } catch {
    return false
  }
}
