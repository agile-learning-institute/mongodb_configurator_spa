import type { Collection, CollectionConfig, Config, ValidationError } from '../types'

// Use relative URLs to work with Vite proxy in development
const API_BASE = import.meta.env.VITE_API_BASE || ''

class ApiError extends Error {
  constructor(message: string, public status?: number, public validationErrors?: ValidationError[]) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  let data: any = undefined
  try {
    data = await response.json()
  } catch (e) {
    // If response is not JSON, ignore
  }

  // If the response is a validation error array, always throw as validation error
  if (Array.isArray(data) && data.length > 0 && data[0].error_id) {
    throw new ApiError('Validation errors occurred', response.status ?? 500, data)
  }

  if (!response.ok) {
    throw new ApiError(`API Error: ${response.statusText}`, response.status)
  }

  return data
}

export const collectionsApi = {
  async getCollections(): Promise<Collection[]> {
    return apiRequest<Collection[]>('/api/collections/')
  },

  async getCollection(name: string): Promise<CollectionConfig> {
    return apiRequest<CollectionConfig>(`/api/collections/${name}/`)
  },

  async processCollection(name: string): Promise<any> {
    return apiRequest<any>(`/api/collections/${name}/`, {
      method: 'POST'
    })
  },

  async processAllCollections(): Promise<any> {
    return apiRequest<any>('/api/collections/', {
      method: 'POST'
    })
  }
}

export const renderApi = {
  async renderJsonSchema(schemaName: string): Promise<any> {
    return apiRequest(`/api/render/json_schema/${schemaName}/`)
  },

  async renderBsonSchema(schemaName: string): Promise<any> {
    return apiRequest(`/api/render/bson_schema/${schemaName}/`)
  },

  async renderOpenApi(schemaName: string): Promise<any> {
    return apiRequest(`/api/render/openapi/${schemaName}/`)
  }
}

export const configApi = {
  async getConfig(): Promise<Config> {
    return apiRequest<Config>('/api/config/')
  }
} 