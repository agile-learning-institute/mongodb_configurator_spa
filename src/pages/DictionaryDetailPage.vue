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

    <!-- Content -->
    <div v-else-if="dictionary">
      <!-- Page Header -->
      <header class="d-flex align-center justify-space-between mb-6">
        <h2 class="text-h4 mb-0">{{ dictionary.file_name }}</h2>
        <div class="d-flex gap-2">
          <v-btn
            v-if="dictionary._locked"
            color="warning"
            variant="elevated"
            @click="unlockDictionary"
            class="font-weight-bold"
          >
            <v-icon start>mdi-lock-open</v-icon>
            Unlock
          </v-btn>
          <v-btn
            v-else
            color="info"
            variant="elevated"
            @click="lockDictionary"
            class="font-weight-bold"
          >
            <v-icon start>mdi-lock</v-icon>
            Lock
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            @click="handleDelete"
            class="font-weight-bold"
          >
            <v-icon start>mdi-delete</v-icon>
            Delete
          </v-btn>
        </div>
      </header>
      <!-- PropertyEditorFactory for root property -->
      <PropertyEditorFactory
        v-if="dictionary.root"
        :property="dictionary.root"
        :is-root="true"
        @change="handleRootPropertyChange"
      />
    </div>
  </v-container>

  <!-- Delete Confirmation Dialog -->
  <v-dialog v-model="showDeleteDialog" max-width="500">
    <v-card>
      <v-card-title class="text-h5">
        Delete Dictionary?
      </v-card-title>
      <v-card-text>
        <p>Are you sure you want to delete "{{ dictionary?.title || dictionary?.file_name }}"?</p>
        <p class="text-caption text-medium-emphasis">
          This action cannot be undone.
        </p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="cancelDelete">Cancel</v-btn>
        <v-btn color="error" @click="confirmDelete">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Unlock Confirmation Dialog -->
  <v-dialog v-model="showUnlockDialog" max-width="500">
    <v-card>
      <v-card-title class="text-h5">
        Unlock Dictionary?
      </v-card-title>
      <v-card-text>
        <p>Unlocking allows editing this dictionary. Are you sure?</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="cancelUnlock">Cancel</v-btn>
        <v-btn color="warning" @click="confirmUnlock">Unlock</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { apiService } from '@/utils/api'
import BaseCard from '@/components/BaseCard.vue'
import PropertyEditorFactory from '@/components/PropertyEditorFactory.vue'
import DictionaryTypePicker from '@/components/DictionaryTypePicker.vue'


interface DictionaryProperty {
  description: string
  type?: string
  required?: boolean
  additionalProperties?: boolean
  items?: DictionaryProperty
  properties?: Record<string, DictionaryProperty>
  schema?: any
  json_type?: any
  bson_type?: any
  enums?: string[]
  oneOf?: Record<string, any>
}

interface Dictionary {
  file_name: string
  title?: string
  _locked: boolean
  root: DictionaryProperty
}

const route = useRoute()
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const dictionary = ref<Dictionary | null>(null)
const showDeleteDialog = ref(false)
const showUnlockDialog = ref(false)


// Computed properties (unused but kept for future use)
// const descriptionValue = computed(() => dictionary.value?.root?.description || '')
// const typeValue = computed(() => dictionary.value?.root?.type || 'string')

// Methods
const loadDictionary = async () => {
  loading.value = true
  error.value = null
  
  try {
    const fileName = route.params.fileName as string
    dictionary.value = await apiService.getDictionary(fileName)
  } catch (err: any) {
    error.value = err.message || 'Failed to load dictionary'
    console.error('Failed to load dictionary:', err)
  } finally {
    loading.value = false
  }
}

const autoSave = async () => {
  if (!dictionary.value) return
  
  saving.value = true
  error.value = null
  
  try {
    // Log the dictionary data before saving
    console.log('Saving dictionary:', JSON.stringify(dictionary.value, null, 2))
    // Save the dictionary
    await apiService.saveDictionary(dictionary.value.file_name, dictionary.value)
    // Reload the fresh data from the API
    const freshData = await apiService.getDictionary(dictionary.value.file_name)
    dictionary.value = freshData
  } catch (err: any) {
    error.value = err.message || 'Failed to save dictionary'
    console.error('Failed to save dictionary:', err)
  } finally {
    saving.value = false
  }
}

const handleRootPropertyChange = (updatedProperty: DictionaryProperty) => {
  if (dictionary.value) {
    dictionary.value.root = updatedProperty
    autoSave()
  }
}

const handlePropertyChange = (propertyName: string, updatedProperty: DictionaryProperty) => {
  
  if (dictionary.value?.root?.properties) {
    // Replace the properties object to force Vue reactivity
    dictionary.value.root.properties = {
      ...dictionary.value.root.properties,
      [propertyName]: updatedProperty
    }
    autoSave()
  }
}

// Add this method after handlePropertyChange
const handleDeleteProperty = (propertyName: string) => {
  if (dictionary.value?.root?.properties) {
    delete dictionary.value.root.properties[propertyName];
    autoSave();
  }
}

// Helper method for card title
const getDictionaryTitle = () => {
  if (!dictionary.value) return 'Dictionary Properties'
  const fileName = dictionary.value.file_name.replace('.yaml', '')
  const description = dictionary.value.root?.description || ''
  return `${fileName}: ${description}`
}

// Handle type change
const handleTypeChange = () => {
  if (dictionary.value) {
    autoSave()
  }
}

// Handle add property
const handleAddProperty = () => {
  if (dictionary.value?.root) {
    const newPropertyName = `property_${Object.keys(dictionary.value.root.properties || {}).length + 1}`
    // Add a new property to the root object
    if (!dictionary.value.root.properties) {
      dictionary.value.root.properties = {}
    }
    dictionary.value.root.properties[newPropertyName] = {
      description: '',
      type: 'string'
    }
    autoSave()
  }
}

// Simple computed properties for action icons
const canBeRequired = computed(() => dictionary.value?.root && dictionary.value.root.type !== 'array')
const canHaveAdditionalProperties = computed(() => dictionary.value?.root && dictionary.value.root.type === 'object')
const canHaveOneOf = computed(() => dictionary.value?.root && dictionary.value.root.type === 'object')

const toggleOneOf = () => {
  // Simple toggle for oneOf - this would need more complex logic
}





const lockDictionary = async () => {
  if (!dictionary.value) return
  
  try {
    // Note: Lock API endpoint may not be implemented yet
    dictionary.value._locked = true
  } catch (err: any) {
    error.value = err.message || 'Failed to lock dictionary'
    console.error('Failed to lock dictionary:', err)
  }
}

const unlockDictionary = async () => {
  if (!dictionary.value) return
  
  try {
    // Note: Unlock API endpoint may not be implemented yet
    dictionary.value._locked = false
    showUnlockDialog.value = false
  } catch (err: any) {
    error.value = err.message || 'Failed to unlock dictionary'
    console.error('Failed to unlock dictionary:', err)
  }
}

const handleDelete = () => {
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!dictionary.value) return
  
  try {
    await apiService.deleteDictionary(dictionary.value.file_name)
    // Navigate back to dictionaries list
    window.location.href = '/dictionaries'
  } catch (err: any) {
    error.value = err.message || 'Failed to delete dictionary'
    console.error('Failed to delete dictionary:', err)
  }
}

const cancelDelete = () => {
  showDeleteDialog.value = false
}

const confirmUnlock = () => {
  unlockDictionary()
}

const cancelUnlock = () => {
  showUnlockDialog.value = false
}

// Load dictionary on mount
onMounted(() => {
  loadDictionary()
})
</script>

<style scoped>
/* Dictionary content styling */
.dictionary-content {
  margin-top: 24px;
}
</style> 