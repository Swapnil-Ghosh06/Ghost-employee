import type { GhostRole, Task, Stats } from '@/types'

const BASE = 'http://localhost:8000'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

// ── Field mappers ───────────────────────────────────────────────────────────
// Backend uses snake_case but different field names than the frontend types.

function mapRole(r: any): GhostRole {
  return {
    id: String(r.id),
    name: r.name,
    role_description: r.description ?? r.role_description ?? '',
    channels: r.channels ?? [],
    active_hours_from: r.active_hours_from ?? '09:00',
    active_hours_to: r.active_hours_to ?? '18:00',
    status: r.status ?? 'offline',
    created_at: r.created_at ?? new Date().toISOString(),
  }
}

function mapTask(t: any): Task {
  return {
    id: String(t.id),
    role_id: String(t.role_id ?? ''),
    role_name: t.role_name ?? '',
    channel: t.channel_id ?? t.channel ?? '',
    request: t.request_text ?? t.request ?? '',
    response: t.result_summary ?? t.response ?? '',
    tool_used: t.tool_used ?? '',
    status: t.status ?? 'completed',
    duration_ms: t.duration_ms ?? 0,
    cost_usd: t.cost_usd ?? 0,
    reasoning: t.reasoning ?? '',
    created_at: t.created_at ?? new Date().toISOString(),
  }
}

function mapStats(r: any): Stats {
  const total: number = r.total_tasks ?? 0
  const totalCost: number = r.total_cost_usd ?? 0
  return {
    tasks_today: r.tasks_today ?? 0,
    cost_saved_today: r.cost_saved_usd ?? r.cost_saved_today ?? 0,
    queue_count: r.queue_count ?? 0,
    total_cost_usd: totalCost,
    tasks_this_week: r.tasks_this_week ?? total,
    avg_cost_per_task: r.avg_cost_per_task ?? (total > 0 ? totalCost / total : 0),
    hours_saved: r.hours_saved ?? Math.round((r.cost_saved_usd ?? 0) / 14),
    hourly_rate: r.hourly_rate ?? 14,
    daily_costs: r.daily_costs ?? [],
  }
}

// ── Roles ──────────────────────────────────────────────────────────────────

export async function getRoles(): Promise<GhostRole[] | null> {
  try {
    const raw = await request<any[]>('/roles')
    return raw.map(mapRole)
  } catch (err) {
    console.error('getRoles failed:', err)
    return null
  }
}

export async function createRole(
  data: Omit<GhostRole, 'id' | 'created_at' | 'status'>
): Promise<GhostRole | null> {
  try {
    const raw = await request<any>('/roles', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        description: data.role_description,
        channels: data.channels,
      }),
    })
    return {
      ...mapRole(raw),
      active_hours_from: data.active_hours_from,
      active_hours_to: data.active_hours_to,
    }
  } catch (err) {
    console.error('createRole failed:', err)
    return null
  }
}

export async function deleteRole(id: string): Promise<boolean> {
  try {
    await request<void>(`/roles/${id}`, { method: 'DELETE' })
    return true
  } catch (err) {
    console.error('deleteRole failed:', err)
    return false
  }
}

// ── Tasks ──────────────────────────────────────────────────────────────────

export async function getTasks(role_id: string | null = null): Promise<Task[] | null> {
  try {
    const path = role_id ? `/tasks?role_id=${role_id}` : '/tasks'
    const raw = await request<any[]>(path)
    return raw.map(mapTask)
  } catch (err) {
    console.error('getTasks failed:', err)
    return null
  }
}

// ── Stats ──────────────────────────────────────────────────────────────────

export async function getStats(): Promise<Stats | null> {
  try {
    const raw = await request<any>('/stats')
    return mapStats(raw)
  } catch (err) {
    console.error('getStats failed:', err)
    return null
  }
}

// ── Mock fallback (when backend is offline) ─────────────────────────────────

export function getMockStats(): Stats {
  return {
    tasks_today: 47,
    cost_saved_today: 312.50,
    queue_count: 3,
    total_cost_usd: 8.42,
    tasks_this_week: 218,
    avg_cost_per_task: 0.039,
    hours_saved: 89,
    hourly_rate: 14,
    daily_costs: [
      { date: 'Mon', cost: 1.2 },
      { date: 'Tue', cost: 0.9 },
      { date: 'Wed', cost: 1.8 },
      { date: 'Thu', cost: 0.6 },
      { date: 'Fri', cost: 2.1 },
      { date: 'Sat', cost: 0.4 },
      { date: 'Sun', cost: 1.42 },
    ],
  }
}

export function getMockTasks(): Task[] {
  return [
    {
      id: '1',
      role_id: 'r1',
      role_name: 'Data Analyst',
      channel: '#data-requests',
      request: 'Can you run a query to get the top 10 users by revenue this month?',
      response: 'SELECT user_id, SUM(revenue) as total FROM transactions WHERE ...',
      tool_used: 'write_sql',
      status: 'completed',
      duration_ms: 4200,
      cost_usd: 0.041,
      reasoning: 'User requested revenue data. Used write_sql tool to generate optimized query.',
      created_at: new Date(Date.now() - 120000).toISOString(),
    },
    {
      id: '2',
      role_id: 'r1',
      role_name: 'Data Analyst',
      channel: '#data-requests',
      request: 'What was our churn rate last quarter?',
      response: 'Churn rate Q1 2025: 3.2%. Based on 1,240 churned / 38,750 active users.',
      tool_used: 'query_db',
      status: 'completed',
      duration_ms: 3100,
      cost_usd: 0.028,
      reasoning: 'Calculated churn using standard formula from user_events table.',
      created_at: new Date(Date.now() - 600000).toISOString(),
    },
    {
      id: '3',
      role_id: 'r2',
      role_name: 'Support Bot',
      channel: '#support',
      request: 'How do I reset my 2FA?',
      response: 'To reset your 2FA: 1) Go to Account Settings → Security...',
      tool_used: 'search_docs',
      status: 'completed',
      duration_ms: 1800,
      cost_usd: 0.012,
      reasoning: 'Found relevant documentation page for 2FA reset flow.',
      created_at: new Date(Date.now() - 900000).toISOString(),
    },
    {
      id: '4',
      role_id: 'r2',
      role_name: 'Support Bot',
      channel: '#support',
      request: 'My payment failed but I was still charged',
      response: '',
      tool_used: 'escalate',
      status: 'pending',
      duration_ms: 0,
      cost_usd: 0,
      reasoning: '',
      created_at: new Date(Date.now() - 60000).toISOString(),
    },
    {
      id: '5',
      role_id: 'r1',
      role_name: 'Data Analyst',
      channel: '#data-requests',
      request: 'Generate a report on DAU for the past 30 days',
      response: '',
      tool_used: 'create_report',
      status: 'failed',
      duration_ms: 8000,
      cost_usd: 0.055,
      reasoning: 'Database timeout after 8 seconds. Query too complex without index.',
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
  ]
}

export function getMockRoles(): GhostRole[] {
  return [
    {
      id: 'r1',
      name: 'Data Analyst',
      role_description: 'Monitor #data-requests channel, write SQL queries, generate reports on demand.',
      channels: ['#data-requests', '#analytics'],
      active_hours_from: '09:00',
      active_hours_to: '18:00',
      status: 'online',
      created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
    {
      id: 'r2',
      name: 'Support Bot',
      role_description: 'Handle tier-1 support requests in #support. Escalate billing issues to human.',
      channels: ['#support', '#help'],
      active_hours_from: '00:00',
      active_hours_to: '23:59',
      status: 'busy',
      created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
    },
  ]
}

// ── Smart Auto-generation fallback helper ──────────────────────────────
function getLocalFallbackDescription(roleName: string): string {
  const nameLower = roleName.toLowerCase().trim()
  if (!nameLower) return ''
  if (nameLower.includes('scientist')) {
    return 'You are a Data Scientist Ghost Employee. Monitor data-science and machine-learning channels, build predictive models, run exploratory data analysis, evaluate key model metrics, and provide data-driven insights to the engineering team.'
  } else if (nameLower.includes('analyst') || nameLower.includes('analytics')) {
    return 'You are a junior data analyst. Monitor #data-requests channel, write SQL when asked, build dashboards, and compile weekly performance reports.'
  } else if (nameLower.includes('developer') || nameLower.includes('engineer') || nameLower.includes('programmer') || nameLower.includes('coder')) {
    return 'You are an expert Software Engineer Ghost Employee. Monitor development channels, assist with code reviews, write clean and efficient scripts, and help debug issues across the application stack.'
  } else if (nameLower.includes('devops') || nameLower.includes('infra') || nameLower.includes('sre')) {
    return 'You are a DevOps and Infrastructure Ghost Employee. Monitor CI/CD alerts and operations channels, troubleshoot deployment issues, optimize cloud resources, and assist with automated script executions.'
  } else if (nameLower.includes('support') || nameLower.includes('help') || nameLower.includes('service')) {
    return 'You are a Customer Support Ghost Employee. Monitor support and helpdesk channels, answer user inquiries with clarity and empathy, search documentation for solutions, and escalate complex issues.'
  } else if (nameLower.includes('writer') || nameLower.includes('doc') || nameLower.includes('content')) {
    return 'You are a Technical Writer Ghost Employee. Monitor documentation feedback, draft clear guides and API references, proofread release notes, and keep the team knowledge base up-to-date and organized.'
  } else if (nameLower.includes('product') || nameLower.includes('pm')) {
    return 'You are a Product Manager Ghost Employee. Monitor product-feedback and strategy channels, compile user requests, structure comprehensive specs, draft roadmaps, and align cross-functional priorities.'
  } else if (nameLower.includes('designer') || nameLower.includes('ux') || nameLower.includes('ui')) {
    return 'You are a Product Designer Ghost Employee. Monitor design-feedback, build high-fidelity wireframes, outline user flows, structure design systems, and ensure design consistency across the web applications.'
  } else {
    return `You are a highly capable ${roleName} Ghost Employee. Monitor assigned team channels, assist with queries related to ${roleName} tasks, automate routine workflows, and provide smart suggestions to improve efficiency.`
  }
}

export async function generateDescription(roleName: string): Promise<string> {
  try {
    const raw = await request<{ description: string }>('/roles/generate-description', {
      method: 'POST',
      body: JSON.stringify({ role_name: roleName }),
    })
    return raw.description
  } catch (err) {
    console.warn('generateDescription API failed, using local fallback:', err)
    return getLocalFallbackDescription(roleName)
  }
}

