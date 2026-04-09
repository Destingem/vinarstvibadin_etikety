import Link from 'next/link';
import React from 'react';

import { cn } from '@/components/ui/cn';

type SharedButtonProps = {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
};

type LinkButtonProps = SharedButtonProps & {
  href: string;
  target?: string;
  rel?: string;
};

type NativeButtonProps = SharedButtonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

type ActionButtonProps = LinkButtonProps | NativeButtonProps;

function buttonClasses(variant: 'primary' | 'secondary', fullWidth?: boolean, className?: string) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors duration-200',
    fullWidth && 'w-full',
    variant === 'primary'
      ? 'bg-[#6f1d2b] text-white shadow-[0_14px_35px_rgba(111,29,43,0.18)] hover:bg-[#5c1825]'
      : 'border border-stone-300 bg-white text-stone-800 hover:border-[#7c2332]/30 hover:text-[#6f1d2b]',
    className
  );
}

function ActionButton({
  children,
  className,
  fullWidth,
  variant,
  ...props
}: ActionButtonProps & { variant: 'primary' | 'secondary' }) {
  const classes = buttonClasses(variant, fullWidth, className);

  if ('href' in props && props.href) {
    const rel = props.target === '_blank' && !props.rel ? 'noreferrer noopener' : props.rel;

    return (
      <Link href={props.href} className={classes} target={props.target} rel={rel}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}

export function PrimaryButton(props: ActionButtonProps) {
  return <ActionButton variant="primary" {...props} />;
}

export function SecondaryButton(props: ActionButtonProps) {
  return <ActionButton variant="secondary" {...props} />;
}
