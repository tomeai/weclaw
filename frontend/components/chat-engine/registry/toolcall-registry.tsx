"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"
import type { ToolcallConfig, ToolcallProps, ToolResultConfig, ToolResultProps } from "../types"

// ─── Registry Context ─────────────────────────────────────────────────────────

interface ToolcallRegistryContextValue {
  toolComponents: Map<string, React.FC<ToolcallProps>>
  resultComponents: Map<string, React.FC<ToolResultProps>>
  defaultToolComponent: React.FC<ToolcallProps> | null
  defaultResultComponent: React.FC<ToolResultProps> | null
  registerTool: (config: ToolcallConfig) => void
  unregisterTool: (name: string) => void
  registerResult: (config: ToolResultConfig) => void
  unregisterResult: (name?: string) => void
  getToolComponent: (name: string) => React.FC<ToolcallProps> | null
  getResultComponent: (name?: string) => React.FC<ToolResultProps> | null
}

const ToolcallRegistryContext = createContext<ToolcallRegistryContextValue | null>(null)

// ─── Registry Provider ────────────────────────────────────────────────────────

export interface ToolcallRegistryProviderProps {
  children: React.ReactNode
  /** Default component for tool_use when no specific component is registered */
  defaultToolComponent?: React.FC<ToolcallProps> | null
  /** Default component for tool_result when no specific component is registered */
  defaultResultComponent?: React.FC<ToolResultProps> | null
  /** Initial tool components to register */
  initialTools?: ToolcallConfig[]
  /** Initial result components to register */
  initialResults?: ToolResultConfig[]
}

export function ToolcallRegistryProvider({
  children,
  defaultToolComponent = null,
  defaultResultComponent = null,
  initialTools = [],
  initialResults = [],
}: ToolcallRegistryProviderProps) {
  const [toolComponents, setToolComponents] = useState<Map<string, React.FC<ToolcallProps>>>(() => {
    const map = new Map<string, React.FC<ToolcallProps>>()
    initialTools.forEach((config) => map.set(config.name, config.component))
    return map
  })

  const [resultComponents, setResultComponents] = useState<Map<string, React.FC<ToolResultProps>>>(() => {
    const map = new Map<string, React.FC<ToolResultProps>>()
    initialResults.forEach((config) => {
      const key = config.name || "__default__"
      map.set(key, config.component)
    })
    return map
  })

  const registerTool = useCallback((config: ToolcallConfig) => {
    setToolComponents((prev) => {
      const next = new Map(prev)
      next.set(config.name, config.component)
      return next
    })
  }, [])

  const unregisterTool = useCallback((name: string) => {
    setToolComponents((prev) => {
      const next = new Map(prev)
      next.delete(name)
      return next
    })
  }, [])

  const registerResult = useCallback((config: ToolResultConfig) => {
    setResultComponents((prev) => {
      const next = new Map(prev)
      const key = config.name || "__default__"
      next.set(key, config.component)
      return next
    })
  }, [])

  const unregisterResult = useCallback((name?: string) => {
    setResultComponents((prev) => {
      const next = new Map(prev)
      const key = name || "__default__"
      next.delete(key)
      return next
    })
  }, [])

  const getToolComponent = useCallback(
    (name: string): React.FC<ToolcallProps> | null => {
      return toolComponents.get(name) || defaultToolComponent
    },
    [toolComponents, defaultToolComponent]
  )

  const getResultComponent = useCallback(
    (name?: string): React.FC<ToolResultProps> | null => {
      return (name && resultComponents.get(name)) || resultComponents.get("__default__") || defaultResultComponent
    },
    [resultComponents, defaultResultComponent]
  )

  const value = useMemo(
    () => ({
      toolComponents,
      resultComponents,
      defaultToolComponent,
      defaultResultComponent,
      registerTool,
      unregisterTool,
      registerResult,
      unregisterResult,
      getToolComponent,
      getResultComponent,
    }),
    [
      toolComponents,
      resultComponents,
      defaultToolComponent,
      defaultResultComponent,
      registerTool,
      unregisterTool,
      registerResult,
      unregisterResult,
      getToolComponent,
      getResultComponent,
    ]
  )

  return (
    <ToolcallRegistryContext.Provider value={value}>
      {children}
    </ToolcallRegistryContext.Provider>
  )
}

// ─── Hook to Access Registry ──────────────────────────────────────────────────

export function useToolcallRegistry() {
  const context = useContext(ToolcallRegistryContext)
  if (!context) {
    throw new Error(
      "useToolcallRegistry must be used within a ToolcallRegistryProvider"
    )
  }
  return context
}

// ─── Hook to Register Tool Component ──────────────────────────────────────────

export function useToolcall(config: ToolcallConfig) {
  const { registerTool, unregisterTool } = useToolcallRegistry()

  React.useEffect(() => {
    registerTool(config)
    return () => unregisterTool(config.name)
  }, [config, registerTool, unregisterTool])
}

// ─── Hook to Register Result Component ────────────────────────────────────────

export function useToolResult(config: ToolResultConfig) {
  const { registerResult, unregisterResult } = useToolcallRegistry()

  React.useEffect(() => {
    registerResult(config)
    return () => unregisterResult(config.name)
  }, [config, registerResult, unregisterResult])
}

// ─── Optional: Get Component for Rendering ────────────────────────────────────

export function useToolComponent(name: string) {
  const { getToolComponent } = useToolcallRegistry()
  return getToolComponent(name)
}

export function useResultComponent(name?: string) {
  const { getResultComponent } = useToolcallRegistry()
  return getResultComponent(name)
}
