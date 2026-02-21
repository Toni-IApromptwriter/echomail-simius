"use client"

import { useState, useCallback } from "react"
import { Globe } from "lucide-react"
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
import { useLanguage } from "@/components/providers/language-provider"
import { useSettings } from "@/components/providers/settings-provider"
import { addToHistory } from "@/lib/history"
import type { HistoryEntry } from "@/lib/history"

export default function DashboardPage() {
  const { t, language } = useLanguage()
  const { isSettingsOpen, openSettings, closeSettings } = useSettings()
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

      const transcribeRes = await fetch("/api/transcribe", {
        method: "POST",
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
        const generateRes = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <main className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-card/60 px-6 py-4 backdrop-blur-sm lg:px-10">
          <div className="pl-10 lg:pl-0">
            <h1 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              {t.greeting}, Ana
            </h1>
            <p className="text-sm text-muted-foreground">{t.subtitle}</p>
          </div>
          <button
            onClick={openSettings}
            className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground hover:bg-muted/50"
            aria-label={t.settings}
          >
            <span className="hidden sm:inline">{t.language}</span>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </button>
        </header>
        <SettingsModal isOpen={isSettingsOpen} onClose={closeSettings} />

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
      </main>
    </div>
  )
}
