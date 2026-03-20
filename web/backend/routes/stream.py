import asyncio
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from services.task_manager import task_manager

router = APIRouter(prefix="/stream", tags=["stream"])


@router.get("/{task_id}")
async def stream(task_id: str, since: int = 0):
    if task_manager.get_status(task_id) is None:
        raise HTTPException(status_code=404, detail="Task not found")

    async def generator():
        offset = since
        idle = 0
        while True:
            lines, status = task_manager.get_lines(task_id, since=offset)
            for line in lines:
                yield f"data: {line}\n\n"
                if line in ("__DONE__", "__ERROR__"):
                    return
            offset += len(lines)
            if not lines:
                idle += 1
                if status != "running" and idle > 5:
                    yield "data: __DONE__\n\n"
                    return
            else:
                idle = 0
            await asyncio.sleep(0.2)

    return StreamingResponse(
        generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
