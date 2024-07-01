import uuid
from typing import Annotated, List, Optional
from uuid import uuid4

from fastapi import APIRouter, HTTPException, Path, Query
from pydantic import BaseModel, Field

import app.storage as storage
from app.auth.charrol_handlers import chatrol_auth_handler

from app.schema import Assistant

from fastapi import Depends, HTTPException

# Mainly deal with Assistant config

router = APIRouter()

FEATURED_PUBLIC_ASSISTANTS = []


class AssistantPayload(BaseModel):
    """Payload for creating an assistant."""

    name: str = Field(..., description="The name of the assistant.")
    config: dict = Field(..., description="The assistant config.")
    public: bool = Field(default=False, description="Whether the assistant is public.")


AssistantID = Annotated[str, Path(description="The ID of the assistant.")]

# Chatrol 验证
@router.get("/")
async def list_assistants(user_id_in_request=Depends(chatrol_auth_handler.auth_wrapper)) -> List[Assistant]:
    """List all assistants for the current user."""
    print(' ---------------- new list_assistants ')
    return await storage.list_assistants(user_id_in_request)


@router.get("/public/")
async def list_public_assistants(
        shared_id: Annotated[
            Optional[str], Query(description="ID of a publicly shared assistant.")
        ] = None,
) -> List[Assistant]:
    """List all public assistants."""
    return await storage.list_public_assistants(
        FEATURED_PUBLIC_ASSISTANTS + ([shared_id] if shared_id else [])
    )


@router.get("/{aid}")
async def get_assistant(
        aid: AssistantID,
        user_id_in_request=Depends(chatrol_auth_handler.auth_wrapper)
) -> Assistant:
    """Get an assistant by ID."""
    assistant = await storage.get_assistant(user_id_in_request, aid)
    if not assistant:
        raise HTTPException(status_code=404, detail="Assistant not found")
    return assistant



@router.post("")
async def create_assistant(
        payload: AssistantPayload,
        user_id_in_request=Depends(chatrol_auth_handler.auth_wrapper)
) -> Assistant:
    """Create an assistant."""
    return await storage.put_assistant(
        user_id_in_request,
        str(uuid4()),
        name=payload.name,
        config=payload.config,
        public=payload.public,
    )


@router.put("/{aid}")
async def upsert_assistant(
        aid: AssistantID,
        payload: AssistantPayload,
        user_id_in_request=Depends(chatrol_auth_handler.auth_wrapper)
) -> Assistant:
    """Create or update an assistant."""
    return await storage.put_assistant(
        user_id_in_request,
        aid,
        name=payload.name,
        config=payload.config,
        public=payload.public,
    )

# 删除某个助手相关的所有记录
class AssistantDeletePayload(BaseModel):
    """删除某个助手所有信息"""

    assistant_id: uuid.UUID = Field(..., description="The id of the assistant.")

@router.post("/delete")
async def create_assistant(
        # user: AuthedUser,
        payload: AssistantDeletePayload,
        user_id_in_request=Depends(chatrol_auth_handler.auth_wrapper)
) :
    print('[AI助手删除] {}'.format(user_id_in_request))
    res_data = await storage.delete_assistant_data(payload.assistant_id)
    return res_data
