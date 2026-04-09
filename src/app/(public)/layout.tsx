import Link from "next/link";

function PublicBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(125,31,43,0.12),transparent_30%),radial-gradient(circle_at_top_right,rgba(165,101,30,0.10),transparent_28%),linear-gradient(180deg,rgba(255,252,248,0.22),rgba(255,252,248,0.72))]" />
      <div className="public-float absolute left-1/4 top-16 h-72 w-72 rounded-full bg-[rgba(125,31,43,0.08)] blur-3xl" />
      <div className="public-breathe absolute bottom-10 right-12 h-96 w-96 rounded-full bg-[rgba(165,101,30,0.10)] blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgb(36 20 15 / 0.16) 1px, transparent 0)",
          backgroundSize: "38px 38px",
        }}
      />
    </div>
  );
}

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-screen overflow-hidden text-[color:var(--foreground)]">
      <PublicBackdrop />

      <header className="relative z-10 px-4 pt-4 sm:px-6 lg:px-8 lg:pt-6">
        <div className="mx-auto max-w-7xl rounded-full border border-[color:var(--border)] bg-[rgba(255,252,248,0.76)] px-4 py-3 shadow-[0_20px_60px_rgba(52,25,12,0.08)] backdrop-blur-xl sm:px-5">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="group inline-flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[color:var(--brand)] text-xl font-semibold text-white shadow-[0_18px_50px_rgba(125,31,43,0.20)] transition group-hover:bg-[color:var(--brand-strong)]">
                E
              </span>
              <span>
                <span className="font-display block text-2xl leading-none sm:text-[2rem]">
                  etiketa.wine
                </span>
                <span className="mt-1 hidden text-[10px] uppercase tracking-[0.3em] text-[color:var(--muted)] sm:block">
                  compliance shell pro ceska vinarstvi
                </span>
              </span>
            </Link>

            <div className="hidden items-center gap-5 lg:flex">
              <nav className="flex items-center gap-1 text-sm text-[color:var(--muted)]">
                <Link
                  href="/#workflow"
                  className="rounded-full px-3 py-2 transition hover:bg-white/70 hover:text-[color:var(--foreground)]"
                >
                  Workflow
                </Link>
                <Link
                  href="/#label"
                  className="rounded-full px-3 py-2 transition hover:bg-white/70 hover:text-[color:var(--foreground)]"
                >
                  Verejna etiketa
                </Link>
              </nav>

              <div className="flex items-center gap-2">
                <Link
                  href="/register"
                  className="rounded-full border border-[color:var(--border)] bg-white/70 px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
                >
                  Registrace
                </Link>
                <Link
                  href="/login"
                  className="rounded-full bg-[color:var(--brand)] px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(125,31,43,0.20)] transition hover:bg-[color:var(--brand-strong)]"
                >
                  Prihlaseni
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <Link
                href="/login"
                className="rounded-full bg-[color:var(--brand)] px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(125,31,43,0.20)] transition hover:bg-[color:var(--brand-strong)]"
              >
                Vstup
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10">{children}</main>

      <footer className="relative z-10 px-4 pb-5 pt-10 sm:px-6 lg:px-8 lg:pb-8">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-[color:var(--border)] bg-[rgba(255,252,248,0.64)] px-5 py-5 shadow-[0_20px_60px_rgba(52,25,12,0.06)] backdrop-blur-xl sm:px-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[color:var(--brand)]">
                etiketa.wine
              </p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                Digitalni etikety, QR a verejna prezentace vin navrzene pro cesky
                provoz bez dalsiho generickeho SaaS balastu.
              </p>
            </div>

            <div className="flex flex-col gap-2 text-sm text-[color:var(--muted)] sm:flex-row sm:items-center sm:gap-6">
              <a
                href="mailto:info@etiketa.wine"
                className="font-medium text-[color:var(--brand)] transition hover:text-[color:var(--brand-strong)]"
              >
                info@etiketa.wine
              </a>
              <Link
                href="/register"
                className="transition hover:text-[color:var(--foreground)]"
              >
                Zalozit ucet
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
