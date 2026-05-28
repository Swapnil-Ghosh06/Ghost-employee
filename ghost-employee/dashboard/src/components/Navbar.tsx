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

interface NavbarProps {
  onOpenCmd?: () => void
}

export default function Navbar({ onOpenCmd }: NavbarProps) {
  const location = useLocation()

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <header
      style={{
        position: 'fixed',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 40px)',
        maxWidth: 1360,
        height: 72,
        background: 'rgba(86, 28, 36, 0.72)',
        backdropFilter: 'blur(20px) saturate(120%)',
        WebkitBackdropFilter: 'blur(20px) saturate(120%)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        border: '1px solid rgba(232, 216, 196, 0.18)',
        borderRadius: 24,
        boxShadow: '0 12px 40px rgba(86, 28, 36, 0.16), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Logo Area ── */}
      <NavLink
        to="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          textDecoration: 'none',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            background: 'rgba(232, 216, 196, 0.15)',
            border: '1px solid rgba(232, 216, 196, 0.3)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            flexShrink: 0,
            boxShadow: '0 0 16px rgba(232, 216, 196, 0.1)',
          }}
        >
          👻
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 20,
              fontWeight: 600,
              color: '#E8D8C4',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            SPECTER
          </span>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 8.5,
              color: 'rgba(232, 216, 196, 0.55)',
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              lineHeight: 1.2,
              fontWeight: 600,
            }}
          >
            AUTONOMY OS
          </span>
        </div>
      </NavLink>

      {/* ── Horizontal Navigation ── */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const active = isActive(path)
          return (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              style={({ isActive: linkActive }) => {
                const isItemActive = linkActive || active;
                return {
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  borderRadius: 20,
                  textDecoration: 'none',
                  fontSize: 13,
                  fontFamily: 'var(--font-sans)',
                  fontWeight: isItemActive ? 500 : 400,
                  color: isItemActive ? '#E8D8C4' : 'rgba(232, 216, 196, 0.7)',
                  background: isItemActive ? 'rgba(232, 216, 196, 0.12)' : 'transparent',
                  transition: 'all 200ms ease',
                  cursor: 'pointer',
                }
              }}
              onMouseEnter={(e) => {
                const target = e.currentTarget as HTMLAnchorElement
                if (!target.style.background || target.style.background === 'transparent' || target.style.background.includes('rgba(232, 216, 196, 0)')) {
                  target.style.background = 'rgba(232, 216, 196, 0.06)'
                  target.style.color = '#E8D8C4'
                }
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget as HTMLAnchorElement
                const linkPath = target.getAttribute('href')
                const linkActive = linkPath === '/' ? location.pathname === '/' : location.pathname.startsWith(linkPath || '')
                if (!linkActive) {
                  target.style.background = 'transparent'
                  target.style.color = 'rgba(232, 216, 196, 0.7)'
                } else {
                  target.style.background = 'rgba(232, 216, 196, 0.12)'
                  target.style.color = '#E8D8C4'
                }
              }}
            >
              <Icon size={14} style={{ flexShrink: 0 }} />
              <span>{label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* ── Search Pill ── */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button
          onClick={onOpenCmd}
          style={{
            background: 'rgba(232, 216, 196, 0.06)',
            border: '1px solid rgba(232, 216, 196, 0.1)',
            borderRadius: 20,
            padding: '7px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            transition: 'all 200ms ease',
            color: 'var(--text-sidebar)',
            fontSize: 12,
            fontFamily: 'var(--font-sans)',
            outline: 'none',
          }}
          onMouseEnter={(e) => {
            const btn = e.currentTarget as HTMLButtonElement
            btn.style.background = 'rgba(232, 216, 196, 0.12)'
            btn.style.borderColor = 'rgba(232, 216, 196, 0.2)'
            btn.style.color = '#E8D8C4'
          }}
          onMouseLeave={(e) => {
            const btn = e.currentTarget as HTMLButtonElement
            btn.style.background = 'rgba(232, 216, 196, 0.06)'
            btn.style.borderColor = 'rgba(232, 216, 196, 0.1)'
            btn.style.color = 'var(--text-sidebar)'
          }}
          title="Open command palette (Ctrl+K)"
        >
          <Search size={13} />
          <span>Search</span>
          <kbd
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--text-sidebar)',
              background: 'rgba(232, 216, 196, 0.08)',
              borderRadius: 4,
              padding: '1px 5px',
              border: '1px solid rgba(232, 216, 196, 0.1)',
              marginLeft: 4,
            }}
          >
            ⌘K
          </kbd>
        </button>
      </div>
    </header>
  )
}
