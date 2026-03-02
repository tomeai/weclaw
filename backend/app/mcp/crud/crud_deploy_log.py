#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from app.mcp.model.deploy_log import DeployLog
from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import noload, selectinload
from sqlalchemy_crud_plus import CRUDPlus


class CRUDDeployLog(CRUDPlus[DeployLog]):
    async def create(self, db: AsyncSession, obj: DeployLog) -> DeployLog:
        db.add(obj)
        await db.flush()
        return obj

    async def get_by_task_id(self, db: AsyncSession, task_id: str) -> DeployLog | None:
        return await self.select_model_by_column(db, task_id=task_id)

    async def get_pending(self, db: AsyncSession) -> list[DeployLog]:
        stmt = (
            select(DeployLog).where(DeployLog.task_status.in_(['PENDING', 'STARTED'])).options(noload(DeployLog.user))
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_user_select(self, user_id: int):
        return await self.select_order(
            'created_time',
            'desc',
            load_options=[noload(self.model.user)],
            user_id=user_id,
        )

    async def get_admin_select(
        self,
        username: str | None = None,
        server_title: str | None = None,
        task_status: str | None = None,
    ) -> Select:
        from app.admin.model import User

        stmt = (
            select(DeployLog)
            .outerjoin(User, DeployLog.user_id == User.id)
            .options(selectinload(DeployLog.user))
            .order_by(DeployLog.created_time.desc())
        )
        if username:
            stmt = stmt.where(User.username.like(f'%{username}%'))
        if server_title:
            stmt = stmt.where(DeployLog.server_title.like(f'%{server_title}%'))
        if task_status:
            stmt = stmt.where(DeployLog.task_status == task_status)
        return stmt

    async def update_status(
        self,
        db: AsyncSession,
        pk: int,
        task_status: str,
        task_result: str | None = None,
        traceback: str | None = None,
    ) -> None:
        data: dict = {'task_status': task_status}
        if task_result is not None:
            data['task_result'] = task_result
        if traceback is not None:
            data['traceback'] = traceback
        await self.update_model(db, pk, data)


deploy_log_dao: CRUDDeployLog = CRUDDeployLog(DeployLog)
