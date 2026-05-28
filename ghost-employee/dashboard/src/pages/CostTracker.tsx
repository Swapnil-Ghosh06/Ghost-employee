import { useState, useEffect, useRef } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import MetricCard from '@/components/MetricCard'
import { getStats, getMockStats } from '@/services/api'
import { animateCountTo } from '@/animations/countTo'
import { formatCurrency } from '@/lib/utils'
import type { Stats } from '@/types'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function CostTracker() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  
  const headerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const metricsRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<HTMLDivElement>(null)

  async function fetchStats() {
    try {
      const data = await getStats()
      setError(false)
      setStats(data)
    } catch {
      setError(true)
      if (!stats) setStats(getMockStats())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 10000)
    return () => clearInterval(interval)
  }, [])

  // Hero counter animation
  useEffect(() => {
    const counterElement = document.getElementById('saved-counter')
    if (stats && counterElement) {
      animateCountTo(
        counterElement,
        stats.cost_saved_today * 4,
        2,
        (n) => formatCurrency(n)
      )
    }
  }, [stats, loading])

  // GSAP scroll animations
  useEffect(() => {
    if (loading) return

    ScrollTrigger.getAll().forEach((t) => t.kill())

    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current.children,
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
      )
    }

    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current,
        { y: 40, opacity: 0 },
        {
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top 85%',
          },
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
        }
      )
    }

    if (metricsRef.current) {
      gsap.fromTo(
        Array.from(metricsRef.current.children),
        { y: 40, opacity: 0 },
        {
          scrollTrigger: {
            trigger: metricsRef.current,
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

    if (chartRef.current) {
      gsap.fromTo(
        chartRef.current,
        { y: 50, opacity: 0 },
        {
          scrollTrigger: {
            trigger: chartRef.current,
            start: 'top 82%',
          },
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
        }
      )
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [loading])

  const hoursSaved = stats?.hours_saved ?? 0
  const hourlyRate = stats?.hourly_rate ?? 14

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
        width: '100%',
      }}
    >
      {/* Page header */}
      <div ref={headerRef}>
        <h1 className="page-title">Cost Tracker</h1>
        <p className="page-subtitle">How much time and money Specter saves you</p>
        <hr className="page-divider" />
      </div>

      {error && !loading && (
        <div className="banner-error">
          ⚠ Backend unreachable — showing mock data. Retrying in 10s.
        </div>
      )}

      {/* Hero number card */}
      <div
        ref={heroRef}
        className="card"
        style={{
          textAlign: 'center',
          padding: '60px 24px',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {loading ? (
          <div className="skeleton" style={{ height: 60, width: 280, margin: '0 auto' }} />
        ) : (
          <>
            <div
              id="saved-counter"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '4.5rem',
                fontWeight: 600,
                color: 'var(--accent)',
                lineHeight: 1,
                letterSpacing: '-0.04em',
              }}
            >
              {formatCurrency(0)}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 500,
                color: 'var(--accent)',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                marginTop: 16,
              }}
            >
              SAVED THIS WEEK
            </div>
            <div
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                color: 'var(--text-muted)',
                marginTop: 8,
                fontWeight: 400,
              }}
            >
              equivalent to <span style={{ color: 'var(--text-primary)' }}>{hoursSaved} hours</span> at ${hourlyRate}/hr
            </div>
          </>
        )}
      </div>

      {/* Secondary metric cards */}
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
          label="Total API Cost"
          value={stats?.total_cost_usd ?? 0}
          format="currency"
          loading={loading}
        />
        <MetricCard
          label="Tasks This Week"
          value={stats?.tasks_this_week ?? 0}
          format="integer"
          loading={loading}
        />
        <MetricCard
          label="Avg Cost Per Task"
          value={stats?.avg_cost_per_task ?? 0}
          format="number"
          loading={loading}
        />
      </div>

      {/* Bar chart panel */}
      <div
        ref={chartRef}
        className="card"
        style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 11,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontWeight: 500,
          }}
        >
          Daily API Cost — Last 7 Days
        </div>
        {loading ? (
          <div className="skeleton" style={{ height: 220 }} />
        ) : stats?.daily_costs?.length ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats.daily_costs} barSize={28}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fill: '#C7B7A3', fontFamily: 'var(--font-mono)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#C7B7A3', fontFamily: 'var(--font-mono)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  background: '#ffffff',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: 'var(--text-primary)',
                  boxShadow: '0 4px 16px rgba(86, 28, 36, 0.1)',
                }}
                cursor={{ fill: 'var(--accent-dim)' }}
                formatter={(v: number) => [`$${v.toFixed(2)}`, 'Cost']}
              />
              <Bar dataKey="cost" fill="var(--accent)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div
            style={{
              height: 220,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
            }}
          >
            No cost data yet
          </div>
        )}
      </div>
    </div>
  )
}
