import Link from "next/link";

export const metadata = {
  title: "Digitalni etikety pro ceska vinarstvi",
  description:
    "etiketa.wine spojuje vino, sarzi, QR a verejnou etiketu do jednoho ceskeho workflow.",
};

const workflow = [
  {
    step: "01",
    title: "Zalozite vinarstvi a verejnou adresu",
    text: "Prvni vrstva drzi identitu vinarstvi, jazykove mutace a kontakty v jednom nastaveni.",
  },
  {
    step: "02",
    title: "Naplnite vino, sarz a QR vystup",
    text: "Produktove a povinne udaje zustavaji v jednom toku misto prepisovani mezi PDF, e-shopem a tiskem.",
  },
  {
    step: "03",
    title: "Publikujete digitalni etiketu",
    text: "QR smeruje na citelnou verejnou stranku, kde jsou compliance informace nad obchodni vrstvou.",
  },
];

const complianceGroups = [
  {
    label: "Povinna vrstva",
    items: ["slozeni", "alergeny", "zeme puvodu", "vyzivove udaje"],
  },
  {
    label: "Produktova vrstva",
    items: ["nazev vina", "rocnik", "sarz", "vinarska obec"],
  },
  {
    label: "Volitelna vrstva",
    items: ["obchodni CTA", "pairing", "sekundarni odkazy"],
  },
];

const supportNotes = [
  "verejna etiketa bez chaosu",
  "sarz a QR v jednom workspace",
  "cs / en / de pripravenost",
  "export pro tisk i provoz",
];

export default function PublicHomePage() {
  return (
    <div className="pb-8">
      <section className="relative isolate min-h-[calc(100svh-7rem)] px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-10 lg:px-8 lg:pb-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] lg:gap-16">
          <div className="public-rise space-y-8">
            <div className="space-y-5">
              <span className="inline-flex items-center rounded-full border border-[color:var(--border)] bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.34em] text-[color:var(--brand)]">
                Warm rebuild pro ceska vinarstvi
              </span>
              <div className="space-y-4">
                <h1 className="font-display max-w-4xl text-5xl leading-[0.9] tracking-tight text-[color:var(--foreground)] sm:text-6xl lg:text-[5.3rem]">
                  Digitalni etikety,
                  <br />
                  ktere drzi vino, sarz a QR v jednom toku.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-[color:var(--muted)] sm:text-xl">
                  etiketa.wine neni dalsi genericky dashboard. Je to cesky
                  workspace pro public label, exporty a compliance, ktery zacina
                  u dat a konci u citelne verejne etikety.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--brand)] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(125,31,43,0.20)] transition hover:bg-[color:var(--brand-strong)]"
              >
                Zalozit ucet
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-[color:var(--border)] bg-white/72 px-6 py-3 text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
              >
                Prihlaseni
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full px-2 py-3 text-sm font-semibold text-[color:var(--muted)] transition hover:text-[color:var(--foreground)]"
              >
                Mam ucet
              </Link>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {supportNotes.map((note) => (
                <div
                  key={note}
                  className="rounded-full border border-[color:var(--border)] bg-[rgba(255,252,248,0.72)] px-4 py-2 text-sm text-[color:var(--muted)]"
                >
                  {note}
                </div>
              ))}
            </div>
          </div>

          <div className="public-rise public-rise-delay relative lg:justify-self-end">
            <div className="public-breathe absolute -left-6 top-8 h-40 w-40 rounded-full bg-[rgba(125,31,43,0.12)] blur-3xl" />
            <div className="public-float absolute -right-8 bottom-10 h-48 w-48 rounded-full bg-[rgba(165,101,30,0.14)] blur-3xl" />

            <div className="relative overflow-hidden rounded-[2.4rem] border border-[color:var(--border)] bg-[rgba(255,251,246,0.9)] p-5 shadow-[0_30px_100px_rgba(52,25,12,0.14)] backdrop-blur-xl sm:p-6">
              <div className="rounded-[2rem] bg-[linear-gradient(180deg,#6f1d28_0%,#8a2d38_100%)] px-5 py-5 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.34em] text-white/70">
                      public label specimen
                    </p>
                    <h2 className="mt-3 font-display text-4xl leading-none sm:text-[2.8rem]">
                      Ryzlink rynsky
                    </h2>
                    <p className="mt-2 text-sm text-white/80">
                      Rocnik 2024 / Sarz B-24-07
                    </p>
                  </div>
                  <div className="rounded-[1.2rem] border border-white/20 bg-white/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/80">
                    scan
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-[2rem] border border-[color:var(--border)] bg-white/78 p-5">
                <div className="flex items-center justify-between gap-4 border-b border-[color:var(--border)] pb-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--muted)]">
                      Moravsky sklep Nove Hory
                    </p>
                    <p className="mt-2 text-sm font-medium text-[color:var(--foreground)]">
                      etiketa.wine/moravsky-sklep/ryzlink-2024
                    </p>
                  </div>
                  <div className="grid h-20 w-20 place-items-center rounded-[1.3rem] border border-dashed border-[color:var(--border)] bg-[rgba(125,31,43,0.06)] text-[10px] uppercase tracking-[0.34em] text-[color:var(--muted)]">
                    QR
                  </div>
                </div>

                <div className="mt-4 space-y-3 text-sm">
                  {[
                    ["Povinne informace", "slozeni, alergeny, vyziva, puvod"],
                    ["Produktova data", "nazev vina, rocnik, sarz, trat"],
                    ["Jazykove mutace", "cs / en / de v jedne strukture"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between gap-4 rounded-[1.4rem] border border-[color:var(--border)] bg-[#fffdfb] px-4 py-3"
                    >
                      <span className="text-[color:var(--muted)]">{label}</span>
                      <span className="text-right font-medium text-[color:var(--foreground)]">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-[1.6rem] bg-[linear-gradient(180deg,rgba(125,31,43,0.08),rgba(255,255,255,0.92))] p-4">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--brand)]">
                    pravidlo rozlozeni
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--foreground)]">
                    Povinne udaje zustavaji nahore. Obchodni CTA, pairings a dalsi
                    vrstvy az pod nimi, ne na jejich ukor.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="workflow"
        className="px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
      >
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
          <div className="public-rise lg:pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[color:var(--brand)]">
              Workflow
            </p>
            <h2 className="mt-4 font-display text-4xl leading-tight text-[color:var(--foreground)] sm:text-5xl">
              Jak to tece ve vinarstvi.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-[color:var(--muted)] sm:text-lg">
              Jedna platforma ma smysl jen tehdy, kdyz data netece do dalsich
              slepych panelu. Tady je poradi, ve kterem produkt dava smysl i v
              realnem provozu.
            </p>
            <div className="mt-8 rounded-[2rem] border border-[color:var(--border)] bg-[rgba(255,252,248,0.72)] p-5">
              <p className="text-sm leading-7 text-[color:var(--muted)]">
                Zadny prepis mezi tabulkou, PDF a e-shopem. Jednou zalozene vino
                se propise do verejne etikety, QR vystupu i dalsiho exportu.
              </p>
            </div>
          </div>

          <ol className="public-rise public-rise-delay space-y-5">
            {workflow.map((item) => (
              <li
                key={item.step}
                className="grid gap-4 rounded-[2rem] border border-[color:var(--border)] bg-[rgba(255,252,248,0.68)] p-5 shadow-[0_18px_60px_rgba(52,25,12,0.07)] sm:grid-cols-[84px_minmax(0,1fr)] sm:p-6"
              >
                <div className="font-display text-5xl leading-none text-[color:var(--brand)]">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-2xl font-semibold tracking-tight text-[color:var(--foreground)]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-base leading-7 text-[color:var(--muted)]">
                    {item.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        id="label"
        className="px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
      >
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1.02fr)_minmax(320px,0.98fr)] lg:gap-14">
          <div className="public-rise relative overflow-hidden rounded-[2.4rem] border border-[color:var(--border)] bg-[rgba(255,251,246,0.88)] p-6 shadow-[0_28px_100px_rgba(52,25,12,0.12)] sm:p-8">
            <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(125,31,43,0.10),transparent)]" />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[color:var(--brand)]">
                Verejna etiketa
              </p>
              <h2 className="mt-4 font-display text-4xl leading-tight text-[color:var(--foreground)] sm:text-5xl">
                Compliance first.
                <br />
                Obchodni vrstva az potom.
              </h2>

              <div className="mt-8 space-y-4">
                {complianceGroups.map((group) => (
                  <div
                    key={group.label}
                    className="rounded-[1.8rem] border border-[color:var(--border)] bg-white/78 p-5"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--foreground)]">
                        {group.label}
                      </p>
                      <span className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--muted)]">
                        {group.items.length} polozky
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-[color:var(--border)] bg-[rgba(255,252,248,0.7)] px-3 py-1.5 text-sm text-[color:var(--muted)]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="public-rise public-rise-delay space-y-6 lg:pt-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[color:var(--brand)]">
              Co se na verejne strance pocita
            </p>
            <div className="space-y-4">
              <h3 className="font-display text-4xl leading-tight text-[color:var(--foreground)] sm:text-5xl">
                Stranka ma byt duveryhodna driv, nez je hezka.
              </h3>
              <p className="text-base leading-7 text-[color:var(--muted)] sm:text-lg">
                Digitalni etiketa nema byt marketingovy microsite. Nejdriv musi
                byt citelna, jazykove stabilni a pripravena na QR scan v realnem
                svete, teprve potom muze neco prodavat.
              </p>
            </div>

            <div className="space-y-4">
              {[
                [
                  "Povinne informace zustavaji nahore",
                  "Pri skenu se uzivatel dostane rovnou k tomu, co potrebuje pro orientaci a compliance.",
                ],
                [
                  "Jedna struktura pro vice jazyku",
                  "Ceska data zustavaji zdrojem pravdy a dalsi mutace se na ni vrstvuji bez chaosu.",
                ],
                [
                  "Volitelne CTA je az sekundarni",
                  "Pairing, e-shop nebo dalsi odkazy muzou existovat, ale netlaci povinnou vrstvu z obrazovky.",
                ],
              ].map(([title, text]) => (
                <div
                  key={title}
                  className="border-b border-[color:var(--border)] pb-4 last:border-b-0"
                >
                  <h4 className="text-xl font-semibold text-[color:var(--foreground)]">
                    {title}
                  </h4>
                  <p className="mt-2 text-base leading-7 text-[color:var(--muted)]">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="start"
        className="px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
      >
        <div className="public-rise mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-[color:var(--border)] bg-[linear-gradient(135deg,rgba(255,251,246,0.9),rgba(246,236,228,0.94))] p-6 shadow-[0_26px_90px_rgba(52,25,12,0.10)] sm:p-8 lg:p-10">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)] lg:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[color:var(--brand)]">
                Finalni CTA
              </p>
              <h2 className="mt-4 font-display text-4xl leading-tight text-[color:var(--foreground)] sm:text-5xl">
                Chcete zacit naostro,
                <br />
                nebo si rovnou otevrit ucet?
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[color:var(--muted)] sm:text-lg">
                Prvni release miri na ceska vinarstvi, ktera chteji udelat poradek
                v digitalni etikete bez dalsiho vlastniho bastleni. Registrace a
                migrace dat maji jasny dalsi krok.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-full bg-[color:var(--brand)] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(125,31,43,0.20)] transition hover:bg-[color:var(--brand-strong)]"
                >
                  Zalozit ucet
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full border border-[color:var(--border)] bg-white/72 px-6 py-3 text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
                >
                  Prihlaseni
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full px-3 py-3 text-sm font-semibold text-[color:var(--muted)] transition hover:text-[color:var(--foreground)]"
                >
                  Prihlaseni
                </Link>
              </div>

              <div className="rounded-[1.8rem] border border-[color:var(--border)] bg-white/74 p-5">
                <p className="text-sm leading-7 text-[color:var(--muted)]">
                  Potrebujete migraci nebo individualni onboarding? Napiste na{" "}
                  <a
                    href="mailto:info@etiketa.wine"
                    className="font-semibold text-[color:var(--brand)] underline decoration-[rgba(125,31,43,0.28)] underline-offset-4"
                  >
                    info@etiketa.wine
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
