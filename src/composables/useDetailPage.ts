import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiService } from '@/utils/api'

export interface DetailPageOptions {
  fileType: 'configurations' | 'dictionaries' | 'types' | 'enumerators' | 'test_data' | 'migrations'
  onLoad?: (data: any) => void
  onSave?: (data: any) => Promise<void>
  onDelete?: (fileName: string) => Promise<void>
  onLock?: (fileName: string) => Promise<void>
  onUnlock?: (fileName: string) => Promise<void>
}

export function useDetailPage(options: DetailPageOptions) {
  const route = useRoute()
  const router = useRouter()
  
  const {
    fileType,
    onLoad,
    onSave,
    onDelete,
    onLock,
    onUnlock
  } = options

  // Reactive state
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)
  const data = ref<any>(null)
  const showDeleteDialog = ref(false)
  const showUnlockDialog = ref(false)

  // Computed properties
  const fileName = computed(() => route.params.fileName as string)
  const isLocked = computed(() => data.value?._locked || false)

  // Methods
  const loadData = async () => {
    loading.value = true
    error.value = null
    
    try {
      let result
      switch (fileType) {
        case 'configurations':
          result = await apiService.getConfiguration(fileName.value)
          break
        case 'dictionaries':
          result = await apiService.getDictionary(fileName.value)
          break
        case 'types':
          result = await apiService.getType(fileName.value)
          break
        case 'enumerators':
          result = await apiService.getEnumerator(fileName.value)
          break
        case 'test_data':
          result = await apiService.getTestDataFile(fileName.value)
          break
        case 'migrations':
          result = await apiService.getMigration(fileName.value)
          break
        default:
          throw new Error(`Unknown file type: ${fileType}`)
      }
      
      data.value = result
      if (onLoad) {
        onLoad(result)
      }
    } catch (err: any) {
      error.value = err.message || `Failed to load ${fileType}`
      console.error(`Failed to load ${fileType}:`, err)
    } finally {
      loading.value = false
    }
  }

  const saveData = async (updatedData?: any) => {
    if (!data.value) return
    
    saving.value = true
    error.value = null
    
    try {
      const dataToSave = updatedData || data.value
      
      if (onSave) {
        await onSave(dataToSave)
      } else {
        switch (fileType) {
          case 'configurations':
            await apiService.saveConfiguration(fileName.value, dataToSave)
            break
          case 'dictionaries':
            await apiService.saveDictionary(fileName.value, dataToSave)
            break
          case 'types':
            await apiService.saveType(fileName.value, dataToSave)
            break
          case 'enumerators':
            await apiService.saveEnumerator(fileName.value, dataToSave)
            break
          case 'test_data':
            await apiService.saveTestDataFile(fileName.value, dataToSave)
            break
          case 'migrations':
            await apiService.saveMigration(fileName.value, dataToSave)
            break
        }
      }
      
      // Update local data
      data.value = { ...dataToSave }
    } catch (err: any) {
      error.value = err.message || `Failed to save ${fileType}`
      console.error(`Failed to save ${fileType}:`, err)
    } finally {
      saving.value = false
    }
  }

  const deleteData = async () => {
    if (!data.value) return
    
    try {
      if (onDelete) {
        await onDelete(fileName.value)
      } else {
        switch (fileType) {
          case 'configurations':
            await apiService.deleteConfiguration(fileName.value)
            break
          case 'dictionaries':
            await apiService.deleteDictionary(fileName.value)
            break
          case 'types':
            await apiService.deleteType(fileName.value)
            break
          case 'enumerators':
            await apiService.deleteEnumerator(fileName.value)
            break
          case 'test_data':
            await apiService.deleteTestDataFile(fileName.value)
            break
          case 'migrations':
            await apiService.deleteMigration(fileName.value)
            break
        }
      }
      
      // Navigate back to list
      router.push(`/${fileType}`)
    } catch (err: any) {
      error.value = err.message || `Failed to delete ${fileType}`
      console.error(`Failed to delete ${fileType}:`, err)
    }
  }

  const lockData = async () => {
    if (!data.value) return
    
    try {
      if (onLock) {
        await onLock(fileName.value)
      }
      // Note: Lock/unlock API endpoints may not be implemented yet
      // This is a placeholder for future implementation
      
      data.value._locked = true
    } catch (err: any) {
      error.value = err.message || `Failed to lock ${fileType}`
      console.error(`Failed to lock ${fileType}:`, err)
    }
  }

  const unlockData = async () => {
    if (!data.value) return
    
    try {
      if (onUnlock) {
        await onUnlock(fileName.value)
      }
      // Note: Lock/unlock API endpoints may not be implemented yet
      // This is a placeholder for future implementation
      
      data.value._locked = false
      showUnlockDialog.value = false
    } catch (err: any) {
      error.value = err.message || `Failed to unlock ${fileType}`
      console.error(`Failed to unlock ${fileType}:`, err)
    }
  }

  const handleTitleChange = async (newTitle: string) => {
    if (data.value) {
      data.value.title = newTitle
      await saveData()
    }
  }

  const handleLock = () => {
    lockData()
  }

  const handleUnlock = () => {
    unlockData()
  }

  const handleDelete = () => {
    showDeleteDialog.value = true
  }

  const confirmDelete = () => {
    showDeleteDialog.value = false
    deleteData()
  }

  const cancelDelete = () => {
    showDeleteDialog.value = false
  }

  const confirmUnlock = () => {
    unlockData()
  }

  const cancelUnlock = () => {
    showUnlockDialog.value = false
  }

  // Load data on mount
  onMounted(() => {
    loadData()
  })

  return {
    // State
    loading,
    saving,
    error,
    data,
    showDeleteDialog,
    showUnlockDialog,
    
    // Computed
    fileName,
    isLocked,
    
    // Methods
    loadData,
    saveData,
    deleteData,
    lockData,
    unlockData,
    handleTitleChange,
    handleLock,
    handleUnlock,
    handleDelete,
    confirmDelete,
    cancelDelete,
    confirmUnlock,
    cancelUnlock
  }
} 