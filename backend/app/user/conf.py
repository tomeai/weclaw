#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from functools import lru_cache

from core.path_conf import BASE_PATH
from pydantic_settings import BaseSettings, SettingsConfigDict


class ClientSettings(BaseSettings):
    """Client 配置"""

    model_config = SettingsConfigDict(env_file=f'{BASE_PATH}/.env', env_file_encoding='utf-8', extra='ignore')

    # .env OAuth2
    OAUTH2_CLIENT_ID: str = ''
    OAUTH2_CLIENT_SECRET: str = ''

    # OAuth2
    OAUTH2_REDIRECT_URI: str = ''

    # redirect fronted
    OAUTH2_FRONTEND_REDIRECT_URI: str = 'http://localhost:3000/auth/callback'


@lru_cache
def get_client_settings() -> ClientSettings:
    """获取 client 配置"""
    return ClientSettings()


client_settings = get_client_settings()
