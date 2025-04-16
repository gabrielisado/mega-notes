export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
}

export interface Folder {
  id: string
  name: string
  parent_id: string | null
  user_id: string
  created_at: string
  updated_at: string
}

export interface Note {
  id: string
  title: string
  content: string | null
  folder_id: string | null
  user_id: string
  is_markdown: boolean
  created_at: string
  updated_at: string
}

export interface AIConfig {
  id: string
  user_id: string
  provider: string
  api_key: string
  is_active: boolean
  created_at: string
  updated_at: string
}
