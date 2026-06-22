import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── IOC Defanging ───────────────────────────────────────────
const DEFANG_MAP: Record<string, (v: string) => string> = {
  url:    (v) => v.replace(/^https?:\/\//i, 'hxxp://').replace(/\./g, '[.]'),
  domain: (v) => v.replace(/\./g, '[.]'),
  ip:     (v) => v.replace(/\./g, '[.]'),
  email:  (v) => v.replace('@', '[@]').replace(/\./g, '[.]'),
  hash:   (v) => v,
}

export function defang(value: string, type: string): string {
  const fn = DEFANG_MAP[type]
  return fn ? fn(value) : value
}
