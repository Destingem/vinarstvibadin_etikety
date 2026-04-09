import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="relative min-h-screen overflow-hidden text-[color:var(--foreground)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(125,31,43,0.10),transparent_28%),radial-gradient(circle_at_top_right,rgba(165,101,30,0.08),transparent_26%),linear-gradient(180deg,rgba(255,252,248,0.2),rgba(255,252,248,0.7))]" />
        <div className="absolute left-1/4 top-24 h-72 w-72 rounded-full bg-[rgba(125,31,43,0.08)] blur-3xl" />
        <div className="absolute bottom-12 right-10 h-96 w-96 rounded-full bg-[rgba(165,101,30,0.10)] blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgb(36 20 15 / 0.18) 1px, transparent 0)",
            backgroundSize: "36px 36px",
          }}
        />
      </div>

      <main className="relative mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full rounded-[2rem] border border-[color:var(--border)] bg-white/70 p-8 shadow-[0_32px_120px_rgba(52,25,12,0.12)] backdrop-blur-xl sm:p-10 lg:p-12">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-[color:var(--brand)] text-2xl font-semibold text-white shadow-[0_18px_50px_rgba(125,31,43,0.20)]">
              404
            </div>
            <p className="mb-3 text-xs uppercase tracking-[0.34em] text-[color:var(--muted)]">
              Stránka nenalezena
            </p>
            <h1 className="font-display text-3xl text-[color:var(--foreground)] sm:text-5xl">
              Tahle adresa tady není
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[color:var(--muted)] sm:text-lg">
              Zkuste návrat na hlavní stránku, přihlášení nebo registraci. Pokud jste
              očekávali dashboard, pokračujte přes vstupní plochu aplikace.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/"
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--brand)] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(125,31,43,0.20)] transition hover:bg-[color:var(--brand-strong)]"
              >
                Zpět na hlavní stránku
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-[color:var(--border)] bg-white/70 px-6 py-3 text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
              >
                Přihlášení
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-sm text-[color:var(--muted)]">
              <Link href="/register" className="rounded-full border border-transparent px-3 py-1.5 transition hover:border-[color:var(--border)] hover:bg-white/70">
                Registrace
              </Link>
              <Link href="/dashboard/wines" className="rounded-full border border-transparent px-3 py-1.5 transition hover:border-[color:var(--border)] hover:bg-white/70">
                Vaše vína
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
