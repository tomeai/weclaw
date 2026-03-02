#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from app.mcp.crud.crud_deploy_log import deploy_log_dao
from app.mcp.schema.deploy_log import AdminDeployLogDetail, AdminSearchDeployLogParam
from common.pagination import DependsPagination, PageData, paging_data
from common.response.response_schema import ResponseSchemaModel, response_base
from common.security.jwt import DependsJwtAuth
from database.db import CurrentSession
from fastapi import APIRouter

router = APIRouter()


@router.post(
    '/logs',
    summary='查询所有部署日志',
    dependencies=[DependsPagination, DependsJwtAuth],
)
async def get_all_deploy_logs(
    db: CurrentSession,
    obj: AdminSearchDeployLogParam,
) -> ResponseSchemaModel[PageData[AdminDeployLogDetail]]:
    stmt = await deploy_log_dao.get_admin_select(**obj.model_dump())
    page_data = await paging_data(db, stmt)
    return response_base.success(data=page_data)
