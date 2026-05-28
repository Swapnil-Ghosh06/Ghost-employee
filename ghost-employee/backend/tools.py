import os
import logging
import asyncpg
from dataclasses import dataclass
from typing import Any

from dotenv import load_dotenv
from github import Github, GithubException
from slack_sdk.web.async_client import AsyncWebClient

from memory import search_tasks_by_similarity

load_dotenv()

logger = logging.getLogger(__name__)

_SELECT_ONLY_ERROR = "Only SELECT statements are permitted."


@dataclass
class ToolResult:
    output: str = ""
    error: str = ""
    tokens_used: int = 0


# ---------------------------------------------------------------------------
# 1. reply_slack
# ---------------------------------------------------------------------------

async def reply_slack(
    client: AsyncWebClient,
    channel_id: str,
    thread_ts: str,
    text: str,
) -> ToolResult:
    """Post a message into an existing Slack thread."""
    try:
        await client.chat_postMessage(
            channel=channel_id,
            thread_ts=thread_ts,
            text=text,
        )
        return ToolResult(output=f"Message posted to {channel_id} (thread {thread_ts}).")
    except Exception as exc:
        logger.error("reply_slack failed: %s", exc)
        return ToolResult(error=str(exc))


# ---------------------------------------------------------------------------
# 2. run_sql
# ---------------------------------------------------------------------------

def _rows_to_markdown(columns: list[str], rows: list[asyncpg.Record]) -> str:
    """Render asyncpg rows as a GitHub-flavoured markdown table."""
    header = "| " + " | ".join(columns) + " |"
    separator = "| " + " | ".join("---" for _ in columns) + " |"
    body_lines = [
        "| " + " | ".join(str(row[col]) for col in columns) + " |"
        for row in rows
    ]
    return "\n".join([header, separator, *body_lines])


async def run_sql(
    pool: asyncpg.Pool,
    query: str,
) -> ToolResult:
    """Execute a SELECT query and return results as a markdown table."""
    normalised = query.strip().upper()
    if not normalised.startswith("SELECT"):
        return ToolResult(error=_SELECT_ONLY_ERROR)

    try:
        rows = await pool.fetch(query)
        if not rows:
            return ToolResult(output="Query returned no rows.")
        columns = list(rows[0].keys())
        table = _rows_to_markdown(columns, rows)
        return ToolResult(output=table)
    except Exception as exc:
        logger.error("run_sql failed: %s", exc)
        return ToolResult(error=str(exc))


# ---------------------------------------------------------------------------
# 3. write_code
# ---------------------------------------------------------------------------

async def write_code(
    language: str,
    code: str,
    filename: str = "",
) -> ToolResult:
    """Return a Slack-formatted code block, optionally with a filename header."""
    header = f"*{filename}*\n" if filename else ""
    block = f"{header}```{language}\n{code}\n```"
    return ToolResult(output=block)


# ---------------------------------------------------------------------------
# 4. create_github_issue
# ---------------------------------------------------------------------------

async def create_github_issue(
    repo_full_name: str,
    title: str,
    body: str,
    labels: list[str] | None = None,
) -> ToolResult:
    """Create a GitHub issue and return its URL."""
    token = os.environ.get("GITHUB_TOKEN", "")
    if not token:
        return ToolResult(error="GITHUB_TOKEN env var not set.")

    try:
        gh = Github(token)
        repo = gh.get_repo(repo_full_name)
        issue = repo.create_issue(
            title=title,
            body=body,
            labels=labels or [],
        )
        return ToolResult(output=f"Issue created: {issue.html_url}")
    except GithubException as exc:
        logger.error("create_github_issue failed: %s", exc)
        return ToolResult(error=f"GitHub error {exc.status}: {exc.data.get('message', exc)}")
    except Exception as exc:
        logger.error("create_github_issue unexpected error: %s", exc)
        return ToolResult(error=str(exc))


# ---------------------------------------------------------------------------
# 5. search_past_tasks
# ---------------------------------------------------------------------------

async def search_past_tasks(
    pool: asyncpg.Pool,
    query: str,
    role_id: int,
    limit: int = 10,
) -> ToolResult:
    """Search past tasks by similarity and return a markdown summary."""
    try:
        results = await search_tasks_by_similarity(pool, query, role_id, limit=limit)
        if not results:
            return ToolResult(output="No similar past tasks found.")

        lines = ["| # | Tool | Summary | Score |", "| --- | --- | --- | --- |"]
        for i, row in enumerate(results, 1):
            score = f"{row.get('score', 0):.2f}"
            summary = row.get("result_summary", "")[:120].replace("|", "\\|")
            tool = row.get("tool_used", "")
            lines.append(f"| {i} | {tool} | {summary} | {score} |")

        return ToolResult(output="\n".join(lines))
    except Exception as exc:
        logger.error("search_past_tasks failed: %s", exc)
        return ToolResult(error=str(exc))


# ---------------------------------------------------------------------------
# 6. ask_clarification
# ---------------------------------------------------------------------------

async def ask_clarification(
    client: AsyncWebClient,
    channel_id: str,
    thread_ts: str,
    question: str,
    state: dict[str, Any],
) -> ToolResult:
    """
    Post a clarifying question in the thread and mark state as pending
    so the caller knows to wait for the user's reply before proceeding.
    """
    try:
        await client.chat_postMessage(
            channel=channel_id,
            thread_ts=thread_ts,
            text=question,
        )
        state["pending_clarification"] = True
        state["pending_question"] = question
        return ToolResult(output=f"Clarification requested: {question}")
    except Exception as exc:
        logger.error("ask_clarification failed: %s", exc)
        return ToolResult(error=str(exc))
