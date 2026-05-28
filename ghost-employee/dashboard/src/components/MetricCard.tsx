import { useRef, useEffect } from 'react'
import { animateCountTo } from '@/animations/countTo'
import { formatCurrency } from '@/lib/utils'

interface MetricCardProps {
  label: string
  value: number
  format?: 'number' | 'currency' | 'integer'
  icon?: React.ReactNode
  loading?: boolean
}

export default function MetricCard({ label, value, format = 'integer', icon, loading }: MetricCardProps) {
  const numberRef = useRef<HTMLDivElement>(null)

  const formatter = (n: number): string => {
    if (format === 'currency') return formatCurrency(n)
    if (format === 'number')   return n.toFixed(2)
    return Math.round(n).toString()
  }

  useEffect(() => {
    if (!loading && numberRef.current) {
      animateCountTo(numberRef.current, value, 1.5, formatter)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, loading])

  if (loading) {
    return (
      <div
        className="card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div className="skeleton" style={{ height: 11, width: '40%' }} />
        <div className="skeleton" style={{ height: 32, width: '65%' }} />
      </div>
    )
  }

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        cursor: 'default',
      }}
    >
      {icon && (
        <div className="metric-icon">
          {icon}
        </div>
      )}

      <div ref={numberRef} className="metric-number">
        {formatter(0)}
      </div>

      <div className="metric-label">{label}</div>
    </div>
  )
}
