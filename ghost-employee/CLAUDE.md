# Ghost Rider — Claude Code Rules

## Project
Ghost Rider (Ghost Employee) — a Slack AI agent platform where you define roles, assign them to channels, and they handle tasks autonomously. Stack: Python backend + React dashboard.

## Folder structure
```
/ghost-rider
  /backend
    slack_bot.py     ← Slack Bolt, socket mode
    agent.py         ← Claude API calls, tool routing
    memory.py        ← asyncpg, PostgreSQL tasks + roles
    tools.py         ← 6 tools: reply_slack, run_sql, write_code, github_issue, search_tasks, ask_clarification
    api.py           ← FastAPI, CORS enabled for localhost:5173
    db_init.py       ← CREATE TABLE IF NOT EXISTS
    requirements.txt
    .env
  /dashboard
    src/
      pages/         ← Config, WorkLog, CostTracker, Settings
      components/    ← from 21st.dev, adapted for dark theme
    package.json
  docker-compose.yml
```

## Stack
- Backend: Python, slack-bolt, anthropic SDK, asyncpg, fastapi, uvicorn, pygithub, redis
- Frontend: React + Vite + Tailwind + shadcn/ui + GSAP
- DB: PostgreSQL with pg_trgm for fuzzy search
- Model: claude-sonnet-4-20250514

## Aesthetic (dashboard)
- Background: `#0a0a0a`, cards: `#111111`
- Accent: `#7C3AED` (electric purple)
- Fonts: JetBrains Mono (logs/data), Inter (labels)
- Borders: `1px solid rgba(255,255,255,0.06)`
- Max border-radius: 8px
- Animations: 200ms entrances, 2s pulses, no bounces

## Coding rules
- Never write placeholder comments like `# TODO` or `# implement later` — write the real code
- Always use async/await for DB and API calls
- All tools return `ToolResult(output, error, tokens_used)`
- Agent always responds with valid JSON `{ "tool": "<name>", "params": {} }` — add try/except fallback
- SQL tool: SELECT only, never write queries
- All env vars loaded from `.env` via python-dotenv

## What NOT to do
- Do not read files outside /backend or /dashboard unless asked
- Do not install packages not in requirements.txt without saying so
- Do not rewrite files that are already working — only patch what's broken
- Do not add console.log spam

## Compact instructions
When compacting, keep:
- Current task goal
- Which files were changed
- Any errors and exact error messages
- Decisions made
- What to do next

Drop:
- Old exploration paths
- Repeated logs
- Resolved errors


# Ghost Employee — Claude Code Rules

## My job
- All Python backend logic in /backend
- Wiring frontend to backend
- Debugging and fixes
- DO NOT touch /dashboard unless asked

## Stack
- Python, FastAPI, Slack Bolt, Anthropic SDK
- asyncpg for PostgreSQL, Redis for cache
- Model: claude-sonnet-4-20250514

## Key files
- slack_bot.py — Slack event listener, Socket Mode
- agent.py — Claude API call, returns tool_call JSON
- memory.py — asyncpg DB read/write
- tools.py — 6 tool implementations
- api.py — FastAPI routes for dashboard

## Rules
- Never use sync functions where async is needed
- All DB calls go through memory.py, never inline
- Every tool returns ToolResult(output, error, tokens_used)
- Environment variables always loaded from .env via python-dotenv
- Never hardcode API keys

## API ports
- FastAPI runs on port 8000
- Dashboard (Vite) runs on port 5173
- CORS must allow localhost:5173

## Current phase
Backend is built. Focus on wiring, debugging, and 
connecting to the dashboard API.