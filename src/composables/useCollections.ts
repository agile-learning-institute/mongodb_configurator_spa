import { ref } from 'vue'
import { collectionsApi } from '../utils/api'
import type { Collection } from '../types'

// Singleton state
const collections = ref<Collection[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const fetchCollections = async () => {
  loading.value = true
  error.value = null
  
  try {
    const data = await collectionsApi.getCollections()
    collections.value = data
  } catch (err) {
    console.error('Error fetching collections:', err)
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

export function useCollections() {
  return {
    collections,
    loading,
    error,
    fetchCollections
  }
} 