"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react"

type SettingsContextType = {
  isSettingsOpen: boolean
  openSettings: () => void
  closeSettings: () => void
  isProfileOpen: boolean
  openProfile: () => void
  closeProfile: () => void
}

const SettingsContext = createContext<SettingsContextType | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const openSettings = useCallback(() => {
    setIsProfileOpen(false)
    setIsSettingsOpen(true)
  }, [])
  const closeSettings = useCallback(() => setIsSettingsOpen(false), [])
  const openProfile = useCallback(() => {
    setIsSettingsOpen(false)
    setIsProfileOpen(true)
  }, [])
  const closeProfile = useCallback(() => setIsProfileOpen(false), [])

  return (
    <SettingsContext.Provider
      value={{
        isSettingsOpen,
        openSettings,
        closeSettings,
        isProfileOpen,
        openProfile,
        closeProfile,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider")
  return ctx
}
