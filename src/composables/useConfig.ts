import { ref, computed } from 'vue'
import { configApi } from '@/utils/api'
import type { Config } from '@/types'

const config = ref<Config | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const isAdmin = computed(() => {
  return config.value?.token?.roles?.includes('admin') || false
})

export function useConfig() {
  const fetchConfig = async () => {
    loading.value = true
    error.value = null
    try {
      config.value = await configApi.getConfig()
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch configuration'
      console.error('Error fetching configuration:', err)
    } finally {
      loading.value = false
    }
  }
  return {
    config,
    loading,
    error,
    isAdmin,
    fetchConfig
  }
} 