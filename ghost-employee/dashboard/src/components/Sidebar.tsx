import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  ScrollText,
  DollarSign,
  Settings2,
  Settings,
  Search,
} from 'lucide-react'

const NAV_ITEMS = [
  { path: '/',        label: 'Dashboard',    icon: LayoutDashboard },
  { path: '/worklog', label: 'Work Log',     icon: ScrollText },
  { path: '/cost',    label: 'Cost Tracker', icon: DollarSign },
  { path: '/config',  label: 'Config',       icon: Settings2 },
  { path: '/settings',label: 'Settings',     icon: Settings },
]

interface SidebarProps {
  onOpenCmd?: () => void
}

export default function Sidebar({ onOpenCmd }: SidebarProps) {
  const location = useLocation()

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <aside
      style={{
        width: 260,
        minHeight: '100vh',
        background: 'var(--bg-sidebar)',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '4px 0 24px rgba(86, 28, 36, 0.15)',
      }}
    >
      {/* ── Logo Area ───────────────────────────────────────────── */}
      <NavLink
        to="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          textDecoration: 'none',
          padding: '32px 24px 24px',
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            background: '#E8D8C4',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          👻
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 18,
              fontWeight: 500,
              color: '#E8D8C4',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}
          >
            Ghost
          </span>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              color: 'var(--text-sidebar)',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              lineHeight: 1.4,
              fontWeight: 400,
            }}
          >
            Employee
          </span>
        </div>
      </NavLink>

      {/* ── Navigation ────────────────────────────────────────── */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: 8 }}>
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const active = isActive(path)
          return (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={`nav-item ${active ? 'active' : ''}`}
            >
              <Icon size={15} style={{ flexShrink: 0, opacity: active ? 1 : 0.7 }} />
              <span>{label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* ── Bottom Area (Search Trigger) ──────────────────────── */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(232, 216, 196, 0.1)' }}>
        <button
          onClick={onOpenCmd}
          style={{
            width: '100%',
            background: 'rgba(232, 216, 196, 0.06)',
            border: '1px solid rgba(232, 216, 196, 0.1)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            transition: 'all 200ms ease',
            color: 'var(--text-sidebar)',
            fontSize: 12,
            fontFamily: 'var(--font-sans)',
          }}
          onMouseEnter={(e) => {
            const btn = e.currentTarget as HTMLButtonElement
            btn.style.background = 'rgba(232, 216, 196, 0.12)'
            btn.style.borderColor = 'rgba(232, 216, 196, 0.2)'
          }}
          onMouseLeave={(e) => {
            const btn = e.currentTarget as HTMLButtonElement
            btn.style.background = 'rgba(232, 216, 196, 0.06)'
            btn.style.borderColor = 'rgba(232, 216, 196, 0.1)'
          }}
          title="Open command palette (Ctrl+K)"
        >
          <Search size={13} />
          <span style={{ flex: 1, textAlign: 'left' }}>Search</span>
          <kbd
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--text-sidebar)',
              background: 'rgba(232, 216, 196, 0.08)',
              borderRadius: 4,
              padding: '1px 5px',
              border: '1px solid rgba(232, 216, 196, 0.1)',
            }}
          >
            ⌘K
          </kbd>
        </button>
      </div>
    </aside>
  )
}
