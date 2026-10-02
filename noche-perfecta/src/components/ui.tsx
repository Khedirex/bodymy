import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { copy } from '../data/copy.es'
import { go, type Route } from '../state/router'
import { asset } from '../data/asset'

// Peças visuais compartilhadas. Alvos de toque ≥ 56 px, texto ≥ 16 px.

export function Btn({
  variant = 'primary',
  className = '',
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }) {
  const v =
    variant === 'primary'
      ? 'bg-ambar text-ambar-ink disabled:bg-noche-700 disabled:text-crema-soft'
      : variant === 'secondary'
        ? 'border-2 border-noche-600 bg-noche-800 text-crema'
        : 'text-crema-soft'
  return (
    <button
      {...p}
      className={`min-h-14 rounded-2xl px-5 text-xl font-bold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-ambar/60 active:scale-[0.98] disabled:cursor-not-allowed ${v} ${className}`}
    />
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-3xl bg-noche-800 p-5 ${className}`}>{children}</section>
}

export function Ilustracion({ name, size = 120, className = '' }: { name: string; size?: number; className?: string }) {
  return (
    <img
      src={asset(`/illustrations/${name}.webp`)}
      alt=""
      width={size}
      height={size}
      className={`mx-auto object-contain ${className}`}
      loading="lazy"
      decoding="async"
    />
  )
}

export function PageTitle({ title, subtitle, back }: { title: string; subtitle?: string; back?: Route }) {
  return (
    <header className="mb-5">
      {back ? (
        <button onClick={() => go(back)} className="mb-2 min-h-14 pr-4 text-lg font-bold text-crema-soft" aria-label="Volver">
          ‹ {copy.nav[back as keyof typeof copy.nav] ?? copy.mas.titulo}
        </button>
      ) : null}
      <h1 className="text-3xl font-extrabold leading-tight text-crema">{title}</h1>
      {subtitle ? <p className="mt-1 text-xl text-ambar">{subtitle}</p> : null}
    </header>
  )
}

export function Ancla() {
  return <p className="text-center text-lg font-bold text-ambar">{copy.ancla}</p>
}

/** Escala 1–5 em botões grandes (checkpoint / bitácora). */
export function Escala({
  value,
  onChange,
  labels,
  name,
}: {
  value: number | null
  onChange: (v: number) => void
  labels?: readonly string[]
  name: string
}) {
  return (
    <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label={name}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          role="radio"
          aria-checked={value === n}
          aria-label={labels ? labels[n - 1] : String(n)}
          onClick={() => onChange(n)}
          className={`min-h-14 rounded-2xl text-xl font-extrabold focus:outline-none focus-visible:ring-4 focus-visible:ring-ambar/60 ${
            value === n ? 'bg-ambar text-ambar-ink' : 'bg-noche-700 text-crema'
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  )
}

/** Grupo de opções (minutos / despertares). */
export function Opciones<T extends number>({
  value,
  onChange,
  options,
  name,
}: {
  value: T | null
  onChange: (v: T) => void
  options: readonly { v: number; label: string }[]
  name: string
}) {
  return (
    <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label={name}>
      {options.map((o) => (
        <button
          key={o.v}
          role="radio"
          aria-checked={value === o.v}
          onClick={() => onChange(o.v as T)}
          className={`min-h-14 rounded-2xl text-xl font-extrabold focus:outline-none focus-visible:ring-4 focus-visible:ring-ambar/60 ${
            value === o.v ? 'bg-ambar text-ambar-ink' : 'bg-noche-700 text-crema'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
