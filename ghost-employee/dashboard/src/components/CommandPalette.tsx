import { useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'

interface Command {
  id: string
  label: string
  category: string
  action: () => void
}

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const panelRef   = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLInputElement>(null)
  const navigate   = useNavigate()

  const commands: Command[] = [
    { id: 'dashboard', label: 'Go to Dashboard',           category: 'Navigate', action: () => { navigate('/');        onClose() } },
    { id: 'worklog',   label: 'View Work Log',             category: 'Navigate', action: () => { navigate('/worklog'); onClose() } },
    { id: 'cost',      label: 'Open Cost Tracker',         category: 'Navigate', action: () => { navigate('/cost');    onClose() } },
    { id: 'config',    label: 'Create New Ghost',          category: 'Actions',  action: () => { navigate('/config');  onClose() } },
    { id: 'assign',    label: 'Assign Ghost to Channel',   category: 'Actions',  action: () => { navigate('/config');  onClose() } },
    { id: 'toggle',    label: 'Toggle Ghost Active',       category: 'Actions',  action: () => { navigate('/config');  onClose() } },
    { id: 'settings',  label: 'Open Settings',             category: 'Navigate', action: () => { navigate('/settings');onClose() } },
  ]

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.15 })
      gsap.fromTo(
        panelRef.current,
        { y: -16, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 0.18, ease: 'power2.out' }
      )
      setTimeout(() => inputRef.current?.focus(), 40)
    } else {
      document.body.style.overflow = ''
    }
  }, [open])

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(26, 10, 12, 0.5)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '14vh',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          width: '100%',
          maxWidth: 560,
          overflow: 'hidden',
          boxShadow: '0 16px 48px rgba(86, 28, 36, 0.15)',
        }}
      >
        {/* Input row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 18px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--accent)' }}>⌘</span>
          <input
            ref={inputRef}
            placeholder="Type a command..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              color: 'var(--text-primary)',
            }}
          />
          <kbd
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--text-muted)',
              background: '#f9f5f0',
              border: '1px solid var(--border)',
              borderRadius: 4,
              padding: '2px 6px',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Command list */}
        <div style={{ padding: '6px 0 8px' }}>
          {commands.map((cmd) => (
            <button
              key={cmd.id}
              onClick={cmd.action}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '9px 18px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                textAlign: 'left',
                transition: 'background 100ms ease',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.background = 'var(--accent-dim)'
                el.style.color = 'var(--accent)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.background = 'transparent'
                el.style.color = 'var(--text-primary)'
              }}
            >
              <span>{cmd.label}</span>
              <span
                style={{
                  fontSize: 10,
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  background: '#f9f5f0',
                  border: '1px solid var(--border)',
                  borderRadius: 4,
                  padding: '1px 6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {cmd.category}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
