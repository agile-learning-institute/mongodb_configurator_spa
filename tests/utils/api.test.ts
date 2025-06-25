import { describe, it, expect, vi, beforeEach } from 'vitest'
import { collectionsApi, renderApi, configApi } from '../../src/utils/api'

// Mock fetch globally
global.fetch = vi.fn()

describe('API Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('collectionsApi', () => {
    it('should transform collections response correctly', async () => {
      const mockResponse = [
        { collection_name: 'test1', version: '1.0.0' },
        { collection_name: 'test2', version: '2.0.0' }
      ]

      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await collectionsApi.getCollections()

      expect(mockFetch).toHaveBeenCalledWith('/api/collections', expect.any(Object))
      expect(result).toEqual(mockResponse)
    })

    it('should get collection config', async () => {
      const mockResponse = {
        name: 'test',
        versions: [{ version: '1.0.0' }]
      }

      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await collectionsApi.getCollection('test')

      expect(fetch).toHaveBeenCalledWith('/api/collections/test', expect.any(Object))
      expect(result).toEqual(mockResponse)
    })

    it('should process collection', async () => {
      const mockResponse = [{ status: 'success' }]

      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await collectionsApi.processCollection('test')

      expect(fetch).toHaveBeenCalledWith('/api/collections/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      expect(result).toEqual(mockResponse)
    })

    it('should process all collections', async () => {
      const mockResponse = [{ status: 'success' }]

      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await collectionsApi.processAllCollections()

      expect(fetch).toHaveBeenCalledWith('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('renderApi', () => {
    it('should render JSON schema', async () => {
      const mockResponse = { type: 'object' }

      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await renderApi.renderJsonSchema('test.1.0.0')

      expect(fetch).toHaveBeenCalledWith('/api/render/json_schema/test.1.0.0', expect.any(Object))
      expect(result).toEqual(mockResponse)
    })
  })

  describe('configApi', () => {
    it('should get config', async () => {
      const mockResponse = { config_items: [] }

      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await configApi.getConfig()

      expect(fetch).toHaveBeenCalledWith('/api/config', expect.any(Object))
      expect(result).toEqual(mockResponse)
    })
  })
}) 