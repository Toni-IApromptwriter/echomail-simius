/**
 * Catálogo de productos/servicios por perfil.
 * Cada perfil puede tener su propio catálogo para generar emails contextuales.
 */

export interface CatalogItem {
  id: string
  name: string
  description?: string
  price?: string
}

const PREFIX = "echomail-catalog-"

function storageKey(profileId: string): string {
  return `${PREFIX}${profileId}`
}

export function loadCatalog(profileId: string): CatalogItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(storageKey(profileId))
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is CatalogItem =>
        item &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        typeof item.name === "string"
    )
  } catch {
    return []
  }
}

export function saveCatalog(profileId: string, items: CatalogItem[]): boolean {
  if (typeof window === "undefined") return false
  try {
    localStorage.setItem(storageKey(profileId), JSON.stringify(items))
    window.dispatchEvent(new CustomEvent("catalog-changed"))
    return true
  } catch {
    return false
  }
}

/**
 * Parsea un CSV simple (nombre, descripción, precio) y devuelve items.
 * Primera fila puede ser encabezado; columnas: 0=nombre, 1=descripción, 2=precio.
 */
export function parseCatalogCSV(text: string): CatalogItem[] {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 1) return []
  const items: CatalogItem[] = []
  let start = 0
  const first = lines[0].toLowerCase()
  if (
    first.includes("nombre") ||
    first.includes("name") ||
    first.includes("producto")
  ) {
    start = 1
  }
  for (let i = start; i < lines.length; i++) {
    const cols = lines[i]
      .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
      .map((c) => c.trim().replace(/^"|"$/g, ""))
    const name = cols[0]?.trim()
    if (!name) continue
    items.push({
      id: crypto.randomUUID(),
      name,
      description: cols[1]?.trim() || undefined,
      price: cols[2]?.trim() || undefined,
    })
  }
  return items
}
