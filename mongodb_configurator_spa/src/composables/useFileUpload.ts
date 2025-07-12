import { ref } from 'vue'
import { apiService } from '@/utils/api'

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export function useFileUpload(fileType: 'configurations' | 'dictionaries' | 'types' | 'enumerators' | 'test_data' | 'migrations') {
  const uploading = ref(false)
  const downloading = ref(false)
  const uploadProgress = ref<UploadProgress | null>(null)
  const error = ref<string | null>(null)

  // Upload/save a file (PUT creates if doesn't exist)
  const uploadFile = async (fileName: string, content: any) => {
    uploading.value = true
    error.value = null
    uploadProgress.value = null
    
    try {
      switch (fileType) {
        case 'configurations':
          await apiService.saveConfiguration(fileName, content)
          break
        case 'dictionaries':
          await apiService.saveDictionary(fileName, content)
          break
        case 'types':
          await apiService.saveType(fileName, content)
          break
        case 'enumerators':
          await apiService.saveEnumerator(fileName, content)
          break
        case 'test_data':
          await apiService.saveTestDataFile(fileName, content)
          break
        case 'migrations':
          await apiService.saveMigration(fileName, content)
          break
        default:
          throw new Error(`Unknown file type: ${fileType}`)
      }
    } catch (err: any) {
      error.value = err.message || `Failed to upload ${fileName}`
      console.error(`Failed to upload ${fileName}:`, err)
      throw err
    } finally {
      uploading.value = false
      uploadProgress.value = null
    }
  }

  // Download a file
  const downloadFile = async (fileName: string) => {
    downloading.value = true
    error.value = null
    
    try {
      let data
      switch (fileType) {
        case 'configurations':
          data = await apiService.getConfiguration(fileName)
          break
        case 'dictionaries':
          data = await apiService.getDictionary(fileName)
          break
        case 'types':
          data = await apiService.getType(fileName)
          break
        case 'enumerators':
          data = await apiService.getEnumerator(fileName)
          break
        case 'test_data':
          data = await apiService.getTestDataFile(fileName)
          break
        case 'migrations':
          data = await apiService.getMigration(fileName)
          break
        default:
          throw new Error(`Unknown file type: ${fileType}`)
      }
      
      // Create and download file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${fileName}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      return data
    } catch (err: any) {
      error.value = err.message || `Failed to download ${fileName}`
      console.error(`Failed to download ${fileName}:`, err)
      throw err
    } finally {
      downloading.value = false
    }
  }

  // Download schema files (for configurations)
  const downloadSchema = async (fileName: string, version: string, type: 'json' | 'bson') => {
    downloading.value = true
    error.value = null
    
    try {
      let data
      if (type === 'json') {
        data = await apiService.downloadJsonSchema(fileName, version)
      } else {
        data = await apiService.downloadBsonSchema(fileName, version)
      }
      
      // Create and download file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${fileName}_${version}_${type}_schema.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      return data
    } catch (err: any) {
      error.value = err.message || `Failed to download ${type} schema for ${fileName}`
      console.error(`Failed to download ${type} schema for ${fileName}:`, err)
      throw err
    } finally {
      downloading.value = false
    }
  }

  return {
    uploading,
    downloading,
    uploadProgress,
    error,
    uploadFile,
    downloadFile,
    downloadSchema,
  }
} 