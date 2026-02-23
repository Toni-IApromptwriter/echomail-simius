"use client"

import { useState, useCallback, useEffect } from "react"
import { Menu } from "lucide-react"
import { ConsentGate } from "@/components/consent-gate"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { RecordButton } from "@/components/dashboard/record-button"
import {
  CopywritingSelectors,
  type TechniqueKey,
  type LengthKey,
} from "@/components/dashboard/copywriting-selectors"
import {
  TECHNIQUE_KEYS,
  LENGTH_KEYS,
  TECHNIQUE_KEY_TO_API,
  LENGTH_KEY_TO_API,
} from "@/lib/i18n"
import { ResultsSection } from "@/components/dashboard/results-section"
import { HistorySidebar } from "@/components/dashboard/history-sidebar"
import { SettingsModal } from "@/components/dashboard/settings-modal"
import { ProfileModal } from "@/components/dashboard/profile-modal"
import { useLanguage } from "@/components/providers/language-provider"
import { useSettings } from "@/components/providers/settings-provider"
import { loadProfile } from "@/lib/profile"
import { loadGoogleIntegrations, saveGoogleIntegrations } from "@/lib/google-integrations"
import { loadOpenAIKey } from "@/lib/openai-settings"
import { addToHistory } from "@/lib/history"
import type { HistoryEntry } from "@/lib/history"

export default function DashboardPage() {
  const { t, language } = useLanguage()
  const {
    isSettingsOpen,
    openSettings,
    closeSettings,
    isProfileOpen,
    openProfile,
    closeProfile,
  } = useSettings()
  const [profileName, setProfileName] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setProfileName(loadProfile().name || "")
  }, [isProfileOpen])
  useEffect(() => {
    const onSaved = () => setProfileName(loadProfile().name || "")
    window.addEventListener("profile-saved", onSaved)
    return () => window.removeEventListener("profile-saved", onSaved)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("google_connected") === "1") {
      saveGoogleIntegrations({ googleConnected: true })
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [])

  const [selectedTechnique, setSelectedTechnique] =
    useState<TechniqueKey>(TECHNIQUE_KEYS[0])
  const [selectedLength, setSelectedLength] = useState<LengthKey>(LENGTH_KEYS[0])
  const [transcription, setTranscription] = useState<string | null>(null)
  const [generatedEmail, setGeneratedEmail] = useState<string | null>(null)
  const [isLoadingTranscription, setIsLoadingTranscription] = useState(false)
  const [isLoadingEmail, setIsLoadingEmail] = useState(false)
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0)
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null)

  const handleSelectHistory = useCallback((entry: HistoryEntry | null) => {
    if (!entry) {
      setTranscription(null)
      setGeneratedEmail(null)
      setSelectedHistoryId(null)
      return
    }
    setTranscription(entry.transcription)
    setGeneratedEmail(entry.email)
    setSelectedHistoryId(entry.id)
  }, [])

  const handleRecordingComplete = async (audioBlob: Blob) => {
    setIsLoadingTranscription(true)
    setTranscription(null)
    setGeneratedEmail(null)
    setSelectedHistoryId(null)

    try {
      const formData = new FormData()
      formData.append("audio", audioBlob, "recording.webm")
      const openAIKey = loadOpenAIKey()
      const transcribeHeaders: Record<string, string> = {}
      if (openAIKey) transcribeHeaders["X-OpenAI-API-Key"] = openAIKey

      const transcribeRes = await fetch("/api/transcribe", {
        method: "POST",
        headers: transcribeHeaders,
        body: formData,
      })

      if (!transcribeRes.ok) {
        const err = await transcribeRes.json()
        throw new Error(err.error || t.transcribeError)
      }

      const { text } = await transcribeRes.json()
      setTranscription(text)

      setIsLoadingEmail(true)

      try {
        const genHeaders: Record<string, string> = { "Content-Type": "application/json" }
        if (openAIKey) genHeaders["X-OpenAI-API-Key"] = openAIKey
        const generateRes = await fetch("/api/generate", {
          method: "POST",
          headers: genHeaders,
          body: JSON.stringify({
            transcript: text,
            technique: TECHNIQUE_KEY_TO_API[selectedTechnique],
            length: LENGTH_KEY_TO_API[selectedLength],
            language,
          }),
        })

        if (!generateRes.ok) {
          const err = await generateRes.json()
          throw new Error(err.error || t.generateError)
        }

        const { email } = await generateRes.json()
        setGeneratedEmail(email)

        addToHistory({
          technique: TECHNIQUE_KEY_TO_API[selectedTechnique],
          length: LENGTH_KEY_TO_API[selectedLength],
          transcription: text,
          email,
        })
        setHistoryRefreshTrigger((prev) => prev + 1)

        const integrations = loadGoogleIntegrations()
        if (integrations.driveSyncEnabled && integrations.googleConnected) {
          try {
            await fetch("/api/google/drive/save", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, transcription: text }),
            })
          } catch (driveErr) {
            console.warn("No se pudo sincronizar con Drive:", driveErr)
          }
        }
      } catch (genErr) {
        console.error(genErr)
        setGeneratedEmail(null)
        alert(
          genErr instanceof Error ? genErr.message : t.generateError
        )
      } finally {
        setIsLoadingEmail(false)
      }
    } catch (err) {
      console.error(err)
      setTranscription(null)
      alert(err instanceof Error ? err.message : t.transcribeError)
      setIsLoadingTranscription(false)
      return
    } finally {
      setIsLoadingTranscription(false)
    }
  }

  return (
    <ConsentGate>
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden
          />
          <div className="fixed inset-y-0 left-0 z-40 lg:hidden">
            <DashboardSidebar overlay onNavClick={() => setMobileMenuOpen(false)} />
          </div>
        </>
      )}

      <main className="flex min-h-screen flex-1 flex-col pb-20 lg:pb-0">
        <header className="flex items-center justify-between border-b border-border bg-card/60 px-4 py-4 backdrop-blur-sm sm:px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg p-2 text-foreground hover:bg-muted lg:hidden"
              aria-label="Menú"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                {t.greeting}{profileName ? `, ${profileName}` : ""}
              </h1>
              <p className="text-sm text-muted-foreground">{t.subtitle}</p>
            </div>
          </div>
        </header>
        <SettingsModal isOpen={isSettingsOpen} onClose={closeSettings} />
        <ProfileModal isOpen={isProfileOpen} onClose={closeProfile} />

        <div className="flex flex-1">
          <div className="flex flex-1 flex-col gap-10 overflow-y-auto px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
            <section className="flex flex-col items-center gap-8 rounded-2xl border border-border bg-card px-6 py-10 shadow-sm sm:py-14">
              <RecordButton
                onRecordingComplete={handleRecordingComplete}
                disabled={isLoadingTranscription || isLoadingEmail}
                isProcessing={isLoadingTranscription || isLoadingEmail}
              />
              <CopywritingSelectors
                technique={selectedTechnique}
                length={selectedLength}
                onTechniqueChange={setSelectedTechnique}
                onLengthChange={setSelectedLength}
              />
            </section>

            <ResultsSection
              transcription={transcription}
              generatedEmail={generatedEmail}
              isLoadingTranscription={isLoadingTranscription}
              isLoadingEmail={isLoadingEmail}
            />
          </div>

          <HistorySidebar
            onSelectEntry={handleSelectHistory}
            currentEntryId={selectedHistoryId}
            refreshTrigger={historyRefreshTrigger}
            onHistoryCleared={() => {
              setTranscription(null)
              setGeneratedEmail(null)
              setSelectedHistoryId(null)
            }}
          />
        </div>

        {/* Barra inferior móvil */}
        <nav className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around border-t border-border bg-card/95 py-2 backdrop-blur-sm lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center gap-1 rounded-lg px-4 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
            <span className="text-xs">{t.dashboard}</span>
          </button>
          <button
            onClick={openSettings}
            className="flex flex-col items-center gap-1 rounded-lg px-4 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs">{t.settings}</span>
          </button>
          <button
            onClick={openProfile}
            className="flex flex-col items-center gap-1 rounded-lg px-4 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs">{t.profile}</span>
          </button>
          <a
            href="/help"
            className="flex flex-col items-center gap-1 rounded-lg px-4 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs">{t.help}</span>
          </a>
        </nav>
      </main>
    </div>
    </ConsentGate>
  )
}
