// Ícones inline (SVG) — sem dependência externa, leves e consistentes.
import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base = (props: IconProps) => ({
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...props,
})

export const HomeIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
  </svg>
)

export const RouteIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="6" cy="19" r="2" />
    <circle cx="18" cy="5" r="2" />
    <path d="M8 19h6a4 4 0 0 0 0-8H10a4 4 0 0 1 0-8h6" />
  </svg>
)

export const SaladIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M7 21h10a5 5 0 0 0 5-5H2a5 5 0 0 0 5 5Z" />
    <path d="M4 11a8 8 0 0 1 16 0" />
    <path d="M12 3v2" />
  </svg>
)

export const ChartIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 3v18h18" />
    <path d="M7 15l3-4 3 3 4-6" />
  </svg>
)

export const CompassIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="m15 9-2 6-4 2 2-6 4-2Z" />
  </svg>
)

export const LockIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="4" y="10" width="16" height="11" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
)

export const CheckIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

export const FlameIcon = (p: IconProps) => (
  <svg {...base({ fill: 'currentColor', stroke: 'none', ...p })}>
    <path d="M12 2c1 3-1 4-2 6-1 2 0 4 1 4 1 0 2-1 2-3 2 1 3 3 3 5a6 6 0 1 1-12 0c0-3 2-5 3-7 1 2 2 2 2 0 0-2 2-3 3-5Z" />
  </svg>
)

export const PlayIcon = (p: IconProps) => (
  <svg {...base({ fill: 'currentColor', stroke: 'none', ...p })}>
    <path d="M8 5v14l11-7z" />
  </svg>
)

export const ChevronRight = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m9 6 6 6-6 6" />
  </svg>
)

export const ChevronLeft = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m15 6-6 6 6 6" />
  </svg>
)

export const CameraIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
    <circle cx="12" cy="13" r="3.5" />
  </svg>
)

export const UserIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
)

export const WaterIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3c3 4 6 7 6 11a6 6 0 1 1-12 0c0-4 3-7 6-11Z" />
  </svg>
)

export const SparkleIcon = (p: IconProps) => (
  <svg {...base({ fill: 'currentColor', stroke: 'none', ...p })}>
    <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2Z" />
  </svg>
)
