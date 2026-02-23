"use client"

import { useEffect, useState, useRef } from "react"
import { X, Upload, Camera, Image as ImageIcon, Lock } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import { useSubscription } from "@/components/providers/subscription-provider"
import {
  loadProfile,
  saveProfile,
  fileToBase64,
  type ProfileData,
} from "@/lib/profile"
import { maxVerbalIdentities } from "@/lib/subscription"

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { t } = useLanguage()
  const { tier, openProTrial } = useSubscription()
  const maxDocs = maxVerbalIdentities(tier)
  const [data, setData] = useState<ProfileData>(loadProfile())
  const [saved, setSaved] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const docInputRef0 = useRef<HTMLInputElement>(null)
  const docInputRef1 = useRef<HTMLInputElement>(null)
  const docInputRef2 = useRef<HTMLInputElement>(null)
  const docInputRefs = [docInputRef0, docInputRef1, docInputRef2]

  useEffect(() => {
    if (isOpen) setData(loadProfile())
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [isOpen, onClose])

  const handleSave = () => {
    const ok = saveProfile(data)
    if (!ok) {
      alert("No se pudo guardar el perfil. Intenta con imágenes más pequeñas.")
      return
    }
    setSaved(true)
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("profile-saved"))
    }
    setTimeout(() => {
      setSaved(false)
      onClose()
    }, 600)
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith("image/")) return
    try {
      const base64 = await fileToBase64(file)
      setData((prev) => ({ ...prev, photoBase64: base64 }))
    } catch {
      // ignore
    }
    e.target.value = ""
  }

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith("image/")) return
    try {
      const base64 = await fileToBase64(file, { forLogo: true })
      setData((prev) => ({ ...prev, logoBase64: base64 }))
    } catch {
      // ignore
    }
    e.target.value = ""
  }

  const handleDocChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const base64 = await fileToBase64(file)
      setData((prev) => ({
        ...prev,
        verbalIdentityDocs: prev.verbalIdentityDocs.map((v, i) =>
          i === index ? base64 : v
        ),
      }))
    } catch {
      // ignore
    }
    e.target.value = ""
  }

  const removePhoto = () =>
    setData((prev) => ({ ...prev, photoBase64: null }))
  const removeLogo = () =>
    setData((prev) => ({ ...prev, logoBase64: null }))
  const removeDoc = (index: number) =>
    setData((prev) => ({
      ...prev,
      verbalIdentityDocs: prev.verbalIdentityDocs.map((v, i) =>
        i === index ? null : v
      ),
    }))

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-title"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 id="profile-title" className="text-lg font-semibold text-foreground">
            {t.profile}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={t.close}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(90vh-140px)] overflow-y-auto p-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              {t.profileName}
            </label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => setData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder={t.profileName}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Email
            </label>
            <input
              type="email"
              value={data.email}
              onChange={(e) =>
                setData((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="tu@email.com"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              {t.profileBrand}
            </label>
            <input
              type="text"
              value={data.brand}
              onChange={(e) => setData((prev) => ({ ...prev, brand: e.target.value }))}
              placeholder={t.profileBrand}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-xl font-semibold text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              {t.profilePhoto}
            </label>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-border bg-muted/30 transition-colors hover:bg-muted/50"
              >
                {data.photoBase64 ? (
                  <img
                    key={data.photoBase64.slice(0, 50)}
                    src={data.photoBase64}
                    alt=""
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <Camera className="h-8 w-8 text-muted-foreground" />
                )}
              </button>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="text-sm text-primary hover:underline"
                >
                  {data.photoBase64 ? t.saveChanges : t.upload}
                </button>
                {data.photoBase64 && (
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="text-left text-sm text-muted-foreground hover:text-foreground"
                  >
                    {t.remove}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              {t.profileLogo}
            </label>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 transition-colors hover:bg-muted/50"
              >
                {data.logoBase64 ? (
                  <img
                    src={data.logoBase64}
                    alt=""
                    className="h-full w-full rounded-lg object-contain p-1"
                  />
                ) : (
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                )}
              </button>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="text-sm text-primary hover:underline"
                >
                  {data.logoBase64 ? t.saveChanges : t.upload}
                </button>
                {data.logoBase64 && (
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="text-left text-sm text-muted-foreground hover:text-foreground"
                  >
                    {t.remove}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              {t.verbalIdentityFiles}
            </label>
            <div className="space-y-2">
              {[0, 1, 2].map((i) => {
                const isLocked = i >= maxDocs
                const handleClick = () => {
                  if (isLocked) {
                    openProTrial()
                  } else {
                    docInputRefs[i].current?.click()
                  }
                }
                return (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      ref={docInputRefs[i]}
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.md"
                      className="hidden"
                      onChange={(e) => handleDocChange(e, i)}
                    />
                    <button
                      type="button"
                      onClick={handleClick}
                      className={`flex flex-1 items-center gap-2 rounded-lg border border-dashed px-4 py-3 text-sm transition-colors ${
                        isLocked
                          ? "border-amber-500/50 bg-amber-500/10 text-muted-foreground hover:bg-amber-500/20"
                          : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                      }`}
                    >
                      {isLocked ? (
                        <Lock className="h-4 w-4 shrink-0" />
                      ) : (
                        <Upload className="h-4 w-4 shrink-0" />
                      )}
                      {data.verbalIdentityDocs[i]
                        ? `${t.verbalIdentityDoc} ${i + 1} ✓`
                        : isLocked
                          ? `${t.verbalIdentityDoc} ${i + 1} (PRO)`
                          : `${t.verbalIdentityDoc} ${i + 1}`}
                    </button>
                    {!isLocked && data.verbalIdentityDocs[i] && (
                      <button
                        type="button"
                        onClick={() => removeDoc(i)}
                        className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label={t.remove}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="border-t border-border px-6 py-4 space-y-3">
          <button
            onClick={handleSave}
            className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
              saved
                ? "bg-emerald-600 text-white"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {saved ? (
              <>
                <span className="text-lg">✓</span>
                {t.saved}
              </>
            ) : (
              t.saveChanges
            )}
          </button>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            <a href="/legal/aviso-legal" target="_blank" rel="noopener noreferrer" className="hover:text-foreground hover:underline">
              Aviso Legal
            </a>
            <span aria-hidden>·</span>
            <a href="/legal/privacidad" target="_blank" rel="noopener noreferrer" className="hover:text-foreground hover:underline">
              Privacidad
            </a>
            <span aria-hidden>·</span>
            <a href="/legal/cookies" target="_blank" rel="noopener noreferrer" className="hover:text-foreground hover:underline">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
