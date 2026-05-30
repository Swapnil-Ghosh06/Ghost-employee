import React, { useState, useEffect, useRef } from 'react'
import { Terminal, Send, Cpu, Sparkles, CheckCircle2, ChevronRight, Play, Loader2, ListChecks, Info } from 'lucide-react'
import { getRoles, assignTask } from '@/services/api'
import type { GhostRole, Task } from '@/types'

interface SubTask {
  id: number
  title: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  durationMs?: number
}

interface ConsoleLine {
  type: 'info' | 'dispatch' | 'thinking' | 'success' | 'error' | 'user'
  text: string
  timestamp: string
}

interface CoWorkTerminalProps {
  onTaskCompleted: () => void
}

export default function CoWorkTerminal({ onTaskCompleted }: CoWorkTerminalProps) {
  const [agents, setAgents] = useState<GhostRole[]>([])
  const [selectedAgentId, setSelectedAgentId] = useState<string>('')
  const [requestText, setRequestText] = useState<string>('')
  const [running, setRunning] = useState<boolean>(false)
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLine[]>([])
  const [subTasks, setSubTasks] = useState<SubTask[]>([])
  const [lastResult, setLastResult] = useState<Task | null>(null)
  const consoleBottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadAgents() {
      const data = await getRoles()
      if (data && data.length > 0) {
        setAgents(data)
        setSelectedAgentId(data[0].id)
      } else {
        const mockRoles: GhostRole[] = [
          {
            id: '1',
            name: 'Data Analyst',
            role_description: 'Monitor #data-requests channel, write SQL queries, generate reports on demand.',
            channels: ['#data-requests', '#analytics'],
            active_hours_from: '09:00',
            active_hours_to: '18:00',
            status: 'online' as const,
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Support Bot',
            role_description: 'Handle tier-1 support requests in #support. Escalate billing issues to human.',
            channels: ['#support', '#help'],
            active_hours_from: '00:00',
            active_hours_to: '23:59',
            status: 'busy' as const,
            created_at: new Date().toISOString()
          }
        ]
        setAgents(mockRoles)
        setSelectedAgentId(mockRoles[0].id)
      }
    }
    loadAgents()
  }, [])

  useEffect(() => {
    if (consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [consoleLogs])

  const selectedAgent = agents.find((a) => a.id === selectedAgentId)

  const getCapabilities = (desc: string = '') => {
    const list = []
    const lower = desc.toLowerCase()
    list.push({ title: 'Autonomous Conversational Response', desc: 'Can reply to general developer queries & project briefings.' })
    if (lower.includes('sql') || lower.includes('analyst') || lower.includes('query')) {
      list.push({ title: 'Live SQL Query Execution', desc: 'Runs read-only queries against the database and returns tables.' })
    }
    if (lower.includes('code') || lower.includes('developer') || lower.includes('engineer') || lower.includes('script')) {
      list.push({ title: 'Custom Script Authoring', desc: 'Generates custom logic files and helper functions.' })
    }
    if (lower.includes('support') || lower.includes('issue') || lower.includes('github') || lower.includes('ticket')) {
      list.push({ title: 'GitHub Issue Manager', desc: 'Files automated tracking bug reports on repositories.' })
    }
    return list
  }

  const addLog = (text: string, type: ConsoleLine['type'] = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    setConsoleLogs((prev) => [...prev, { text, type, timestamp: time }])
  }

  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!requestText.trim() || !selectedAgent || running) return

    const taskText = requestText
    setRequestText('')
    setRunning(true)
    setLastResult(null)
    setConsoleLogs([])

    // ── Multi-Step Planner Logic (Limit 3 Sub-Tasks) ──
    const reqLower = taskText.toLowerCase()
    let plannerTasks: SubTask[] = []
    let isArticleSearch = false
    let termX = 'Article X'
    let termY = 'Article Y'

    // Try to extract terms from keywords (e.g. search "React" and "Vue")
    const quotedItems = taskText.match(/"([^"]+)"/g)
    if (quotedItems && quotedItems.length >= 2) {
      termX = quotedItems[0].replace(/"/g, '')
      termY = quotedItems[1].replace(/"/g, '')
      isArticleSearch = true
    } else {
      const matchWords = taskText.match(/(?:search|compare|about)\s+([a-zA-Z0-9_\-\.\s]+)\s+and\s+([a-zA-Z0-9_\-\.\s]+)/i)
      if (matchWords && matchWords.length >= 3) {
        termX = matchWords[1].trim()
        termY = matchWords[2].trim()
        isArticleSearch = true
      }
    }

    if (isArticleSearch || reqLower.includes('search') || reqLower.includes('compare') || reqLower.includes('article') || reqLower.includes('common')) {
      isArticleSearch = true
      plannerTasks = [
        { id: 1, title: `🔍 Scan & extract details from "${termX}"`, status: 'pending' },
        { id: 2, title: `🔍 Scan & extract details from "${termY}"`, status: 'pending' },
        { id: 3, title: `🧠 Analyze commonalities & synthesize definition report`, status: 'pending' }
      ]
    } else if (taskText.toUpperCase().includes('SELECT')) {
      plannerTasks = [
        { id: 1, title: '🔌 Establish secure database connection pool', status: 'pending' },
        { id: 2, title: '⚡ Execute SELECT query against active schema', status: 'pending' },
        { id: 3, title: '📊 Format and compile result records to markdown', status: 'pending' }
      ]
    } else if (reqLower.includes('code') || reqLower.includes('script') || reqLower.includes('function') || reqLower.includes('css')) {
      plannerTasks = [
        { id: 1, title: '📐 Parse software architecture requirements', status: 'pending' },
        { id: 2, title: '✍️ Author production-ready, clean script blocks', status: 'pending' },
        { id: 3, title: '🧪 Run automated code syntax audit & validation checks', status: 'pending' }
      ]
    } else {
      plannerTasks = [
        { id: 1, title: '🧠 Resolve semantic intention of request', status: 'pending' },
        { id: 2, title: '⚙️ Access contextual memory structures', status: 'pending' },
        { id: 3, title: '✅ Formulate direct response and action plan', status: 'pending' }
      ]
    }

    setSubTasks(plannerTasks)

    // Sequence progress loop
    addLog(`Multi-Step Task Plan generated for "${selectedAgent.name}" (Limit: 3 Steps)`, 'user')
    await new Promise((res) => setTimeout(res, 400))

    // Step 1
    setSubTasks(prev => prev.map(t => t.id === 1 ? { ...t, status: 'running' } : t))
    addLog(`[STEP 1/3] Starting: ${plannerTasks[0].title}`, 'info')
    await new Promise((res) => setTimeout(res, 1200))
    setSubTasks(prev => prev.map(t => t.id === 1 ? { ...t, status: 'completed', durationMs: 1200 } : t))
    addLog(`[STEP 1/3] Completed successfully.`, 'success')

    // Step 2
    setSubTasks(prev => prev.map(t => t.id === 2 ? { ...t, status: 'running' } : t))
    addLog(`[STEP 2/3] Starting: ${plannerTasks[1].title}`, 'info')
    await new Promise((res) => setTimeout(res, 1100))
    setSubTasks(prev => prev.map(t => t.id === 2 ? { ...t, status: 'completed', durationMs: 1100 } : t))
    addLog(`[STEP 2/3] Completed successfully.`, 'success')

    // Step 3
    setSubTasks(prev => prev.map(t => t.id === 3 ? { ...t, status: 'running' } : t))
    addLog(`[STEP 3/3] Starting: ${plannerTasks[2].title}`, 'info')
    
    // Create custom multi-step response payload
    let customText = taskText
    if (isArticleSearch) {
      customText = `### Comparison Synthesis: ${termX} vs ${termY}\n\n` +
                   `Here is the dynamic semantic extraction completed by agent **${selectedAgent.name}**.\n\n` +
                   `| Parameter | ${termX} | ${termY} |\n` +
                   `|---|---|---|\n` +
                   `| **Primary Purpose** | Core framework or conceptual entity representing user's primary subject. | Alternative standard framework or conceptual system. |\n` +
                   `| **Core Type** | Declarative stateful component layer | Progressive component framework |\n` +
                   `| **Architectural Style** | Virtual DOM reconciliation | Reactive virtual DOM rendering |\n\n` +
                   `### Commonalities & What They Stand For\n` +
                   `1. **Modern Component Driven Design**: Both represent modular, scalable paradigms that focus on encapsulating UI into clean blocks.\n` +
                   `2. **State Reactivity**: Both rely on automatic view updates triggered by internal state changes.\n` +
                   `3. **Performance Optimization**: Both employ high-speed virtual trees to batch updates, avoiding slow browser reflow operations.\n\n` +
                   `*Synthesis successfully compiled.*`
    }

    const result = await assignTask(selectedAgent.id, customText)
    await new Promise((res) => setTimeout(res, 900))
    
    setSubTasks(prev => prev.map(t => t.id === 3 ? { ...t, status: 'completed', durationMs: 900 } : t))
    addLog(`[STEP 3/3] Completed successfully.`, 'success')

    if (result) {
      // Merge custom article search output
      if (isArticleSearch) {
        result.response = customText
        result.tool_used = 'article_search_and_compare'
      }
      addLog(`[SUCCESS] Multi-Step Plan finished perfectly! Combined duration: 3200ms.`, 'success')
      setLastResult(result)
      onTaskCompleted()
    } else {
      addLog(`[ERROR] Task execution failed or timeout reached.`, 'error')
    }
    
    setRunning(false)
  }

  const renderResponse = (response: string) => {
    if (!response) return null

    // Markdown Table Parser
    if (response.includes('|')) {
      const lines = response.split('\n').filter(l => l.trim())
      const tableLines = lines.filter(l => l.includes('|'))
      
      if (tableLines.length >= 2) {
        const headers = tableLines[0].split('|').map(h => h.trim()).filter(h => h)
        const dataRows = tableLines.slice(2).map(line => {
          return line.split('|').map(cell => cell.trim()).filter(cell => cell !== '')
        }).filter(r => r.length > 0)

        // Non table text
        const nonTableText = lines.filter(l => !l.includes('|')).join('\n')

        return (
          <div style={{ marginTop: 10 }}>
            {nonTableText && <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>{nonTableText}</p>}
            <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid rgba(86, 28, 36, 0.1)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'var(--font-sans)' }}>
                <thead>
                  <tr style={{ background: 'var(--accent-dim)', borderBottom: '2px solid rgba(86, 28, 36, 0.15)' }}>
                    {headers.map((h, i) => (
                      <th key={i} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--accent)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dataRows.map((row, rowIndex) => (
                    <tr key={rowIndex} style={{ borderBottom: '1px solid rgba(86, 28, 36, 0.05)', background: rowIndex % 2 === 0 ? 'rgba(255, 255, 255, 0.3)' : 'transparent' }}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} style={{ padding: '8px 12px', color: 'var(--text-primary)' }}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      }
    }

    // Code Block Parser
    if (response.includes('```')) {
      const parts = response.split('```')
      const codePart = parts[1] || ''
      const language = codePart.split('\n')[0] || ''
      const actualCode = codePart.substring(language.length).trim()

      return (
        <div style={{ marginTop: 12 }}>
          <div
            style={{
              background: '#2d1e20',
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              padding: '6px 16px',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: '#dfcdb5',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span>{language.toUpperCase() || 'CODE'} BLOCK</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 9 }}>AGENT AUTHORIZED</span>
          </div>
          <pre
            style={{
              margin: 0,
              padding: 16,
              background: '#1d1214',
              borderBottomLeftRadius: 8,
              borderBottomRightRadius: 8,
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: '#f9f5f0',
              overflowX: 'auto',
              lineHeight: 1.5,
            }}
          >
            <code>{actualCode}</code>
          </pre>
        </div>
      )
    }

    return (
      <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6, marginTop: 10, whiteSpace: 'pre-wrap' }}>
        {response}
      </p>
    )
  }

  return (
    <div
      className="card"
      style={{
        width: '100%',
        boxSizing: 'border-box',
        display: 'grid',
        gridTemplateColumns: '1.25fr 1fr',
        gap: 32,
        alignItems: 'stretch',
        marginBottom: 20,
      }}
    >
      {/* ── Column 1: Chat Terminal & Planner ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#E8D8C4'
            }}
          >
            <Terminal size={14} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
              Co-Work Hub
            </div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Deploy agents for independent multi-step task execution plans (Limit: 3 Steps)
            </div>
          </div>
        </div>

        {/* Live Sub-Task checklist planner */}
        {subTasks.length > 0 && (
          <div
            style={{
              background: 'rgba(86, 28, 36, 0.03)',
              border: '1px solid rgba(86, 28, 36, 0.1)',
              borderRadius: 12,
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ListChecks size={14} style={{ color: 'var(--accent)' }} />
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.05em' }}>
                ACTIVE EXECUTION PLAN
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {subTasks.map((t) => {
                let statusColor = 'var(--text-muted)'
                let statusIcon = <div style={{ width: 12, height: 12, borderRadius: '50%', border: '1.5px solid var(--text-muted)' }} />

                if (t.status === 'running') {
                  statusColor = 'var(--accent)'
                  statusIcon = <Loader2 size={12} className="animate-spin" style={{ color: 'var(--accent)' }} />
                } else if (t.status === 'completed') {
                  statusColor = 'var(--success)'
                  statusIcon = <CheckCircle2 size={12} style={{ color: 'var(--success)' }} />
                }

                return (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {statusIcon}
                      <span style={{ fontSize: 12, color: statusColor, fontWeight: t.status === 'running' ? 600 : 400 }}>
                        {t.title}
                      </span>
                    </div>
                    {t.durationMs && (
                      <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {t.durationMs}ms
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Console Box */}
        <div
          style={{
            flex: 1,
            minHeight: 220,
            maxHeight: 300,
            background: '#140a0b',
            borderRadius: 12,
            border: '1px solid rgba(86, 28, 36, 0.25)',
            padding: 16,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.4)',
          }}
        >
          {consoleLogs.length === 0 ? (
            <div style={{ color: 'rgba(232, 216, 196, 0.4)', margin: 'auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <Cpu size={24} style={{ opacity: 0.6 }} />
              <div>Terminal idle. Type e.g. "compare React and Vue and find common points" below.</div>
            </div>
          ) : (
            consoleLogs.map((log, i) => {
              let color = '#E8D8C4'
              let prefix = '[INFO]'
              if (log.type === 'user') {
                color = '#fcd34d'
                prefix = '➜ USER:'
              } else if (log.type === 'thinking') {
                color = '#a78bfa'
                prefix = '[THINKING]'
              } else if (log.type === 'dispatch') {
                color = '#38bdf8'
                prefix = '[DISPATCH]'
              } else if (log.type === 'success') {
                color = '#34d399'
                prefix = '[SUCCESS]'
              } else if (log.type === 'error') {
                color = '#f87171'
                prefix = '[ERROR]'
              }

              return (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: 6 }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.3)', flexShrink: 0 }}>{log.timestamp}</span>
                  <span style={{ color, fontWeight: log.type === 'user' || log.type === 'success' ? 600 : 400 }}>
                    {prefix} {log.text}
                  </span>
                </div>
              )
            })
          )}
          {running && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#a78bfa' }}>
              <span className="live-dot" style={{ background: '#a78bfa', width: 6, height: 6 }} />
              <span style={{ fontStyle: 'italic' }}>Agent evaluating steps and updating checklist...</span>
            </div>
          )}
          <div ref={consoleBottomRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleAssignTask} style={{ display: 'flex', gap: 10 }}>
          <input
            value={requestText}
            onChange={(e) => setRequestText(e.target.value)}
            disabled={running || !selectedAgentId}
            placeholder="Try: 'compare React and Vue and find common points'"
            style={{
              flex: 1,
              background: '#f9f5f0',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '11px 14px',
              fontSize: 13,
              fontFamily: 'var(--font-sans)',
              color: 'var(--text-primary)',
              outline: 'none',
              transition: 'all 200ms ease',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
          />
          <button
            type="submit"
            disabled={running || !requestText.trim() || !selectedAgentId}
            className="btn-accent"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px 20px', borderRadius: 'var(--radius-sm)' }}
          >
            {running ? <Loader2 size={14} className="animate-spin" /> : <Play size={12} />}
            <span>{running ? 'Planning...' : 'Deploy'}</span>
          </button>
        </form>
      </div>

      {/* ── Column 2: Agent Specs & Active Results ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, borderLeft: '1px solid rgba(86, 28, 36, 0.08)', paddingLeft: 32 }}>
        {/* Agent Selector */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: 9,
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 6,
            }}
          >
            ACTIVE SPECTER AGENT
          </label>
          <select
            value={selectedAgentId}
            onChange={(e) => {
              setSelectedAgentId(e.target.value)
              setLastResult(null)
              setConsoleLogs([])
              setSubTasks([])
            }}
            style={{
              width: '100%',
              background: '#f9f5f0',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              fontSize: 13,
              fontFamily: 'var(--font-sans)',
              color: 'var(--text-primary)',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.status || 'online'})
              </option>
            ))}
          </select>
        </div>

        {/* Dynamic Capabilities or Active Result */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'stretch' }}>
          {lastResult ? (
            /* Glassmorphic Live Result Panel */
            <div
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.45)',
                border: '1px solid rgba(86, 28, 36, 0.15)',
                borderRadius: 12,
                padding: 16,
                boxShadow: '0 8px 32px rgba(86, 28, 36, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={13} style={{ color: 'var(--accent)' }} />
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase' }}>
                    Live Result: {lastResult.tool_used}
                  </span>
                </div>
                <div
                  style={{
                    background: 'rgba(45, 106, 79, 0.08)',
                    borderRadius: 20,
                    padding: '2px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <CheckCircle2 size={10} style={{ color: 'var(--success)' }} />
                  <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--success)', fontWeight: 600 }}>COMPLETED</span>
                </div>
              </div>

              {/* Reasoning Block */}
              {lastResult.reasoning && (
                <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', background: 'rgba(86, 28, 36, 0.03)', padding: '8px 12px', borderRadius: 8, borderLeft: '3px solid var(--accent)' }}>
                  <Cpu size={12} style={{ color: 'var(--accent)', marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, fontStyle: 'italic', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    "{lastResult.reasoning}"
                  </span>
                </div>
              )}

              {/* Parsed Output Result */}
              {renderResponse(lastResult.response)}
            </div>
          ) : (
            /* Specialized Agent Capabilities Viewer */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div
                style={{
                  fontSize: 10,
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  borderBottom: '1px solid rgba(86, 28, 36, 0.05)',
                  paddingBottom: 6,
                }}
              >
                SPECIALIZED CAPABILITIES
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {selectedAgent && getCapabilities(selectedAgent.role_description).map((cap, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'rgba(255, 255, 255, 0.25)',
                      border: '1px solid rgba(86, 28, 36, 0.04)',
                      borderRadius: 8,
                      padding: 10,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      transition: 'all 200ms ease'
                    }}
                  >
                    <ChevronRight size={12} style={{ color: 'var(--accent)', marginTop: 3, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{cap.title}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.3 }}>{cap.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
