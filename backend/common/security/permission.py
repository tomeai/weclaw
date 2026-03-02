from common.context import ctx
from common.exception import errors
from core.conf import settings
from fastapi import Request


class RequestPermission:
    """
    请求权限验证器，用于角色菜单 RBAC 权限控制

    注意：
        使用此请求权限时，需要将 `Depends(RequestPermission('xxx'))` 在 `DependsRBAC` 之前设置，
        因为 FastAPI 当前版本的接口依赖注入按正序执行，意味着 RBAC 标识会在验证前被设置
    """

    def __init__(self, value: str) -> None:
        """
        初始化请求权限验证器

        :param value: 权限标识
        :return:
        """
        self.value = value

    async def __call__(self, request: Request) -> None:
        """
        验证请求权限

        :param request: FastAPI 请求对象
        :return:
        """
        if settings.RBAC_ROLE_MENU_MODE:
            if not isinstance(self.value, str):
                raise errors.ServerError

            # 设置权限标识到上下文
            ctx.permission = self.value
