import type { Collection, CollectionConfig, ProcessingResult, Config } from '@/types'

// Use relative URLs to work with Vite proxy in development
const API_BASE = import.meta.env.VITE_API_BASE || ''

class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new ApiError(`API Error: ${response.statusText}`, response.status)
  }

  return response.json()
}

export const collectionsApi = {
  async getCollections(): Promise<Collection[]> {
    return apiRequest<Collection[]>('/api/collections')
  },

  async getCollection(name: string): Promise<CollectionConfig> {
    return apiRequest<CollectionConfig>(`/api/collections/${name}`)
  },

  async processCollection(name: string): Promise<ProcessingResult[]> {
    return apiRequest<ProcessingResult[]>(`/api/collections/${name}`, {
      method: 'POST'
    })
  },

  async processAllCollections(): Promise<ProcessingResult[]> {
    return apiRequest<ProcessingResult[]>('/api/collections', {
      method: 'POST'
    })
  }
}

export const renderApi = {
  async renderJsonSchema(schemaName: string): Promise<any> {
    return apiRequest(`/api/render/json_schema/${schemaName}`)
  },

  async renderBsonSchema(schemaName: string): Promise<any> {
    return apiRequest(`/api/render/bson_schema/${schemaName}`)
  },

  async renderOpenApi(schemaName: string): Promise<any> {
    return apiRequest(`/api/render/openapi/${schemaName}`)
  }
}

export const configApi = {
  async getConfig(): Promise<Config> {
    return apiRequest<Config>('/api/config')
  }
} 