import { Edit2, Trash2 } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import type { GhostRole } from '@/types'

interface GhostCardProps {
  ghost: GhostRole
  onEdit: (ghost: GhostRole) => void
  onDelete: (id: string) => void
}

export default function GhostCard({ ghost, onEdit, onDelete }: GhostCardProps) {
  const preview = ghost.role_description.length > 90
    ? ghost.role_description.slice(0, 90) + '…'
    : ghost.role_description

  return (
    <div
      className="card"
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: 'var(--accent-dim)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 15,
              flexShrink: 0,
            }}
          >
            👻
          </div>
          <div>
            <div
              style={{
                fontWeight: 600,
                fontSize: 13,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {ghost.name}
            </div>
            <div style={{ marginTop: 2 }}>
              <StatusBadge status={ghost.status} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => onEdit(ghost)}
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 200ms ease',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.color = 'var(--accent)'
              el.style.borderColor = 'var(--border-strong)'
              el.style.background = 'var(--accent-dim)'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.color = 'var(--text-muted)'
              el.style.borderColor = 'var(--border)'
              el.style.background = 'transparent'
            }}
            title="Edit configuration"
          >
            <Edit2 size={12} />
          </button>
          <button
            onClick={() => onDelete(ghost.id)}
            style={{
              background: 'transparent',
              border: '1px solid rgba(155, 28, 28, 0.18)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px',
              cursor: 'pointer',
              color: 'var(--error)',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 200ms ease',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.background = 'rgba(155, 28, 28, 0.06)'
              el.style.borderColor = 'rgba(155, 28, 28, 0.3)'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.background = 'transparent'
              el.style.borderColor = 'rgba(155, 28, 28, 0.18)'
            }}
            title="Delete ghost employee"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Role preview */}
      <p
        style={{
          fontSize: 12,
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-sans)',
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        {preview}
      </p>

      {/* Channel tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {ghost.channels.map((ch) => (
          <span
            key={ch}
            style={{
              background: 'var(--accent-dim)',
              color: 'var(--accent)',
              borderRadius: 'var(--radius-sm)',
              padding: '3px 8px',
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              fontWeight: 500,
            }}
          >
            {ch}
          </span>
        ))}
      </div>

      {/* Active hours */}
      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
        ACTIVE WORK HOURS: {ghost.active_hours_from} – {ghost.active_hours_to}
      </div>
    </div>
  )
}
