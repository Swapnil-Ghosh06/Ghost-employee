export interface GhostRole {
  id: string
  name: string
  role_description: string
  channels: string[]
  active_hours_from: string
  active_hours_to: string
  status: 'online' | 'offline' | 'busy'
  created_at: string
}

export interface Task {
  id: string
  role_id: string
  role_name: string
  channel: string
  request: string
  response: string
  tool_used: string
  status: 'completed' | 'pending' | 'failed'
  duration_ms: number
  cost_usd: number
  reasoning: string
  created_at: string
}

export interface Stats {
  tasks_today: number
  cost_saved_today: number
  queue_count: number
  total_cost_usd: number
  tasks_this_week: number
  avg_cost_per_task: number
  hours_saved: number
  hourly_rate: number
  daily_costs: { date: string; cost: number }[]
}

export interface LogEntry {
  id: string
  timestamp: string
  ghost_name: string
  tool_used: string
  message: string
  level: 'INFO' | 'WARN' | 'ERROR'
}
