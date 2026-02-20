from typing import Annotated

from app.admin.schema.opera_log import DeleteOperaLogParam, GetOperaLogDetail
from app.admin.service.opera_log_service import opera_log_service
from common.pagination import DependsPagination, PageData
from common.response.response_schema import ResponseModel, ResponseSchemaModel, response_base
from common.security.jwt import DependsJwtAuth
from common.security.permission import RequestPermission
from common.security.rbac import DependsRBAC
from database.db import CurrentSession, CurrentSessionTransaction
from fastapi import APIRouter, Depends, Query

router = APIRouter()


@router.get(
    '',
    summary='分页获取操作日志',
    dependencies=[
        DependsJwtAuth,
        DependsPagination,
    ],
)
async def get_opera_logs_paginated(
    db: CurrentSession,
    username: Annotated[str | None, Query(description='用户名')] = None,
    status: Annotated[int | None, Query(description='状态')] = None,
    ip: Annotated[str | None, Query(description='IP 地址')] = None,
) -> ResponseSchemaModel[PageData[GetOperaLogDetail]]:
    page_data = await opera_log_service.get_list(db=db, username=username, status=status, ip=ip)

    return response_base.success(data=page_data)


@router.delete(
    '',
    summary='批量删除操作日志',
    dependencies=[
        Depends(RequestPermission('log:opera:del')),
        DependsRBAC,
    ],
)
async def delete_opera_logs(db: CurrentSessionTransaction, obj: DeleteOperaLogParam) -> ResponseModel:
    count = await opera_log_service.delete(db=db, obj=obj)
    if count > 0:
        return response_base.success()
    return response_base.fail()


@router.delete(
    '/all',
    summary='清空操作日志',
    dependencies=[
        Depends(RequestPermission('log:opera:clear')),
        DependsRBAC,
    ],
)
async def delete_all_opera_logs(db: CurrentSessionTransaction) -> ResponseModel:
    await opera_log_service.delete_all(db=db)
    return response_base.success()
