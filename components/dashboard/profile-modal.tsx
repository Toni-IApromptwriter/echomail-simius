"use client"

import { useEffect, useState, useRef } from "react"
import { X, Upload, Camera, Image as ImageIcon, Lock, Trash2 } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import { useProfile } from "@/components/providers/profile-provider"
import { useSubscription } from "@/components/providers/subscription-provider"
import { ProfileSwitcher } from "./profile-switcher"
import {
  loadProfile,
  saveProfile,
  fileToBase64,
} from "@/lib/profile"
import { PROFILE_COLORS, getProfileColorHex, type IdentityProfile } from "@/lib/profiles"
import { maxVerbalIdentities } from "@/lib/subscription"

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { t } = useLanguage()
  const { tier, openProTrial } = useSubscription()
  const { activeProfile, updateProfile } = useProfile()
  const maxDocs = maxVerbalIdentities(tier)

  const [userEmail, setUserEmail] = useState("")
  const [userPhone, setUserPhone] = useState("")
  const [identity, setIdentity] = useState<IdentityProfile>(activeProfile)
  const [saved, setSaved] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const docInputRef0 = useRef<HTMLInputElement>(null)
  const docInputRef1 = useRef<HTMLInputElement>(null)
  const docInputRef2 = useRef<HTMLInputElement>(null)
  const docInputRefs = [docInputRef0, docInputRef1, docInputRef2]

  useEffect(() => {
    if (isOpen) {
      const p = loadProfile()
      setUserEmail(p.email ?? "")
      setUserPhone(p.phone ?? "")
      setIdentity({ ...activeProfile })
    }
  }, [isOpen, activeProfile.id])

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
    const phone = userPhone.trim()
    if (!phone) {
      alert("El teléfono es obligatorio.")
      return
    }
    const userOk = saveProfile({
      ...loadProfile(),
      email: userEmail,
      phone,
    })
    if (!userOk) {
      alert("No se pudo guardar el perfil.")
      return
    }
    updateProfile(activeProfile.id, {
      name: identity.name,
      brand: identity.brand,
      color: identity.color,
      photoBase64: identity.photoBase64,
      logoBase64: identity.logoBase64,
      verbalIdentityDocs: identity.verbalIdentityDocs,
      verbalIdentityDocNames: identity.verbalIdentityDocNames,
      companyContext: identity.companyContext,
      useCompanyContext: identity.useCompanyContext,
    })
    setSaved(true)
    window.dispatchEvent(new CustomEvent("profile-saved"))
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
      setIdentity((prev) => ({ ...prev, photoBase64: base64 }))
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
      setIdentity((prev) => ({ ...prev, logoBase64: base64 }))
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
      setIdentity((prev) => {
        const names = prev.verbalIdentityDocNames ?? [null, null, null]
        return {
          ...prev,
          verbalIdentityDocs: prev.verbalIdentityDocs.map((v, i) =>
            i === index ? base64 : v
          ),
          verbalIdentityDocNames: names.map((n, i) =>
            i === index ? file.name : n
          ),
        }
      })
    } catch {
      // ignore
    }
    e.target.value = ""
  }

  const removePhoto = () =>
    setIdentity((prev) => ({ ...prev, photoBase64: null }))
  const removeLogo = () =>
    setIdentity((prev) => ({ ...prev, logoBase64: null }))
  const removeDoc = (index: number) => {
    setIdentity((prev) => {
      const names = prev.verbalIdentityDocNames ?? [null, null, null]
      return {
        ...prev,
        verbalIdentityDocs: prev.verbalIdentityDocs.map((v, i) =>
          i === index ? null : v
        ),
        verbalIdentityDocNames: names.map((n, i) => (i === index ? null : n)),
      }
    })
  }

  if (!isOpen) return null

  const colorHex = getProfileColorHex(identity.color)

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

        <div className="max-h-[calc(90vh-200px)] overflow-y-auto p-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Perfil activo
            </label>
            <ProfileSwitcher />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              {t.profileName}
            </label>
            <input
              type="text"
              value={identity.name}
              onChange={(e) =>
                setIdentity((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder={t.profileName}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Color del perfil
            </label>
            <div className="flex flex-wrap gap-2">
              {PROFILE_COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() =>
                    setIdentity((prev) => ({ ...prev, color: c.id }))
                  }
                  className={`h-8 w-8 rounded-full border-2 transition-all ${
                    identity.color === c.id
                      ? "border-foreground ring-2 ring-offset-2 ring-offset-background"
                      : "border-transparent hover:border-muted-foreground/50"
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Email
            </label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Teléfono <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={userPhone}
              onChange={(e) => setUserPhone(e.target.value)}
              placeholder="+34 600 000 000"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              {t.profileBrand}
            </label>
            <input
              type="text"
              value={identity.brand}
              onChange={(e) =>
                setIdentity((prev) => ({ ...prev, brand: e.target.value }))
              }
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
                {identity.photoBase64 ? (
                  <img
                    src={identity.photoBase64}
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
                  {identity.photoBase64 ? t.saveChanges : t.upload}
                </button>
                {identity.photoBase64 && (
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
                {identity.logoBase64 ? (
                  <img
                    src={identity.logoBase64}
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
                  {identity.logoBase64 ? t.saveChanges : t.upload}
                </button>
                {identity.logoBase64 && (
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
                      {identity.verbalIdentityDocs[i]
                        ? `${t.verbalIdentityDoc} ${i + 1} ✓`
                        : isLocked
                          ? `${t.verbalIdentityDoc} ${i + 1} (PRO)`
                          : `${t.verbalIdentityDoc} ${i + 1}`}
                    </button>
                    {!isLocked && identity.verbalIdentityDocs[i] && (
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

            {identity.verbalIdentityDocs.some(Boolean) && (
              <div className="mt-4 rounded-lg border border-border bg-muted/20 p-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Documentos Activos
                </p>
                <ul className="space-y-2">
                  {identity.verbalIdentityDocs.map((doc, i) =>
                    doc ? (
                      <li
                        key={i}
                        className="flex items-center justify-between gap-2 rounded-md bg-background px-3 py-2 text-sm"
                      >
                        <span className="truncate text-foreground">
                          {identity.verbalIdentityDocNames?.[i] ?? `Documento ${i + 1}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeDoc(i)}
                          className="shrink-0 rounded p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-600"
                          aria-label={t.remove}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ) : null
                  )}
                </ul>
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Información de Empresa / Catálogo
            </label>
            <textarea
              value={identity.companyContext ?? ""}
              onChange={(e) =>
                setIdentity((prev) => ({
                  ...prev,
                  companyContext: e.target.value,
                }))
              }
              placeholder="Pega tu URL de catálogo, descripción de servicios, o texto con el que quieres que la IA conozca tu negocio..."
              rows={4}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <label className="mt-3 flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border bg-muted/20 px-4 py-3">
              <span className="text-sm font-medium text-foreground">
                Usar contexto de empresa
              </span>
              <button
                role="switch"
                aria-checked={identity.useCompanyContext ?? false}
                onClick={() =>
                  setIdentity((prev) => ({
                    ...prev,
                    useCompanyContext: !prev.useCompanyContext,
                  }))
                }
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  identity.useCompanyContext ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                    identity.useCompanyContext ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </label>
            <p className="mt-1 text-xs text-muted-foreground">
              Si está activo, la IA leerá esta información antes de redactar los emails.
            </p>
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
