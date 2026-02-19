from app.agent.model.thread import ChatThread
from common.response.response_schema import response_base
from database.sqlite import get_db
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()


@router.get('/threads/{thread_id}/title')
async def get_thread_title(
    thread_id: str,
    db_session: AsyncSession = Depends(get_db),
):
    """获取线程标题（用于前端轮询）"""
    thread = await db_session.get(ChatThread, thread_id)
    if not thread:
        return response_base.success(
            data={
                'thread_id': thread_id,
                'chat_title': '新对话',
                'title_generated': False,
            }
        )
    return response_base.success(
        data={
            'thread_id': thread.thread_id,
            'chat_title': thread.chat_title,
            'title_generated': thread.title_generated,
        }
    )
