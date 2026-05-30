# 👻 Ghost Employee (Ghost Rider Workspace)

> **Deploy, monitor, and coordinate autonomous virtual teammates ("Ghost Employees") directly inside your team's workspace.**

This is the main monorepo workspace for **Ghost Employee** (code-named *Ghost Rider*).

---

<p align="center">
  <img src="https://img.shields.io/badge/AI_Brain-Anthropic_Claude-7C3AED?style=for-the-badge&logo=anthropic&logoColor=white" alt="AI Brain" />
  <img src="https://img.shields.io/badge/Interface-Slack_Bolt-4A154B?style=for-the-badge&logo=slack&logoColor=white" alt="Slack Bolt" />
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL_&_Redis-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="Database" />
  <img src="https://img.shields.io/badge/Frontend-React_TypeScript_&_GSAP-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="Frontend" />
</p>

---

## 🌌 Introduction & Vision

**Ghost Employee** is a next-generation AI agent orchestration platform designed to bridge the gap between team communication channels and automated execution environments. 

Rather than building simple, single-purpose Slack slash commands or passive notification feeds, **Ghost Employee** empowers you to spin up fully autonomous virtual teammates. Each agent is defined with a distinct **Role**, operates within designated Slack channels, and is armed with structured tools allowing it to run database queries, compose software scripts, file GitHub issues, retrieve past task context, or request clarification—all from normal Slack conversations.

### The Objective
*   **Reduce Context-Switching:** Bring the developer’s database, code sandbox, and issue tracker directly into Slack.
*   **Decentralize Automation:** Empower non-technical stakeholders to ask natural language questions (e.g., *"What is our current monthly active user count?"*) and receive safe, read-only SQL reports automatically.
*   **Full Observability:** Provide a premium, real-time control room (The Dashboard) where team operators can audit role assignments, track dollar costs, view interactive terminal telemetry, and watch multi-step planning tasks execute step-by-step.

---

## 🛠️ The Tech Stack

The architecture is split into a robust, high-performance Python backend and a beautiful, immersive glassmorphic frontend dashboard.

```mermaid
graph TD
    subgraph Slack Workspace
        SU[Slack User] <--> |Socket Mode / Events| SB[Slack Bolt Bot]
    end

    subgraph Operator Dashboard
        DB[React Frontend] <--> |HTTP / JSON REST API| FA[FastAPI Gateway]
    end

    subgraph AI Engine & Memory
        SB <--> |Agent Execution| AG[Claude Sonnet 3.5]
        FA <--> |Direct Deployments| AG
        SB <--> |Semantic & Task Logging| PG[(PostgreSQL)]
        SB <--> |Context Cache| RD[(Redis Cache)]
        FA <--> |Stats & Configs| PG
    end

    subgraph Integrations
        AG --> |Database Tool| PG
        AG --> |GitHub API| GH[GitHub Repository]
    end
```

### Backend Layer
*   **AI Orchestration:** Anthropic Claude (`claude-sonnet-4-20250514`) acts as the cognitive engine. It parses incoming workspace text, maintains thread context, and determines when to trigger automated tools using a strict JSON-dispatch parser.
*   **Workspace Gateway:** Built with **Slack Bolt for Python** in Socket Mode, allowing instant event-driven listening without opening raw public ports on your local network.
*   **API Service:** **FastAPI + Uvicorn** serves high-speed asynchronous REST endpoints providing agent metadata, configuration controls, and task telemetry directly to the dashboard.
*   **Data Lake & Memory:** **PostgreSQL** (interfaced asynchronously via `asyncpg`) persists task metrics, token usages, financial logs, and active roles. Utilizes specialized schema indices for fast lookup.
*   **Transient Storage:** **Redis** maintains agent lock parameters and short-term chat context variables.

### Frontend Layer
*   **Component Base:** **React 18** and **TypeScript** configured over **Vite** for rapid hot-reloads and modular type-safety.
*   **Utility Styling:** **Tailwind CSS** combined with custom CSS variables to generate a polished, uniform dark-themed UI.
*   **Visual Polish:** **Radix UI primitives** (via `shadcn/ui` standards) for dialogs, modals, and dropdown overlays.
*   **High-Fidelity Animations:** **GSAP (GreenSock)** and `@gsap/react` drive smooth, hardware-accelerated timeline transitions, interactive log metrics counters, and bento-box hover effects.
*   **Data Visualization:** **Recharts** charts render live cost histories, token allocations, and operations success metrics.
*   **Fluid Scrolling:** **Lenis** provides customized inertial page scrolling.

---

## ⚡ Agent Capability System (The 6 Tools)

Each Ghost Employee is given specialized permissions to run system commands and interact with third-party software. The AI brain evaluates the user's intent and dispatches one of **six core tools**:

| Tool Name | Action | Input Parameters | Safe Execution Protocol |
| :--- | :--- | :--- | :--- |
| **`reply_slack`** | Formulates and posts a response into the active Slack thread. | `channel_id`, `thread_ts`, `text` | Directly replies to the user in context. |
| **`run_sql`** | Executes SQL queries and returns a markdown table. | `query` | **Read-Only Enforced:** Rejects queries starting with `INSERT`, `UPDATE`, `DELETE`, `DROP`, or `ALTER`. |
| **`write_code`** | Authors syntax-highlighted code blocks (CSS, TS, Python, SQL). | `language`, `code`, `filename` | Renders fully formatted snippets back to the target workspace. |
| **`create_github_issue`** | Automatically files a formal tracking issue on GitHub. | `repo_full_name`, `title`, `body`, `labels` | Integrates via PyGithub using the configured repository credentials. |
| **`search_past_tasks`** | Searches the database for similar previous tasks. | `query`, `role_id`, `limit` | Automatically injects historical context to maintain task consistency. |
| **`ask_clarification`** | Halts current chain and asks the user a clarifying question. | `question`, `state` | Sets agent state to `pending_clarification` and waits for subsequent replies. |

---

## 🎛️ Dashboard Command Center

The Ghost Rider dashboard features a stunning, premium aesthetic built to deliver instant wow-factor:
*   **Dark Mode Visuals:** Deep charcoal workspace (`#0a0a0a`), carbon fiber card surfaces (`#111111`), and vibrant neon purple highlights (`#7C3AED`).
*   **Co-Work Hub (Interactive Terminal):** Operators can select an active agent, input tasks directly, and watch a **Multi-Step Planner** generate, validate, and execute an active step-by-step checklist.
*   **Cost & Savings Tracker:** Beautiful Recharts telemetry displays financial cost vs. value saved. Every task executed automatically tracks input/output tokens, calculating exact Anthropic costs and matching them against a **$0.50 average developer cost-savings index** to showcase ROI in real-time.
*   **Ghost Configurator:** Allows operators to add new employees, assign them custom active times (hours from/to), bind them to specific Slack channels, and trigger Claude to **auto-generate detailed, professional agent prompts** from just a title (e.g. *"Data Scientist"*).
*   **Interactive System Logs:** Real-time, color-coded console outputs mapping active `[INFO]`, `[DISPATCH]`, `[THINKING]`, `[SUCCESS]`, and `[ERROR]` metrics.

---

## 📂 Project Structure

```
ghost-employee/
├── backend/
│   ├── slack_bot.py      # Slack Event Listener, Bolt App, & Event Loop
│   ├── agent.py          # Claude API Orchestrator & Strict JSON Output Validator
│   ├── memory.py         # Async DB access layer (pg_trgm similarity search & tasks logging)
│   ├── tools.py          # Implementations for the 6 core tools (reply_slack, run_sql, etc.)
│   ├── api.py            # FastAPI REST endpoints for dashboard config & telemetry
│   ├── db_init.py        # Database schema bootstrap scripts
│   ├── requirements.txt  # Python package declarations
│   └── .env.example      # Sample configurations for variables
├── dashboard/
│   ├── src/
│   │   ├── components/   # Modular dashboard components (CoWorkTerminal, MetricCard, etc.)
│   │   ├── pages/        # Route views (Dashboard, Config, CostTracker, Settings, WorkLog)
│   │   ├── services/     # api.ts (handles CORS requests, field mappings, and offline mock fallbacks)
│   │   ├── types/        # TypeScript interfaces for Roles, Tasks, and Stats
│   │   ├── globals.css   # Main CSS styling variables and custom animations
│   │   ├── App.tsx       # Routing logic and sidebar navigation layout
│   │   └── main.tsx      # Main application entry point
│   ├── tailwind.config.ts# Tailwind configurations
│   ├── tsconfig.json     # TypeScript settings
│   ├── package.json      # Node package declarations
│   └── vite.config.ts    # Vite compiler adjustments
├── docker-compose.yml    # Combined Docker multi-container orchestrator
└── README.md             # Project roadmap and general instructions
```

---

## 🚀 Workspace Commands

A `package.json` file is configured at the workspace root to orchestrate both services from a single location:

```bash
# Install dashboard dependencies
npm run install:dashboard

# Start the dashboard (React + Vite)
npm run dev

# Launch the FastAPI REST Backend
npm run dev:backend

# Launch the Slack Bot Client listener
npm run dev:bot

# Build dashboard for production
npm run build
```

---

## 🚀 Getting Started

### Option A: Standard Local Setup (Recommended for Dev)

#### 1. Configure the Environment
Create a copy of `.env.example` inside the `ghost-employee/backend` directory and name it `.env`:
```bash
cp ghost-employee/backend/.env.example ghost-employee/backend/.env
```
Fill in the configuration details inside the file:
```env
# Slack Credentials
SLACK_BOT_TOKEN=xoxb-...
SLACK_APP_TOKEN=xapp-...

# AI Brain API Key
ANTHROPIC_API_KEY=sk-ant-...

# Integrations
GITHUB_TOKEN=ghp_...

# Database (PostgreSQL URL)
DATABASE_URL=postgresql://user:password@localhost:5432/ghost_employee
```

#### 2. Start PostgreSQL and Redis via Docker
Spin up the database and cache instances in the background:
```bash
docker-compose up -d postgres redis
```

#### 3. Setup the Python Backend
Initialize a virtual environment, install dependencies, and launch the services:
```bash
cd ghost-employee/backend
python -m venv venv
source venv/bin/activate  # On Windows, use: venv\Scripts\activate

pip install -r requirements.txt
python db_init.py         # Set up database schema parameters
```

Launch the FastAPI dashboard server:
```bash
uvicorn api:app --reload --port 8000
```

Launch the Slack Bolt listener in a separate terminal:
```bash
python slack_bot.py
```

#### 4. Setup the Frontend Dashboard
Navigate to the dashboard directory, install dependencies, and run the Vite compiler:
```bash
cd ../dashboard
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to view the premium dashboard.

---

### Option B: Docker Compose Full-Stack Setup (Production Mode)

To run the entire system—including the databases, python agent, API gateway, and dashboard—with a single command:

```bash
# Verify your ghost-employee/backend/.env variables are fully set up
docker-compose up --build -d
```
The stack will spin up:
*   **Dashboard** on [http://localhost:3000](http://localhost:3000)
*   **FastAPI Gateway** on [http://localhost:8000](http://localhost:8000)
*   **PostgreSQL** on port `5432`
*   **Redis** on port `6379`

---

## 📡 API Reference Endpoints

The FastAPI backend exposes several telemetry and configuration routes used by the React Dashboard:

*   `GET /roles` — Fetches list of all active Ghost Employees.
*   `POST /roles` — Instantiates a brand-new Ghost Employee.
*   `DELETE /roles/{role_id}` — Removes and deactivates a specific Ghost Employee.
*   `POST /roles/generate-description` — Uses Claude to generate professional descriptions based on custom titles.
*   `GET /tasks` — Retrieves detailed historical list of tasks. Supports `role_id` filtering.
*   `POST /tasks` — Forces manual agent dispatch from the interactive console dashboard.
*   `GET /stats` — Compiles analytical data showing accumulated costs, tokens utilized, and values saved.
*   `GET /health` — Simple heartbeat endpoint returns active database configurations.

---

## 🎨 Immersive Design Standards

The frontend has been built under premium visual principles tailored for an high-end look and feel:

```css
/* Color Palette Variables */
--bg-base: #0a0a0a;            /* Dystopian background */
--bg-card: #111111;            /* Sleek carbon card surfaces */
--accent: #7C3AED;             /* Cyber purple neon glow */
--accent-dim: rgba(124, 58, 237, 0.08);
--border: rgba(255, 255, 255, 0.06);
--font-mono: 'JetBrains Mono', monospace; /* Used for code / telemetry logs */
--font-sans: 'Inter', sans-serif;         /* Used for readable metrics */
```

### GSAP Animation Protocols
1.  **Entrance Stagger:** Task listings inside the `WorkLog` list animate upwards using `gsap.from()` with a `stagger: 0.05s`.
2.  **Live Pulse:** Online badges and status indicators perform continuous glow cycles (`scale: 1 -> 1.08 -> 1`) on a 2s loop.
3.  **Numerical Counters:** ROI metrics and savings amounts automatically transition upon page load using custom GSAP decimal interpolators.

---

## 🤖 Contributing & Hackathon Mode

If you're in a rush to prototype new features or demonstrate the app at an event, you can run in **Hackathon Mode**. 

The frontend's API service (`ghost-employee/dashboard/src/services/api.ts`) contains **automatic, local mock fallbacks**. If the Python API gateway goes offline, the dashboard gracefully cascades into an internal simulation engine.

---

_"Code is craft. Ship with intention."_ 👻⚡
