from common.model import MappedBase
from sqlalchemy import BigInteger, Column, ForeignKey, Table

sys_user_role = Table(
    'sys_user_role',
    MappedBase.metadata,
    Column('id', BigInteger, primary_key=True, unique=True, index=True, autoincrement=True, comment='主键ID'),
    Column('user_id', BigInteger, ForeignKey('sys_user.id', ondelete='CASCADE'), primary_key=True, comment='用户ID'),
    Column('role_id', BigInteger, ForeignKey('sys_role.id', ondelete='CASCADE'), primary_key=True, comment='角色ID'),
)
