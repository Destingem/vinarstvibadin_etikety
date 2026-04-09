import Link from "next/link";

function AuthBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(125,31,43,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(165,101,30,0.10),transparent_28%),linear-gradient(180deg,rgba(255,252,248,0.28),rgba(255,252,248,0.76))]" />
      <div className="public-float absolute left-[10%] top-24 h-80 w-80 rounded-full bg-[rgba(125,31,43,0.08)] blur-3xl" />
      <div className="public-breathe absolute right-[6%] top-1/2 h-[30rem] w-[30rem] rounded-full bg-[rgba(165,101,30,0.10)] blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgb(36 20 15 / 0.16) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-screen overflow-hidden text-[color:var(--foreground)]">
      <AuthBackdrop />

      <div className="relative mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1.05fr_0.95fr]">
        <aside className="relative hidden flex-col justify-between border-r border-[color:var(--border)] px-10 py-12 lg:flex xl:px-12">
          <div className="space-y-10">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[color:var(--brand)] text-xl font-semibold text-white shadow-[0_18px_50px_rgba(125,31,43,0.20)]">
                E
              </span>
              <span>
                <span className="font-display block text-3xl leading-none">
                  etiketa.wine
                </span>
                <span className="mt-1 block text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">
                  pristupovy shell
                </span>
              </span>
            </Link>

            <div className="public-rise max-w-xl space-y-5">
              <span className="inline-flex items-center rounded-full border border-[color:var(--border)] bg-white/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--brand)]">
                Vstup do aplikace
              </span>
              <h1 className="font-display text-6xl leading-[0.96] tracking-tight">
                Ucet pro etikety,
                <br />
                sarze a verejnou etiketu.
              </h1>
              <p className="max-w-lg text-lg leading-8 text-[color:var(--muted)]">
                Prihlaseni a registrace maji zustat klidne. Zadny marketingovy
                sum kolem formulare, jen jasny vstup do workspace vinarstvi.
              </p>
            </div>
          </div>

          <div className="public-rise public-rise-delay space-y-8">
            <ol className="space-y-5">
              {[
                [
                  "01",
                  "Vstupite nebo zalozite ucet",
                  "Jeden ucet pro jedno vinarstvi a jeho verejny shell.",
                ],
                [
                  "02",
                  "Naplnite vino, sarz a QR",
                  "Po prihlaseni uz jdete rovnou do provozniho workspace, ne do prazdneho hero panelu.",
                ],
                [
                  "03",
                  "Zverejnite digitalni etiketu",
                  "Co je povinne, zustava citelne. Co je obchodni, je az dalsi vrstva.",
                ],
              ].map(([step, title, text]) => (
                <li
                  key={step}
                  className="grid gap-4 border-t border-[color:var(--border)] pt-5 first:border-t-0 first:pt-0 sm:grid-cols-[72px_minmax(0,1fr)]"
                >
                  <div className="font-display text-5xl leading-none text-[color:var(--brand)]">
                    {step}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-[color:var(--foreground)]">
                      {title}
                    </h2>
                    <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                      {text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="rounded-[2rem] border border-[color:var(--border)] bg-white/70 p-5 shadow-[0_18px_50px_rgba(52,25,12,0.08)] backdrop-blur">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[color:var(--brand)]">
                Potrebujete pristup nebo onboarding?
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href="mailto:info@etiketa.wine"
                  className="rounded-full border border-[color:var(--border)] bg-white/80 px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
                >
                  info@etiketa.wine
                </a>
                <Link
                  href="/register"
                  className="rounded-full px-1 py-2 text-sm font-medium text-[color:var(--brand)] transition hover:text-[color:var(--brand-strong)]"
                >
                  Zalozit ucet
                </Link>
              </div>
            </div>
          </div>
        </aside>

        <section className="relative flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="w-full max-w-xl">
            <div className="mb-8 flex items-center justify-between gap-4 lg:hidden">
              <Link href="/" className="inline-flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[color:var(--brand)] text-xl font-semibold text-white shadow-[0_18px_50px_rgba(125,31,43,0.20)]">
                  E
                </span>
                <span>
                  <span className="font-display block text-2xl leading-none">
                    etiketa.wine
                  </span>
                  <span className="mt-1 block text-xs uppercase tracking-[0.28em] text-[color:var(--muted)]">
                    pro ceska vinarstvi
                  </span>
                </span>
              </Link>
            </div>
            <div className="public-rise">{children}</div>
          </div>
        </section>
      </div>
    </div>
  );
}
