import { ref, onMounted } from 'vue'
import { apiService } from '@/utils/api'

export interface CollectionSummary {
  collection_name: string
  configuration_file: string
  latest_dictionary_file: string
  latest_version: string
  _locked?: boolean
  description?: string
}

export function useCollections() {
  const collections = ref<CollectionSummary[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const loadCollections = async () => {
    loading.value = true
    error.value = null
    try {
      const data = await apiService.getCollections()
      collections.value = (data || []).sort((a: CollectionSummary, b: CollectionSummary) =>
        a.collection_name.localeCompare(b.collection_name, undefined, { sensitivity: 'base' })
      )
    } catch (err: any) {
      error.value = err.message || 'Failed to load collections'
      collections.value = []
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    loadCollections()
  })

  return {
    collections,
    loading,
    error,
    loadCollections,
  }
}
