"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import Link from "next/link"
import { FolderOpen, Upload, Plus, Trash2, FileSpreadsheet } from "lucide-react"
import { ConsentGate } from "@/components/consent-gate"
import { useSubscription } from "@/components/providers/subscription-provider"
import { useProfile } from "@/components/providers/profile-provider"
import { ProTrialGate } from "@/components/pro-trial-gate"
import {
  loadCatalog,
  saveCatalog,
  parseCatalogCSV,
  type CatalogItem,
} from "@/lib/catalog"

function CatalogoContent() {
  const { activeProfile } = useProfile()
  const [items, setItems] = useState<CatalogItem[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const refresh = useCallback(() => {
    if (activeProfile) {
      setItems(loadCatalog(activeProfile.id))
    }
  }, [activeProfile?.id])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    const handler = () => refresh()
    window.addEventListener("catalog-changed", handler)
    return () => window.removeEventListener("catalog-changed", handler)
  }, [refresh])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !activeProfile) return
    setUploading(true)
    try {
      const text = await file.text()
      const parsed = parseCatalogCSV(text)
      if (parsed.length === 0) {
        alert("El CSV no tiene filas válidas. Formato: nombre, descripción, precio")
        return
      }
      const existing = loadCatalog(activeProfile.id)
      const merged = [...existing]
      for (const p of parsed) {
        if (!merged.some((x) => x.name === p.name)) merged.push(p)
      }
      saveCatalog(activeProfile.id, merged)
      setItems(merged)
    } catch {
      alert("Error al leer el archivo. Usa un CSV con columnas: nombre, descripción, precio")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const handleAddItem = () => {
    if (!activeProfile) return
    const newItem: CatalogItem = {
      id: crypto.randomUUID(),
      name: "Nuevo producto",
      description: "",
      price: "",
    }
    const next = [...items, newItem]
    saveCatalog(activeProfile.id, next)
    setItems(next)
  }

  const handleRemove = (id: string) => {
    if (!activeProfile) return
    const next = items.filter((i) => i.id !== id)
    saveCatalog(activeProfile.id, next)
    setItems(next)
  }

  const handleUpdate = (id: string, updates: Partial<CatalogItem>) => {
    if (!activeProfile) return
    const next = items.map((i) => (i.id === id ? { ...i, ...updates } : i))
    saveCatalog(activeProfile.id, next)
    setItems(next)
  }

  return (
    <main className="flex min-h-screen flex-col px-6 py-8">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FolderOpen className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-semibold text-foreground">Módulo Catálogo</h1>
              <p className="text-sm text-muted-foreground">
                Productos y servicios para el perfil «{activeProfile?.name || "Activo"}»
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            Volver al Dashboard
          </Link>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-60"
          >
            <Upload className="h-4 w-4" />
            {uploading ? "Subiendo…" : "Subir CSV"}
          </button>
          <button
            type="button"
            onClick={handleAddItem}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Añadir producto
          </button>
        </div>

        <p className="mb-4 text-xs text-muted-foreground">
          Formato CSV: <code className="rounded bg-muted px-1">nombre, descripción, precio</code>.
          La primera fila puede ser encabezado.
        </p>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 py-12">
            <FileSpreadsheet className="mb-3 h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No hay productos en el catálogo</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Sube un CSV o añade productos manualmente
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-3 rounded-lg border border-border bg-card p-4"
              >
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleUpdate(item.id, { name: e.target.value })}
                    className="w-full rounded border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground"
                    placeholder="Nombre"
                  />
                  <input
                    type="text"
                    value={item.description ?? ""}
                    onChange={(e) => handleUpdate(item.id, { description: e.target.value })}
                    className="w-full rounded border border-border bg-background px-3 py-1.5 text-sm text-foreground"
                    placeholder="Descripción"
                  />
                  <input
                    type="text"
                    value={item.price ?? ""}
                    onChange={(e) => handleUpdate(item.id, { price: e.target.value })}
                    className="w-32 rounded border border-border bg-background px-3 py-1.5 text-sm text-foreground"
                    placeholder="Precio"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  className="rounded p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-600"
                  aria-label="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}

export default function CatalogoPage() {
  const { isPro } = useSubscription()

  if (!isPro) {
    return (
      <ConsentGate>
        <ProTrialGate feature="Catálogo" />
      </ConsentGate>
    )
  }

  return (
    <ConsentGate>
      <CatalogoContent />
    </ConsentGate>
  )
}
