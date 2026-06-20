import { ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'success' | 'danger'
type Size = 'sm' | 'md'

const VARIANT_STYLES: Record<Variant, string> = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
  secondary: 'text-slate-600 hover:bg-slate-100',
  success: 'bg-green-100 text-green-800 hover:bg-green-200',
  danger: 'bg-red-100 text-red-800 hover:bg-red-200',
}

const SIZE_STYLES: Record<Size, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-4 py-2 text-sm',
}

type ButtonProps = {
  variant: Variant
  size?: Size
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}

export function Button({ variant, size = 'md', disabled, onClick, children }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded font-medium disabled:opacity-60 disabled:cursor-not-allowed ${SIZE_STYLES[size]} ${VARIANT_STYLES[variant]}`}
    >
      {children}
    </button>
  )
}
