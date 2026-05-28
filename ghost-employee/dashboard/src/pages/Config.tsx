import { useState, useEffect, useRef } from 'react'
import { Plus, Wand2 } from 'lucide-react'
import GhostCard from '@/components/GhostCard'
import Toast, { type ToastData } from '@/components/Toast'
import { getRoles, createRole, deleteRole, generateDescription } from '@/services/api'
import { elasticScale } from '@/animations/slideIn'
import type { GhostRole } from '@/types'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const EMPTY_FORM = {
  name: '',
  role_description: '',
  channels: '',
  active_hours_from: '09:00',
  active_hours_to: '18:00',
}

export default function Config() {
  const [roles, setRoles] = useState<GhostRole[]>([])
  const [rolesLoading, setRolesLoading] = useState(true)
  const [rolesError, setRolesError] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [toasts, setToasts] = useState<ToastData[]>([])
  
  const avatarRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const activeGhostsRef = useRef<HTMLDivElement>(null)
  const typingTimerRef = useRef<any>(null)

  function addToast(message: string, type: ToastData['type'] = 'success') {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, message, type }])
  }

  function dismissToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  async function fetchRoles() {
    const data = await getRoles()
    if (data === null) {
      setRolesError(true)
    } else {
      setRolesError(false)
      setRoles(data)
    }
    setRolesLoading(false)
  }

  useEffect(() => {
    fetchRoles()
    return () => {
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current)
      }
    }
  }, [])

  // Stagger entry animations
  useEffect(() => {
    if (rolesLoading) return

    ScrollTrigger.getAll().forEach((t) => t.kill())

    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current.children,
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
      )
    }

    if (formRef.current) {
      gsap.fromTo(
        formRef.current,
        { y: 40, opacity: 0 },
        {
          scrollTrigger: {
            trigger: formRef.current,
            start: 'top 85%',
          },
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
        }
      )
    }

    if (activeGhostsRef.current) {
      gsap.fromTo(
        activeGhostsRef.current,
        { y: 40, opacity: 0 },
        {
          scrollTrigger: {
            trigger: activeGhostsRef.current,
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
  }, [rolesLoading])

  async function triggerGenerate(roleName: string) {
    if (!roleName.trim() || generating) return
    setGenerating(true)

    // Clear any previous typing animations
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current)
    }

    // Set initial loading state inside the textarea
    setForm((f) => ({ ...f, role_description: 'Generating customized role description...' }))

    try {
      const desc = await generateDescription(roleName)
      setGenerating(false)
      
      // Beautiful char-by-char reveal animation
      let currentText = ''
      let index = 0
      
      typingTimerRef.current = setInterval(() => {
        if (index < desc.length) {
          currentText += desc[index]
          setForm((f) => ({ ...f, role_description: currentText }))
          index++
        } else {
          clearInterval(typingTimerRef.current)
        }
      }, 8) // 8ms per char
    } catch {
      setGenerating(false)
      setForm((f) => ({ ...f, role_description: '' }))
      addToast('Failed to generate description.', 'error')
    }
  }

  function handleNameBlur() {
    // If name is typed but description is completely empty, auto-generate!
    if (form.name.trim() && !form.role_description.trim()) {
      triggerGenerate(form.name)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    const newRole = await createRole({
      name: form.name,
      role_description: form.role_description,
      channels: form.channels.split(',').map((c) => c.trim()).filter(Boolean),
      active_hours_from: form.active_hours_from,
      active_hours_to: form.active_hours_to,
    })
    setSaving(false)
    if (newRole === null) {
      addToast('Failed to create ghost. Check backend connection.', 'error')
    } else {
      setRoles((prev) => [newRole, ...prev])
      setForm(EMPTY_FORM)
      elasticScale(avatarRef.current)
      addToast(`Ghost "${newRole.name}" created!`, 'success')
    }
  }

  async function handleDelete(id: string) {
    await deleteRole(id)
    setRoles((prev) => prev.filter((r) => r.id !== id))
    addToast('Ghost removed.', 'info')
  }

  function handleEdit(ghost: GhostRole) {
    setForm({
      name: ghost.name,
      role_description: ghost.role_description,
      channels: ghost.channels.join(', '),
      active_hours_from: ghost.active_hours_from,
      active_hours_to: ghost.active_hours_to,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const FIELD_STYLE: React.CSSProperties = {
    width: '100%',
    background: '#f9f5f0',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '11px 14px',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-sans)',
    fontSize: 13,
    outline: 'none',
    transition: 'all 200ms ease',
    boxSizing: 'border-box',
  }

  const LABEL_STYLE: React.CSSProperties = {
    display: 'block',
    fontSize: 10,
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: 6,
    fontWeight: 500,
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
        width: '100%',
      }}
    >
      {/* Toast container */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9998, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onDismiss={dismissToast} />
        ))}
      </div>

      {/* Header */}
      <div ref={headerRef}>
        <h1 className="page-title">Config</h1>
        <p className="page-subtitle">Create and manage Specter agents</p>
        <hr className="page-divider" />
      </div>

      {/* Two-Column Responsive Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
          gap: 32,
          alignItems: 'start',
          width: '100%',
        }}
      >
        {/* Column 1: Create Form */}
        <div
          ref={formRef}
          className="card"
          style={{
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
            <div
              ref={avatarRef}
              style={{
                width: 40,
                height: 40,
                background: 'var(--accent-dim)',
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
            <div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                New Specter Agent
              </div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                Define a role and assign it to channels
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={LABEL_STYLE}>Specter Name</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Data Scientist, Support Bot"
                  style={{ ...FIELD_STYLE, paddingRight: 116 }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                  onBlur={handleNameBlur}
                  required
                />
                <button
                  type="button"
                  onClick={() => triggerGenerate(form.name)}
                  disabled={generating || !form.name.trim()}
                  style={{
                    position: 'absolute',
                    right: 6,
                    background: 'var(--accent-dim)',
                    border: '1px solid var(--border)',
                    color: 'var(--accent)',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: 11,
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    opacity: form.name.trim() ? 1 : 0.5,
                    transition: 'all 200ms ease',
                    userSelect: 'none',
                  }}
                  onMouseEnter={(e) => {
                    const target = e.currentTarget as HTMLButtonElement
                    if (form.name.trim()) {
                      target.style.background = 'var(--accent)'
                      target.style.color = '#E8D8C4'
                    }
                  }}
                  onMouseLeave={(e) => {
                    const target = e.currentTarget as HTMLButtonElement
                    target.style.background = 'var(--accent-dim)'
                    target.style.color = 'var(--accent)'
                  }}
                >
                  <Wand2 size={11} />
                  <span>{generating ? 'Gen...' : 'Auto-gen'}</span>
                </button>
              </div>
            </div>

            <div>
              <label style={LABEL_STYLE}>Role Description</label>
              <textarea
                value={form.role_description}
                onChange={(e) => setForm((f) => ({ ...f, role_description: e.target.value }))}
                rows={5}
                placeholder="You are a junior data analyst. Monitor #data-requests channel, write SQL when asked..."
                style={{
                  ...FIELD_STYLE,
                  resize: 'vertical',
                  lineHeight: 1.6,
                  borderColor: generating ? 'var(--accent)' : 'var(--border)',
                  boxShadow: generating ? '0 0 10px rgba(86, 28, 36, 0.08)' : 'none',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                disabled={generating}
              />
            </div>

            <div>
              <label style={LABEL_STYLE}>Assigned Channels (comma separated)</label>
              <input
                value={form.channels}
                onChange={(e) => setForm((f) => ({ ...f, channels: e.target.value }))}
                placeholder="#data-requests, #analytics"
                style={FIELD_STYLE}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={LABEL_STYLE}>Active Hours From</label>
                <input
                  type="time"
                  value={form.active_hours_from}
                  onChange={(e) => setForm((f) => ({ ...f, active_hours_from: e.target.value }))}
                  style={FIELD_STYLE}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                />
              </div>
              <div>
                <label style={LABEL_STYLE}>Active Hours To</label>
                <input
                  type="time"
                  value={form.active_hours_to}
                  onChange={(e) => setForm((f) => ({ ...f, active_hours_to: e.target.value }))}
                  style={FIELD_STYLE}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                />
              </div>
            </div>

            <div style={{ marginTop: 6 }}>
              <button
                type="submit"
                disabled={saving}
                className="btn-accent"
                style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: saving ? 0.6 : 1 }}
              >
                <Plus size={16} />
                {saving ? 'Saving...' : 'Create Specter Agent'}
              </button>
            </div>
          </form>
        </div>

        {/* Column 2: Existing Specters */}
        <div ref={activeGhostsRef} style={{ width: '100%' }}>
          <div
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              color: 'var(--text-muted)',
              marginBottom: 16,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: 500,
            }}
          >
            Active Specters ({rolesLoading ? '…' : roles.length})
          </div>

          {rolesError && !rolesLoading && (
            <div className="banner-error" style={{ marginBottom: 16 }}>
              ⚠ Failed to load ghost configurations.
            </div>
          )}

          {rolesLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[...Array(2)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 140, borderRadius: 'var(--radius)' }} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {roles.map((ghost) => (
                <GhostCard
                  key={ghost.id}
                  ghost={ghost}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
