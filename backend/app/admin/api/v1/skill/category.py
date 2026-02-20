from app.admin.schema.category import AddCategoryParam, CategoryDetail, GetAllCategoryParam
from app.admin.service.admin_skill_category_service import skill_admin_category_service
from common.pagination import DependsPagination, PageData, paging_data
from common.response.response_schema import ResponseModel, ResponseSchemaModel, response_base
from common.security.jwt import DependsJwtAuth
from database.db import CurrentSession
from fastapi import APIRouter, Request

router = APIRouter()


@router.post(
    '/create',
    summary='创建 skill 分类',
    dependencies=[DependsJwtAuth],
)
async def add_skill_category(request: Request, obj: AddCategoryParam) -> ResponseModel:
    await skill_admin_category_service.create(request=request, obj=obj)
    return response_base.success()


@router.post(
    '/get',
    summary='返回所有 skill 分类',
    dependencies=[DependsPagination, DependsJwtAuth],
)
async def get_all_skill_category(
    db: CurrentSession, obj: GetAllCategoryParam
) -> ResponseSchemaModel[PageData[CategoryDetail]]:
    result = await skill_admin_category_service.get_list(obj.is_recommend)
    page_data = await paging_data(db, result)
    return response_base.success(data=page_data)
