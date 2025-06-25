import { useCollections } from '../../src/composables/useCollections'
import { collectionsApi } from '../../src/utils/api'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the API
vi.mock('../../src/utils/api', () => ({
  collectionsApi: {
    getCollections: vi.fn()
  }
}))

describe('useCollections', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset the singleton state
    const { collections, loading, error } = useCollections()
    collections.value = []
    loading.value = false
    error.value = null
  })

  it('should fetch collections successfully', async () => {
    const mockCollections = [
      { collection_name: 'test1', version: '1.0.0' },
      { collection_name: 'test2', version: '2.0.0' }
    ]

    vi.mocked(collectionsApi.getCollections).mockResolvedValue(mockCollections)

    const { collections, loading, fetchCollections } = useCollections()

    expect(loading.value).toBe(false)
    expect(collections.value).toEqual([])

    await fetchCollections()

    expect(collectionsApi.getCollections).toHaveBeenCalledOnce()
    expect(loading.value).toBe(false)
    expect(collections.value).toEqual(mockCollections)
  })

  it('should handle API errors', async () => {
    vi.mocked(collectionsApi.getCollections).mockRejectedValue(new Error('API Error'))

    const { collections, loading, error, fetchCollections } = useCollections()

    expect(loading.value).toBe(false)
    expect(collections.value).toEqual([])

    await fetchCollections()

    expect(collectionsApi.getCollections).toHaveBeenCalledOnce()
    expect(loading.value).toBe(false)
    expect(collections.value).toEqual([])
    expect(error.value).toBe('API Error')
  })
}) 