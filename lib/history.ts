export interface HistoryEntry {
  id: string
  date: string // ISO string
  technique: string
  length: string
  transcription: string
  email: string
}

const STORAGE_KEY = "echomail-history"
const MAX_ENTRIES = 100

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (e): e is HistoryEntry =>
        e &&
        typeof e === "object" &&
        typeof (e as HistoryEntry).id === "string" &&
        typeof (e as HistoryEntry).date === "string" &&
        typeof (e as HistoryEntry).email === "string"
    )
  } catch {
    return []
  }
}

export function saveHistory(entries: HistoryEntry[]): void {
  if (typeof window === "undefined") return
  try {
    const trimmed = entries.slice(0, MAX_ENTRIES)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  } catch {
    // ignore
  }
}

export function addToHistory(entry: Omit<HistoryEntry, "id" | "date">): HistoryEntry {
  const list = loadHistory()
  const newEntry: HistoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
  }
  const updated = [newEntry, ...list]
  saveHistory(updated)
  return newEntry
}

export function deleteFromHistory(id: string): void {
  const list = loadHistory().filter((e) => e.id !== id)
  saveHistory(list)
}

export function clearHistory(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
