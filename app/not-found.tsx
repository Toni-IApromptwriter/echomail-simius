import Link from "next/link"

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <p className="mb-8 text-center text-lg text-foreground">
        Este eslabón de la evolución se ha perdido. Vuelve al inicio.
      </p>
      <Link
        href="/"
        className="rounded-lg border border-border bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Vuelve al inicio
      </Link>
    </main>
  )
}
