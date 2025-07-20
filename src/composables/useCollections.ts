import { ref } from 'vue'
import { collectionsApi } from '@/utils/api'

// Singleton state
const collections = ref<any[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

export function useCollections() {
  const fetchCollections = async () => {
    loading.value = true
    error.value = null
    
    try {
      const data = await collectionsApi.getCollections()
      collections.value = data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch collections'
      collections.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    collections,
    loading,
    error,
    fetchCollections
  }
} 