"use client"

import { useState } from "react"
import { Copy } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import { EmailEditor, getPlainTextForCopy } from "@/components/dashboard/email-editor"

interface ResultsSectionProps {
  transcription: string | null
  generatedEmail: string | null
  isLoadingTranscription: boolean
  isLoadingEmail: boolean
}

export function ResultsSection({
  transcription,
  generatedEmail,
  isLoadingTranscription,
  isLoadingEmail,
}: ResultsSectionProps) {
  const { t } = useLanguage()
  const [isCopied, setIsCopied] = useState(false)

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-foreground">{t.results}</h2>
      <div className="grid min-h-[200px] grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card/30 px-6 py-4">
          <h3 className="text-sm font-medium text-foreground">
            {t.yourTranscription}
          </h3>
          <div className="min-h-[120px] flex-1">
            {isLoadingTranscription ? (
              <p className="text-sm text-muted-foreground">{t.loading}</p>
            ) : transcription ? (
              <p className="whitespace-pre-wrap text-sm text-foreground">
                {transcription}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground/70">—</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card/30 px-6 py-4">
          <h3 className="text-sm font-medium text-foreground">
            {t.generatedEmail}
          </h3>
          <div className="min-h-[120px] flex-1">
            {isLoadingEmail ? (
              <p className="text-sm text-muted-foreground">{t.loading}</p>
            ) : (
              <EmailEditor
                content={generatedEmail}
                placeholder="—"
              />
            )}
          </div>
          {generatedEmail && (
            <button
              onClick={async () => {
                try {
                  const plainText = getPlainTextForCopy(generatedEmail)
                  await navigator.clipboard.writeText(plainText)
                  setIsCopied(true)
                  setTimeout(() => setIsCopied(false), 2000)
                } catch (err) {
                  console.error(t.copyError, err)
                }
              }}
              className={`mt-2 flex w-fit items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                isCopied
                  ? "border-green-600 bg-green-600 text-white hover:bg-green-600"
                  : "border-border bg-background text-foreground hover:bg-muted/50"
              }`}
            >
              <Copy className="h-4 w-4" />
              {isCopied ? t.copied : t.copyEmail}
            </button>
          )}
        </div>
      </div>

      {generatedEmail && (
        <p className="text-center text-sm text-muted-foreground">{t.reminder}</p>
      )}
    </section>
  )
}
