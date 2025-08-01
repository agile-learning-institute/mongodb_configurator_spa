<template>
  <v-container>
    <!-- Loading state -->
    <div v-if="loading" class="d-flex justify-center align-center pa-8">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="pa-4">
      <v-alert type="error">
        {{ error }}
        <v-btn @click="loadTestData" class="mt-2">Retry</v-btn>
      </v-alert>
    </div>

    <!-- Test data detail -->
    <div v-else-if="testData">
      <BaseCard 
        :title="fileName"
        icon="mdi-file-document"
      >


        <JsonArrayEditor
          v-model="testData"
          title="Test Data"
          item-label="Document"
          :auto-save="autoSave"
          :allow-multiple="false"
          size-mode="fit-content"
        />
      </BaseCard>
    </div>
    

  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { apiService } from '@/utils/api'
import JsonArrayEditor from '@/components/JsonArrayEditor.vue'
import BaseCard from '@/components/BaseCard.vue'

const route = useRoute()
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const testData = ref<any[] | null>(null)

const fileName = computed(() => route.params.fileName as string)

// Load test data
const loadTestData = async () => {
  loading.value = true
  error.value = null
  
  try {
    const data = await apiService.getTestDataFile(fileName.value)
    testData.value = data
  } catch (err: any) {
    error.value = err.message || 'Failed to load test data'
    console.error('Failed to load test data:', err)
  } finally {
    loading.value = false
  }
}

// Auto-save functionality
const autoSave = async () => {
  if (!testData.value) return
  
  saving.value = true
  try {
    await apiService.saveTestDataFile(fileName.value, testData.value)
  } catch (err: any) {
    error.value = err.message || 'Failed to save test data'
    console.error('Failed to save test data:', err)
    throw err
  } finally {
    saving.value = false
  }
}



// Load test data on mount
onMounted(() => {
  loadTestData()
})
</script> 