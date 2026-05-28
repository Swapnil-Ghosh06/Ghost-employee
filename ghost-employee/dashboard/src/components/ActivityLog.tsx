import { useState, useEffect, useRef, useCallback } from 'react'
import { Search } from 'lucide-react'
import type { LogEntry } from '@/types'

interface ActivityLogProps {
  entries: LogEntry[]
  loading?: boolean
}

type LogLevel = 'ALL' | 'INFO' | 'WARN' | 'ERROR'

export default function ActivityLog({ entries, loading }: ActivityLogProps) {
  const [filter, setFilter]   = useState<LogLevel>('ALL')
  const [search, setSearch]   = useState('')
  const scrollRef             = useRef<HTMLDivElement>(null)
  const rowRefs               = useRef<Map<string, HTMLDivElement>>(new Map())

  useEffect(() => {
    const latest = entries[0]
    if (!latest) return
    const el = rowRefs.current.get(latest.id)
    if (el) {
      import('gsap').then(({ default: gsap }) => {
        gsap.from(el, { y: -10, opacity: 0, duration: 0.25, ease: 'power2.out' })
      })
    }
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [entries])

  const filtered = entries.filter((e) => {
    const matchLevel = filter === 'ALL' || e.level === filter
    const q = search.toLowerCase()
    const matchSearch = !q ||
      e.message.toLowerCase().includes(q) ||
      e.ghost_name.toLowerCase().includes(q) ||
      e.tool_used.toLowerCase().includes(q)
    return matchLevel && matchSearch
  })

  const setRef = useCallback((id: string) => (el: HTMLDivElement | null) => {
    if (el) rowRefs.current.set(id, el)
  }, [])

  return (
    <div
      className="glass-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <span className="live-dot" />
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: 'var(--success)',
            letterSpacing: '0.06em',
            fontWeight: 500,
          }}
        >
          LIVE
        </span>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 17,
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginLeft: 4,
          }}
        >
          Ghost Activity
        </span>
      </div>

      {/* ── Filter + Search ─────────────────────────────────── */}
      <div
        style={{
          padding: '14px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        {(['ALL', 'INFO', 'WARN', 'ERROR'] as LogLevel[]).map((lvl) => (
          <button
            key={lvl}
            onClick={() => setFilter(lvl)}
            className={`filter-pill${filter === lvl ? ' active' : ''}`}
          >
            {lvl}
          </button>
        ))}

        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#f9f5f0',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 12px',
          }}
        >
          <Search size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search logs..."
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              width: 150,
            }}
          />
        </div>
      </div>

      {/* ── Log entries ─────────────────────────────────────── */}
      <div
        ref={scrollRef}
        style={{ flex: 1, overflowY: 'auto', maxHeight: 400, padding: '6px 0' }}
      >
        {loading && (
          <div style={{ padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="skeleton"
                style={{ height: 13, width: `${60 + (i % 3) * 15}%` }}
              />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div
            style={{
              padding: '28px 16px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
            }}
          >
            No entries match your filter.
          </div>
        )}

        {!loading && filtered.map((entry) => (
          <div
            key={entry.id}
            ref={setRef(entry.id)}
            style={{
              display: 'flex',
              gap: 10,
              padding: '4px 16px',
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              lineHeight: 1.7,
            }}
          >
            {/* timestamp */}
            <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {new Date(entry.timestamp).toLocaleTimeString('en-US', { hour12: false })}
            </span>

            {/* ghost name */}
            <span style={{ color: 'var(--accent)', fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0 }}>
              {entry.ghost_name}
            </span>

            {/* message */}
            <span style={{ color: 'var(--text-primary)' }}>
              {entry.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
