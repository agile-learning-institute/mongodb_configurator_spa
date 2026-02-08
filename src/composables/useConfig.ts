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

// Shared state - all instances of useConfig will share the same config
const sharedConfig = ref<AppConfig | null>(null)
const sharedLoading = ref(false)
const sharedError = ref<string | null>(null)

export function useConfig() {
  const config = sharedConfig
  const loading = sharedLoading
  const error = sharedError

  // Computed properties for common config values
  const builtAt = computed(() => {
    if (!config.value) return null
    // Check BUILT_AT first (as specified by user), fall back to API_BUILT_AT for compatibility
    const builtAtItem = config.value.config_items.find(item => item.name === 'BUILT_AT') ||
                        config.value.config_items.find(item => item.name === 'API_BUILT_AT')
    return builtAtItem?.value?.trim() || null
  })

  const uiHeader = computed(() => {
    if (!config.value) return null
    const uiHeaderItem = config.value.config_items.find(item => item.name === 'UI_HEADER')
    return uiHeaderItem?.value?.trim() || null
  })

  const isLocal = computed(() => {
    // If config hasn't loaded yet, default to false (not local)
    if (builtAt.value === null || builtAt.value === undefined) return false
    // Trim and compare (case-sensitive as per API requirements)
    return builtAt.value.trim() === 'Local'
  })

  const isReadOnly = computed(() => {
    // If config hasn't loaded yet, default to read-only to be safe
    // This will be updated once config loads
    if (builtAt.value === null) return true
    return !isLocal.value
  })

  // Load configuration from API
  const loadConfig = async () => {
    loading.value = true
    error.value = null
    
    try {
      const data = await apiService.getConfig()
      config.value = data
      
      // Debug logging to help diagnose read-only mode issues
      const builtAtItem = data.config_items.find((item: ConfigItem) => item.name === 'BUILT_AT') ||
                         data.config_items.find((item: ConfigItem) => item.name === 'API_BUILT_AT')
      console.log('Config loaded - BUILT_AT value:', builtAtItem?.value, 'isLocal:', builtAtItem?.value?.trim() === 'Local')
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
    uiHeader,
    isLocal,
    isReadOnly,
    loadConfig,
    getConfigValue,
    getConfigSource,
  }
} 