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
        <v-btn @click="loadMigration" class="mt-2">Retry</v-btn>
      </v-alert>
    </div>

    <!-- Migration detail -->
    <div v-else-if="migration">
      <!-- Header -->
      <div class="d-flex justify-space-between align-center mb-6">
        <div>
          <h1 class="text-h4">{{ fileName }}</h1>
          <p class="text-body-2 text-medium-emphasis">Migration Document</p>
        </div>
        <div class="d-flex align-center">
          <v-chip
            v-if="locked"
            color="warning"
            class="mr-2"
          >
            Locked
          </v-chip>
          <v-btn
            color="primary"
            @click="saveMigration"
            :loading="saving"
            :disabled="locked"
          >
            <v-icon start>mdi-content-save</v-icon>
            Save
          </v-btn>
        </div>
      </div>

      <!-- JSON Editor -->
      <v-card>
        <v-card-title>JSON Editor</v-card-title>
        <v-card-text>
          <v-textarea
            v-model="jsonString"
            label="JSON Data"
            rows="20"
            auto-grow
            :disabled="locked"
            @update:model-value="validateJson"
            :error="!!jsonError"
            :error-messages="jsonError || undefined"
            placeholder='[
  {
    "$addFields": {
      "full_name": {
        "$concat": [
          "$first_name",
          " ",
          "$last_name"
        ]
      }
    }
  },
  {
    "$unset": [
      "first_name",
      "last_name"
    ]
  }
]'
          />
        </v-card-text>
      </v-card>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { apiService } from '@/utils/api'

const route = useRoute()
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const migration = ref<any[] | null>(null)
const jsonString = ref('')
const jsonError = ref<string | null>(null)
const locked = ref(false)

const fileName = computed(() => route.params.fileName as string)

// Load migration
const loadMigration = async () => {
  loading.value = true
  error.value = null
  
  try {
    const data = await apiService.getMigration(fileName.value)
    migration.value = data
    jsonString.value = JSON.stringify(data, null, 2)
  } catch (err: any) {
    error.value = err.message || 'Failed to load migration'
    console.error('Failed to load migration:', err)
  } finally {
    loading.value = false
  }
}

// Validate JSON
const validateJson = () => {
  try {
    JSON.parse(jsonString.value)
    jsonError.value = null
  } catch (err: any) {
    jsonError.value = 'Invalid JSON format'
  }
}

// Save migration
const saveMigration = async () => {
  if (jsonError.value) return
  
  saving.value = true
  try {
    const parsedData = JSON.parse(jsonString.value)
    await apiService.saveMigration(fileName.value, parsedData)
    migration.value = parsedData
    // Could add success notification here
  } catch (err: any) {
    error.value = err.message || 'Failed to save migration'
    console.error('Failed to save migration:', err)
  } finally {
    saving.value = false
  }
}

// Load migration on mount
onMounted(() => {
  loadMigration()
})
</script> 