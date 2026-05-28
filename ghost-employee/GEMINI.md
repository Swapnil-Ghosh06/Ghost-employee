# Ghost Rider — Antigravity Rules

## Project
Ghost Rider (Ghost Employee) — Slack AI agent platform. Agents have roles, live in channels, handle tasks.

## My job in Antigravity
- Scaffold folder structure
- Build the React dashboard UI
- Handle all visual/component work

## Folder structure (for context)
```
/ghost-rider
  /backend      ← Python (Claude Code handles this)
  /dashboard    ← React + Vite + Tailwind (MY territory)
    src/
      pages/    Config, WorkLog, CostTracker, Settings
      components/
```

## Dashboard aesthetic
- Background: `#0a0a0a`
- Card surfaces: `#111111`
- Accent color: `#7C3AED`
- Fonts: JetBrains Mono for logs/data, Inter for everything else
- Borders: `1px solid rgba(255,255,255,0.06)`
- Max border-radius: 8px
- No bouncy animations. Entrances: 200ms. Pulses: 2s loops.

## UI components (from 21st.dev, already adapted)
- AnimatedTerminal — live agent activity log
- StatusDot / LiveBadge — agent online/offline
- MetricCard — cost saved, tasks done, queue count
- CommandPalette (Cmd+K) — assign ghost to channel
- DataTable with row expand — task history
- Sidebar with animated collapse

## Tech
- React + Vite + Tailwind
- shadcn/ui base components
- GSAP + @gsap/react for animations
- API: FastAPI on localhost:8000

## GSAP animation rules
1. New task card in WorkLog → `gsap.from()` slide up + fade in, stagger 0.05s
2. Agent status dot → `gsap.to()` pulse loop when online
3. CostTracker number → GSAP CountTo on mount
4. Save role on Config page → ghost avatar scale 0.8→1 elastic ease
5. WorkLog sections → ScrollTrigger fade-in

## API endpoints (backend already built by Claude Code)
- `GET /roles` — all ghost roles
- `POST /roles` — create ghost
- `GET /tasks?role_id=` — task history
- `GET /stats` — cost tracker data
- Auto-refresh /tasks every 10 seconds

## Mode rules
- Use Fast Mode (Cmd+L) for: small edits, CSS tweaks, adding one component, fixing a typo
- Use Planning Mode for: building a full new page, wiring GSAP across the dashboard, setting up the whole project scaffold

## What NOT to touch
- /backend folder — that's Claude Code's job
- Don't modify requirements.txt or any Python files
- Don't change docker-compose.yml unless asked

## Component file naming
- PascalCase for all components: WorkLog.jsx, CostTracker.jsx
- One component per file, no exceptions
- All GSAP animations live in a /animations folder, 
  imported into components — not written inline

## When building a new page
1. Create the page file in src/pages/
2. Create sub-components in src/components/
3. Wire GSAP last, after layout is confirmed working
4. Always use CSS variables from globals.css, never hardcode colors

## Colors as CSS variables (put in globals.css)
--bg-base: #0a0a0a;
--bg-card: #111111;
--accent: #7C3AED;
--border: rgba(255,255,255,0.06);
--font-mono: 'JetBrains Mono', monospace;
--font-sans: 'Inter', sans-serif;