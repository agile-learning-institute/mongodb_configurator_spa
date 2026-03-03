import { useCollections } from '../../src/composables/useCollections'
import { apiService } from '../../src/utils/api'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the API
const mockGetCollections = vi.fn()
vi.mock('../../src/utils/api', () => ({
  apiService: {
    getCollections: () => mockGetCollections()
  },
  API_ENDPOINTS: {},
  collectionsApi: { getCollections: () => mockGetCollections() },
  apiClient: {},
  configApi: {},
  renderApi: {}
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
      { collection_name: 'test1', configuration_file: 'test1.yaml', latest_dictionary_file: 'test1.1.0.0.yaml', latest_version: '1.0.0' },
      { collection_name: 'test2', configuration_file: 'test2.yaml', latest_dictionary_file: 'test2.2.0.0.yaml', latest_version: '2.0.0' }
    ]

    mockGetCollections.mockResolvedValue(mockCollections)

    const { collections, loading, loadCollections } = useCollections()

    expect(loading.value).toBe(false)
    expect(collections.value).toEqual([])

    await loadCollections()

    expect(mockGetCollections).toHaveBeenCalledOnce()
    expect(loading.value).toBe(false)
    expect(collections.value).toEqual(mockCollections)
  })

  it('should handle API errors', async () => {
    mockGetCollections.mockRejectedValue(new Error('API Error'))

    const { collections, loading, error, loadCollections } = useCollections()

    expect(loading.value).toBe(false)
    expect(collections.value).toEqual([])

    await loadCollections()

    expect(mockGetCollections).toHaveBeenCalledOnce()
    expect(loading.value).toBe(false)
    expect(collections.value).toEqual([])
    expect(error.value).toBe('API Error')
  })
}) 