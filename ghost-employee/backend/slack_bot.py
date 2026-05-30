import os
import logging
from typing import Any

import asyncpg
from dotenv import load_dotenv
from slack_bolt.async_app import AsyncApp
from slack_bolt.adapter.socket_mode.aiohttp import AsyncSocketModeHandler
from slack_sdk.web.async_client import AsyncWebClient

from agent import run_agent
from db_init import init_db
from memory import save_task
from tools import (
    ToolResult,
    reply_slack,
    run_sql,
    write_code,
    create_github_issue,
    search_past_tasks,
    ask_clarification,
)

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = AsyncApp(token=os.environ["SLACK_BOT_TOKEN"])

_pool: asyncpg.Pool | None = None


async def _get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        _pool = await init_db()
    return _pool


async def _fetch_thread_context(
    client: AsyncWebClient,
    channel_id: str,
    thread_ts: str,
    limit: int = 10,
) -> list[dict]:
    try:
        result = await client.conversations_replies(
            channel=channel_id,
            ts=thread_ts,
            limit=limit,
        )
        messages = result.get("messages", [])
        return [
            {"user": m.get("user", ""), "text": m.get("text", ""), "ts": m.get("ts", "")}
            for m in messages[-limit:]
        ]
    except Exception as exc:
        logger.warning("Could not fetch thread context: %s", exc)
        return []


async def _build_payload(event: dict, client: AsyncWebClient) -> dict:
    channel_id = event.get("channel", "")
    thread_ts = event.get("thread_ts") or event.get("ts", "")
    return {
        "text": event.get("text", ""),
        "user_id": event.get("user", ""),
        "channel_id": channel_id,
        "thread_ts": thread_ts,
        "thread_context": await _fetch_thread_context(client, channel_id, thread_ts),
    }


async def _dispatch_tool(
    tool_name: str,
    params: dict[str, Any],
    client: AsyncWebClient,
    pool: asyncpg.Pool,
    channel_id: str,
    thread_ts: str,
) -> ToolResult:
    state: dict[str, Any] = {}

    match tool_name:
        case "reply_slack":
            return await reply_slack(
                client,
                channel_id,
                thread_ts,
                params.get("text", ""),
            )
        case "run_sql":
            return await run_sql(pool, params.get("query", ""))
        case "write_code":
            return await write_code(
                params.get("language", ""),
                params.get("code", ""),
                params.get("filename", ""),
            )
        case "create_github_issue":
            repo = params.get("repo") or os.environ.get("GITHUB_REPO", "")
            return await create_github_issue(
                repo,
                params.get("title", ""),
                params.get("body", ""),
                params.get("labels", []),
            )
        case "search_past_tasks":
            return await search_past_tasks(
                pool,
                params.get("query", ""),
                params.get("role_id", 0),
            )
        case "ask_clarification":
            return await ask_clarification(
                client,
                channel_id,
                thread_ts,
                params.get("question") or params.get("reason", ""),
                state,
            )
        case _:
            return ToolResult(error=f"Unknown tool: {tool_name!r}")


async def handle_agent_request(payload: dict, client: AsyncWebClient) -> None:
    channel_id = payload["channel_id"]
    thread_ts = payload["thread_ts"]
    user_id = payload["user_id"]
    incoming_message = payload["text"]
    thread_context = [m.get("text", "") for m in payload.get("thread_context", [])]

    # Initialize connection pool
    pool = await _get_pool()

    # Dynamic domain isolation using PostgreSQL JSONB channels lookup
    role_description = "You are a helpful AI assistant."
    try:
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT description FROM roles WHERE channels ? $1 LIMIT 1",
                channel_id,
            )
            if row and row["description"]:
                role_description = row["description"]
    except Exception as exc:
        logger.warning("Could not fetch dynamic role description: %s", exc)

    # 1. Agent decides which tool to use
    decision = run_agent(role_description, incoming_message, thread_context)
    tool_name = decision["tool"]
    params = decision["params"]

    print(f"[DECISION] tool={tool_name!r}  params={params}")
    logger.info("Agent decided: tool=%s params=%s", tool_name, params)

    # 2. Run the tool
    result = await _dispatch_tool(tool_name, params, client, pool, channel_id, thread_ts)

    print(f"[RESULT]   output={result.output!r}  error={result.error!r}  tokens={result.tokens_used}")
    logger.info("Tool result: output=%r error=%r tokens=%d", result.output, result.error, result.tokens_used)

    # 3. Post result back to Slack
    # reply_slack and ask_clarification already post their own messages
    _self_posting = {"reply_slack", "ask_clarification"}
    if result.error:
        await reply_slack(client, channel_id, thread_ts, f":x: {result.error}")
    elif tool_name not in _self_posting and result.output:
        await reply_slack(client, channel_id, thread_ts, result.output)

    # 4. Save to memory
    summary = (result.error or result.output)[:500]
    try:
        await save_task(
            pool,
            role_id=None,
            user_id=user_id,
            channel_id=channel_id,
            request_text=incoming_message,
            tool_used=tool_name,
            result_summary=summary,
            tokens_used=result.tokens_used,
            cost_usd=0.0,
        )
    except Exception as exc:
        logger.warning("save_task failed (non-fatal): %s", exc)


@app.event("app_mention")
async def on_mention(event: dict, client: AsyncWebClient, say) -> None:
    logger.info("app_mention from user=%s channel=%s", event.get("user"), event.get("channel"))
    payload = await _build_payload(event, client)
    await handle_agent_request(payload, client)


@app.event("message")
async def on_dm(event: dict, client: AsyncWebClient, say) -> None:
    if event.get("channel_type") != "im" or event.get("bot_id"):
        return
    logger.info("DM from user=%s", event.get("user"))
    payload = await _build_payload(event, client)
    await handle_agent_request(payload, client)


if __name__ == "__main__":
    import asyncio

    async def main():
        handler = AsyncSocketModeHandler(app, os.environ["SLACK_APP_TOKEN"])
        logger.info("Starting Slack bot in Socket Mode…")
        await handler.start_async()

    asyncio.run(main())
