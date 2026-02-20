from collections.abc import Sequence
from typing import Any

from app.admin.model import DataRule, DataScope, data_scope_rule
from app.admin.schema.data_scope import (
    CreateDataScopeParam,
    CreateDataScopeRuleParam,
    UpdateDataScopeParam,
    UpdateDataScopeRuleParam,
)
from sqlalchemy import Select, delete, insert, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy_crud_plus import CRUDPlus
from utils.serializers import select_join_serialize


class CRUDDataScope(CRUDPlus[DataScope]):
    """数据范围数据库操作类"""

    async def get(self, db: AsyncSession, pk: int) -> DataScope | None:
        """
        获取数据范围详情

        :param db: 数据库会话
        :param pk: 范围 ID
        :return:
        """
        return await self.select_model(db, pk)

    async def get_by_name(self, db: AsyncSession, name: str) -> DataScope | None:
        """
        通过名称获取数据范围

        :param db: 数据库会话
        :param name: 范围名称
        :return:
        """
        return await self.select_model_by_column(db, name=name)

    async def get_join(self, db: AsyncSession, pk: int) -> Any:
        """
        获取数据范围关联数据

        :param db: 数据库会话
        :param pk: 范围 ID
        :return:
        """
        stmt = (
            select(DataScope, DataRule)
            .outerjoin(data_scope_rule, data_scope_rule.c.data_scope_id == DataScope.id)
            .outerjoin(DataRule, DataRule.id == data_scope_rule.c.data_rule_id)
            .where(DataScope.id == pk)
        )
        result = await db.execute(stmt)
        rows = result.all()

        return select_join_serialize(rows, relationships=['DataScope-m2m-DataRule:rules'])

    async def get_all(self, db: AsyncSession) -> Sequence[DataScope]:
        """
        获取所有数据范围

        :param db: 数据库会话
        :return:
        """
        return await self.select_models(db)

    async def get_select(self, name: str | None, status: int | None) -> Select:
        """
        获取数据范围列表查询表达式

        :param name: 范围名称
        :param status: 范围状态
        :return:
        """
        filters = {}

        if name is not None:
            filters['name__like'] = f'%{name}%'
        if status is not None:
            filters['status'] = status

        return await self.select_order('id', **filters)

    async def create(self, db: AsyncSession, obj: CreateDataScopeParam) -> None:
        """
        创建数据范围

        :param db: 数据库会话
        :param obj: 创建数据范围参数
        :return:
        """
        await self.create_model(db, obj)

    async def update(self, db: AsyncSession, pk: int, obj: UpdateDataScopeParam) -> int:
        """
        更新数据范围

        :param db: 数据库会话
        :param pk: 范围 ID
        :param obj: 更新数据范围参数
        :return:
        """
        return await self.update_model(db, pk, obj)

    @staticmethod
    async def update_rules(db: AsyncSession, pk: int, rule_ids: UpdateDataScopeRuleParam) -> int:
        """
        更新数据范围规则

        :param db: 数据库会话
        :param pk: 范围 ID
        :param rule_ids: 数据规则 ID 列表
        :return:
        """
        data_scope_rule_stmt = delete(data_scope_rule).where(data_scope_rule.c.data_scope_id == pk)
        await db.execute(data_scope_rule_stmt)

        if rule_ids.rules:
            data_scope_rule_data = [
                CreateDataScopeRuleParam(data_scope_id=pk, data_rule_id=rule_id).model_dump()
                for rule_id in rule_ids.rules
            ]
            data_scope_rule_stmt = insert(data_scope_rule)
            await db.execute(data_scope_rule_stmt, data_scope_rule_data)

        return len(rule_ids.rules)

    async def delete(self, db: AsyncSession, pks: list[int]) -> int:
        """
        批量删除数据范围

        :param db: 数据库会话
        :param pks: 范围 ID 列表
        :return:
        """
        return await self.delete_model_by_column(db, allow_multiple=True, id__in=pks)


data_scope_dao: CRUDDataScope = CRUDDataScope(DataScope)
