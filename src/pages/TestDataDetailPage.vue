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
            v-if="locked"
            color="white"
            variant="text"
            @click="showUnlockDialog = true"
          >
            <v-icon start>mdi-lock</v-icon>
            Locked
          </v-btn>
          <v-btn
            v-else
            color="white"
            variant="text"
            @click="lockTestData"
          >
            <v-icon start>mdi-lock</v-icon>
            Lock
          </v-btn>
        </template>

        <JsonArrayEditor
          v-model="testData"
          title="Test Data"
          item-label="Document"
          :disabled="locked"
          :auto-save="autoSave"
          :allow-multiple="false"
          size-mode="percentage"
          :percentage="70"
        />
      </BaseCard>
    </div>
    
    <!-- Unlock Dialog -->
    <v-dialog v-model="showUnlockDialog" max-width="400">
      <v-card>
        <v-card-title>Unlock Test Data?</v-card-title>
        <v-card-text>
          Unlocking allows editing this test data. Are you sure?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showUnlockDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="unlockTestData">Unlock</v-btn>
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
const locked = ref(false)
const showUnlockDialog = ref(false)

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
  if (!testData.value || locked.value) return
  
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

// Lock/unlock functionality
const lockTestData = () => {
  if (!testData.value) return
  locked.value = true
  autoSave()
}

const unlockTestData = () => {
  if (!testData.value) return
  locked.value = false
  showUnlockDialog.value = false
  autoSave()
}

// Load test data on mount
onMounted(() => {
  loadTestData()
})
</script> 