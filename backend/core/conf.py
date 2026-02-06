#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from functools import lru_cache
from typing import Any, Literal, Pattern

from core.path_conf import BASE_PATH
from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """全局配置"""

    model_config = SettingsConfigDict(
        env_file=f'{BASE_PATH}/.env',
        env_file_encoding='utf-8',
        extra='ignore',
        case_sensitive=True,
    )

    # .env 环境
    ENVIRONMENT: Literal['dev', 'pro']

    # .env 数据库
    DATABASE_TYPE: Literal['mysql', 'postgresql']
    DATABASE_HOST: str
    DATABASE_PORT: int
    DATABASE_USER: str
    DATABASE_PASSWORD: str

    # .env Redis
    REDIS_HOST: str
    REDIS_PORT: int
    REDIS_PASSWORD: str
    REDIS_DATABASE: int

    CELERY_BROKER_REDIS_DATABASE: int
    CELERY_TASK_MAX_RETRIES: int = 5

    # .env Token
    TOKEN_SECRET_KEY: str  # 密钥 secrets.token_urlsafe(32)

    # .env 操作日志加密密钥
    OPERA_LOG_ENCRYPT_SECRET_KEY: str  # 密钥 os.urandom(32), 需使用 bytes.hex() 方法转换为 str

    I18N_DEFAULT_LANGUAGE: str = 'zh-CN'

    OPERA_LOG_QUEUE_BATCH_CONSUME_SIZE: int = 100
    OPERA_LOG_QUEUE_TIMEOUT: int = 60  # 1 分钟

    # FastAPI
    FASTAPI_API_V1_PATH: str = '/api/v1'
    FASTAPI_TITLE: str = 'FastAPI'
    FASTAPI_VERSION: str = '0.0.1'
    FASTAPI_DESCRIPTION: str = 'FastAPI Best Architecture'
    FASTAPI_DOCS_URL: str = '/docs'
    FASTAPI_REDOC_URL: str = '/redoc'
    FASTAPI_OPENAPI_URL: str | None = '/openapi'
    FASTAPI_STATIC_FILES: bool = True

    # serverless
    SERVERLESS_PROVIDER: str
    SERVERLESS_ENDPOINT: str
    SERVERLESS_ACCESS_KEY_ID: str
    SERVERLESS_ACCESS_KEY_SECRET: str

    # 数据库
    DATABASE_ECHO: bool = False
    DATABASE_POOL_ECHO: bool = False
    DATABASE_SCHEMA: str = 'wemcp'
    DATABASE_CHARSET: str = 'utf8mb4'

    # github
    GITHUB_APP_ACCESS_TOKEN: str

    # Redis
    REDIS_TIMEOUT: int = 5

    # Token
    TOKEN_ALGORITHM: str = 'HS256'
    TOKEN_EXPIRE_SECONDS: int = 60 * 60 * 24  # 1 天
    TOKEN_REFRESH_EXPIRE_SECONDS: int = 60 * 60 * 24 * 7  # 7 天
    TOKEN_REDIS_PREFIX: str = 'wemcp:token'
    TOKEN_EXTRA_INFO_REDIS_PREFIX: str = 'wemcp:token_extra_info'
    TOKEN_ONLINE_REDIS_PREFIX: str = 'wemcp:token_online'
    TOKEN_REFRESH_REDIS_PREFIX: str = 'wemcp:refresh_token'
    TOKEN_REQUEST_PATH_EXCLUDE: list[str] = [  # JWT / RBAC 路由白名单
        f'{FASTAPI_API_V1_PATH}/auth/login',
    ]
    TOKEN_REQUEST_PATH_EXCLUDE_PATTERN: list[Pattern[str]] = [  # JWT / RBAC 路由白名单（正则）
        rf'^{FASTAPI_API_V1_PATH}/monitors/(redis|server)$',
    ]

    # JWT
    JWT_USER_REDIS_PREFIX: str = 'wemcp:user'
    JWT_USER_REDIS_EXPIRE_SECONDS: int = 60 * 60 * 24 * 7  # 7 天

    # RBAC
    RBAC_ROLE_MENU_MODE: bool = False
    RBAC_ROLE_MENU_EXCLUDE: list[str] = [
        'sys:monitor:redis',
        'sys:monitor:server',
    ]

    # Cookie
    COOKIE_REFRESH_TOKEN_KEY: str = 'wemcp_refresh_token'
    COOKIE_REFRESH_TOKEN_EXPIRE_SECONDS: int = 60 * 60 * 24 * 7  # 7 天

    # 数据权限配置
    DATA_PERMISSION_MODELS: dict[str, str] = {  # 允许进行数据过滤的 SQLA 模型，它必须以模块字符串的方式定义
        'Api': 'plugin.casbin.model.Api',
    }
    DATA_PERMISSION_COLUMN_EXCLUDE: list[str] = [  # 排除允许进行数据过滤的 SQLA 模型列
        'id',
        'sort',
        'created_time',
        'updated_time',
    ]

    # OAuth2
    # github oauth
    OAUTH2_GITHUB_CLIENT_ID: str = ''
    OAUTH2_GITHUB_CLIENT_SECRET: str = ''
    # google oauth
    OAUTH2_GOOGLE_CLIENT_ID: str = ''
    OAUTH2_GOOGLE_CLIENT_SECRET: str = ''
    # gitee
    OAUTH2_GITEE_CLIENT_ID: str = ''
    OAUTH2_GITEE_CLIENT_SECRET: str = ''

    # oauth callback
    OAUTH2_FRONTEND_REDIRECT_URI: str

    # Socket.IO
    WS_NO_AUTH_MARKER: str = 'internal'

    # CORS
    CORS_ALLOWED_ORIGINS: list[str] = [  # 末尾不带斜杠
        'http://127.0.0.1:8000',
        'http://127.0.0.1:3000',
        'http://localhost:3000',
        'https://www.wemcp.cn',
        'https://wemcp.cn',
    ]
    CORS_EXPOSE_HEADERS: list[str] = [
        'X-Request-ID',
    ]

    # 中间件配置
    MIDDLEWARE_CORS: bool = True
    MIDDLEWARE_ACCESS: bool = True

    # 请求限制配置
    REQUEST_LIMITER_REDIS_PREFIX: str = 'wemcp:limiter'

    # 时间配置
    DATETIME_TIMEZONE: str = 'Asia/Shanghai'
    DATETIME_FORMAT: str = '%Y-%m-%d %H:%M:%S'

    # 文件上传
    UPLOAD_READ_SIZE: int = 1024
    UPLOAD_IMAGE_EXT_INCLUDE: list[str] = ['jpg', 'jpeg', 'png', 'gif', 'webp']
    UPLOAD_IMAGE_SIZE_MAX: int = 5 * 1024 * 1024  # 5 MB
    UPLOAD_VIDEO_EXT_INCLUDE: list[str] = ['mp4', 'mov', 'avi', 'flv']
    UPLOAD_VIDEO_SIZE_MAX: int = 20 * 1024 * 1024  # 20 MB

    # IP 定位配置
    IP_LOCATION_PARSE: Literal['online', 'offline', 'false'] = 'offline'
    IP_LOCATION_REDIS_PREFIX: str = 'wemcp:ip:location'
    IP_LOCATION_EXPIRE_SECONDS: int = 60 * 60 * 24  # 1 天

    # 追踪 ID
    TRACE_ID_REQUEST_HEADER_KEY: str = 'X-Request-ID'

    # 日志
    LOG_CID_DEFAULT_VALUE: str = '-'
    LOG_CID_UUID_LENGTH: int = 32  # 日志 correlation_id 长度，必须小于等于 32
    LOG_STD_LEVEL: str = 'INFO'
    LOG_ACCESS_FILE_LEVEL: str = 'INFO'
    LOG_ERROR_FILE_LEVEL: str = 'ERROR'
    LOG_STD_FORMAT: str = (
        '<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</> | <lvl>{level: <8}</> | '
        '<cyan> {correlation_id} </> | <lvl>{message}</>'
    )
    LOG_FILE_FORMAT: str = (
        '<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</> | <lvl>{level: <8}</> | '
        '<cyan> {correlation_id} </> | <lvl>{message}</>'
    )
    LOG_ACCESS_FILENAME: str = 'wemcp_access.log'
    LOG_ERROR_FILENAME: str = 'wemcp_error.log'

    # 操作日志
    OPERA_LOG_PATH_EXCLUDE: list[str] = [
        '/favicon.ico',
        '/docs',
        '/redoc',
        '/openapi',
        f'{FASTAPI_API_V1_PATH}/auth/login/swagger',
        f'{FASTAPI_API_V1_PATH}/oauth2/github/callback',
        f'{FASTAPI_API_V1_PATH}/oauth2/linux-do/callback',
    ]
    OPERA_LOG_ENCRYPT_TYPE: int = 1  # 0: AES (性能损耗); 1: md5; 2: ItsDangerous; 3: 不加密, others: 替换为 ******
    OPERA_LOG_ENCRYPT_KEY_INCLUDE: list[str] = [  # 将加密接口入参参数对应的值
        'password',
        'old_password',
        'new_password',
        'confirm_password',
    ]

    @model_validator(mode='before')
    @classmethod
    def check_env(cls, values: Any) -> Any:
        """生产环境下禁用 OpenAPI 文档和静态文件服务"""
        if values.get('ENVIRONMENT') == 'pro':
            values['FASTAPI_OPENAPI_URL'] = None
            values['FASTAPI_STATIC_FILES'] = False
        return values


@lru_cache
def get_settings() -> Settings:
    """获取全局配置单例"""
    return Settings()


# 创建全局配置实例
settings = get_settings()
