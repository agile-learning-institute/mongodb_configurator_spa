import { ref, onMounted } from 'vue'
import { apiService } from '@/utils/api'

/**
 * Composable to get the latest enumerator file name for nav links.
 * Returns the file with the highest version number (e.g. enumerations.2.yaml > enumerations.0.yaml).
 * Falls back to enumerations.0.yaml when no enumerators exist.
 */
export function useLatestEnumerator() {
  const latestEnumeratorFile = ref<string>('enumerations.0.yaml')

  onMounted(async () => {
    try {
      const files = await apiService.getEnumerators()
      if (files.length > 0) {
        const latest = files.reduce((a: { file_name: string }, b: { file_name: string }) => {
          const aVer = parseInt(a.file_name.match(/enumerations\.(\d+)\.yaml/)?.[1] || '0')
          const bVer = parseInt(b.file_name.match(/enumerations\.(\d+)\.yaml/)?.[1] || '0')
          return bVer > aVer ? b : a
        })
        latestEnumeratorFile.value = latest.file_name
      }
    } catch {
      // Keep default
    }
  })

  return { latestEnumeratorFile }
}
