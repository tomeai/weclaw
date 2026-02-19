#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from app.admin.model.agent import AgentServer
from app.admin.model.category import AgentCategory, McpCategory, SkillCategory
from app.admin.model.data_rule import DataRule
from app.admin.model.data_scope import DataScope
from app.admin.model.login_log import LoginLog
from app.admin.model.m2m import data_scope_rule, role_data_scope, role_menu, user_role
from app.admin.model.mcp import McpServer
from app.admin.model.menu import Menu
from app.admin.model.opera_log import OperaLog
from app.admin.model.role import Role
from app.admin.model.skill import AgentSkill
from app.admin.model.user import User
from app.admin.model.user_social import UserSocial
