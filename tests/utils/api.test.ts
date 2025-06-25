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
  })
}) 