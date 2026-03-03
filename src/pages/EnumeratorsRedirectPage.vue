<template>
  <div class="d-flex justify-center align-center pa-8">
    <v-progress-circular indeterminate size="64"></v-progress-circular>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiService } from '@/utils/api'

const router = useRouter()

onMounted(async () => {
  try {
    const files = await apiService.getEnumerators()
    const fileName = files.length > 0
      ? files.reduce((a: { file_name: string }, b: { file_name: string }) => {
          const aVer = parseInt(a.file_name.match(/enumerations\.(\d+)\.yaml/)?.[1] || '0')
          const bVer = parseInt(b.file_name.match(/enumerations\.(\d+)\.yaml/)?.[1] || '0')
          return bVer > aVer ? b : a
        }).file_name
      : 'enumerations.0.yaml'
    router.replace(`/enumerators/${fileName}`)
  } catch {
    router.replace('/enumerators/enumerations.0.yaml')
  }
})
</script>
