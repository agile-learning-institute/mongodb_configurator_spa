// Type definitions based on OpenAPI schema

export interface Collection {
  collection_name: string
  version: string
  targeted_version?: string
}

export interface CollectionConfig {
  name: string
  versions: VersionConfig[]
}

export interface VersionConfig {
  version: string
  test_data?: string
  add_indexes?: any[]
  drop_indexes?: string[]
  aggregations?: any[]
}

export interface ProcessingResult {
  operation: string
  status: 'success' | 'error' | 'skipped'
  collection?: string
  message?: string
  details_type?: string
  details?: any
}

export interface Config {
  config_items: ConfigItem[]
  enumerators: Record<string, any>
  token: Token
  versions: any[]
}

export interface ConfigItem {
  name: string
  value: string
  from: 'default' | 'file' | 'environment'
}

export interface Token {
  user_id: string
  from_ip?: string
  roles: string[]
}

export interface ApiError {
  message: string
  status?: number
} 