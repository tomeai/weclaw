from typing import Annotated

from app.admin.schema.menu import CreateMenuParam, GetMenuDetail, GetMenuTree, UpdateMenuParam
from app.admin.service.menu_service import menu_service
from common.response.response_schema import ResponseModel, ResponseSchemaModel, response_base
from common.security.permission import RequestPermission
from common.security.rbac import DependsRBAC
from database.db import CurrentSession, CurrentSessionTransaction
from fastapi import APIRouter, Depends, Path

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
async def get_menus(db: CurrentSession) -> ResponseSchemaModel[list[GetMenuDetail]]:
    data = await menu_service.get_all_flat(db=db)
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
