import asyncio
import logging
from typing import Annotated, Any, Dict, List, Sequence, Union
from uuid import uuid4

from fastapi import APIRouter, HTTPException, Path, Depends
from langchain.schema.messages import AnyMessage
from pydantic import BaseModel, Field

import app.storage as storage
from app.auth.charrol_handlers import chatrol_auth_handler
from app.schema import Thread

router = APIRouter()

ThreadID = Annotated[str, Path(description="The ID of the thread.")]


class ThreadPutRequest(BaseModel):
    """Payload for creating a thread."""

    name: str = Field(..., description="The name of the thread.")
    assistant_id: str = Field(..., description="The ID of the assistant to use.")


class ThreadPostRequest(BaseModel):
    """Payload for adding state to a thread."""

    values: Union[Sequence[AnyMessage], Dict[str, Any]]


class ThreadDeletePostRequest(BaseModel):
    """Payload for adding state to a thread."""

    thread_id: str = Field(..., description="The ID of the thread to delete.")

@router.get("/")
async def list_threads(user_id=Depends(chatrol_auth_handler.auth_wrapper)) -> List[Thread]:
    """List all threads for the current user."""
    return await storage.list_threads(user_id)

@router.get("/{tid}/state")
async def get_thread_state(
        tid: ThreadID,
        user_id=Depends(chatrol_auth_handler.auth_wrapper)
):
    """Get state for a thread."""
    thread, state = await asyncio.gather(
        storage.get_thread(user_id, tid),
        storage.get_thread_state(user_id, tid),
    )
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    return state

@router.post("/{tid}/state")
async def add_thread_state(
        tid: ThreadID,
        payload: ThreadPostRequest,
        user_id=Depends(chatrol_auth_handler.auth_wrapper)
):
    """Add state to a thread."""
    thread = await storage.get_thread(user_id, tid)
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    return await storage.update_thread_state(user_id, tid, payload.values)


@router.get("/{tid}/history")
async def get_thread_history(
        tid: ThreadID,
        user_id=Depends(chatrol_auth_handler.auth_wrapper)
):
    """Get all past states for a thread."""
    thread, history = await asyncio.gather(
        storage.get_thread(user_id, tid),
        storage.get_thread_history(user_id, tid),
    )
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    return history

@router.post("/delete")
async def delete_thread(
        thread_put_request: ThreadDeletePostRequest,
        user_id=Depends(chatrol_auth_handler.auth_wrapper)
):
    """Get all past states for a thread."""
    thread_id = thread_put_request.thread_id

    print('[Delete thread] user_id[{}] tid[{}]'.format(user_id, thread_id))
    thread, checkpopints = await asyncio.gather(
        storage.delete_thread(user_id, thread_id),
        storage.delete_checkpoint(user_id, thread_id),
    )
    print('[Delete thread OK] user_id[{}] tid[{}] checkpoints[{}]'.format(user_id, thread_id, checkpopints))
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    return checkpopints


@router.get("/{tid}")
async def get_thread(
        tid: ThreadID,
        user_id=Depends(chatrol_auth_handler.auth_wrapper)
) -> Thread:
    """Get a thread by ID."""
    thread = await storage.get_thread(user_id, tid)
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    return thread

@router.post("")
async def create_thread(
        thread_put_request: ThreadPutRequest,
        user_id=Depends(chatrol_auth_handler.auth_wrapper)
) -> Thread:
    """Create a thread."""
    return await storage.put_thread(
        user_id,
        str(uuid4()),
        assistant_id=thread_put_request.assistant_id,
        name=thread_put_request.name,
    )


@router.put("/{tid}")
async def upsert_thread(
        tid: ThreadID,
        thread_put_request: ThreadPutRequest,
        user_id=Depends(chatrol_auth_handler.auth_wrapper)
) -> Thread:
    """Update a thread."""
    return await storage.put_thread(
        user_id,
        tid,
        assistant_id=thread_put_request.assistant_id,
        name=thread_put_request.name,
    )
