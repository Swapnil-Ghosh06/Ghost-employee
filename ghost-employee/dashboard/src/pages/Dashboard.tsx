import { useState, useEffect, useRef } from 'react'
import { CheckSquare, DollarSign, Clock } from 'lucide-react'
import MetricCard from '@/components/MetricCard'
import ActivityLog from '@/components/ActivityLog'
import TaskQueue from '@/components/TaskQueue'
import { getStats, getTasks, getMockStats, getMockTasks } from '@/services/api'
import type { Stats, Task, LogEntry } from '@/types'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function tasksToLogs(tasks: Task[]): LogEntry[] {
  return tasks.map((t) => ({
    id: t.id,
    timestamp: t.created_at,
    ghost_name: t.role_name,
    tool_used: t.tool_used,
    message: t.request.slice(0, 80),
    level: t.status === 'failed' ? 'ERROR' : t.status === 'pending' ? 'WARN' : 'INFO',
  }))
}

function ErrorBanner() {
  return (
    <div className="banner-error">
      ⚠ Backend unreachable — showing mock data. Retrying in 10s.
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const headerRef = useRef<HTMLDivElement>(null)
  const metricsRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  async function fetchData() {
    try {
      const [s, t] = await Promise.all([getStats(), getTasks()])
      setError(false)
      setStats(s)
      setTasks(t ?? [])
    } catch {
      setError(true)
      if (!stats) {
        setStats(getMockStats())
        setTasks(getMockTasks())
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  // Stagger entry animations
  useEffect(() => {
    if (loading) return

    ScrollTrigger.getAll().forEach((t) => t.kill())

    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current.children,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
      )
    }

    if (metricsRef.current) {
      gsap.fromTo(
        Array.from(metricsRef.current.children),
        { y: 30, opacity: 0 },
        {
          scrollTrigger: {
            trigger: metricsRef.current,
            start: 'top 90%',
          },
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
        }
      )
    }

    if (contentRef.current) {
      gsap.fromTo(
        Array.from(contentRef.current.children),
        { y: 40, opacity: 0 },
        {
          scrollTrigger: {
            trigger: contentRef.current,
            start: 'top 85%',
          },
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
        }
      )
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [loading])

  const queueTasks = tasks.filter((t) => t.status === 'pending')
  const logs = tasksToLogs(tasks)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Page Header ── */}
      <div ref={headerRef}>
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title">Control Telemetry</h1>
            <p className="page-subtitle">Live overview of all active autonomous agents and processes</p>
          </div>

          <div
            style={{
              background: 'rgba(45, 106, 79, 0.06)',
              border: '1px solid rgba(45, 106, 79, 0.15)',
              borderRadius: 20,
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span className="live-dot" />
            <span
              style={{
                fontSize: 10,
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.08em',
                fontWeight: 500,
                color: 'var(--success)',
              }}
            >
              TELEMETRY: RUNNING
            </span>
          </div>
        </div>
        <hr className="page-divider" />
      </div>

      {error && !loading && <ErrorBanner />}

      {/* ── Telemetry Ticker Marquee ── */}
      <div
        className="marquee-container"
        style={{
          margin: '0 -54px',
          width: 'calc(100% + 108px)',
          padding: '12px 0',
        }}
      >
        <div className="marquee-content" style={{ gap: '2rem' }}>
          <span className="marquee-item active">
            [LIVE TELEMETRY ACTIVE]
          </span>
          <span className="marquee-item">•</span>
          <span className="marquee-item" style={{ color: 'var(--text-primary)' }}>
            GHOST AGENT CHANNELS: #TELEMETRY, #DEV-OPS, #PR-REVIEW
          </span>
          <span className="marquee-item">•</span>
          <span className="marquee-item active" style={{ color: 'var(--success)' }}>
            AUTONOMY RATING: 99.8%
          </span>
          <span className="marquee-item">•</span>
          <span className="marquee-item" style={{ color: 'var(--text-primary)' }}>
            MONITORING STABILIZED
          </span>
          <span className="marquee-item">•</span>
          {/* Duplicate content for seamless wrap */}
          <span className="marquee-item active">
            [LIVE TELEMETRY ACTIVE]
          </span>
          <span className="marquee-item">•</span>
          <span className="marquee-item" style={{ color: 'var(--text-primary)' }}>
            GHOST AGENT CHANNELS: #TELEMETRY, #DEV-OPS, #PR-REVIEW
          </span>
          <span className="marquee-item">•</span>
          <span className="marquee-item active" style={{ color: 'var(--success)' }}>
            AUTONOMY RATING: 99.8%
          </span>
          <span className="marquee-item">•</span>
          <span className="marquee-item" style={{ color: 'var(--text-primary)' }}>
            MONITORING STABILIZED
          </span>
          <span className="marquee-item">•</span>
        </div>
      </div>

      {/* ── Metric Cards Grid ── */}
      <div
        ref={metricsRef}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
          width: '100%',
        }}
      >
        <MetricCard
          label="Tasks Completed Today"
          value={stats?.tasks_today ?? 0}
          format="integer"
          icon={<CheckSquare size={16} />}
          loading={loading}
        />
        <MetricCard
          label="Cost Saved Today"
          value={stats?.cost_saved_today ?? 0}
          format="currency"
          icon={<DollarSign size={16} />}
          loading={loading}
        />
        <MetricCard
          label="Queue (Pending)"
          value={stats?.queue_count ?? 0}
          format="integer"
          icon={<Clock size={16} />}
          loading={loading}
        />
      </div>

      {/* ── Content Grid (Activity Log + Task Queue) ── */}
      <div
        ref={contentRef}
        style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr',
          gap: 20,
          width: '100%',
        }}
      >
        <div style={{ minHeight: 450 }}>
          <ActivityLog entries={logs} loading={loading} />
        </div>
        <div style={{ minHeight: 450 }}>
          <TaskQueue tasks={queueTasks} onReorder={setTasks} />
        </div>
      </div>
    </div>
  )
}
