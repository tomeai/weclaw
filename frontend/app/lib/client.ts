/**
 * Generic API client for making HTTP requests using axios
 */
import { toast } from "@/components/ui/toast"
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios"

export class ApiClient {
  /**
   * Base URL for API requests
   */
  static readonly BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

  /**
   * Axios instance with default configuration
   */
  private static axiosInstance: AxiosInstance = axios.create({
    baseURL: ApiClient.BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 10000, // 10 seconds timeout
  })

  /**
   * Initializes the axios instance with interceptors for auth handling
   */
  static {
    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken()
        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor to handle unauthorized responses and network errors
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle unauthorized responses
        if (error.response?.status === 401 || error.response?.status === 403) {
          this.handleUnauthorized()
        }

        // Handle network errors with toast notification
        if (axios.isAxiosError(error) && !error.response) {
          let errorMessage = "Unable to connect to the server. Please check your internet connection."
          
          // Check if it's a timeout error
          if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
            errorMessage = "请求超时，服务器响应时间过长。请稍后重试或检查网络连接。"
            toast({
              title: "请求超时",
              description: errorMessage,
              status: "error",
            })
          } else {
            // General network error
            toast({
              title: "网络错误",
              description: errorMessage,
              status: "error",
            })
          }

          // Create a modified error object that includes a flag indicating it's been handled
          const handledError = Object.create(error)
          handledError.isHandled = true
          return Promise.reject(handledError)
        }

        return Promise.reject(error)
      }
    )
  }

  /**
   * Gets the authentication token from localStorage
   *
   * @returns The authentication token or null if not found
   */
  private static getAuthToken(): string | null {
    // Only access localStorage in browser environment
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token")
    }
    return null
  }

  /**
   * Handles unauthorized (401) responses by clearing auth token and redirecting to login
   */
  private static handleUnauthorized(): void {
    // Only run in browser environment
    if (typeof window !== "undefined") {
      // Clear the auth token
      localStorage.removeItem("auth_token")

      // Redirect to login page
      // window.location.href = "/auth/login"
    }
  }

  /**
   * Resolves a URL by prepending the base URL if the provided URL is relative
   *
   * @param url - The URL to resolve
   * @returns The resolved URL
   */
  private static resolveUrl(url: string): string {
    // If the URL starts with http:// or https://, use it as is
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url
    }

    // If the URL starts with a slash, append it to the base URL
    if (url.startsWith("/")) {
      return `${this.BASE_URL}${url}`
    }

    // Otherwise, append with a slash
    return `${this.BASE_URL}/${url}`
  }

  /**
   * Makes a GET request to the specified URL with query parameters
   *
   * @param url - The URL for the request (relative or absolute)
   * @param params - Query parameters to append to the URL
   * @returns The response data
   */
  static async get<T>(
    url: string,
    params: Record<string, any> = {}
  ): Promise<T> {
    try {
      // Filter out null and undefined values from params
      const filteredParams = Object.entries(params).reduce(
        (acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            acc[key] = value
          }
          return acc
        },
        {} as Record<string, any>
      )

      // Determine if we need to use a custom URL or let axios handle it
      const config: AxiosRequestConfig = {
        params: filteredParams,
      }

      // If it's an absolute URL, use it directly
      if (url.startsWith("http://") || url.startsWith("https://")) {
        config.url = url
        config.baseURL = undefined
      }

      const response: AxiosResponse<T> = await this.axiosInstance.get<T>(
        url,
        config
      )
      return response.data
    } catch (error: any) {
      console.error(`Error making GET request to ${url}:`, error)

      // If the error has already been handled by the interceptor, just return an empty object
      if (error.isHandled) {
        return {} as T
      }

      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with an error status code
          throw new Error(
            error.response.data?.error ||
              `Request failed with status: ${error.response.status}`
          )
        } else if (error.request) {
          // Request was made but no response received (network error)
          toast({
            title: "Network Error",
            description:
              "Unable to connect to the server. Please check your internet connection.",
            status: "error",
          })
          return {} as T // Return empty object to prevent further errors
        } else {
          // Error in setting up the request
          toast({
            title: "Request Error",
            description:
              error.message ||
              "An error occurred while setting up the request.",
            status: "error",
          })
          return {} as T // Return empty object to prevent further errors
        }
      }

      // For non-axios errors, show toast and return empty object
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An unknown error occurred.",
        status: "error",
      })
      return {} as T // Return empty object to prevent further errors
    }
  }

  /**
   * Makes a POST request to the specified URL with a JSON body
   *
   * @param url - The URL for the request (relative or absolute)
   * @param body - The request body to send as JSON
   * @returns The response data
   */
  static async post<T>(
    url: string,
    body: Record<string, any> = {}
  ): Promise<T> {
    try {
      // Determine if we need to use a custom URL or let axios handle it
      const config: AxiosRequestConfig = {}

      // If it's an absolute URL, use it directly
      if (url.startsWith("http://") || url.startsWith("https://")) {
        config.url = url
        config.baseURL = undefined
      }

      const response: AxiosResponse<T> = await this.axiosInstance.post<T>(
        url,
        body,
        config
      )
      return response.data
    } catch (error: any) {
      console.error(`Error making POST request to ${url}:`, error)

      // If the error has already been handled by the interceptor, just return an empty object
      if (error.isHandled) {
        return {} as T
      }

      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with an error status code
          throw new Error(
            error.response.data?.error ||
              `Request failed with status: ${error.response.status}`
          )
        } else if (error.request) {
          // Request was made but no response received (network error)
          toast({
            title: "Network Error",
            description:
              "Unable to connect to the server. Please check your internet connection.",
            status: "error",
          })
          return {} as T // Return empty object to prevent further errors
        } else {
          // Error in setting up the request
          toast({
            title: "Request Error",
            description:
              error.message ||
              "An error occurred while setting up the request.",
            status: "error",
          })
          return {} as T // Return empty object to prevent further errors
        }
      }

      // For non-axios errors, show toast and return empty object
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An unknown error occurred.",
        status: "error",
      })
      return {} as T // Return empty object to prevent further errors
    }
  }

  /**
   * Makes a PUT request to the specified URL with a JSON body
   *
   * @param url - The URL for the request (relative or absolute)
   * @param body - The request body to send as JSON
   * @returns The response data
   */
  static async put<T>(
    url: string,
    body: Record<string, any> = {}
  ): Promise<T> {
    try {
      // Determine if we need to use a custom URL or let axios handle it
      const config: AxiosRequestConfig = {}

      // If it's an absolute URL, use it directly
      if (url.startsWith("http://") || url.startsWith("https://")) {
        config.url = url
        config.baseURL = undefined
      }

      const response: AxiosResponse<T> = await this.axiosInstance.put<T>(
        url,
        body,
        config
      )
      return response.data
    } catch (error: any) {
      console.error(`Error making PUT request to ${url}:`, error)

      // If the error has already been handled by the interceptor, just return an empty object
      if (error.isHandled) {
        return {} as T
      }

      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with an error status code
          throw new Error(
            error.response.data?.error ||
              `Request failed with status: ${error.response.status}`
          )
        } else if (error.request) {
          // Request was made but no response received (network error)
          toast({
            title: "Network Error",
            description:
              "Unable to connect to the server. Please check your internet connection.",
            status: "error",
          })
          return {} as T // Return empty object to prevent further errors
        } else {
          // Error in setting up the request
          toast({
            title: "Request Error",
            description:
              error.message ||
              "An error occurred while setting up the request.",
            status: "error",
          })
          return {} as T // Return empty object to prevent further errors
        }
      }

      // For non-axios errors, show toast and return empty object
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An unknown error occurred.",
        status: "error",
      })
      return {} as T // Return empty object to prevent further errors
    }
  }
}
