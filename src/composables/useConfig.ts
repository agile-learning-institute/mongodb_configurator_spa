import { ref, computed } from 'vue'
import { apiService } from '@/utils/api'

export interface ConfigItem {
  name: string
  value: string
  from: 'default' | 'file' | 'environment'
}

export interface AppConfig {
  config_items: ConfigItem[]
}

export function useConfig() {
  const config = ref<AppConfig | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties for common config values
  const builtAt = computed(() => {
    if (!config.value) return null
    const builtAtItem = config.value.config_items.find(item => item.name === 'BUILT_AT')
    return builtAtItem?.value || null
  })

  const isLocal = computed(() => {
    return builtAt.value === 'Local'
  })

  const isReadOnly = computed(() => {
    return !isLocal.value
  })

  // Load configuration from API
  const loadConfig = async () => {
    loading.value = true
    error.value = null
    
    try {
      const data = await apiService.getConfig()
      config.value = data
    } catch (err: any) {
      error.value = err.message || 'Failed to load configuration'
      console.error('Failed to load configuration:', err)
    } finally {
      loading.value = false
    }
  }

  // Get a specific config value
  const getConfigValue = (name: string): string | null => {
    if (!config.value) return null
    const item = config.value.config_items.find(item => item.name === name)
    return item?.value || null
  }

  // Get config value source
  const getConfigSource = (name: string): 'default' | 'file' | 'environment' | null => {
    if (!config.value) return null
    const item = config.value.config_items.find(item => item.name === name)
    return item?.from || null
  }

  return {
    config,
    loading,
    error,
    builtAt,
    isLocal,
    isReadOnly,
    loadConfig,
    getConfigValue,
    getConfigSource,
  }
} 