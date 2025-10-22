import { ApiClient } from "./client"

export interface McpSubmitData {
  server_title: string
  server_type: "hosted" | "local"
  git: string
  mcpServers: any
}

export interface McpSubmitResponse {
  code: number
  msg?: string
  message?: string
  error?: string
  data?: any
}

export class McpApiService {
  /**
   * Validates and sanitizes MCP submission data
   */
  private static validateAndCleanData(data: Partial<McpSubmitData>): McpSubmitData {
    const cleanData = {
      server_title: data.server_title?.trim() || '',
      server_type: data.server_type as "hosted" | "local" || '',
      git: data.git?.trim() || '',
      mcpServers: data.mcpServers
    }

    // 验证必填字段
    if (!cleanData.server_title) {
      throw new Error('请输入服务器标题')
    }
    if (!cleanData.server_type) {
      throw new Error('请选择服务器类型')
    }
    if (!cleanData.git) {
      throw new Error('请输入Git仓库地址')
    }
    if (!cleanData.mcpServers) {
      throw new Error('请输入MCP服务器配置')
    }

    // 验证服务器类型
    if (cleanData.server_type !== 'hosted' && cleanData.server_type !== 'local') {
      throw new Error('请选择有效的服务器类型')
    }

    // 验证和处理 MCP 服务器配置
    let mcpServersJson: any

    try {
      // 如果 mcpServers 是字符串，则解析为 JSON
      if (typeof cleanData.mcpServers === 'string') {
        const trimmedString = cleanData.mcpServers.trim()
        if (!trimmedString) {
          throw new Error('MCP服务器配置不能为空')
        }
        mcpServersJson = JSON.parse(trimmedString)
      } else if (typeof cleanData.mcpServers === 'object' && cleanData.mcpServers !== null) {
        // 如果已经是对象，直接使用
        mcpServersJson = cleanData.mcpServers
      } else {
        throw new Error('MCP服务器配置必须是一个有效的JSON对象')
      }

      if (!mcpServersJson || typeof mcpServersJson !== 'object') {
        throw new Error('MCP服务器配置必须是一个有效的JSON对象')
      }

      // 验证基本结构 - 检查是否包含必要字段
      if (mcpServersJson.config && mcpServersJson.config.mcpServers) {
        const mcpServers = mcpServersJson.config.mcpServers
        if (typeof mcpServers !== 'object' || Array.isArray(mcpServers)) {
          throw new Error('mcpServers必须是一个对象')
        }
        
        // 验证每个服务器配置的基本结构
        for (const [serverName, serverConfig] of Object.entries(mcpServers)) {
          if (typeof serverConfig !== 'object' || serverConfig === null) {
            throw new Error(`服务器 "${serverName}" 的配置必须是一个对象`)
          }
          
          const config = serverConfig as any
          if (!config.type) {
            throw new Error(`服务器 "${serverName}" 必须指定type字段`)
          }
          
          if (config.type === 'sse' || config.type === 'streamableHttp') {
            if (!config.url) {
              throw new Error(`服务器 "${serverName}" 的type为${config.type}时必须指定url字段`)
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('MCP服务器配置格式错误，请输入有效的JSON格式')
      }
      throw error
    }

    // 将解析后的 JSON 对象赋值给 mcpServers
    cleanData.mcpServers = mcpServersJson

    // 验证 Git 仓库格式
    const gitUrlPattern = /^https?:\/\/(github\.com|gitlab\.com|bitbucket\.org)\/[\w\-\.]+\/[\w\-\.]+(\.git)?$/
    if (!gitUrlPattern.test(cleanData.git)) {
      throw new Error('请输入有效的 Git 仓库地址 (支持 GitHub、GitLab、Bitbucket)')
    }

    return {
      ...cleanData,
    }
  }

  /**
   * 提交 MCP 服务器配置
   */
  static async submitMcpServer(data: Partial<McpSubmitData>): Promise<McpSubmitResponse> {
    try {
      // 数据验证和清理
      const validatedData = this.validateAndCleanData(data)

      console.log("提交数据:", validatedData)

      // 调用API提交数据
      const response = await ApiClient.post<McpSubmitResponse>("/api/v1/mcp/deploy/package", validatedData)

      return response || { code: 500, error: "服务器响应异常" }
    } catch (error: any) {
      console.error("提交MCP失败:", error)
      
      // 如果是已知错误，直接抛出
      if (error.message) {
        throw error
      }
      
      // 未知错误包装
      throw new Error('提交失败，请稍后重试')
    }
  }

  /**
   * 获取 MCP 服务器列表
   */
  static async getMcpServers(params?: Record<string, any>): Promise<any> {
    try {
      return await ApiClient.get("/api/v1/mcp/servers", params)
    } catch (error: any) {
      console.error("获取MCP服务器列表失败:", error)
      throw new Error('获取服务器列表失败，请稍后重试')
    }
  }

  /**
   * 获取 MCP 服务器详情
   */
  static async getMcpServerDetail(serverId: string): Promise<any> {
    try {
      return await ApiClient.get(`/api/v1/mcp/servers/${serverId}`)
    } catch (error: any) {
      console.error("获取MCP服务器详情失败:", error)
      throw new Error('获取服务器详情失败，请稍后重试')
    }
  }
}
