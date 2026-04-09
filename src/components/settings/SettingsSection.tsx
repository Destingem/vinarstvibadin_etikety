"use client";

import type { ReactNode } from "react";

type SettingsSectionProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export default function SettingsSection({
  eyebrow,
  title,
  description,
  children,
}: SettingsSectionProps) {
  return (
    <section className="rounded-[28px] border border-stone-200 bg-[rgba(255,251,247,0.92)] p-5 shadow-[0_18px_60px_rgba(58,34,27,0.08)] backdrop-blur sm:p-7">
      <div className="mb-6 border-b border-stone-200 pb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8d5348]">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#2b1f1a]">
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b5a54]">
          {description}
        </p>
      </div>

      {children}
    </section>
  );
}
