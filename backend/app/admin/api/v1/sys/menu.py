from typing import Annotated

from app.admin.schema.menu import CreateMenuParam, GetMenuDetail, GetMenuTree, UpdateMenuParam
from app.admin.service.menu_service import menu_service
from common.response.response_schema import ResponseModel, ResponseSchemaModel, response_base
from common.security.jwt import DependsJwtAuth
from common.security.permission import RequestPermission
from common.security.rbac import DependsRBAC
from database.db import CurrentSession, CurrentSessionTransaction
from fastapi import APIRouter, Depends, Path, Query, Request

router = APIRouter()


@router.get(
    '/tree',
    summary='获取菜单树',
    dependencies=[
        Depends(RequestPermission('sys:menu:list')),
        DependsRBAC,
    ],
)
async def get_menu_tree(db: CurrentSession) -> ResponseSchemaModel[list[GetMenuTree]]:
    data = await menu_service.get_all(db=db)
    return response_base.success(data=data)


@router.get(
    '',
    summary='获取所有菜单（平铺）',
    dependencies=[
        Depends(RequestPermission('sys:menu:list')),
        DependsRBAC,
    ],
)
async def get_menus(
    db: CurrentSession,
    types: Annotated[str | None, Query(description='菜单类型过滤，逗号分隔，如 0,2')] = None,
) -> ResponseSchemaModel[list[GetMenuDetail]]:
    type_list = [int(t) for t in types.split(',') if t.strip().isdigit()] if types else None
    data = await menu_service.get_all_flat(db=db, types=type_list)
    return response_base.success(data=data)


@router.get(
    '/user',
    summary='获取当前用户可访问的侧边栏菜单',
    dependencies=[DependsJwtAuth],
)
async def get_user_menus(
    db: CurrentSession,
    request: Request,
) -> ResponseSchemaModel[list[GetMenuDetail]]:
    data = await menu_service.get_user_menus(db=db, request=request)
    return response_base.success(data=data)


@router.get(
    '/{pk}',
    summary='获取菜单详情',
    dependencies=[
        Depends(RequestPermission('sys:menu:list')),
        DependsRBAC,
    ],
)
async def get_menu(
    db: CurrentSession,
    pk: Annotated[int, Path(description='菜单 ID')],
) -> ResponseSchemaModel[GetMenuDetail]:
    data = await menu_service.get(db=db, pk=pk)
    return response_base.success(data=data)


@router.post(
    '',
    summary='创建菜单',
    dependencies=[
        Depends(RequestPermission('sys:menu:add')),
        DependsRBAC,
    ],
)
async def create_menu(db: CurrentSessionTransaction, obj: CreateMenuParam) -> ResponseModel:
    await menu_service.create(db=db, obj=obj)
    return response_base.success()


@router.put(
    '/{pk}',
    summary='更新菜单',
    dependencies=[
        Depends(RequestPermission('sys:menu:edit')),
        DependsRBAC,
    ],
)
async def update_menu(
    db: CurrentSessionTransaction,
    pk: Annotated[int, Path(description='菜单 ID')],
    obj: UpdateMenuParam,
) -> ResponseModel:
    count = await menu_service.update(db=db, pk=pk, obj=obj)
    if count > 0:
        return response_base.success()
    return response_base.fail()


@router.delete(
    '/{pk}',
    summary='删除菜单',
    dependencies=[
        Depends(RequestPermission('sys:menu:del')),
        DependsRBAC,
    ],
)
async def delete_menu(
    db: CurrentSessionTransaction,
    pk: Annotated[int, Path(description='菜单 ID')],
) -> ResponseModel:
    count = await menu_service.delete(db=db, pk=pk)
    if count > 0:
        return response_base.success()
    return response_base.fail()
