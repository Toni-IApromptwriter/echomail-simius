"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"
import {
  loadProfiles,
  saveProfiles,
  loadActiveProfileId,
  saveActiveProfileId,
  getActiveProfile,
  type IdentityProfile,
  type ProfilesData,
} from "@/lib/profiles"
import { maxProfiles } from "@/lib/subscription"
import { useSubscription } from "@/components/providers/subscription-provider"

type ProfileContextType = {
  profiles: IdentityProfile[]
  activeProfile: IdentityProfile
  activeProfileId: string | null
  maxProfilesAllowed: number
  setActiveProfileId: (id: string) => void
  updateProfile: (id: string, updates: Partial<IdentityProfile>) => void
  addProfile: () => void
  deleteProfile: (id: string) => void
  canAddProfile: boolean
  canDeleteProfile: boolean
  refresh: () => void
}

const ProfileContext = createContext<ProfileContextType | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { tier } = useSubscription()
  const [data, setData] = useState<ProfilesData>({ profiles: [] })
  const maxAllowed = maxProfiles(tier)

  const refresh = useCallback(() => {
    const loaded = loadProfiles()
    setData(loaded)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    const handler = () => refresh()
    window.addEventListener("profiles-changed", handler)
    window.addEventListener("subscription-updated", handler)
    return () => {
      window.removeEventListener("profiles-changed", handler)
      window.removeEventListener("subscription-updated", handler)
    }
  }, [refresh])

  const activeProfile = getActiveProfile(data)
  const activeProfileId = loadActiveProfileId()

  const setActiveProfileId = useCallback((id: string) => {
    saveActiveProfileId(id)
    window.dispatchEvent(new CustomEvent("active-profile-changed"))
  }, [])

  const updateProfile = useCallback((id: string, updates: Partial<IdentityProfile>) => {
    const next = {
      ...data,
      profiles: data.profiles.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    }
    if (saveProfiles(next)) setData(next)
  }, [data])

  const addProfile = useCallback(() => {
    if (data.profiles.length >= maxAllowed) return
    const colors = ["blue", "orange", "emerald", "violet", "rose"] as const
    const used = new Set(data.profiles.map((p) => p.color))
    const nextColor = colors.find((c) => !used.has(c)) ?? "blue"
    const newProfile: IdentityProfile = {
      id: crypto.randomUUID(),
      name: `Perfil ${data.profiles.length + 1}`,
      color: nextColor,
      brand: "",
      photoBase64: null,
      logoBase64: null,
      verbalIdentityDocs: [null, null, null],
      verbalIdentityDocNames: [null, null, null],
    }
    const next = {
      ...data,
      profiles: [...data.profiles, newProfile],
    }
    if (saveProfiles(next)) {
      setData(next)
      saveActiveProfileId(newProfile.id)
      window.dispatchEvent(new CustomEvent("active-profile-changed"))
    }
  }, [data, maxAllowed])

  const deleteProfile = useCallback((id: string) => {
    if (data.profiles.length <= 1) return
    const next = {
      ...data,
      profiles: data.profiles.filter((p) => p.id !== id),
    }
    const newActive = next.profiles[0]?.id
    if (newActive) saveActiveProfileId(newActive)
    if (saveProfiles(next)) {
      setData(next)
      window.dispatchEvent(new CustomEvent("active-profile-changed"))
    }
  }, [data])

  const canAddProfile = data.profiles.length < maxAllowed
  const canDeleteProfile = data.profiles.length > 1

  return (
    <ProfileContext.Provider
      value={{
        profiles: data.profiles,
        activeProfile,
        activeProfileId,
        maxProfilesAllowed: maxAllowed,
        setActiveProfileId,
        updateProfile,
        addProfile,
        deleteProfile,
        canAddProfile,
        canDeleteProfile,
        refresh,
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider")
  return ctx
}
