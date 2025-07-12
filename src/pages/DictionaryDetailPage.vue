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
        <v-card class="mb-4">
          <v-card-title class="d-flex justify-space-between align-center pa-4" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
            <div class="d-flex align-center">
              <h2 class="text-h5 mb-0">Dictionary</h2>
            </div>
            <div class="d-flex align-center">
              <v-btn
                v-if="dictionary._locked"
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
                @click="lockDictionary"
              >
                <v-icon start>mdi-lock</v-icon>
                Lock
              </v-btn>
            </div>
          </v-card-title>
          
          <v-card-text class="pa-4">
            <DictionaryProperty
              property-name="root"
              :property="{ ...dictionary, type: dictionary.type || '' }"
              :disabled="dictionary._locked"
              :exclude-type="dictionary.file_name"
              :top-level="true"
              :top-level-name="dictionary.file_name.replace('.yaml', '')"
              @change="handleTopLevelPropertyChange"
            />
          </v-card-text>
        </v-card>
      </div>
    <v-dialog v-model="showUnlockDialog" max-width="400">
      <v-card>
        <v-card-title>Unlock Dictionary?</v-card-title>
        <v-card-text>
          Unlocking allows editing this dictionary. Are you sure?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showUnlockDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="unlockDictionary">Unlock</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { apiService } from '@/utils/api'
import DictionaryProperty from '@/components/DictionaryProperty.vue'

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

// Lock/unlock functionality
const showUnlockDialog = ref(false)

const unlockDictionary = () => {
  if (!dictionary.value) return
  dictionary.value._locked = false
  showUnlockDialog.value = false
  autoSave()
}

const lockDictionary = () => {
  if (!dictionary.value) return
  dictionary.value._locked = true
  autoSave()
}

const handleTopLevelPropertyChange = (updated: any) => {
  if (!dictionary.value) return
  // Copy all top-level fields from updated to dictionary.value
  Object.assign(dictionary.value, updated)
  autoSave()
}
</script> 