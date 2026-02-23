/**
 * Configuración de integraciones.
 * Los logos se cargan desde /public/logos/{id}.png
 * Si el archivo existe, se mostrará; si no, se usa el fallback SVG.
 */

export type IntegrationPlatform = "google" | "external"
export type IntegrationBadge = "partner" | "secure"

export interface IntegrationConfig {
  id: string
  name: string
  description: string
  /** Ruta al logo PNG en /public/logos/ (ej: google-drive.png) */
  logoFile?: string
  platform: IntegrationPlatform
  /** Badge de confianza: "partner" = Partner Oficial, "secure" = Conexión Segura */
  badge?: IntegrationBadge
}

export const INTEGRATIONS_CONFIG: IntegrationConfig[] = [
  {
    id: "google-drive",
    name: "Google Drive",
    description: "Sincroniza tus emails generados en Drive",
    logoFile: "google-drive.png",
    platform: "google",
    badge: "partner",
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Controlador de envíos y calendario",
    logoFile: "google-calendar.png",
    platform: "google",
    badge: "secure",
  },
  {
    id: "getresponse",
    name: "GetResponse",
    description: "Automatización de email marketing",
    logoFile: "getresponse.png",
    platform: "external",
  },
  {
    id: "mailerlite",
    name: "MailerLite",
    description: "Newsletters y campañas por email",
    logoFile: "mailerlite.png",
    platform: "external",
  },
]
