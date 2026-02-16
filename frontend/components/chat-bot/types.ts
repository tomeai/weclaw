export type SearchType = "mcp" | "skill" | "agent"

export type SelectedContext = {
  type: SearchType
  owner: string
  name: string
  label: string
}

export type SearchResult = {
  owner: string
  name: string
  label: string
  description: string
  avatar: string
}
