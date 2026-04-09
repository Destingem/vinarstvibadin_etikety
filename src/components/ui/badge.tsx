import React from 'react';

import { cn } from '@/components/ui/cn';

type BadgeTone = 'burgundy' | 'neutral' | 'success' | 'warning';

const toneClasses: Record<BadgeTone, string> = {
  burgundy: 'border border-[#7c2332]/15 bg-[#7c2332]/10 text-[#6f1d2b]',
  neutral: 'border border-stone-200 bg-stone-100 text-stone-700',
  success: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border border-amber-200 bg-amber-50 text-amber-700',
};

interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}

export function Badge({ children, tone = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]',
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
