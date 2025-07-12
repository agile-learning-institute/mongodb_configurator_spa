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
        <v-btn @click="loadType" class="mt-2">Retry</v-btn>
      </v-alert>
    </div>

    <!-- Type detail -->
    <div v-else-if="type">
      <!-- Header -->
      <div class="d-flex justify-space-between align-center mb-6">
        <div>
          <h1 class="text-h4">{{ type.description }}</h1>
          <p class="text-body-2 text-medium-emphasis">{{ type.file_name }}</p>
        </div>
        <div class="d-flex align-center">
          <v-chip
            v-if="type._locked"
            color="warning"
            class="mr-2"
          >
            Locked
          </v-chip>
          <v-btn
            color="primary"
            @click="saveType"
            :loading="saving"
            :disabled="type._locked"
          >
            <v-icon start>mdi-content-save</v-icon>
            Save
          </v-btn>
        </div>
      </div>

      <!-- Type settings -->
      <v-card class="mb-6">
        <v-card-title>Type Settings</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="type.description"
                label="Description"
                :disabled="type._locked"
                @update:model-value="autoSave"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="type.type"
                label="Type"
                :items="['object', 'array', 'string', 'number', 'boolean']"
                :disabled="type._locked"
                @update:model-value="autoSave"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-switch
                v-model="type.additionalProperties"
                label="Additional Properties"
                :disabled="type._locked"
                @update:model-value="autoSave"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-switch
                v-model="type.required"
                label="Required"
                :disabled="type._locked"
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
            :disabled="type._locked"
          >
            <v-icon start>mdi-plus</v-icon>
            Add Property
          </v-btn>
        </v-card-title>
        <v-card-text>
          <div v-if="Object.keys(type.properties).length === 0" class="text-center pa-8">
            <v-icon size="64" color="grey">mdi-file-document-outline</v-icon>
            <h3 class="text-h6 mt-4">No Properties</h3>
            <p class="text-body-2 text-medium-emphasis">Add properties to define the type structure.</p>
          </div>
          
          <div v-else>
            <v-expansion-panels>
              <v-expansion-panel
                v-for="(property, propertyName) in type.properties"
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
                        :disabled="type._locked"
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
                        :disabled="type._locked"
                        @update:model-value="autoSave"
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-select
                        v-model="property.type"
                        label="Type"
                        :items="propertyTypes"
                        :disabled="type._locked"
                        @update:model-value="autoSave"
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-switch
                        v-model="property.required"
                        label="Required"
                        :disabled="type._locked"
                        @update:model-value="autoSave"
                      />
                    </v-col>
                    <v-col cols="12" md="6" v-if="property.type === 'enum'">
                      <v-text-field
                        v-model="property.enums"
                        label="Enum Reference"
                        :disabled="type._locked"
                        @update:model-value="autoSave"
                      />
                    </v-col>
                    <v-col cols="12" md="6" v-if="property.type === 'ref'">
                      <v-text-field
                        v-model="property.ref"
                        label="Reference"
                        :disabled="type._locked"
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

interface TypeProperty {
  description: string
  type: string
  required: boolean
  enums?: string
  ref?: string
}

interface Type {
  description: string
  file_name: string
  type: string
  additionalProperties: boolean
  required: boolean
  properties: Record<string, TypeProperty>
  _locked: boolean
}

const route = useRoute()
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const type = ref<Type | null>(null)

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

// Load type data
const loadType = async () => {
  loading.value = true
  error.value = null
  
  try {
    const fileName = route.params.fileName as string
    const data = await apiService.getType(fileName)
    type.value = data
  } catch (err: any) {
    error.value = err.message || 'Failed to load type'
    console.error('Failed to load type:', err)
  } finally {
    loading.value = false
  }
}

// Auto-save functionality
const autoSave = async () => {
  if (!type.value || type.value._locked) return
  
  saving.value = true
  try {
    await apiService.saveType(type.value.file_name, type.value)
  } catch (err: any) {
    error.value = err.message || 'Failed to save type'
    console.error('Failed to save type:', err)
  } finally {
    saving.value = false
  }
}

// Manual save
const saveType = async () => {
  if (!type.value) return
  
  saving.value = true
  try {
    await apiService.saveType(type.value.file_name, type.value)
    // Could add success notification here
  } catch (err: any) {
    error.value = err.message || 'Failed to save type'
    console.error('Failed to save type:', err)
  } finally {
    saving.value = false
  }
}

// Add new property
const addProperty = () => {
  if (!type.value || type.value._locked) return
  
  const propertyName = `new_property_${Object.keys(type.value.properties).length + 1}`
  type.value.properties[propertyName] = {
    description: '',
    type: 'string',
    required: false
  }
  
  autoSave()
}

// Delete property
const deleteProperty = (propertyName: string) => {
  if (!type.value || type.value._locked) return
  
  delete type.value.properties[propertyName]
  autoSave()
}

// Load type on mount
onMounted(() => {
  loadType()
})
</script> 