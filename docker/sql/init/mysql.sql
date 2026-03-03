INSERT INTO `sys_menu` (`id`, `title`, `name`, `path`, `sort`, `icon`, `type`, `component`, `perms`, `status`,
                        `display`, `cache`,
                        `remark`, `parent_id`, `created_time`, `updated_time`)
VALUES (1, '系统概览', 'dashboard', '/user/admin', 1, 'LayoutDashboard', 0, NULL, NULL, 1, 1, 1, NULL, NULL, NOW(),
        NULL),
       (2, 'MCP 管理', 'mcp-manage', '/user/admin/mcp', 2, 'Server', 0, NULL, NULL, 1, 1, 1, NULL, NULL, NOW(), NULL),
       (3, 'Skill 管理', 'skill-manage', '/user/admin/skill', 4, 'Zap', 0, NULL, NULL, 1, 1, 1, NULL, NULL, NOW(),
        NULL),
       (4, 'Agent 管理', 'agent-manage', '/user/admin/agent', 3, 'Bot', 0, NULL, NULL, 1, 1, 1, NULL, NULL, NOW(),
        NULL),
       (5, '部署日志', 'deploy-log', '/user/admin/deploy', 8, 'History', 0, NULL, NULL, 1, 1, 1, NULL, NULL, NOW(), NULL),
       (6, '用户管理', 'user-manage', '/user/admin/user', 5, 'Users', 0, NULL, NULL, 1, 1, 1, NULL, NULL, NOW(), NULL),
       (7, '权限管理', 'permission-manage', '/user/admin/permission', 6, 'Shield', 0, NULL, NULL, 1, 1, 1, NULL, NULL,
        NOW(), NULL),
       (8, '日志管理', 'log-manage', '/user/admin/log', 7, 'FileText', 0, NULL, NULL, 1, 1, 1, NULL, NULL, NOW(), NULL);

INSERT INTO `sys_menu` (`id`, `title`, `name`, `path`, `sort`, `icon`, `type`, `component`, `perms`, `status`,
                        `display`, `cache`,
                        `remark`, `parent_id`, `created_time`, `updated_time`)
VALUES (10, '查询用户', 'sys:user:list', NULL, 1, NULL, 2, NULL, 'sys:user:list', 1, 1, 1, NULL, 5, NOW(), NULL),
       (11, '创建用户', 'sys:user:add', NULL, 2, NULL, 2, NULL, 'sys:user:add', 1, 1, 1, NULL, 5, NOW(), NULL),
       (12, '更新用户', 'sys:user:edit', NULL, 3, NULL, 2, NULL, 'sys:user:edit', 1, 1, 1, NULL, 5, NOW(), NULL),
       (13, '重置密码', 'sys:user:password:reset', NULL, 4, NULL, 2, NULL, 'sys:user:password:reset', 1, 1, 1, NULL, 5,
        NOW(), NULL);

INSERT INTO `sys_menu` (`id`, `title`, `name`, `path`, `sort`, `icon`, `type`, `component`, `perms`, `status`,
                        `display`, `cache`,
                        `remark`, `parent_id`, `created_time`, `updated_time`)
VALUES (20, '查询菜单', 'sys:menu:list', NULL, 1, NULL, 2, NULL, 'sys:menu:list', 1, 1, 1, NULL, 6, NOW(), NULL),
       (21, '创建菜单', 'sys:menu:add', NULL, 2, NULL, 2, NULL, 'sys:menu:add', 1, 1, 1, NULL, 6, NOW(), NULL),
       (22, '更新菜单', 'sys:menu:edit', NULL, 3, NULL, 2, NULL, 'sys:menu:edit', 1, 1, 1, NULL, 6, NOW(), NULL),
       (23, '删除菜单', 'sys:menu:del', NULL, 4, NULL, 2, NULL, 'sys:menu:del', 1, 1, 1, NULL, 6, NOW(), NULL),
       (24, '创建角色', 'sys:role:add', NULL, 5, NULL, 2, NULL, 'sys:role:add', 1, 1, 1, NULL, 6, NOW(), NULL),
       (25, '更新角色', 'sys:role:edit', NULL, 6, NULL, 2, NULL, 'sys:role:edit', 1, 1, 1, NULL, 6, NOW(), NULL),
       (26, '删除角色', 'sys:role:del', NULL, 7, NULL, 2, NULL, 'sys:role:del', 1, 1, 1, NULL, 6, NOW(), NULL),
       (27, '更新角色菜单', 'sys:role:menu:edit', NULL, 8, NULL, 2, NULL, 'sys:role:menu:edit', 1, 1, 1, NULL, 6, NOW(),
        NULL),
       (28, '更新数据范围', 'sys:role:scope:edit', NULL, 9, NULL, 2, NULL, 'sys:role:scope:edit', 1, 1, 1, NULL, 6,
        NOW(), NULL);

INSERT INTO `sys_menu` (`id`, `title`, `name`, `path`, `sort`, `icon`, `type`, `component`, `perms`, `status`,
                        `display`, `cache`,
                        `remark`, `parent_id`, `created_time`, `updated_time`)
VALUES (30, '删除操作日志', 'log:opera:del', NULL, 1, NULL, 2, NULL, 'log:opera:del', 1, 1, 1, NULL, 7, NOW(), NULL),
       (31, '清空操作日志', 'log:opera:clear', NULL, 2, NULL, 2, NULL, 'log:opera:clear', 1, 1, 1, NULL, 7, NOW(),
        NULL),
       (32, '删除登录日志', 'log:login:del', NULL, 3, NULL, 2, NULL, 'log:login:del', 1, 1, 1, NULL, 7, NOW(), NULL),
       (33, '清空登录日志', 'log:login:clear', NULL, 4, NULL, 2, NULL, 'log:login:clear', 1, 1, 1, NULL, 7, NOW(),
        NULL);
