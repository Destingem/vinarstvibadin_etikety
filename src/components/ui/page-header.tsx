import React from 'react';

import { cn } from '@/components/ui/cn';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  meta,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'relative overflow-hidden rounded-[32px] border border-stone-200/80 bg-[linear-gradient(135deg,rgba(246,241,234,0.96),rgba(255,255,255,0.98))] px-5 py-6 shadow-[0_24px_60px_rgba(58,41,36,0.08)] sm:px-7 sm:py-8',
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-[#7c2332]/10 blur-3xl"
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7c2332]">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">{description}</p>
          ) : null}
          {meta ? <div className="mt-4 flex flex-wrap gap-2">{meta}</div> : null}
        </div>

        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </header>
  );
}
