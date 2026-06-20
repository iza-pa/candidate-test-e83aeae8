import { ReactNode } from 'react'

type NotificationType = 'error' | 'warning' | 'success'

const TYPE_STYLES: Record<NotificationType, string> = {
  error: 'bg-red-50 border-red-200 text-red-700',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  success: 'bg-green-50 border-green-200 text-green-700',
}

type NotificationProps = {
  type: NotificationType
  children: ReactNode
}

export function Notification({ type, children }: NotificationProps) {
  return <div className={`border rounded px-4 py-3 text-sm ${TYPE_STYLES[type]}`}>{children}</div>
}
