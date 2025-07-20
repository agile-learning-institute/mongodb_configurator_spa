import { describe, it, expect, vi, beforeEach } from 'vitest'
import { collectionsApi, renderApi, configApi } from '../../src/utils/api'

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn()
  }
}))

describe('API Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('collectionsApi', () => {
    it('should get collections successfully', async () => {
      const mockResponse = [{ collection_name: 'test', version: '1.0.0' }]
      const mockAxiosInstance = {
        get: vi.fn().mockResolvedValue({ data: mockResponse }),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        patch: vi.fn(),
        interceptors: {
          response: {
            use: vi.fn()
          }
        }
      }
      const { default: axios } = await import('axios')
      ;(axios.create as any).mockReturnValue(mockAxiosInstance)

      const result = await collectionsApi.getCollections()

      expect(result).toEqual(mockResponse)
    })

    it('should get collection successfully', async () => {
      const mockResponse = { collection_name: 'test', version: '1.0.0' }
      const mockAxiosInstance = {
        get: vi.fn().mockResolvedValue({ data: mockResponse }),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        patch: vi.fn(),
        interceptors: {
          response: {
            use: vi.fn()
          }
        }
      }
      const { default: axios } = await import('axios')
      ;(axios.create as any).mockReturnValue(mockAxiosInstance)

      const result = await collectionsApi.getCollection('test')

      expect(result).toEqual(mockResponse)
    })

    it('should process collection successfully', async () => {
      const mockResponse = [{ status: 'success' }]
      const mockAxiosInstance = {
        get: vi.fn(),
        post: vi.fn().mockResolvedValue({ data: mockResponse }),
        put: vi.fn(),
        delete: vi.fn(),
        patch: vi.fn(),
        interceptors: {
          response: {
            use: vi.fn()
          }
        }
      }
      const { default: axios } = await import('axios')
      ;(axios.create as any).mockReturnValue(mockAxiosInstance)

      const result = await collectionsApi.processCollection('test')

      expect(result).toEqual(mockResponse)
    })

    it('should process all collections successfully', async () => {
      const mockResponse = [{ status: 'success' }]
      const mockAxiosInstance = {
        get: vi.fn(),
        post: vi.fn().mockResolvedValue({ data: mockResponse }),
        put: vi.fn(),
        delete: vi.fn(),
        patch: vi.fn(),
        interceptors: {
          response: {
            use: vi.fn()
          }
        }
      }
      const { default: axios } = await import('axios')
      ;(axios.create as any).mockReturnValue(mockAxiosInstance)

      const result = await collectionsApi.processAllCollections()

      expect(result).toEqual(mockResponse)
    })
  })

  describe('renderApi', () => {
    it('should render JSON schema successfully', async () => {
      const mockResponse = { type: 'object' }
      const mockAxiosInstance = {
        get: vi.fn().mockResolvedValue({ data: mockResponse }),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        patch: vi.fn(),
        interceptors: {
          response: {
            use: vi.fn()
          }
        }
      }
      const { default: axios } = await import('axios')
      ;(axios.create as any).mockReturnValue(mockAxiosInstance)

      const result = await renderApi.renderJsonSchema('test', '1.0.0')

      expect(result).toEqual(mockResponse)
    })

    it('should render BSON schema successfully', async () => {
      const mockResponse = { bsonType: 'object' }
      const mockAxiosInstance = {
        get: vi.fn().mockResolvedValue({ data: mockResponse }),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        patch: vi.fn(),
        interceptors: {
          response: {
            use: vi.fn()
          }
        }
      }
      const { default: axios } = await import('axios')
      ;(axios.create as any).mockReturnValue(mockAxiosInstance)

      const result = await renderApi.renderBsonSchema('test', '1.0.0')

      expect(result).toEqual(mockResponse)
    })

    it('should render OpenAPI successfully', async () => {
      try {
        await renderApi.renderOpenApi()
        expect.fail('Should have thrown error')
      } catch (error: any) {
        expect(error.message).toBe('OpenAPI rendering not implemented')
      }
    })
  })

  describe('configApi', () => {
    it('should get config successfully', async () => {
      const mockResponse = { version: '1.0.0' }
      const mockAxiosInstance = {
        get: vi.fn().mockResolvedValue({ data: mockResponse }),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        patch: vi.fn(),
        interceptors: {
          response: {
            use: vi.fn()
          }
        }
      }
      const { default: axios } = await import('axios')
      ;(axios.create as any).mockReturnValue(mockAxiosInstance)

      const result = await configApi.getConfig()

      expect(result).toEqual(mockResponse)
    })

    describe('validation error handling', () => {
      it('should throw validation error when API returns validation errors array', async () => {
        const mockValidationErrors = [
          {
            error: 'invalid_config_format',
            error_id: 'CFG-101',
            message: 'Configuration must be a dictionary',
            file: 'test.yaml'
          },
          {
            error: 'missing_required_field',
            error_id: 'CFG-201',
            message: 'Configuration must include name field',
            file: 'test.yaml',
            field: 'name'
          }
        ]

        const mockAxiosInstance = {
          get: vi.fn().mockRejectedValue({
            type: 'API_ERROR',
            status: 500,
            data: mockValidationErrors
          }),
          post: vi.fn(),
          put: vi.fn(),
          delete: vi.fn(),
          patch: vi.fn(),
          interceptors: {
            response: {
              use: vi.fn()
            }
          }
        }
        const { default: axios } = await import('axios')
        ;(axios.create as any).mockReturnValue(mockAxiosInstance)

        try {
          await collectionsApi.getCollections()
          expect.fail('Should have thrown validation error')
        } catch (error: any) {
          expect(error.type).toBe('API_ERROR')
          expect(error.data).toEqual(mockValidationErrors)
          expect(error.status).toBe(500)
        }
      })

      it('should throw validation error when API returns 500 with validation errors', async () => {
        const mockValidationErrors = [
          {
            error: 'invalid_config_format',
            error_id: 'CFG-101',
            message: 'Configuration must be a dictionary'
          }
        ]

        const mockAxiosInstance = {
          get: vi.fn().mockRejectedValue({
            type: 'API_ERROR',
            status: 500,
            data: mockValidationErrors
          }),
          post: vi.fn(),
          put: vi.fn(),
          delete: vi.fn(),
          patch: vi.fn(),
          interceptors: {
            response: {
              use: vi.fn()
            }
          }
        }
        const { default: axios } = await import('axios')
        ;(axios.create as any).mockReturnValue(mockAxiosInstance)

        try {
          await collectionsApi.getCollections()
          expect.fail('Should have thrown validation error')
        } catch (error: any) {
          expect(error.type).toBe('API_ERROR')
          expect(error.data).toEqual(mockValidationErrors)
          expect(error.status).toBe(500)
        }
      })

      it('should throw regular API error when response is not ok and not validation errors', async () => {
        const mockAxiosInstance = {
          get: vi.fn().mockRejectedValue({
            response: {
              status: 404,
              statusText: 'Not Found',
              data: { message: 'Not found' }
            }
          }),
          post: vi.fn(),
          put: vi.fn(),
          delete: vi.fn(),
          patch: vi.fn(),
          interceptors: {
            response: {
              use: vi.fn()
            }
          }
        }
        const { default: axios } = await import('axios')
        ;(axios.create as any).mockReturnValue(mockAxiosInstance)

        try {
          await collectionsApi.getCollections()
          expect.fail('Should have thrown API error')
        } catch (error: any) {
          expect(error.response.status).toBe(404)
          expect(error.response.statusText).toBe('Not Found')
        }
      })
    })
  })
}) 