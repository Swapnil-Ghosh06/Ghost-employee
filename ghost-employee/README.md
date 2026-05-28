# 👻 Ghost Employee

An AI-powered Slack bot that operates as a ghost employee — autonomously handling tasks, remembering context, and integrating with your team's tools.

## Stack

| Layer | Tech |
|-------|------|
| AI Brain | Anthropic Claude (via `anthropic`) |
| Slack Interface | Slack Bolt (`slack-bolt`) |
| API Server | FastAPI + Uvicorn |
| Database | PostgreSQL (`asyncpg`) |
| Cache / Memory | Redis |
| GitHub Integration | PyGithub |

## Project Structure

```
ghost-employee/
├── backend/
│   ├── slack_bot.py     # Slack event listeners and Bolt app
│   ├── agent.py         # Claude-powered agent logic
│   ├── memory.py        # Persistent memory (Redis + Postgres)
│   ├── tools.py         # Agent tool definitions
│   ├── api.py           # FastAPI routes
│   ├── db_init.py       # DB schema initialization
│   ├── requirements.txt
│   └── .env.example
├── dashboard/           # Frontend dashboard (TBD)
├── docker-compose.yml
└── README.md
```

## Getting Started

### 1. Clone and configure environment

```bash
cp backend/.env.example backend/.env
# Fill in your keys in backend/.env
```

### 2. Start services

```bash
docker-compose up -d
```

### 3. Install Python dependencies

```bash
pip install -r backend/requirements.txt
```

## Environment Variables

See [`backend/.env.example`](./backend/.env.example) for all required keys.

| Variable | Description |
|----------|-------------|
| `SLACK_BOT_TOKEN` | Slack bot OAuth token (`xoxb-...`) |
| `SLACK_APP_TOKEN` | Slack app-level token for Socket Mode (`xapp-...`) |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude |
| `DATABASE_URL` | PostgreSQL connection string |
| `GITHUB_TOKEN` | GitHub personal access token |


### 4. Run the backend
```bash
cd backend
uvicorn api:app --reload --port 8000
python slack_bot.py
```

### 5. Run the dashboard
```bash
cd dashboard
npm install
npm run dev
```