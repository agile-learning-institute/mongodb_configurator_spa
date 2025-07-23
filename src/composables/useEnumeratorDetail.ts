import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { apiService } from '@/utils/api'
import { useEvents } from '@/composables/useEvents'
import type { EnumeratorFile } from '@/types/types'

export function useEnumeratorDetail() {
  const route = useRoute()
  const { showEvent, showError } = useEvents()

  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)
  const enumerator = ref<EnumeratorFile | null>(null)

  const fileName = computed(() => route.params.fileName as string)
  const isLocked = computed(() => enumerator.value?._locked || false)

  // Load enumerator file
  const loadEnumerator = async () => {
    loading.value = true
    error.value = null
    try {
      const data = await apiService.getEnumerator(fileName.value)
      enumerator.value = data
    } catch (err: any) {
      if (err.type === 'API_ERROR' && err.data) {
        showEvent(err.data, 'Load Enumerator Error', 'Failed to load enumerator')
      } else {
        showError(err.message || 'Failed to load enumerator', 'Load Enumerator Error')
      }
      error.value = err.message || 'Failed to load enumerator'
    } finally {
      loading.value = false
    }
  }

  // Save enumerator file (auto-save)
  const saveEnumerator = async (updatedData?: EnumeratorFile) => {
    if (!enumerator.value) return
    saving.value = true
    error.value = null
    try {
      const dataToSave = updatedData || enumerator.value
      const saved = await apiService.saveEnumerator(fileName.value, dataToSave)
      enumerator.value = saved // Always update from canonical API response
    } catch (err: any) {
      if (err.type === 'API_ERROR' && err.data) {
        showEvent(err.data, 'Save Enumerator Error', 'Failed to save enumerator')
      } else {
        showError(err.message || 'Failed to save enumerator', 'Save Enumerator Error')
      }
      error.value = err.message || 'Failed to save enumerator'
    } finally {
      saving.value = false
    }
  }

  // Delete enumerator file
  const deleteEnumerator = async () => {
    if (!enumerator.value) return
    try {
      await apiService.deleteEnumerator(fileName.value)
    } catch (err: any) {
      if (err.type === 'API_ERROR' && err.data) {
        showEvent(err.data, 'Delete Enumerator Error', 'Failed to delete enumerator')
      } else {
        showError(err.message || 'Failed to delete enumerator', 'Delete Enumerator Error')
      }
      error.value = err.message || 'Failed to delete enumerator'
    }
  }

  onMounted(() => {
    loadEnumerator()
  })

  return {
    loading,
    saving,
    error,
    enumerator,
    fileName,
    isLocked,
    loadEnumerator,
    saveEnumerator,
    deleteEnumerator,
  }
} 