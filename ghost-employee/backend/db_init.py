import asyncpg
import json
import os
import logging
import ssl
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

_CREATE_EXTENSION = "CREATE EXTENSION IF NOT EXISTS pg_trgm;"

_CREATE_ROLES = """
CREATE TABLE IF NOT EXISTS roles (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL DEFAULT '',
    channels    JSONB NOT NULL DEFAULT '[]',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
"""

_CREATE_TASKS = """
CREATE TABLE IF NOT EXISTS tasks (
    id             SERIAL PRIMARY KEY,
    role_id        INTEGER REFERENCES roles(id) ON DELETE SET NULL,
    user_id        TEXT NOT NULL DEFAULT '',
    channel_id     TEXT NOT NULL DEFAULT '',
    request_text   TEXT NOT NULL DEFAULT '',
    tool_used      TEXT NOT NULL DEFAULT '',
    result_summary TEXT NOT NULL DEFAULT '',
    tokens_used    INTEGER NOT NULL DEFAULT 0,
    cost_usd       NUMERIC(10, 6) NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
"""

_CREATE_TASKS_TRGM_INDEX = """
CREATE INDEX IF NOT EXISTS tasks_request_text_trgm_idx
    ON tasks USING GIN (request_text gin_trgm_ops);
"""

_CREATE_KNOWLEDGE_TABLE = """
CREATE TABLE IF NOT EXISTS company_knowledge (
    id      SERIAL PRIMARY KEY,
    topic   TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL
);
"""

_SEED_KNOWLEDGE_DATA = """
INSERT INTO company_knowledge (topic, content) VALUES
('tech stack', 'Our active web core dashboard uses React 18, Vite, Tailwind CSS, and hardware-accelerated timelines via GSAP.'),
('project objective', 'Ghost Employee is a next-generation AI agent orchestration layer designed to bridge workspaces with execution environments.')
ON CONFLICT (topic) DO NOTHING;
"""


async def _init_connection(conn: asyncpg.Connection) -> None:
    """Register JSON/JSONB codecs so asyncpg returns Python objects, not strings."""
    await conn.set_type_codec("json",  encoder=json.dumps, decoder=json.loads, schema="pg_catalog")
    await conn.set_type_codec("jsonb", encoder=json.dumps, decoder=json.loads, schema="pg_catalog")


async def init_db(dsn: str | None = None) -> asyncpg.Pool:
    """Create tables and indexes, then return a connection pool."""
    dsn = dsn or os.environ["DATABASE_URL"]
    
    # Configure a secure, unverified SSL context block for Supabase compatibility
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    
    pool = await asyncpg.create_pool(dsn, init=_init_connection, ssl=ssl_context, min_size=1, max_size=1)
    async with pool.acquire() as conn:
        await conn.execute(_CREATE_EXTENSION)
        await conn.execute(_CREATE_ROLES)
        await conn.execute(_CREATE_TASKS)
        await conn.execute(_CREATE_TASKS_TRGM_INDEX)
        await conn.execute(_CREATE_KNOWLEDGE_TABLE)
        await conn.execute(_SEED_KNOWLEDGE_DATA)
    logger.info("Database schema initialised.")
    return pool


if __name__ == "__main__":
    import asyncio
    logging.basicConfig(level=logging.INFO)
    asyncio.run(init_db())

