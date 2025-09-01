import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiService } from '@/utils/api'

export function useNewVersion() {
  const router = useRouter()
  const creating = ref(false)
  const error = ref<string | null>(null)

  /**
   * Creates a new version of an enumerator file
   * This is the unified logic used by:
   * 1. Enumerators list page "New" button
   * 2. Enumerator detail page "Add Version" button  
   * 3. Unlock dialog "Create New Version" button
   * 
   * ALWAYS follows this pattern:
   * 1. Find the newest version
   * 2. Lock that version
   * 3. Copy that to a new document
   * 4. Unlock the new document
   * 5. +1 the version number
   * 
   * @returns Promise<string> - The new file name created
   */
  const createNewEnumeratorVersion = async (): Promise<string> => {
    creating.value = true
    error.value = null

    try {
      // Get the list of existing enumerator files
      const existingFiles = await apiService.getEnumerators()
      
      // Find the highest version number and the newest file
      let maxVersion = 0
      let newestFile: { file_name: string; _locked?: boolean } | null = null
      
      existingFiles.forEach((file: { file_name: string; _locked?: boolean }) => {
        const match = file.file_name.match(/enumerations\.(\d+)\.yaml/)
        if (match) {
          const version = parseInt(match[1], 10)
          if (version > maxVersion) {
            maxVersion = version
            newestFile = file
          }
        }
      })
      
      // Get the data from the newest version
      let newestEnumeratorData = null
      if (newestFile) {
        newestEnumeratorData = await apiService.getEnumerator(newestFile.file_name)
      }
      
      // Lock the newest version if it exists and is not already locked
      if (newestFile && !newestFile._locked) {
        const lockData = {
          ...newestEnumeratorData,
          _locked: true
        }
        await apiService.saveEnumerator(newestFile.file_name, lockData)
      }
      
      // Create new version number
      const newVersion = maxVersion + 1
      const newFileName = `enumerations.${newVersion}.yaml`
      
      // Create the new enumerator data (unlocked)
      const newEnumeratorData = {
        ...newestEnumeratorData,
        file_name: newFileName,
        version: newVersion,
        _locked: false // New version starts unlocked
      }
      
      // Save the new version
      await apiService.saveEnumerator(newFileName, newEnumeratorData)
      
      return newFileName
    } catch (err: any) {
      error.value = err.message || 'Failed to create new version'
      console.error('Failed to create new enumerator version:', err)
      throw err
    } finally {
      creating.value = false
    }
  }

  /**
   * Creates a new version and navigates to it
   */
  const createNewVersionAndNavigate = async () => {
    try {
      const newFileName = await createNewEnumeratorVersion()
      // Use window.location.href for reliable navigation (like the original implementation)
      window.location.href = `/enumerators/${newFileName}`
    } catch (err) {
      // Error is already set in createNewEnumeratorVersion
      console.error('Failed to create and navigate to new version:', err)
    }
  }

  return {
    creating,
    error,
    createNewEnumeratorVersion,
    createNewVersionAndNavigate
  }
}