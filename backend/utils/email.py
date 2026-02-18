#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from email.mime.text import MIMEText

import aiosmtplib

from core.conf import settings


async def send_verification_email(to_email: str, code: str) -> None:
    """发送验证码邮件"""
    msg = MIMEText(f'您的验证码是：{code}，5分钟内有效。', 'plain', 'utf-8')
    msg['Subject'] = 'WeMCP 登录验证码'
    msg['From'] = settings.SMTP_USER
    msg['To'] = to_email
    await aiosmtplib.send(
        msg,
        hostname=settings.SMTP_HOST,
        port=settings.SMTP_PORT,
        username=settings.SMTP_USER,
        password=settings.SMTP_PASSWORD,
        use_tls=True,
    )
