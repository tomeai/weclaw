import { toast } from "@/components/ui/toast";
import axios, { AxiosInstance } from "axios";


/** 统一响应体 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
}

/** 业务异常 */
export class BusinessError extends Error {
  code: number
  constructor(code: number, msg: string) {
    super(msg)
    this.code = code
    this.name = "BusinessError"
  }
}

const instance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
})

// ---- 请求拦截：自动携带 token ----
instance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token")
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`
    }
  }
  return config
})

// ---- 响应拦截：统一错误处理 ----
instance.interceptors.response.use(
  (response) => {
    const res = response.data as ApiResponse

    // 业务 code !== 200 视为错误
    if (res.code !== 200) {
      const errMsg = res.msg || "请求失败"
      toast({ title: "请求失败", description: errMsg, status: "error" })
      return Promise.reject(new BusinessError(res.code, errMsg))
    }

    return response
  },
  (error) => {
    // 401/403 清除 token
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token")
      }
    }

    let errMsg: string
    if (!error.response) {
      // 网络错误 / 超时
      errMsg =
        error.code === "ECONNABORTED"
          ? "请求超时，请稍后重试"
          : "网络异常，请检查网络连接"
    } else {
      // 优先使用后端返回的业务错误信息
      const serverMsg = error.response.data?.msg
      if (serverMsg) {
        errMsg = serverMsg
      } else {
        // HTTP status 错误
        const status = error.response.status
        const messages: Record<number, string> = {
          400: "请求参数错误",
          401: "未授权，请重新登录",
          403: "没有权限访问",
          404: "请求资源不存在",
          500: "服务器内部错误",
          502: "网关错误",
          503: "服务不可用",
        }
        errMsg = messages[status] || `请求失败 (${status})`
      }
    }

    toast({ title: "请求失败", description: errMsg, status: "error" })
    return Promise.reject(new BusinessError(error.response?.status || 0, errMsg))
  }
)

/** 过滤掉 null / undefined 的参数 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function filterParams(params: Record<string, any>): Record<string, any> {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null)
  )
}

/**
 * 统一请求工具
 *
 * 用法:
 *   http.get<UserItem>('/api/user', { id: 1 })
 *   http.post<null>('/api/user', { name: 'test' })
 *
 * 返回值直接是响应体中的 data 字段
 */
const http = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async get<T = any>(url: string, params: Record<string, any> = {}): Promise<T> {
    const res = await instance.get<ApiResponse<T>>(url, {
      params: filterParams(params),
    })
    return res.data.data
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async post<T = any>(url: string, data: any = {}): Promise<T> {
    const res = await instance.post<ApiResponse<T>>(url, data)
    return res.data.data
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async put<T = any>(url: string, data: any = {}): Promise<T> {
    const res = await instance.put<ApiResponse<T>>(url, data)
    return res.data.data
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async delete<T = any>(url: string, params: Record<string, any> = {}): Promise<T> {
    const res = await instance.delete<ApiResponse<T>>(url, {
      params: filterParams(params),
    })
    return res.data.data
  },

  /** 需要拿到完整响应体 { code, msg, data } 时使用 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getRaw<T = any>(url: string, params: Record<string, any> = {}): Promise<ApiResponse<T>> {
    const res = await instance.get<ApiResponse<T>>(url, {
      params: filterParams(params),
    })
    return res.data
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async postRaw<T = any>(url: string, data: any = {}): Promise<ApiResponse<T>> {
    const res = await instance.post<ApiResponse<T>>(url, data)
    return res.data
  },
}

export default http
