#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from datetime import datetime
from typing import Annotated, Any

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_serializer, validate_email
from utils.timezone import timezone

CustomPhoneNumber = Annotated[str, Field(pattern=r'^1[3-9]\d{9}$')]


class CustomEmailStr(EmailStr):
    """自定义邮箱类型"""

    @classmethod
    def _validate(cls, __input_value: str) -> str:
        return None if __input_value == '' else validate_email(__input_value)[1]


class SchemaBase(BaseModel):
    """基础模型配置"""

    model_config = ConfigDict(
        use_enum_values=True,
    )

    @field_serializer('*', when_used='json')
    def serialize_datetime(self, value):
        if isinstance(value, datetime):
            return (
                timezone.to_str(timezone.from_datetime(value))
                if value.tzinfo is not None and value.tzinfo != timezone.tz_info
                else timezone.to_str(value)
            )
        return value


def ser_string(value: Any) -> str | None:
    if value:
        return str(value)
    return value
