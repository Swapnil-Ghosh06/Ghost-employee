import * as React from 'react'
import { useState } from 'react'
import { formatCurrency, formatDuration, timeAgo } from '@/lib/utils'
import type { Task } from '@/types'

interface WorkLogTableProps {
  tasks: Task[]
  loading?: boolean
}

const STATUS_BADGE: Record<Task['status'], string> = {
  completed: 'badge-success',
  pending:   'badge-warning',
  failed:    'badge-error',
}

function StatusPill({ status }: { status: Task['status'] }) {
  return (
    <span
      className={STATUS_BADGE[status]}
      style={{
        fontSize: 12,
        fontFamily: 'var(--font-sans)',
        fontWeight: 500,
        whiteSpace: 'nowrap',
        display: 'inline-block',
      }}
    >
      {status}
    </span>
  )
}

function ExpandedRow({ task }: { task: Task }) {
  return (
    <tr>
      <td
        colSpan={8}
        style={{
          background: '#f9f3ec',
          padding: '24px 28px',
          borderBottom: '1px solid var(--border)',
          borderLeft: '4px solid var(--accent)',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          {/* Request */}
          <div>
            <div
              style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 10,
              }}
            >
              Request
            </div>
            <pre
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                color: 'var(--text-primary)',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
                margin: 0,
              }}
            >
              {task.request}
            </pre>
          </div>

          {/* Response */}
          <div>
            <div
              style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 10,
              }}
            >
              Response
            </div>
            <pre
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                color: 'var(--text-primary)',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
                margin: 0,
              }}
            >
              {task.response || '(no response yet)'}
            </pre>
          </div>
        </div>

        {/* Reasoning chain */}
        {task.reasoning && (
          <div style={{ marginTop: 20 }}>
            <div
              style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 10,
              }}
            >
              Reasoning Chain
            </div>
            <pre
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                color: 'var(--accent)',
                lineHeight: 1.7,
                background: 'var(--accent-dim)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px 18px',
                border: '1px solid var(--border)',
                whiteSpace: 'pre-wrap',
                margin: 0,
              }}
            >
              {task.reasoning}
            </pre>
          </div>
        )}
      </td>
    </tr>
  )
}

export default function WorkLogTable({ tasks, loading }: WorkLogTableProps) {
  const [expandedId,   setExpandedId]   = useState<string | null>(null)
  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState<Task['status'] | 'all'>('all')

  const filtered = tasks.filter((t) => {
    const matchStatus = statusFilter === 'all' || t.status === statusFilter
    const q = search.toLowerCase()
    const matchSearch = !q ||
      t.request.toLowerCase().includes(q) ||
      t.channel.toLowerCase().includes(q) ||
      t.role_name.toLowerCase().includes(q) ||
      t.tool_used.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  const COLUMNS = ['Time', 'Ghost', 'Channel', 'Request', 'Tool Used', 'Status', 'Duration', 'Cost']

  return (
    <div
      className="glass-panel"
      style={{
        overflow: 'hidden',
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        {/* Search */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search work log..."
          style={{
            background: '#f9f5f0',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 10px',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            outline: 'none',
            width: 200,
            transition: 'border-color 150ms ease',
          }}
          onFocus={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)')}
          onBlur={(e)  => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border)')}
        />

        {/* Status filters */}
        {(['all', 'completed', 'pending', 'failed'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`filter-pill${statusFilter === s ? ' active' : ''}`}
            style={{ textTransform: 'capitalize' }}
          >
            {s}
          </button>
        ))}

        <span
          style={{
            marginLeft: 'auto',
            fontSize: 11,
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {filtered.length} entries
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Skeleton rows */}
            {loading && [...Array(5)].map((_, i) => (
              <tr key={i}>
                {COLUMNS.map((c) => (
                  <td key={c}>
                    <div className="skeleton" style={{ height: 11, width: '80%' }} />
                  </td>
                ))}
              </tr>
            ))}

            {/* Data rows */}
            {!loading && filtered.map((task) => (
              <React.Fragment key={task.id}>
                <tr
                  onClick={() => setExpandedId((cur) => (cur === task.id ? null : task.id))}
                  style={{
                    cursor: 'pointer',
                    background: expandedId === task.id ? '#fdf8f4' : undefined,
                  }}
                >
                  <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12, whiteSpace: 'nowrap' }}>
                    {timeAgo(task.created_at)}
                  </td>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: 14 }}>
                    {task.role_name}
                  </td>
                  <td style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 500 }}>
                    {task.channel}
                  </td>
                  <td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 14 }}>
                    {task.request}
                  </td>
                  <td style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                    {task.tool_used}
                  </td>
                  <td>
                    <StatusPill status={task.status} />
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12, whiteSpace: 'nowrap' }}>
                    {formatDuration(task.duration_ms)}
                  </td>
                  <td style={{ color: 'var(--success)', fontFamily: 'var(--font-mono)', fontSize: 12, whiteSpace: 'nowrap' }}>
                    {formatCurrency(task.cost_usd)}
                  </td>
                </tr>
                {expandedId === task.id && <ExpandedRow task={task} />}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
