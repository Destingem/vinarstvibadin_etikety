import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Surface } from '@/components/ui/surface';
import { cn } from '@/components/ui/cn';

type MetricTone = 'accent' | 'neutral' | 'warning';

const iconToneClasses: Record<MetricTone, string> = {
  accent: 'bg-[#7c2332]/10 text-[#6f1d2b]',
  neutral: 'bg-stone-100 text-stone-700',
  warning: 'bg-amber-100 text-amber-700',
};

const surfaceToneMap: Record<MetricTone, 'accent' | 'default' | 'muted'> = {
  accent: 'accent',
  neutral: 'default',
  warning: 'muted',
};

interface MetricCardProps {
  label: string;
  value: string | number;
  detail?: string;
  icon?: React.ReactNode;
  tone?: MetricTone;
  badge?: React.ReactNode;
  className?: string;
}

export function MetricCard({
  label,
  value,
  detail,
  icon,
  tone = 'neutral',
  badge,
  className,
}: MetricCardProps) {
  return (
    <Surface tone={surfaceToneMap[tone]} padding="sm" className={cn('min-h-[156px]', className)}>
      <div className="flex h-full flex-col justify-between gap-6">
        <div className="flex items-start justify-between gap-3">
          <div
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-semibold',
              iconToneClasses[tone]
            )}
          >
            {icon}
          </div>
          {badge ? <Badge tone={tone === 'warning' ? 'warning' : 'neutral'}>{badge}</Badge> : null}
        </div>

        <div>
          <p className="text-sm font-medium text-stone-600">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">{value}</p>
          {detail ? <p className="mt-2 text-sm text-stone-500">{detail}</p> : null}
        </div>
      </div>
    </Surface>
  );
}
