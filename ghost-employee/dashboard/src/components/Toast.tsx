import { useEffect, useRef } from 'react'
import { CheckCircle, XCircle, Info } from 'lucide-react'
import gsap from 'gsap'

export interface ToastData {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastProps {
  toast: ToastData
  onDismiss: (id: string) => void
}

const TOAST_STYLES = {
  success: { color: '#2d6a4f', border: 'rgba(45, 106, 79, 0.2)' },
  error:   { color: '#9b1c1c', border: 'rgba(155, 28, 28, 0.2)' },
  info:    { color: '#561C24', border: 'var(--border)' },
}

export default function Toast({ toast, onDismiss }: ToastProps) {
  const ref = useRef<HTMLDivElement>(null)
  const styles = TOAST_STYLES[toast.type]

  useEffect(() => {
    const el = ref.current
    if (!el) return
    gsap.fromTo(el, { x: 50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.25, ease: 'power2.out' })
    const timer = setTimeout(() => {
      gsap.to(el, { x: 50, opacity: 0, duration: 0.2, onComplete: () => onDismiss(toast.id) })
    }, 3000)
    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  const Icon = toast.type === 'success' ? CheckCircle : toast.type === 'error' ? XCircle : Info

  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: '#ffffff',
        border: `1px solid ${styles.border}`,
        borderRadius: 'var(--radius-sm)',
        padding: '10px 14px',
        minWidth: 220,
        maxWidth: 340,
        boxShadow: '0 4px 16px rgba(86, 28, 36, 0.1)',
      }}
    >
      <Icon size={14} style={{ color: styles.color, flexShrink: 0 }} />
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-primary)' }}>
        {toast.message}
      </span>
    </div>
  )
}
