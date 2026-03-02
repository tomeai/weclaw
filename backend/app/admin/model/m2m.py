import sqlalchemy as sa

from common.model import MappedBase

# 用户角色表
user_role = sa.Table(
    'sys_user_role',
    MappedBase.metadata,
    sa.Column('id', sa.BigInteger, primary_key=True, unique=True, index=True, autoincrement=True, comment='主键ID'),
    sa.Column('user_id', sa.BigInteger, primary_key=True, comment='用户ID'),
    sa.Column('role_id', sa.BigInteger, primary_key=True, comment='角色ID'),
)

# 角色菜单表
role_menu = sa.Table(
    'sys_role_menu',
    MappedBase.metadata,
    sa.Column('id', sa.BigInteger, primary_key=True, unique=True, index=True, autoincrement=True, comment='主键ID'),
    sa.Column('role_id', sa.BigInteger, primary_key=True, comment='角色ID'),
    sa.Column('menu_id', sa.BigInteger, primary_key=True, comment='菜单ID'),
)
