import Link from "next/link"

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-neutral-200 bg-white px-6 py-4">
        <Link
          href="/"
          className="text-lg font-semibold text-neutral-900 hover:text-neutral-600"
        >
          EchoMail
        </Link>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-12 sm:px-10 sm:py-16 text-neutral-900">
        {children}
      </main>
    </div>
  )
}
