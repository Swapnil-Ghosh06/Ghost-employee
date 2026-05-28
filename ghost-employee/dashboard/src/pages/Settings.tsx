import { useState, useEffect, useRef } from 'react'
import { Bell, RefreshCw, DollarSign } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface ToggleRowProps {
  label: string
  description: string
  icon: React.ReactNode
  value: boolean
  onChange: (v: boolean) => void
}

function ToggleRow({ label, description, icon, value, onChange }: ToggleRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px 20px',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ color: value ? 'var(--accent)' : 'var(--text-muted)', transition: 'color 200ms ease', flexShrink: 0 }}>
          {icon}
        </span>
        <div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
            {label}
          </div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            {description}
          </div>
        </div>
      </div>
      <div
        className={`toggle-track ${value ? 'on' : ''}`}
        onClick={() => onChange(!value)}
        role="switch"
        aria-checked={value}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') onChange(!value) }}
      >
        <div className="toggle-thumb" />
      </div>
    </div>
  )
}

export default function Settings() {
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [soundAlerts, setSoundAlerts] = useState(false)
  const [showCost, setShowCost] = useState(true)

  const headerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const aboutRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ScrollTrigger.getAll().forEach((t) => t.kill())

    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current.children,
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
      )
    }

    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { y: 40, opacity: 0 },
        {
          scrollTrigger: {
            trigger: cardRef.current,
            start: 'top 85%',
          },
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
        }
      )
    }

    if (aboutRef.current) {
      gsap.fromTo(
        aboutRef.current,
        { y: 40, opacity: 0 },
        {
          scrollTrigger: {
            trigger: aboutRef.current,
            start: 'top 85%',
          },
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
        }
      )
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
        width: '100%',
      }}
    >
      {/* Header */}
      <div ref={headerRef}>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Dashboard preferences and notification settings</p>
        <hr className="page-divider" />
      </div>

      <div
        ref={cardRef}
        className="card"
        style={{ padding: 0, maxWidth: 640, width: '100%', overflow: 'hidden' }}
      >
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--border)',
            fontFamily: 'var(--font-sans)',
            fontSize: 11,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontWeight: 500,
          }}
        >
          Preferences
        </div>

        <ToggleRow label="Auto-refresh Work Log" description="Automatically refresh every 10 seconds" icon={<RefreshCw size={16} />} value={autoRefresh} onChange={setAutoRefresh} />
        <ToggleRow label="Sound Alerts on Task Complete" description="Play a chime when a ghost finishes a task" icon={<Bell size={16} />} value={soundAlerts} onChange={setSoundAlerts} />
        <ToggleRow label="Show Cost in Sidebar" description="Display today's cost saved in the sidebar footer" icon={<DollarSign size={16} />} value={showCost} onChange={setShowCost} />
      </div>

      <div
        ref={aboutRef}
        className="card"
        style={{
          padding: '24px 20px',
          maxWidth: 640,
          width: '100%',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 11,
            color: 'var(--text-muted)',
            marginBottom: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontWeight: 500,
          }}
        >
          About
        </div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.8 }}>
          Specter Autonomy OS v0.1.0<br />
          Built with React + Vite + TypeScript<br />
          Connected to FastAPI backend on <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>localhost:8000</span>
        </div>
      </div>
    </div>
  )
}
