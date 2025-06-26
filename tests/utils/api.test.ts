import { describe, it, expect, vi, beforeEach } from 'vitest'
import { collectionsApi, renderApi, configApi } from '../../src/utils/api'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('API Utils', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  describe('collectionsApi', () => {
    it('should get collections successfully', async () => {
      const mockResponse = [{ collection_name: 'test', version: '1.0.0' }]
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await collectionsApi.getCollections()

      expect(result).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledWith('/api/collections/', expect.any(Object))
    })

    it('should get collection successfully', async () => {
      const mockResponse = { collection_name: 'test', version: '1.0.0' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await collectionsApi.getCollection('test')

      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith('/api/collections/test/', expect.any(Object))
    })

    it('should process collection successfully', async () => {
      const mockResponse = [{ status: 'success' }]
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await collectionsApi.processCollection('test')

      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith('/api/collections/test/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })

    it('should process all collections successfully', async () => {
      const mockResponse = [{ status: 'success' }]
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await collectionsApi.processAllCollections()

      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith('/api/collections/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })
  })

  describe('renderApi', () => {
    it('should render JSON schema successfully', async () => {
      const mockResponse = { type: 'object' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await renderApi.renderJsonSchema('test')

      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith('/api/render/json_schema/test/', expect.any(Object))
    })

    it('should render BSON schema successfully', async () => {
      const mockResponse = { bsonType: 'object' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await renderApi.renderBsonSchema('test')

      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith('/api/render/bson_schema/test/', expect.any(Object))
    })

    it('should render OpenAPI successfully', async () => {
      const mockResponse = { openapi: '3.0.0' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await renderApi.renderOpenApi('test')

      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith('/api/render/openapi/test/', expect.any(Object))
    })
  })

  describe('configApi', () => {
    it('should get config successfully', async () => {
      const mockResponse = { version: '1.0.0' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await configApi.getConfig()

      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith('/api/config/', expect.any(Object))
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

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockValidationErrors,
        })

        try {
          await collectionsApi.getCollections()
          expect.fail('Should have thrown validation error')
        } catch (error: any) {
          expect(error.message).toBe('Validation errors occurred')
          expect(error.validationErrors).toEqual(mockValidationErrors)
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

        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: async () => mockValidationErrors,
        })

        try {
          await collectionsApi.getCollections()
          expect.fail('Should have thrown validation error')
        } catch (error: any) {
          expect(error.message).toBe('Validation errors occurred')
          expect(error.validationErrors).toEqual(mockValidationErrors)
          expect(error.status).toBe(500)
        }
      })

      it('should throw regular API error when response is not ok and not validation errors', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          json: async () => ({ message: 'Not found' }),
        })

        try {
          await collectionsApi.getCollections()
          expect.fail('Should have thrown API error')
        } catch (error: any) {
          expect(error.message).toBe('API Error: Not Found')
          expect(error.status).toBe(404)
          expect(error.validationErrors).toBeUndefined()
        }
      })
    })
  })
}) 