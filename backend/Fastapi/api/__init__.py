from fastapi import APIRouter
from Fastapi.api.threads import router as threads_router
from Fastapi.api.runs import router as runs_router
router = APIRouter()

@router.get("/ok")
async def ok():
    return {"ok": True}

router.include_router(
    threads_router,
    prefix="/threads",
    tags=["threads"],
)

router.include_router(
    runs_router,
    prefix="/runs",
    tags=["runs"],
)
