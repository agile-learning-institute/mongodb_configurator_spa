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

  it('should fetch and sort collections successfully', async () => {
    const mockCollections = [
      { collection_name: 'zebra', configuration_file: 'zebra.yaml', latest_dictionary_file: 'zebra.1.0.0.yaml', latest_version: '1.0.0' },
      { collection_name: 'apple', configuration_file: 'apple.yaml', latest_dictionary_file: 'apple.1.0.0.yaml', latest_version: '1.0.0' },
      { collection_name: 'Banana', configuration_file: 'banana.yaml', latest_dictionary_file: 'banana.2.0.0.yaml', latest_version: '2.0.0' }
    ]

    mockGetCollections.mockResolvedValue(mockCollections)

    const { collections, loading, loadCollections } = useCollections()

    expect(loading.value).toBe(false)
    expect(collections.value).toEqual([])

    await loadCollections()

    expect(mockGetCollections).toHaveBeenCalledOnce()
    expect(loading.value).toBe(false)
    expect(collections.value.map(c => c.collection_name)).toEqual(['apple', 'Banana', 'zebra'])
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