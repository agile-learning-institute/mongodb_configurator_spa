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
        <v-btn @click="loadEnumerator" class="mt-2">Retry</v-btn>
      </v-alert>
    </div>

    <!-- Enumerator detail -->
    <div v-else-if="enumerator">
      <!-- Header -->
      <div class="d-flex justify-space-between align-center mb-6">
        <div>
          <h1 class="text-h4">{{ enumerator.name }}</h1>
          <p class="text-body-2 text-medium-emphasis">Version {{ enumerator.version }}</p>
        </div>
        <div class="d-flex align-center">
          <v-chip
            v-if="enumerator._locked"
            color="warning"
            class="mr-2"
          >
            Locked
          </v-chip>
          <v-btn
            color="primary"
            @click="saveEnumerator"
            :loading="saving"
            :disabled="enumerator._locked"
          >
            <v-icon start>mdi-content-save</v-icon>
            Save
          </v-btn>
        </div>
      </div>

      <!-- Enumerator settings -->
      <v-card class="mb-6">
        <v-card-title>Enumerator Settings</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="enumerator.name"
                label="Name"
                :disabled="enumerator._locked"
                @update:model-value="autoSave"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="enumerator.status"
                label="Status"
                :disabled="enumerator._locked"
                @update:model-value="autoSave"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="enumerator.version"
                label="Version"
                type="number"
                :disabled="enumerator._locked"
                @update:model-value="autoSave"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Enumerations -->
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Enumerations</span>
          <v-btn
            color="primary"
            variant="outlined"
            @click="addEnumeration"
            :disabled="enumerator._locked"
          >
            <v-icon start>mdi-plus</v-icon>
            Add Enumeration
          </v-btn>
        </v-card-title>
        <v-card-text>
          <div v-if="!enumerator.enumerators || Object.keys(enumerator.enumerators).length === 0" class="text-center pa-8">
            <v-icon size="64" color="grey">mdi-format-list-bulleted</v-icon>
            <h3 class="text-h6 mt-4">No Enumerations</h3>
            <p class="text-body-2 text-medium-emphasis">Add enumerations to define key-value pairs.</p>
          </div>
          
          <div v-else>
            <v-expansion-panels>
              <v-expansion-panel
                v-for="(enumeration, enumName) in enumerator.enumerators"
                :key="enumName"
              >
                <v-expansion-panel-title>
                  <div class="d-flex justify-space-between align-center w-100">
                    <span>{{ enumName }}</span>
                    <v-btn
                      icon
                      size="small"
                      variant="text"
                      color="error"
                      @click.stop="deleteEnumeration(enumName)"
                      :disabled="enumerator._locked"
                    >
                      <v-icon size="18">mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <div class="mb-4">
                    <v-btn
                      color="primary"
                      variant="outlined"
                      size="small"
                      @click="addEnumValue(enumName)"
                      :disabled="enumerator._locked"
                    >
                      <v-icon start>mdi-plus</v-icon>
                      Add Value
                    </v-btn>
                  </div>
                  
                  <v-row>
                    <v-col
                                             v-for="(_, key) in enumeration"
                      :key="key"
                      cols="12"
                      md="6"
                    >
                      <v-card variant="outlined" class="pa-3">
                        <div class="d-flex justify-space-between align-center">
                          <div class="flex-grow-1 mr-3">
                            <v-text-field
                              v-model="enumeration[key]"
                              :label="`Value for '${key}'`"
                              density="compact"
                              :disabled="enumerator._locked"
                              @update:model-value="autoSave"
                            />
                          </div>
                          <v-btn
                            icon
                            size="small"
                            variant="text"
                            color="error"
                            @click="deleteEnumValue(enumName, key)"
                            :disabled="enumerator._locked"
                          >
                            <v-icon size="18">mdi-delete</v-icon>
                          </v-btn>
                        </div>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { apiService } from '@/utils/api'

interface Enumerator {
  name: string
  status: string
  version: number
  file_name: string
  enumerators: Record<string, Record<string, string>>
  _locked: boolean
}

const route = useRoute()
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const enumerator = ref<Enumerator | null>(null)

// Load enumerator data
const loadEnumerator = async () => {
  loading.value = true
  error.value = null
  
  try {
    const fileName = route.params.fileName as string
    const data = await apiService.getEnumerator(fileName)
    enumerator.value = data
  } catch (err: any) {
    error.value = err.message || 'Failed to load enumerator'
    console.error('Failed to load enumerator:', err)
  } finally {
    loading.value = false
  }
}

// Auto-save functionality
const autoSave = async () => {
  if (!enumerator.value || enumerator.value._locked) return
  
  saving.value = true
  try {
    await apiService.saveEnumerator(enumerator.value.file_name, enumerator.value)
  } catch (err: any) {
    error.value = err.message || 'Failed to save enumerator'
    console.error('Failed to save enumerator:', err)
  } finally {
    saving.value = false
  }
}

// Manual save
const saveEnumerator = async () => {
  if (!enumerator.value) return
  
  saving.value = true
  try {
    await apiService.saveEnumerator(enumerator.value.file_name, enumerator.value)
    // Could add success notification here
  } catch (err: any) {
    error.value = err.message || 'Failed to save enumerator'
    console.error('Failed to save enumerator:', err)
  } finally {
    saving.value = false
  }
}

// Add new enumeration
const addEnumeration = () => {
  if (!enumerator.value || enumerator.value._locked) return
  
  const enumName = `new_enum_${Object.keys(enumerator.value.enumerators).length + 1}`
  enumerator.value.enumerators[enumName] = {}
  
  autoSave()
}

// Delete enumeration
const deleteEnumeration = (enumName: string) => {
  if (!enumerator.value || enumerator.value._locked) return
  
  delete enumerator.value.enumerators[enumName]
  autoSave()
}

// Add enum value
const addEnumValue = (enumName: string) => {
  if (!enumerator.value || enumerator.value._locked) return
  
  const key = `new_key_${Object.keys(enumerator.value.enumerators[enumName]).length + 1}`
  enumerator.value.enumerators[enumName][key] = 'new_value'
  
  autoSave()
}

// Delete enum value
const deleteEnumValue = (enumName: string, key: string) => {
  if (!enumerator.value || enumerator.value._locked) return
  
  delete enumerator.value.enumerators[enumName][key]
  autoSave()
}

// Load enumerator on mount
onMounted(() => {
  loadEnumerator()
})
</script> 