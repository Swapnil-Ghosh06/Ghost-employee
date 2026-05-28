import { useRef, useEffect } from 'react'
import { pulseLoop } from '@/animations/pulse'

interface StatusBadgeProps {
  status: 'online' | 'offline' | 'busy'
  showLabel?: boolean
}

const STATUS_CONFIG = {
  online:  { color: '#2d6a4f', label: 'Online' },
  offline: { color: '#C7B7A3', label: 'Offline' },
  busy:    { color: '#b5451b', label: 'Processing' },
}

export default function StatusBadge({ status, showLabel = true }: StatusBadgeProps) {
  const dotRef = useRef<HTMLSpanElement>(null)
  const { color, label } = STATUS_CONFIG[status]

  useEffect(() => {
    if (status === 'online') {
      const tween = pulseLoop(dotRef.current)
      return () => { tween?.kill() }
    }
  }, [status])

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontSize: 11,
        fontFamily: 'var(--font-sans)',
      }}
    >
      <span
        ref={dotRef}
        style={{
          display: 'inline-block',
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: color,
          flexShrink: 0,
        }}
      />
      {showLabel && (
        <span style={{ color, fontWeight: 500 }}>{label}</span>
      )}
    </span>
  )
}
