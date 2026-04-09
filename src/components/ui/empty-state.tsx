import React from 'react';

import { cn } from '@/components/ui/cn';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'rounded-[24px] border border-dashed border-stone-300 bg-stone-50/80 px-5 py-8 text-center',
        className
      )}
    >
      {icon ? (
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-stone-500 shadow-sm">
          {icon}
        </div>
      ) : null}
      <h3 className="mt-4 text-lg font-semibold text-stone-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-600">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
