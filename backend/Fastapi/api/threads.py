
# 对话历史 thread

from typing import Annotated
from fastapi import APIRouter, Path
from Fastapi.local_agent import llm_agent_executor

router = APIRouter()

ThreadID = Annotated[str, Path(description="The ID of the thread.")]


@router.get("/{thread_id}/history")
async def get_thread_history(
        thread_id: ThreadID,
):
    """Get the history of a thread."""
    print('[get_thread_history] :{}'.format(thread_id))
    thread_cfg = {"configurable": {"thread_id": thread_id}}
    history = None
    try:
        res = llm_agent_executor.get_state(thread_cfg)
        history = res.values
    except Exception as e:
        print('[get_thread_history] error :{}'.format(e))
    return history