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
        <template #header-actions>
          <v-btn
            color="error"
            variant="elevated"
            @click="showDeleteDialog = true"
            class="font-weight-bold"
          >
            <v-icon start>mdi-delete</v-icon>
            Delete
          </v-btn>
        </template>

        <JsonArrayEditor
          v-model="testData"
          title="Test Data"
          item-label="Document"
          :auto-save="autoSave"
          :allow-multiple="true"
          size-mode="fit-content"
        />
      </BaseCard>
    </div>
    
    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5">
          Delete Test Data File?
        </v-card-title>
        <v-card-text>
          <p>Are you sure you want to delete "{{ fileName }}"?</p>
          <p class="text-caption text-medium-emphasis">
            This action cannot be undone.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="confirmDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
const showDeleteDialog = ref(false)

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

// Delete functionality
const confirmDelete = async () => {
  try {
    await apiService.deleteTestDataFile(fileName.value)
    // Navigate back to test data list
    window.location.href = '/test_data'
  } catch (err: any) {
    error.value = err.message || 'Failed to delete test data file'
    console.error('Failed to delete test data file:', err)
  } finally {
    showDeleteDialog.value = false
  }
}


// Load test data on mount
onMounted(() => {
  loadTestData()
})
</script> 