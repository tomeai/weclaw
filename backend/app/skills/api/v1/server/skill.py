from typing import List

from app.mcp.schema.skill import SearchSkillParam, SkillCategoryDetail, SkillDetail
from app.skills.service.skill_service import skill_service
from common.pagination import DependsPagination, PageData, paging_data
from common.response.response_schema import ResponseSchemaModel, response_base
from database.db import CurrentSession
from fastapi import APIRouter

router = APIRouter()


@router.post(
    '/search',
    summary='搜索skill',
    dependencies=[DependsPagination],
)
async def search_skill(
    db: CurrentSession,
    obj: SearchSkillParam,
) -> ResponseSchemaModel[PageData[SkillDetail]]:
    skill_select = await skill_service.get_select(keyword=obj.keyword, category_id=obj.category_id)
    page_data = await paging_data(db, skill_select)
    return response_base.success(data=page_data)


@router.get('/categories', summary='skill categories')
async def get_skill_categories() -> ResponseSchemaModel[List[SkillCategoryDetail]]:
    result = await skill_service.get_categories()
    return response_base.success(data=result)
