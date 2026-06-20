import { ReactNode } from 'react'

type ModalProps = {
  onClose: () => void
  children: ReactNode
}

export function Modal({ onClose, children }: ModalProps) {
  return (
    <div
      className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200 rounded-lg p-6 w-full max-w-md mx-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 text-xl leading-none"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  )
}
