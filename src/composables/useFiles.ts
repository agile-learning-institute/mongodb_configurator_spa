import { ref, computed } from 'vue'
import { apiService } from '@/utils/api'

export interface FileInfo {
  name: string
  created_at: string
  updated_at: string
  size: number
  _locked?: boolean
}

export interface FileList {
  files: FileInfo[]
}

export function useFiles(fileType: 'configurations' | 'dictionaries' | 'types' | 'enumerators' | 'test_data' | 'migrations') {
  const files = ref<FileInfo[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Load files based on type
  const loadFiles = async () => {
    loading.value = true
    error.value = null
    
    try {
      let data
      switch (fileType) {
        case 'configurations':
          data = await apiService.getConfigurations()
          break
        case 'dictionaries':
          data = await apiService.getDictionaries()
          break
        case 'types':
          data = await apiService.getTypes()
          break
        case 'enumerators':
          data = await apiService.getEnumerators()
          break
        case 'test_data':
          data = await apiService.getTestData()
          break
        case 'migrations':
          data = await apiService.getMigrations()
          break
        default:
          throw new Error(`Unknown file type: ${fileType}`)
      }
      
      // API returns array directly, not wrapped in files property
      // Also need to map file_name to name
      files.value = (data || []).map((file: any) => ({
        name: file.file_name,
        created_at: file.created_at,
        updated_at: file.updated_at,
        size: file.size,
        _locked: file._locked || false
      }))
    } catch (err: any) {
      error.value = err.message || `Failed to load ${fileType}`
      console.error(`Failed to load ${fileType}:`, err)
    } finally {
      loading.value = false
    }
  }

  // Delete a file
  const deleteFile = async (fileName: string) => {
    try {
      switch (fileType) {
        case 'configurations':
          await apiService.deleteConfiguration(fileName)
          break
        case 'dictionaries':
          await apiService.deleteDictionary(fileName)
          break
        case 'types':
          await apiService.deleteType(fileName)
          break
        case 'enumerators':
          await apiService.deleteEnumerator(fileName)
          break
        case 'test_data':
          await apiService.deleteTestDataFile(fileName)
          break
        case 'migrations':
          await apiService.deleteMigration(fileName)
          break
      }
      
      // Reload files after deletion
      await loadFiles()
    } catch (err: any) {
      error.value = err.message || `Failed to delete ${fileName}`
      console.error(`Failed to delete ${fileName}:`, err)
    }
  }

  // Process a file (for configurations)
  const processFile = async (fileName: string) => {
    if (fileType !== 'configurations') {
      throw new Error('Processing is only available for configurations')
    }
    
    try {
      await apiService.processConfiguration(fileName)
    } catch (err: any) {
      error.value = err.message || `Failed to process ${fileName}`
      console.error(`Failed to process ${fileName}:`, err)
    }
  }

  // Lock/unlock a file
  const toggleFileLock = async (fileName: string) => {
    // This would be implemented based on the API
    // For now, just update the local state
    const file = files.value.find(f => f.name === fileName)
    if (file) {
      file._locked = !file._locked
    }
  }

  // Get file by name
  const getFile = (fileName: string) => {
    return files.value.find(f => f.name === fileName)
  }

  // Computed properties
  const lockedFiles = computed(() => files.value.filter(f => f._locked))
  const unlockedFiles = computed(() => files.value.filter(f => !f._locked))
  const totalFiles = computed(() => files.value.length)

  return {
    files,
    loading,
    error,
    loadFiles,
    deleteFile,
    processFile,
    toggleFileLock,
    getFile,
    lockedFiles,
    unlockedFiles,
    totalFiles,
  }
} 