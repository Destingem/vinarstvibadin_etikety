import React from 'react';

import { cn } from '@/components/ui/cn';

type SurfaceTone = 'default' | 'muted' | 'accent';
type SurfacePadding = 'none' | 'sm' | 'md' | 'lg';

const toneClasses: Record<SurfaceTone, string> = {
  default: 'bg-white/95',
  muted: 'bg-[#f6f1ea]/90',
  accent:
    'bg-[radial-gradient(circle_at_top_right,_rgba(111,29,43,0.12),_rgba(255,255,255,0.98)_48%)]',
};

const paddingClasses: Record<SurfacePadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
};

interface SurfaceProps {
  children?: React.ReactNode;
  className?: string;
  tone?: SurfaceTone;
  padding?: SurfacePadding;
}

export function Surface({
  children,
  className,
  tone = 'default',
  padding = 'md',
}: SurfaceProps) {
  return (
    <section
      className={cn(
        'rounded-[28px] border border-stone-200/80 shadow-[0_18px_45px_rgba(58,41,36,0.06)]',
        toneClasses[tone],
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </section>
  );
}
