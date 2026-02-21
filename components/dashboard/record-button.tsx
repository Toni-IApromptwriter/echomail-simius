"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Mic, Square, Loader2 } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"

const MAX_RECORDING_SECONDS = 60

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

interface RecordButtonProps {
  onRecordingComplete?: (audioBlob: Blob) => void
  disabled?: boolean
  isProcessing?: boolean
}

export function RecordButton({
  onRecordingComplete,
  disabled = false,
  isProcessing = false,
}: RecordButtonProps) {
  const { t } = useLanguage()
  const [isRecording, setIsRecording] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current
    const stream = streamRef.current

    setElapsedTime(0)
    setIsRecording(false)

    if (recorder?.state === "recording") {
      recorder.stop()
    }
    stream?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }, [])

  const finishAndEmitBlob = useCallback(() => {
    if (chunksRef.current.length > 0) {
      const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" })
      onRecordingComplete?.(audioBlob)
    }
    chunksRef.current = []
    mediaRecorderRef.current = null
  }, [onRecordingComplete])

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  useEffect(() => {
    if (!isRecording) {
      setElapsedTime(0)
      return
    }

    setElapsedTime(0)
    const intervalId = setInterval(() => {
      setElapsedTime((prev) => {
        if (prev >= MAX_RECORDING_SECONDS - 1) {
          stopRecording()
          return prev + 1
        }
        return prev + 1
      })
    }, 1000)

    return () => clearInterval(intervalId)
  }, [isRecording, stopRecording])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        finishAndEmitBlob()
      }

      mediaRecorder.start(500)
      setIsRecording(true)
    } catch (err) {
      console.error(err)
      alert(t.micAccessError)
    }
  }

  const handleClick = async () => {
    if (disabled || isProcessing) return
    if (isRecording) {
      stopRecording()
    } else {
      await startRecording()
    }
  }

  const isButtonDisabled = disabled || isProcessing

  const statusText = isProcessing
    ? t.processingAI
    : isRecording
      ? t.recording
      : t.clickToRecord

  const ariaLabel = isProcessing
    ? t.processing
    : isRecording
      ? t.stopRecording
      : t.startRecording

  return (
    <div className="flex flex-col items-center gap-4">
      {isRecording && (
        <p className="text-center text-sm font-medium text-red-600 tabular-nums">
          {formatTime(elapsedTime)} / {formatTime(MAX_RECORDING_SECONDS)}
        </p>
      )}
      <button
        onClick={handleClick}
        disabled={isButtonDisabled}
        className={`
          relative flex h-24 w-24 items-center justify-center rounded-full
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background
          disabled:cursor-not-allowed disabled:opacity-70
          ${
            isProcessing
              ? "bg-orange-500/80 text-white cursor-not-allowed"
              : isRecording
                ? "bg-red-500 text-white hover:bg-red-600 ring-4 ring-red-400/60 ring-offset-2 ring-offset-background animate-pulse"
                : "bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary"
          }
        `}
        aria-label={ariaLabel}
      >
        {isProcessing ? (
          <Loader2 className="h-10 w-10 animate-spin" />
        ) : isRecording ? (
          <Square className="h-10 w-10 fill-current" />
        ) : (
          <Mic className="h-10 w-10" />
        )}
      </button>
      <p className="text-center text-sm text-muted-foreground">{statusText}</p>
    </div>
  )
}
