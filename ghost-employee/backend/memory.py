import asyncpg
import logging
from decimal import Decimal
from typing import Any

logger = logging.getLogger(__name__)


async def save_task(
    pool: asyncpg.Pool,
    *,
    role_id: int | None,
    user_id: str,
    channel_id: str,
    request_text: str,
    tool_used: str,
    result_summary: str,
    tokens_used: int,
    cost_usd: float,
) -> int:
    """Insert a task record and return its new id."""
    row = await pool.fetchrow(
        """
        INSERT INTO tasks
            (role_id, user_id, channel_id, request_text,
             tool_used, result_summary, tokens_used, cost_usd)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
        """,
        role_id,
        user_id,
        channel_id,
        request_text,
        tool_used,
        result_summary,
        tokens_used,
        cost_usd,
    )
    return row["id"]


async def get_recent_tasks(
    pool: asyncpg.Pool,
    role_id: int,
    limit: int = 20,
) -> list[dict[str, Any]]:
    """Return the most recent `limit` tasks for a given role, newest-first."""
    rows = await pool.fetch(
        """
        SELECT id, role_id, user_id, channel_id, request_text,
               tool_used, result_summary, tokens_used, cost_usd, created_at
        FROM tasks
        WHERE role_id = $1
        ORDER BY created_at DESC
        LIMIT $2
        """,
        role_id,
        limit,
    )
    return [dict(r) for r in rows]


async def get_all_roles(pool: asyncpg.Pool) -> list[dict[str, Any]]:
    """Return all roles ordered by most recently created."""
    rows = await pool.fetch(
        "SELECT id, name, description, channels, created_at FROM roles ORDER BY created_at DESC"
    )
    return [dict(r) for r in rows]


async def create_role(
    pool: asyncpg.Pool,
    *,
    name: str,
    description: str,
    channels: list[str],
) -> dict[str, Any]:
    """Insert a new role and return the full row."""
    row = await pool.fetchrow(
        """
        INSERT INTO roles (name, description, channels)
        VALUES ($1, $2, $3)
        RETURNING id, name, description, channels, created_at
        """,
        name,
        description,
        channels,
    )
    return dict(row)


async def get_stats(pool: asyncpg.Pool) -> dict[str, Any]:
    """Return aggregate task statistics across all roles."""
    row = await pool.fetchrow(
        """
        SELECT
            COUNT(*)                                                AS total_tasks,
            COALESCE(SUM(cost_usd), 0)                              AS total_cost_usd,
            COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE)     AS tasks_today
        FROM tasks
        """
    )
    total_tasks = int(row["total_tasks"])
    return {
        "total_tasks": total_tasks,
        "total_cost_usd": float(row["total_cost_usd"]),
        "tasks_today": int(row["tasks_today"]),
        "cost_saved_usd": round(total_tasks * 0.50, 2),
    }


async def get_all_tasks(pool: asyncpg.Pool, limit: int = 100) -> list[dict[str, Any]]:
    """Return the most recent `limit` tasks across all roles, newest-first."""
    rows = await pool.fetch(
        """
        SELECT id, role_id, user_id, channel_id, request_text,
               tool_used, result_summary, tokens_used, cost_usd, created_at
        FROM tasks
        ORDER BY created_at DESC
        LIMIT $1
        """,
        limit,
    )
    return [dict(r) for r in rows]


async def search_tasks_by_similarity(
    pool: asyncpg.Pool,
    query: str,
    role_id: int,
    limit: int = 10,
) -> list[dict[str, Any]]:
    """
    Return tasks whose request_text is similar to `query` using pg_trgm,
    ranked by similarity score descending.
    """
    rows = await pool.fetch(
        """
        SELECT id, role_id, user_id, channel_id, request_text,
               tool_used, result_summary, tokens_used, cost_usd, created_at,
               similarity(request_text, $1) AS score
        FROM tasks
        WHERE role_id = $2
          AND similarity(request_text, $1) > 0.1
        ORDER BY score DESC
        LIMIT $3
        """,
        query,
        role_id,
        limit,
    )
    return [dict(r) for r in rows]
