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
        <v-btn @click="loadDictionary" class="mt-2">Retry</v-btn>
      </v-alert>
    </div>

    <!-- Dictionary detail -->
    <div v-else-if="dictionary">
      <!-- Header -->
      <div class="d-flex justify-space-between align-center mb-6">
        <div>
          <h1 class="text-h4">{{ dictionary.description }}</h1>
          <p class="text-body-2 text-medium-emphasis">{{ dictionary.file_name }}</p>
        </div>
        <div class="d-flex align-center">
          <v-chip
            v-if="dictionary._locked"
            color="warning"
            class="mr-2"
          >
            Locked
          </v-chip>
          <v-btn
            color="primary"
            @click="saveDictionary"
            :loading="saving"
            :disabled="dictionary._locked"
          >
            <v-icon start>mdi-content-save</v-icon>
            Save
          </v-btn>
        </div>
      </div>

      <!-- Dictionary settings -->
      <v-card class="mb-6">
        <v-card-title>Dictionary Settings</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="dictionary.description"
                label="Description"
                :disabled="dictionary._locked"
                @update:model-value="autoSave"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="dictionary.type"
                label="Type"
                :items="['object', 'array']"
                :disabled="dictionary._locked"
                @update:model-value="autoSave"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-switch
                v-model="dictionary.additionalProperties"
                label="Additional Properties"
                :disabled="dictionary._locked"
                @update:model-value="autoSave"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-switch
                v-model="dictionary.required"
                label="Required"
                :disabled="dictionary._locked"
                @update:model-value="autoSave"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Properties -->
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Properties</span>
          <v-btn
            color="primary"
            variant="outlined"
            @click="addProperty"
            :disabled="dictionary._locked"
          >
            <v-icon start>mdi-plus</v-icon>
            Add Property
          </v-btn>
        </v-card-title>
        <v-card-text>
          <div v-if="Object.keys(dictionary.properties).length === 0" class="text-center pa-8">
            <v-icon size="64" color="grey">mdi-file-document-outline</v-icon>
            <h3 class="text-h6 mt-4">No Properties</h3>
            <p class="text-body-2 text-medium-emphasis">Add properties to define the dictionary structure.</p>
          </div>
          
          <div v-else>
            <v-expansion-panels>
              <v-expansion-panel
                v-for="(property, propertyName) in dictionary.properties"
                :key="propertyName"
              >
                <v-expansion-panel-title>
                  <div class="d-flex justify-space-between align-center w-100">
                    <span>{{ propertyName }}</span>
                    <div class="d-flex align-center">
                      <v-chip
                        v-if="property.required"
                        color="primary"
                        size="small"
                        class="mr-2"
                      >
                        Required
                      </v-chip>
                      <v-btn
                        icon
                        size="small"
                        variant="text"
                        color="error"
                        @click.stop="deleteProperty(propertyName)"
                        :disabled="dictionary._locked"
                      >
                        <v-icon size="18">mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </div>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="property.description"
                        label="Description"
                        :disabled="dictionary._locked"
                        @update:model-value="autoSave"
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-select
                        v-model="property.type"
                        label="Type"
                        :items="propertyTypes"
                        :disabled="dictionary._locked"
                        @update:model-value="autoSave"
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-switch
                        v-model="property.required"
                        label="Required"
                        :disabled="dictionary._locked"
                        @update:model-value="autoSave"
                      />
                    </v-col>
                    <v-col cols="12" md="6" v-if="property.type === 'enum'">
                      <v-text-field
                        v-model="property.enums"
                        label="Enum Reference"
                        :disabled="dictionary._locked"
                        @update:model-value="autoSave"
                      />
                    </v-col>
                    <v-col cols="12" md="6" v-if="property.type === 'ref'">
                      <v-text-field
                        v-model="property.ref"
                        label="Reference"
                        :disabled="dictionary._locked"
                        @update:model-value="autoSave"
                      />
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

interface DictionaryProperty {
  description: string
  type: string
  required: boolean
  enums?: string
  ref?: string
}

interface Dictionary {
  description: string
  file_name: string
  type: string
  additionalProperties: boolean
  required: boolean
  properties: Record<string, DictionaryProperty>
  _locked: boolean
}

const route = useRoute()
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const dictionary = ref<Dictionary | null>(null)

const propertyTypes = [
  'string',
  'number',
  'boolean',
  'object',
  'array',
  'identity',
  'word',
  'sentence',
  'email',
  'url',
  'ip_address',
  'us_phone',
  'date_time',
  'markdown',
  'enum',
  'ref'
]

// Load dictionary data
const loadDictionary = async () => {
  loading.value = true
  error.value = null
  
  try {
    const fileName = route.params.fileName as string
    const data = await apiService.getDictionary(fileName)
    dictionary.value = data
  } catch (err: any) {
    error.value = err.message || 'Failed to load dictionary'
    console.error('Failed to load dictionary:', err)
  } finally {
    loading.value = false
  }
}

// Auto-save functionality
const autoSave = async () => {
  if (!dictionary.value || dictionary.value._locked) return
  
  saving.value = true
  try {
    await apiService.saveDictionary(dictionary.value.file_name, dictionary.value)
  } catch (err: any) {
    error.value = err.message || 'Failed to save dictionary'
    console.error('Failed to save dictionary:', err)
  } finally {
    saving.value = false
  }
}

// Manual save
const saveDictionary = async () => {
  if (!dictionary.value) return
  
  saving.value = true
  try {
    await apiService.saveDictionary(dictionary.value.file_name, dictionary.value)
    // Could add success notification here
  } catch (err: any) {
    error.value = err.message || 'Failed to save dictionary'
    console.error('Failed to save dictionary:', err)
  } finally {
    saving.value = false
  }
}

// Add new property
const addProperty = () => {
  if (!dictionary.value || dictionary.value._locked) return
  
  const propertyName = `new_property_${Object.keys(dictionary.value.properties).length + 1}`
  dictionary.value.properties[propertyName] = {
    description: '',
    type: 'string',
    required: false
  }
  
  autoSave()
}

// Delete property
const deleteProperty = (propertyName: string) => {
  if (!dictionary.value || dictionary.value._locked) return
  
  delete dictionary.value.properties[propertyName]
  autoSave()
}

// Load dictionary on mount
onMounted(() => {
  loadDictionary()
})
</script> 