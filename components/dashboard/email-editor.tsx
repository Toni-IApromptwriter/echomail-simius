"use client"

import ReactMarkdown from "react-markdown"

interface EmailEditorProps {
  content: string | null
  placeholder?: string
  className?: string
}

/** Strip markdown bold syntax for plain-text copy */
function stripMarkdownBold(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*/g, "$1")
}

export function EmailEditor({ content, placeholder, className = "" }: EmailEditorProps) {
  if (!content?.trim()) {
    return (
      <div className={`min-h-[120px] flex-1 ${className}`}>
        <p className="text-sm text-muted-foreground/70">{placeholder ?? "—"}</p>
      </div>
    )
  }

  return (
    <div
      className={`min-h-[120px] flex-1 text-sm text-foreground [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:font-semibold ${className}`}
      data-raw={content}
    >
      <ReactMarkdown
        components={{
          p: ({ children }) => (
            <p className="whitespace-pre-wrap">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export function getPlainTextForCopy(content: string): string {
  return stripMarkdownBold(content)
}
