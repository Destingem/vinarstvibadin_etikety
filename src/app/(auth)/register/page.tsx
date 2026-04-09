import Link from "next/link";
import RegisterForm from "@/components/RegisterForm";

export const metadata = {
  title: "Registrace",
  description:
    "Vytvorte ucet pro vase vinarstvi a spuste digitalni etikety, QR a verejnou etiketu.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterPage() {
  return (
    <section className="space-y-8">
      <div className="space-y-4">
        <span className="inline-flex items-center rounded-full border border-[color:var(--border)] bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--brand)]">
          Registrace vinarstvi
        </span>
        <div className="space-y-3">
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">
            Zalozte ucet
            <br />
            pro jedno vinarstvi.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-[color:var(--muted)] sm:text-lg">
            Registrace je vstup do ceskeho workflow pro vino, sarz, QR a
            verejnou etiketu. Po vytvoreni uctu se rovnou dostanete do
            dashboardu a nastavite identitu vinarstvi.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Verejna URL", "slug a identita vinarstvi v jednom nastaveni"],
          ["QR a export", "jedna struktura dat pro web i tisk"],
          ["CZ-first rytmus", "texty a workflow navrzene pro cesky provoz"],
        ].map(([title, text]) => (
          <div
            key={title}
            className="rounded-[1.7rem] border border-[color:var(--border)] bg-white/68 px-4 py-4"
          >
            <p className="text-sm font-semibold text-[color:var(--foreground)]">
              {title}
            </p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
              {text}
            </p>
          </div>
        ))}
      </div>

      <RegisterForm />

      <div className="border-t border-[color:var(--border)] pt-4 text-sm text-[color:var(--muted)]">
        <p>
          Uz mate ucet?{" "}
          <Link
            href="/login"
            className="font-semibold text-[color:var(--brand)] transition hover:text-[color:var(--brand-strong)]"
          >
            Prihlaste se
          </Link>
        </p>
      </div>
    </section>
  );
}
