import os
from contextlib import asynccontextmanager

import asyncpg
import orjson
from fastapi import FastAPI

from app.llm_cfg import POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST, POSTGRES_PORT

_pg_pool = None

def get_pg_pool() -> asyncpg.pool.Pool:
    return _pg_pool

async def _init_connection(conn) -> None:
    await conn.set_type_codec(
        "json",
        encoder=lambda v: orjson.dumps(v).decode(),
        decoder=orjson.loads,
        schema="pg_catalog",
    )
    await conn.set_type_codec(
        "uuid", encoder=lambda v: str(v), decoder=lambda v: v, schema="pg_catalog"
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _pg_pool

    _pg_pool = await asyncpg.create_pool(
        database=POSTGRES_DB,
        user=POSTGRES_USER,
        password=POSTGRES_PASSWORD,
        host=POSTGRES_HOST,
        port=POSTGRES_PORT,
        init=_init_connection,
    )
    yield
    await _pg_pool.close()
    _pg_pool = None
