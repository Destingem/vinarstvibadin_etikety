"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  summary: string;
  icon: React.ReactNode;
  matches: (pathname: string) => boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const ADMIN_EMAILS = [
  'admin@etiketa.wine',
  'ondrej.zaplatilek@gmail.com',
  'ondrej.zaplatilek@bytedev.cz'
];

const exactMatch = (href: string) => (pathname: string) => pathname === href;
const prefixMatch = (href: string) => (pathname: string) =>
  pathname === href || pathname.startsWith(`${href}/`);
const wineWorkspaceMatch = (pathname: string) =>
  pathname.startsWith('/dashboard/wines/') && pathname !== '/dashboard/wines';

const createNavigation = (isAdmin: boolean): NavSection[] => {
  const sections: NavSection[] = [
    {
      title: 'Workspace',
      items: [
        {
          name: 'Dashboard Home',
          href: '/dashboard',
          summary: 'Přehled účtu, katalogu a dalších kroků.',
          matches: exactMatch('/dashboard'),
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2 7-7 7 7 2 2M5 10v9a1 1 0 001 1h3m10-10v9a1 1 0 01-1 1h-3m-6 0h6" />
            </svg>
          ),
        },
        {
          name: 'Catalog',
          href: '/dashboard/wines',
          summary: 'Seznam vín, šarží a základní stav katalogu.',
          matches: exactMatch('/dashboard/wines'),
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 4h11a2 2 0 012 2v13a1 1 0 01-1.447.894L12 17l-5.553 2.894A1 1 0 015 19V6a2 2 0 012-2z" />
            </svg>
          ),
        },
        {
          name: 'Wine Workspace',
          href: '/dashboard/wines/new',
          summary: 'Detail, editace a příprava nového nebo rozpracovaného vína.',
          matches: wineWorkspaceMatch,
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 4h6m-5 4h4m-5 4h6m-3 8V5m0 15l4-4m-4 4l-4-4" />
            </svg>
          ),
        },
      ],
    },
    {
      title: 'Delivery',
      items: [
        {
          name: 'QR & Export',
          href: '/dashboard/qrcodes',
          summary: 'QR výstupy, stažení podkladů a příprava pro etikety.',
          matches: prefixMatch('/dashboard/qrcodes'),
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 5h4v4H5V5zm10 0h4v4h-4V5zM5 15h4v4H5v-4zm10 0h1m-1-5h4m-9 9v-4m4 4h5m-5 0v-5" />
            </svg>
          ),
        },
      ],
    },
    {
      title: 'Intelligence',
      items: [
        {
          name: 'Analytics',
          href: '/dashboard/analytics',
          summary: 'Sledování načtení QR a chování kolem veřejných etiket.',
          matches: prefixMatch('/dashboard/analytics'),
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 19V9m7 10V5m7 14v-7" />
            </svg>
          ),
        },
        {
          name: 'API Access',
          href: '/dashboard/api',
          summary: 'Klíče, integrace a technický přístup do systému.',
          matches: prefixMatch('/dashboard/api'),
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 14l-2 2a3 3 0 11-4-4l2-2m8 0l2-2a3 3 0 114 4l-2 2m-8 0l4-4" />
            </svg>
          ),
        },
      ],
    },
    {
      title: 'System',
      items: [
        {
          name: 'Settings',
          href: '/dashboard/settings',
          summary: 'Profil vinařství, heslo a základní nastavení účtu.',
          matches: prefixMatch('/dashboard/settings'),
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317a1 1 0 011.9 0l.345 1.38a1 1 0 00.95.757h1.41a1 1 0 01.949.684l.48 1.435a1 1 0 00.694.657l1.39.347a1 1 0 01.001 1.94l-1.39.347a1 1 0 00-.694.657l-.48 1.435a1 1 0 01-.95.684h-1.409a1 1 0 00-.95.757l-.345 1.38a1 1 0 01-1.9 0l-.345-1.38a1 1 0 00-.95-.757H8.07a1 1 0 01-.95-.684l-.48-1.435a1 1 0 00-.694-.657l-1.39-.347a1 1 0 01.001-1.94l1.39-.347a1 1 0 00.694-.657l.48-1.435a1 1 0 01.95-.684h1.409a1 1 0 00.95-.757l.345-1.38z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
            </svg>
          ),
        },
      ],
    },
  ];

  if (isAdmin) {
    sections.push({
      title: 'Admin',
      items: [
        {
          name: 'Admin Ops',
          href: '/dashboard/admin',
          summary: 'Správa uživatelů, členství a interních provozních zásahů.',
          matches: prefixMatch('/dashboard/admin'),
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3l7 4v5c0 4.5-2.9 7.9-7 9-4.1-1.1-7-4.5-7-9V7l7-4z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.5 12.5l1.8 1.8 3.2-3.8" />
            </svg>
          ),
        },
      ],
    });
  }

  return sections;
};

const findActiveItem = (sections: NavSection[], pathname: string) => {
  for (const section of sections) {
    for (const item of section.items) {
      if (item.matches(pathname)) {
        return { section, item };
      }
    }
  }

  return { section: sections[0], item: sections[0].items[0] };
};

function UserInitial({ name }: { name?: string }) {
  const initial = name?.trim().charAt(0).toUpperCase() || 'U';

  return (
    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[color:var(--brand)] text-sm font-semibold text-white shadow-[0_18px_50px_rgba(125,31,43,0.20)]">
      {initial}
    </div>
  );
}

function MobileNavItem({
  item,
  pathname,
  onClick,
}: {
  item: NavItem;
  pathname: string;
  onClick: () => void;
}) {
  const active = item.matches(pathname);

  return (
    <Link
      href={item.href}
      onClick={onClick}
        className={`block rounded-[1.25rem] border px-4 py-3 transition ${
        active
          ? 'border-[rgba(125,31,43,0.18)] bg-[rgba(125,31,43,0.08)] text-[color:var(--brand-strong)]'
          : 'border-transparent bg-white/40 text-[color:var(--foreground)] hover:border-[color:var(--border)] hover:bg-white/80'
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 ${active ? 'text-[color:var(--brand)]' : 'text-[color:var(--muted)]'}`}
        >
          {item.icon}
        </span>
        <div className="min-w-0">
          <div className="text-sm font-semibold">{item.name}</div>
          <div className="mt-1 text-xs leading-5 text-[color:var(--muted)]">
            {item.summary}
          </div>
        </div>
      </div>
    </Link>
  );
}

function DesktopNavItem({
  item,
  pathname,
}: {
  item: NavItem;
  pathname: string;
}) {
  const active = item.matches(pathname);

  return (
    <Link
      href={item.href}
      className={`group flex items-start gap-3 rounded-[1.2rem] border px-4 py-3 transition ${
        active
          ? 'border-[rgba(125,31,43,0.18)] bg-[rgba(125,31,43,0.08)] text-[color:var(--brand-strong)] shadow-[0_18px_50px_rgba(52,25,12,0.06)]'
          : 'border-transparent text-[color:var(--foreground)] hover:border-[color:var(--border)] hover:bg-white/80'
      }`}
    >
      <span
        className={`mt-0.5 transition ${
          active ? 'text-[color:var(--brand)]' : 'text-[color:var(--muted)] group-hover:text-[color:var(--foreground)]'
        }`}
      >
        {item.icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{item.name}</span>
        <span className="mt-1 block text-xs leading-5 text-[color:var(--muted)]">
          {item.summary}
        </span>
      </span>
    </Link>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout, isDemo } = useAuth();

  const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email) : false;
  const navigation = createNavigation(isAdmin);
  const active = findActiveItem(navigation, pathname);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="relative min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)]">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(125,31,43,0.08),transparent_28%),radial-gradient(circle_at_top_right,rgba(165,101,30,0.07),transparent_24%),linear-gradient(180deg,rgba(255,252,248,0.4),rgba(255,252,248,0.75))]" />
        <div className="absolute left-0 top-0 h-[22rem] w-[22rem] rounded-full bg-[rgba(125,31,43,0.06)] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[24rem] w-[24rem] rounded-full bg-[rgba(165,101,30,0.08)] blur-3xl" />
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-[rgba(36,20,15,0.36)] backdrop-blur-sm"
            aria-hidden="true"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="relative flex h-full w-full max-w-sm flex-col border-r border-[color:var(--border)] bg-[linear-gradient(180deg,rgba(255,251,247,0.96),rgba(248,241,233,0.96))] p-5 shadow-[0_24px_80px_rgba(36,20,15,0.18)]">
            <div className="flex items-start justify-between gap-4 border-b border-[color:var(--border)] pb-5">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[color:var(--brand)] text-base font-semibold text-white shadow-[0_18px_50px_rgba(125,31,43,0.20)]">
                  E
                </div>
                <div>
                  <p className="font-display text-2xl leading-none">etiketa.wine</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.24em] text-[color:var(--muted)]">
                    dashboard shell
                  </p>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full border border-[color:var(--border)] bg-white/80 text-[color:var(--foreground)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
              >
                <span className="sr-only">Zavřít menu</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-[color:var(--border)] bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">
                Aktuální sekce
              </p>
              <p className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
                {active.item.name}
              </p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                {active.item.summary}
              </p>
            </div>

            <nav className="mt-6 flex-1 space-y-6 overflow-y-auto pr-1">
              {navigation.map((section) => (
                <div key={section.title}>
                  <p className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-[color:var(--muted)]">
                    {section.title}
                  </p>
                  <div className="space-y-2">
                    {section.items.map((item) => (
                      <MobileNavItem
                        key={item.name}
                        item={item}
                        pathname={pathname}
                        onClick={() => setIsMobileMenuOpen(false)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            <div className="mt-6 rounded-[1.5rem] border border-[color:var(--border)] bg-white/75 p-4">
              <div className="flex items-center gap-3">
                <UserInitial name={user?.name} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[color:var(--foreground)]">
                    {user?.name || 'Účet'}
                  </p>
                  <p className="truncate text-xs text-[color:var(--muted)]">
                    {user?.email}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-[color:var(--border)] bg-white/80 px-4 py-2.5 text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
              >
                Odhlásit
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative hidden lg:fixed lg:inset-y-0 lg:z-30 lg:flex lg:w-[19rem] lg:flex-col">
        <aside className="flex h-full flex-col border-r border-[color:var(--border)] bg-[linear-gradient(180deg,rgba(255,251,247,0.92),rgba(248,241,233,0.9))] px-5 py-6 backdrop-blur-xl">
          <div className="rounded-[1.9rem] border border-[color:var(--border)] bg-white/72 p-5 shadow-[0_24px_80px_rgba(36,20,15,0.08)]">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[color:var(--brand)] text-lg font-semibold text-white shadow-[0_18px_50px_rgba(125,31,43,0.20)]">
                E
              </div>
              <div>
                <p className="font-display text-3xl leading-none">etiketa.wine</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.28em] text-[color:var(--muted)]">
                  app workspace
                </p>
              </div>
            </Link>

            <div className="mt-5 border-t border-[color:var(--border)] pt-4">
              <p className="text-sm leading-6 text-[color:var(--muted)]">
                Operativní shell pro katalog, QR, analytiku a technický přístup.
              </p>
            </div>

            {isDemo && (
              <div className="mt-4 inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-800">
                Demo účet
              </div>
            )}
          </div>

          <nav className="mt-6 flex-1 space-y-6 overflow-y-auto pr-1">
            {navigation.map((section) => (
              <div key={section.title}>
                <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-[color:var(--muted)]">
                  {section.title}
                </p>
                <div className="space-y-2">
                  {section.items.map((item) => (
                    <DesktopNavItem key={item.name} item={item} pathname={pathname} />
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="mt-6 rounded-[1.6rem] border border-[color:var(--border)] bg-white/72 p-4 shadow-[0_18px_50px_rgba(36,20,15,0.06)]">
            <div className="flex items-center gap-3">
              <UserInitial name={user?.name} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[color:var(--foreground)]">
                  {user?.name || 'Účet'}
                </p>
                <p className="truncate text-xs text-[color:var(--muted)]">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-[color:var(--border)] bg-white/85 px-4 py-2.5 text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
            >
              Odhlásit
            </button>
          </div>
        </aside>
      </div>

      <div className="relative flex min-h-screen flex-col lg:ml-[19rem]">
        <header className="sticky top-0 z-40 border-b border-[color:var(--border)] bg-[rgba(255,251,247,0.78)] backdrop-blur-xl">
          <div className="flex min-h-[4.5rem] items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-full border border-[color:var(--border)] bg-white/78 text-[color:var(--foreground)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)] lg:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <span className="sr-only">Otevřít menu</span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[color:var(--muted)]">
                {active.section.title}
              </p>
              <div className="mt-1 flex flex-col gap-1 lg:flex-row lg:items-baseline lg:gap-3">
                <h1 className="truncate text-xl font-semibold text-[color:var(--foreground)]">
                  {active.item.name}
                </h1>
                <p className="truncate text-sm text-[color:var(--muted)]">
                  {active.item.summary}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isAdmin && (
                <span className="hidden rounded-full border border-[color:var(--border)] bg-white/75 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)] sm:inline-flex">
                  Admin
                </span>
              )}
              {isDemo && (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-800">
                  Demo
                </span>
              )}
              <div className="hidden min-w-0 text-right md:block">
                <p className="truncate text-sm font-semibold text-[color:var(--foreground)]">
                  {user?.name || 'Účet'}
                </p>
                <p className="truncate text-xs text-[color:var(--muted)]">
                  {user?.email}
                </p>
              </div>
              <button
                onClick={logout}
                className="inline-flex items-center justify-center rounded-full border border-[color:var(--border)] bg-white/82 px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
                title="Odhlásit"
              >
                <span className="hidden sm:inline">Odhlásit</span>
                <svg className="h-4 w-4 sm:ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H9m4 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <main className="relative flex-1 px-0 pb-8 pt-4 sm:pt-6 lg:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}
