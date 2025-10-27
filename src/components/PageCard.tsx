// PageCard.tsx
import type { ReactNode } from 'react';

interface PageCardProps {
  title?: string;
  children: ReactNode;
}

export default function PageCard({ title, children }: PageCardProps) {
  return (
    <section className="bg-brand-900 rounded-2xl shadow-[0_6px_18px_rgba(0,0,0,.08)] p-6">
      {title && (
        <h1 className="text-xl font-semibold text-white mb-4">
          {title}
        </h1>
      )}
      <div className="text-white">
        {children}
      </div>
    </section>
  );
}
