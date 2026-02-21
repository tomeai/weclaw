import http from "@/lib/http"
import { PaginatedData } from "@/lib/mcp"
import { API_ROUTE_SYS_MENUS, API_ROUTE_SYS_ROLES, API_ROUTE_SYS_USERS } from "./routes"

// ============ 用户类型 ============

export interface SysRoleDetail {
  id: number
  name: string
  status: 0 | 1
  is_filter_scopes: boolean
  remark: string | null
  created_time: string
  updated_time: string | null
}

export interface SysUserDetail {
  id: number
  uuid: string
  username: string
  nickname: string
  avatar: string | null
  email: string | null
  phone: string | null
  status: 0 | 1
  is_superuser: boolean
  is_staff: boolean
  is_multi_login: boolean
  join_time: string
  last_login_time: string | null
  roles: SysRoleDetail[]
}

export interface GetSysUsersParams {
  page?: number
  size?: number
  username?: string
  phone?: string
  status?: number
}

export interface AddSysUserParam {
  username: string
  password: string
  nickname?: string
  email?: string
  phone?: string
  roles?: number[]
}

export interface UpdateSysUserParam {
  username: string
  nickname: string
  avatar?: string | null
  email?: string | null
  phone?: string | null
  roles: number[]
}

export type UserPermissionType = "superuser" | "staff" | "status" | "multi_login"

// ============ 角色类型 ============

export interface GetSysRolesParams {
  page?: number
  size?: number
  name?: string
  status?: number
}

export interface CreateSysRoleParam {
  name: string
  status: 0 | 1
  is_filter_scopes?: boolean
  remark?: string | null
}

export interface UpdateSysRoleParam extends CreateSysRoleParam {}

export interface DeleteSysRolesParam {
  pks: number[]
}

// ============ 用户 API ============

/** 分页获取用户列表 */
export function getSysUsers(
  params: GetSysUsersParams = {}
): Promise<PaginatedData<SysUserDetail>> {
  return http.get<PaginatedData<SysUserDetail>>(API_ROUTE_SYS_USERS, {
    page: params.page ?? 1,
    size: params.size ?? 20,
    username: params.username,
    phone: params.phone,
    status: params.status,
  })
}

/** 获取用户详情 */
export function getSysUser(pk: number): Promise<SysUserDetail> {
  return http.get<SysUserDetail>(`${API_ROUTE_SYS_USERS}/${pk}`)
}

/** 获取用户的角色列表 */
export function getSysUserRoles(pk: number): Promise<SysRoleDetail[]> {
  return http.get<SysRoleDetail[]>(`${API_ROUTE_SYS_USERS}/${pk}/roles`)
}

/** 创建用户 */
export function createSysUser(obj: AddSysUserParam): Promise<SysUserDetail> {
  return http.post<SysUserDetail>(API_ROUTE_SYS_USERS, obj)
}

/** 更新用户信息 */
export function updateSysUser(
  pk: number,
  obj: UpdateSysUserParam
): Promise<void> {
  return http.put<void>(`${API_ROUTE_SYS_USERS}/${pk}`, obj)
}

/** 更新用户权限（superuser/staff/status/multi_login） */
export function updateUserPermission(
  pk: number,
  type: UserPermissionType
): Promise<void> {
  return http.put<void>(
    `${API_ROUTE_SYS_USERS}/${pk}/permissions?type=${type}`
  )
}

/** 重置用户密码 */
export function resetSysUserPassword(
  pk: number,
  password: string
): Promise<void> {
  return http.put<void>(`${API_ROUTE_SYS_USERS}/${pk}/password`, { password })
}

/** 删除用户 */
export function deleteSysUser(pk: number): Promise<void> {
  return http.delete<void>(`${API_ROUTE_SYS_USERS}/${pk}`)
}

// ============ 角色 API ============

/** 分页获取角色列表 */
export function getSysRoles(
  params: GetSysRolesParams = {}
): Promise<PaginatedData<SysRoleDetail>> {
  return http.get<PaginatedData<SysRoleDetail>>(API_ROUTE_SYS_ROLES, {
    page: params.page ?? 1,
    size: params.size ?? 20,
    name: params.name,
    status: params.status,
  })
}

/** 获取所有角色（不分页） */
export function getAllSysRoles(): Promise<SysRoleDetail[]> {
  return http.get<SysRoleDetail[]>(`${API_ROUTE_SYS_ROLES}/all`)
}

/** 获取角色详情 */
export function getSysRole(pk: number): Promise<SysRoleDetail> {
  return http.get<SysRoleDetail>(`${API_ROUTE_SYS_ROLES}/${pk}`)
}

/** 创建角色 */
export function createSysRole(obj: CreateSysRoleParam): Promise<void> {
  return http.post<void>(API_ROUTE_SYS_ROLES, obj)
}

/** 更新角色 */
export function updateSysRole(
  pk: number,
  obj: UpdateSysRoleParam
): Promise<void> {
  return http.put<void>(`${API_ROUTE_SYS_ROLES}/${pk}`, obj)
}

/** 批量删除角色 */
export function deleteSysRoles(pks: number[]): Promise<void> {
  return http.deleteBody<void>(API_ROUTE_SYS_ROLES, { pks })
}

/** 获取角色菜单树 */
export function getRoleMenuTree(roleId: number): Promise<SysMenuDetail[]> {
  return http.get<SysMenuDetail[]>(`${API_ROUTE_SYS_ROLES}/${roleId}/menus`)
}

/** 更新角色菜单 */
export function updateRoleMenus(roleId: number, menuIds: number[]): Promise<void> {
  return http.put<void>(`${API_ROUTE_SYS_ROLES}/${roleId}/menus`, { menus: menuIds })
}

// ============ 菜单类型 ============

/** 菜单类型：0目录 1菜单 2按钮 3内嵌 4外链 */
export type MenuType = 0 | 1 | 2 | 3 | 4

export interface SysMenuDetail {
  id: number
  title: string
  name: string
  path: string | null
  parent_id: number | null
  sort: number
  icon: string | null
  type: MenuType
  component: string | null
  perms: string | null
  status: 0 | 1
  display: 0 | 1
  cache: 0 | 1
  link: string | null
  remark: string | null
  created_time: string
  updated_time: string | null
  children?: SysMenuDetail[]
}

export interface CreateSysMenuParam {
  title: string
  name: string
  path?: string | null
  parent_id?: number | null
  sort?: number
  icon?: string | null
  type: MenuType
  component?: string | null
  perms?: string | null
  status: 0 | 1
  display: 0 | 1
  cache: 0 | 1
  link?: string | null
  remark?: string | null
}

export interface UpdateSysMenuParam extends CreateSysMenuParam {}

// ============ 菜单 API ============

/** 获取所有菜单（平铺） */
export function getSysMenus(): Promise<SysMenuDetail[]> {
  return http.get<SysMenuDetail[]>(API_ROUTE_SYS_MENUS)
}

/** 获取菜单树 */
export function getSysMenuTree(): Promise<SysMenuDetail[]> {
  return http.get<SysMenuDetail[]>(`${API_ROUTE_SYS_MENUS}/tree`)
}

/** 获取菜单详情 */
export function getSysMenu(pk: number): Promise<SysMenuDetail> {
  return http.get<SysMenuDetail>(`${API_ROUTE_SYS_MENUS}/${pk}`)
}

/** 创建菜单 */
export function createSysMenu(obj: CreateSysMenuParam): Promise<void> {
  return http.post<void>(API_ROUTE_SYS_MENUS, obj)
}

/** 更新菜单 */
export function updateSysMenu(pk: number, obj: UpdateSysMenuParam): Promise<void> {
  return http.put<void>(`${API_ROUTE_SYS_MENUS}/${pk}`, obj)
}

/** 删除菜单 */
export function deleteSysMenu(pk: number): Promise<void> {
  return http.delete<void>(`${API_ROUTE_SYS_MENUS}/${pk}`)
}
