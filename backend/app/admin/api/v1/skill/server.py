from typing import Annotated

from app.admin.schema.skill import AdminSearchSkillParam, AdminSkillBaseDetail, GetAdminSkillDetail, UpdateSkillParam
from app.admin.service.admin_skill_service import skill_admin_server_service
from common.pagination import DependsPagination, PageData, paging_data
from common.response.response_schema import ResponseModel, ResponseSchemaModel, response_base
from common.security.jwt import DependsJwtAuth
from database.db import CurrentSession, CurrentSessionTransaction
from fastapi import APIRouter, Path

router = APIRouter()


@router.post(
    '',
    summary='返回所有 skill',
    dependencies=[DependsPagination, DependsJwtAuth],
)
async def get_all_skill(
    db: CurrentSession, obj: AdminSearchSkillParam
) -> ResponseSchemaModel[PageData[AdminSkillBaseDetail]]:
    skill_select = await skill_admin_server_service.get_all_select(**obj.model_dump())
    page_data = await paging_data(db, skill_select)
    return response_base.success(data=page_data)


@router.get(
    '/{skill_id}',
    summary='查询 skill 详情',
    dependencies=[DependsJwtAuth],
)
async def get_skill(
    skill_id: Annotated[int, Path(description='skill_id')],
) -> ResponseSchemaModel[GetAdminSkillDetail | None]:
    result = await skill_admin_server_service.get_skill(skill_id)
    return response_base.success(data=result)


@router.put(
    '/{skill_id}',
    summary='更新 skill',
    dependencies=[DependsJwtAuth],
)
async def put_skill(
    db: CurrentSessionTransaction,
    skill_id: Annotated[int, Path(description='skill_id')],
    obj: UpdateSkillParam,
) -> ResponseModel:
    count = await skill_admin_server_service.update_skill(db=db, skill_id=skill_id, **obj.model_dump())
    if count > 0:
        return response_base.success()
    return response_base.fail()


@router.delete(
    '/{skill_id}',
    summary='删除 skill',
    dependencies=[DependsJwtAuth],
)
async def delete_skill(
    db: CurrentSessionTransaction,
    skill_id: Annotated[int, Path(description='skill_id')],
) -> ResponseModel:
    count = await skill_admin_server_service.delete_skill(db=db, skill_id=skill_id)
    if count > 0:
        return response_base.success()
    return response_base.fail()
