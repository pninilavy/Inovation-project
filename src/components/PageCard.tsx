// עטיפה לעמודים עם רקע לבן וצל עדין
import type { ReactNode } from 'react'

export default function PageCard({ title, children }:{
  title?: string; children: ReactNode
}) {
  return (
    <section className="bg-white rounded-2xl shadow-[0_6px_18px_rgba(0,0,0,.08)] p-6">
      {title && <h1 className="text-xl font-semibold text-purple-700 mb-4">{title}</h1>}
      {children}
    </section>
  )
}
