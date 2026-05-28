import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Any

import asyncpg
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from db_init import init_db
from memory import (
    create_role,
    get_all_roles,
    get_all_tasks,
    get_recent_tasks,
    get_stats,
)

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class DescriptionRequest(BaseModel):
    role_name: str


class RoleCreate(BaseModel):
    name: str
    description: str = ""
    channels: list[str] = []


class RoleOut(BaseModel):
    id: int
    name: str
    description: str
    channels: list[str]
    created_at: Any


class TaskOut(BaseModel):
    id: int
    role_id: int | None
    user_id: str
    channel_id: str
    request_text: str
    tool_used: str
    result_summary: str
    tokens_used: int
    cost_usd: float
    created_at: Any


class StatsOut(BaseModel):
    total_tasks: int
    total_cost_usd: float
    tasks_today: int
    cost_saved_usd: float


# ---------------------------------------------------------------------------
# In-memory store (used when DATABASE_URL is not configured)
# ---------------------------------------------------------------------------

class MemoryStore:
    """Thread-safe in-memory fallback when Postgres is unavailable."""

    def __init__(self):
        self._roles: list[dict] = []
        self._tasks: list[dict] = []
        self._role_seq = 1
        self._task_seq = 1

    def _now(self) -> str:
        return datetime.now(timezone.utc).isoformat()

    def get_all_roles(self) -> list[dict]:
        return list(reversed(self._roles))

    def create_role(self, *, name: str, description: str, channels: list[str]) -> dict:
        for r in self._roles:
            if r["name"] == name:
                raise ValueError(f"Role '{name}' already exists.")
        role = {
            "id": self._role_seq,
            "name": name,
            "description": description,
            "channels": channels,
            "created_at": self._now(),
        }
        self._roles.append(role)
        self._role_seq += 1
        return role

    def delete_role(self, role_id: int) -> bool:
        before = len(self._roles)
        self._roles = [r for r in self._roles if r["id"] != role_id]
        return len(self._roles) < before

    def get_all_tasks(self, limit: int = 100) -> list[dict]:
        return list(reversed(self._tasks))[:limit]

    def get_recent_tasks(self, role_id: int, limit: int = 20) -> list[dict]:
        return [t for t in reversed(self._tasks) if t["role_id"] == role_id][:limit]

    def get_stats(self) -> dict:
        total = len(self._tasks)
        total_cost = sum(t["cost_usd"] for t in self._tasks)
        today = datetime.now(timezone.utc).date().isoformat()
        tasks_today = sum(1 for t in self._tasks if t["created_at"][:10] == today)
        return {
            "total_tasks": total,
            "total_cost_usd": round(total_cost, 6),
            "tasks_today": tasks_today,
            "cost_saved_usd": round(total * 0.50, 2),
        }


_mem = MemoryStore()


# ---------------------------------------------------------------------------
# Description fallback helper
# ---------------------------------------------------------------------------

def get_fallback_description(role_name: str) -> str:
    name_lower = role_name.lower().strip()
    if not name_lower:
        return ""
    if "scientist" in name_lower:
        return f"You are a Data Scientist Ghost Employee. Monitor data-science and machine-learning channels, build predictive models, run exploratory data analysis, evaluate key model metrics, and provide data-driven insights to the engineering team."
    elif "analyst" in name_lower or "analytics" in name_lower:
        return f"You are a junior data analyst. Monitor #data-requests channel, write SQL when asked, build dashboards, and compile weekly performance reports."
    elif "developer" in name_lower or "engineer" in name_lower or "programmer" in name_lower or "coder" in name_lower:
        return f"You are an expert Software Engineer Ghost Employee. Monitor development channels, assist with code reviews, write clean and efficient scripts, and help debug issues across the application stack."
    elif "devops" in name_lower or "infra" in name_lower or "sre" in name_lower:
        return f"You are a DevOps and Infrastructure Ghost Employee. Monitor CI/CD alerts and operations channels, troubleshoot deployment issues, optimize cloud resources, and assist with automated script executions."
    elif "support" in name_lower or "help" in name_lower or "service" in name_lower:
        return f"You are a Customer Support Ghost Employee. Monitor support and helpdesk channels, answer user inquiries with clarity and empathy, search documentation for solutions, and escalate complex issues."
    elif "writer" in name_lower or "doc" in name_lower or "content" in name_lower:
        return f"You are a Technical Writer Ghost Employee. Monitor documentation feedback, draft clear guides and API references, proofread release notes, and keep the team knowledge base up-to-date and organized."
    elif "product" in role_name or "pm" in name_lower:
        return f"You are a Product Manager Ghost Employee. Monitor product-feedback and strategy channels, compile user requests, structure comprehensive specs, draft roadmaps, and align cross-functional priorities."
    elif "designer" in name_lower or "ux" in name_lower or "ui" in name_lower:
        return f"You are a Product Designer Ghost Employee. Monitor design-feedback, build high-fidelity wireframes, outline user flows, structure design systems, and ensure design consistency across the web applications."
    else:
        return f"You are a highly capable {role_name} Ghost Employee. Monitor assigned team channels, assist with queries related to {role_name} tasks, automate routine workflows, and provide smart suggestions to improve efficiency."


# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

_pool: asyncpg.Pool | None = None
_use_memory = False


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _pool, _use_memory
    try:
        _pool = await init_db()
        logger.info("Database pool ready.")
    except KeyError:
        _use_memory = True
        logger.warning("DATABASE_URL not set — running in in-memory mode. Data will not persist across restarts.")
    except Exception as exc:
        _use_memory = True
        logger.warning("Database init failed (%s) — running in in-memory mode.", exc)
    yield
    if _pool:
        await _pool.close()
        logger.info("Database pool closed.")


app = FastAPI(title="Ghost Employee API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _pool_or_raise() -> asyncpg.Pool:
    if _pool is None:
        raise RuntimeError("No DB pool")
    return _pool


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/roles", response_model=list[RoleOut])
async def list_roles():
    if _use_memory:
        return _mem.get_all_roles()
    return await get_all_roles(_pool_or_raise())


@app.post("/roles/generate-description")
async def generate_role_description(body: DescriptionRequest):
    role_name = body.role_name.strip()
    if not role_name:
        raise HTTPException(status_code=400, detail="Role name is required.")
    try:
        from anthropic import Anthropic
        client = Anthropic()
        prompt = (
            f"You are the Ghost Employee platform. Generate a concise, clear, and action-oriented role description for a new AI Ghost Employee "
            f"named '{role_name}'. Write 2-3 sentences outlining their typical responsibilities, standard channels they should monitor, and "
            f"how they should assist the team. Do not include any greeting, intro, or markdown. Start directly with 'You are a...'"
        )
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=256,
            messages=[{"role": "user", "content": prompt}],
        )
        description = response.content[0].text.strip()
        return {"description": description}
    except Exception as exc:
        logger.error("Failed to generate description via Anthropic: %s", exc)
        fallback = get_fallback_description(role_name)
        return {"description": fallback}


@app.post("/roles", response_model=RoleOut, status_code=201)
async def add_role(body: RoleCreate):
    if _use_memory:
        try:
            return _mem.create_role(
                name=body.name,
                description=body.description,
                channels=body.channels,
            )
        except ValueError as e:
            raise HTTPException(status_code=409, detail=str(e))

    try:
        role = await create_role(
            _pool_or_raise(),
            name=body.name,
            description=body.description,
            channels=body.channels,
        )
    except asyncpg.UniqueViolationError:
        raise HTTPException(status_code=409, detail=f"Role '{body.name}' already exists.")
    return role


@app.delete("/roles/{role_id}", status_code=204)
async def remove_role(role_id: int):
    if _use_memory:
        _mem.delete_role(role_id)
        return
    try:
        pool = _pool_or_raise()
        await pool.execute("DELETE FROM roles WHERE id = $1", role_id)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/tasks", response_model=list[TaskOut])
async def list_tasks(
    role_id: int | None = Query(None, description="Filter by role ID; omit to return all tasks"),
    limit: int = Query(100, ge=1, le=500),
):
    if _use_memory:
        if role_id is not None:
            return _mem.get_recent_tasks(role_id, limit=limit)
        return _mem.get_all_tasks(limit=limit)

    pool = _pool_or_raise()
    if role_id is not None:
        return await get_recent_tasks(pool, role_id, limit=limit)
    return await get_all_tasks(pool, limit=limit)


@app.get("/stats", response_model=StatsOut)
async def aggregate_stats():
    if _use_memory:
        return _mem.get_stats()
    return await get_stats(_pool_or_raise())


@app.get("/health")
async def health():
    return {"status": "ok", "mode": "memory" if _use_memory else "database"}


# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
