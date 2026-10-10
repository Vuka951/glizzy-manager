import type { ReactNode } from 'react';

export default function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-center text-xs font-bold uppercase tracking-[0.3em] text-sky-300">
      {children}
    </h2>
  );
}
