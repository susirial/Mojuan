import os
from typing import Any, Dict, Optional, Sequence, Union
from uuid import uuid4

import langsmith.client
from fastapi import APIRouter, BackgroundTasks, HTTPException, Depends
from fastapi.exceptions import RequestValidationError
from langchain.pydantic_v1 import ValidationError
from langchain_core.messages import AnyMessage
from langchain_core.runnables import RunnableConfig
from langserve.schema import FeedbackCreateRequest
from langserve.server import _unpack_input
from langsmith.utils import tracing_is_enabled
from pydantic import BaseModel, Field
from sse_starlette import EventSourceResponse
from app.agent import agent
from app.auth.charrol_handlers import chatrol_auth_handler
from app.storage import get_assistant, get_thread
from app.stream import astream_messages, to_sse
router = APIRouter()



class CreateRunPayload(BaseModel):
    """Payload for creating a run."""

    thread_id: str
    input: Optional[Union[Sequence[AnyMessage], Dict[str, Any]]] = Field(
        default_factory=dict
    )
    config: Optional[RunnableConfig] = None


async def _run_input_and_config(payload: CreateRunPayload, user_id: str):
    thread = await get_thread(user_id, payload.thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")

    assistant = await get_assistant(user_id, str(thread["assistant_id"]))
    if not assistant:
        raise HTTPException(status_code=404, detail="Assistant not found")

    config: RunnableConfig = {
        **assistant["config"],
        "configurable": {
            **assistant["config"]["configurable"],
            **((payload.config or {}).get("configurable") or {}),
            "user_id": user_id,
            "thread_id": str(thread["thread_id"]),
            "assistant_id": str(assistant["assistant_id"]),
        },
    }

    try:
        input_ = (
            _unpack_input(agent.get_input_schema(config).validate(payload.input))
            if payload.input is not None
            else None
        )
    except ValidationError as e:
        raise RequestValidationError(e.errors(), body=payload)

    return input_, config


@router.post("")
async def create_run(
    payload: CreateRunPayload,
    background_tasks: BackgroundTasks,
    user_id=Depends(chatrol_auth_handler.auth_wrapper)
):
    """Create a run."""
    input_, config = await _run_input_and_config(payload, user_id)
    print('[create_run] input_:------------\n{}\n------------\n config:-----------\n{}\n-----------\n'.format(input_,config))
    background_tasks.add_task(agent.ainvoke, input_, config)
    return {"status": "ok"}


@router.post("/stream")
async def stream_run(
    payload: CreateRunPayload,
    user_id=Depends(chatrol_auth_handler.auth_wrapper)
):
    """Create a run."""
    print('----------------------------------------------------------------')
    print('payload: ->{}<-'.format(payload))
    input_, config = await _run_input_and_config(payload, user_id)
    print('[stream_run] input_:------------\n{}\n------------\n config:-----------\n{}\n-----------\n'.format(input_,
                                                                                                              config))
    return EventSourceResponse(to_sse(astream_messages(agent, input_, config)))


@router.get("/input_schema")
async def input_schema() -> dict:
    """Return the input schema of the runnable."""
    return agent.get_input_schema().schema()


@router.get("/output_schema")
async def output_schema() -> dict:
    """Return the output schema of the runnable."""
    return agent.get_output_schema().schema()


@router.get("/config_schema")
async def config_schema(user_id=Depends(chatrol_auth_handler.auth_wrapper)) -> dict:
    """Return the config schema of the runnable."""
    print('[config_schema] 用户 :{}'.format(user_id))
    return agent.config_schema().schema()


if tracing_is_enabled():
    langsmith_client = langsmith.client.Client()

    @router.post("/feedback")
    def create_run_feedback(feedback_create_req: FeedbackCreateRequest) -> dict:
        """
        Send feedback on an individual run to langsmith

        Note that a successful response means that feedback was successfully
        submitted. It does not guarantee that the feedback is recorded by
        langsmith. Requests may be silently rejected if they are
        unauthenticated or invalid by the server.
        """

        langsmith_client.create_feedback(
            feedback_create_req.run_id,
            feedback_create_req.key,
            score=feedback_create_req.score,
            value=feedback_create_req.value,
            comment=feedback_create_req.comment,
            source_info={
                "from_langserve": True,
            },
        )

        return {"status": "ok"}
