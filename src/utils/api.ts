import axios, { AxiosInstance, AxiosResponse } from 'axios'

// Environment-based configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const API_TIMEOUT = 30000 // 30 seconds

// API client configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  // Force relative URLs
  withCredentials: false,
})

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    // All API errors return 500 with Event objects
    if (error.response?.status === 500) {
      // Return the event data for popup display
      return Promise.reject({
        type: 'API_ERROR',
        status: 500,
        data: error.response.data,
      })
    }
    return Promise.reject(error)
  }
)

// API endpoints
export const API_ENDPOINTS = {
  // Configuration
  CONFIG: '/config/',
  
  // Configurations
  CONFIGURATIONS: '/configurations/',
  CONFIGURATION: (fileName: string) => `/configurations/${fileName}/`,
  NEW_COLLECTION: (name: string) => `/configurations/collection/${name}/`,
  JSON_SCHEMA: (fileName: string, version: string) => 
    `/configurations/json_schema/${fileName}/${version}/`,
  BSON_SCHEMA: (fileName: string, version: string) => 
    `/configurations/bson_schema/${fileName}/${version}/`,
  
  // Dictionaries
  DICTIONARIES: '/dictionaries/',
  DICTIONARY: (fileName: string) => `/dictionaries/${fileName}/`,
  
  // Types
  TYPES: '/types/',
  TYPE: (fileName: string) => `/types/${fileName}/`,
  
  // Test Data
  TEST_DATA: '/test_data/',
  TEST_DATA_FILE: (fileName: string) => `/test_data/${fileName}/`,
  
  // Migrations
  MIGRATIONS: '/migrations/',
  MIGRATION: (fileName: string) => `/migrations/${fileName}/`,
  
  // Enumerators
  ENUMERATORS: '/enumerators/',
  ENUMERATOR: (fileName: string) => `/enumerators/${fileName}/`,
  
  // Database
  DATABASE: '/database/',
  
  // Health
  HEALTH: '/health',
  
  // Events - removed as this endpoint doesn't exist in OpenAPI
  // EVENTS: '/events/',
} as const

// API service functions
export const apiService = {
  // Configuration
  async getConfig() {
    const response = await apiClient.get(API_ENDPOINTS.CONFIG)
    return response.data
  },

  // Configurations
  async getConfigurations() {
    const response = await apiClient.get(API_ENDPOINTS.CONFIGURATIONS)
    return response.data
  },

  async getConfiguration(fileName: string) {
    const response = await apiClient.get(API_ENDPOINTS.CONFIGURATION(fileName))
    return response.data
  },

  async saveConfiguration(fileName: string, data: any) {
    const response = await apiClient.put(API_ENDPOINTS.CONFIGURATION(fileName), data)
    return response.data
  },

  async deleteConfiguration(fileName: string) {
    const response = await apiClient.delete(API_ENDPOINTS.CONFIGURATION(fileName))
    return response.data
  },

  async processConfiguration(fileName: string) {
    const response = await apiClient.post(API_ENDPOINTS.CONFIGURATION(fileName))
    return response.data
  },

  async processAllConfigurations() {
    const response = await apiClient.post(API_ENDPOINTS.CONFIGURATIONS)
    return response.data
  },

  async createNewCollection(name: string) {
    const response = await apiClient.post(API_ENDPOINTS.NEW_COLLECTION(name))
    return response.data
  },

  async downloadJsonSchema(fileName: string, version: string) {
    const response = await apiClient.get(API_ENDPOINTS.JSON_SCHEMA(fileName, version), {
      responseType: 'blob'
    })
    return response.data
  },

  async downloadBsonSchema(fileName: string, version: string) {
    const response = await apiClient.get(API_ENDPOINTS.BSON_SCHEMA(fileName, version), {
      responseType: 'blob'
    })
    return response.data
  },

  // Dictionaries
  async getDictionaries() {
    const response = await apiClient.get(API_ENDPOINTS.DICTIONARIES)
    return response.data
  },

  async getDictionary(fileName: string) {
    const response = await apiClient.get(API_ENDPOINTS.DICTIONARY(fileName))
    return response.data
  },

  async saveDictionary(fileName: string, data: any) {
    const response = await apiClient.put(API_ENDPOINTS.DICTIONARY(fileName), data)
    return response.data
  },

  async deleteDictionary(fileName: string) {
    const response = await apiClient.delete(API_ENDPOINTS.DICTIONARY(fileName))
    return response.data
  },

  async lockAllDictionaries() {
    const response = await apiClient.patch(API_ENDPOINTS.DICTIONARIES)
    return response.data
  },

  // Types
  async getTypes() {
    const response = await apiClient.get(API_ENDPOINTS.TYPES)
    return response.data
  },

  async getType(fileName: string) {
    const response = await apiClient.get(API_ENDPOINTS.TYPE(fileName))
    return response.data
  },

  async saveType(fileName: string, data: any) {
    const response = await apiClient.put(API_ENDPOINTS.TYPE(fileName), data)
    return response.data
  },

  async deleteType(fileName: string) {
    const response = await apiClient.delete(API_ENDPOINTS.TYPE(fileName))
    return response.data
  },

  async lockAllTypes() {
    const response = await apiClient.patch(API_ENDPOINTS.TYPES)
    return response.data
  },

  // Test Data
  async getTestData() {
    const response = await apiClient.get(API_ENDPOINTS.TEST_DATA)
    return response.data
  },

  async getTestDataFile(fileName: string) {
    const response = await apiClient.get(API_ENDPOINTS.TEST_DATA_FILE(fileName))
    return response.data
  },

  async saveTestDataFile(fileName: string, data: any) {
    const response = await apiClient.put(API_ENDPOINTS.TEST_DATA_FILE(fileName), data)
    return response.data
  },

  async deleteTestDataFile(fileName: string) {
    const response = await apiClient.delete(API_ENDPOINTS.TEST_DATA_FILE(fileName))
    return response.data
  },

  // Migrations
  async getMigrations() {
    const response = await apiClient.get(API_ENDPOINTS.MIGRATIONS)
    return response.data
  },

  async getMigration(fileName: string) {
    const response = await apiClient.get(API_ENDPOINTS.MIGRATION(fileName))
    return response.data
  },

  async saveMigration(fileName: string, data: any) {
    const response = await apiClient.put(API_ENDPOINTS.MIGRATION(fileName), data)
    return response.data
  },

  async deleteMigration(fileName: string) {
    const response = await apiClient.delete(API_ENDPOINTS.MIGRATION(fileName))
    return response.data
  },

  // Enumerators
  async getEnumerators() {
    const response = await apiClient.get(API_ENDPOINTS.ENUMERATORS)
    return response.data
  },

  async getEnumerator(fileName: string) {
    const response = await apiClient.get(API_ENDPOINTS.ENUMERATOR(fileName))
    return response.data
  },

  async saveEnumerator(fileName: string, data: any) {
    const response = await apiClient.put(API_ENDPOINTS.ENUMERATOR(fileName), data)
    return response.data
  },

  async deleteEnumerator(fileName: string) {
    const response = await apiClient.delete(API_ENDPOINTS.ENUMERATOR(fileName))
    return response.data
  },

  async lockAllEnumerators() {
    const response = await apiClient.patch(API_ENDPOINTS.ENUMERATORS)
    return response.data
  },

  // Lock all configurations
  async lockAllConfigurations() {
    const response = await apiClient.patch(API_ENDPOINTS.CONFIGURATIONS)
    return response.data
  },

  // Database operations
  async dropDatabase() {
    const response = await apiClient.delete(API_ENDPOINTS.DATABASE)
    return response.data
  },

  // Health check
  async getHealth() {
    const response = await apiClient.get(API_ENDPOINTS.HEALTH)
    return response.data
  },
}

// Export specific API modules for tests
export const collectionsApi = {
  getCollections: apiService.getConfigurations,
  getCollection: apiService.getConfiguration,
  processCollection: apiService.processConfiguration,
  processAllCollections: apiService.processAllConfigurations,
}

export const renderApi = {
  renderJsonSchema: apiService.downloadJsonSchema,
  renderBsonSchema: apiService.downloadBsonSchema,
  renderOpenApi: () => Promise.reject(new Error('OpenAPI rendering not implemented')),
}

export const configApi = {
  getConfig: apiService.getConfig,
} 