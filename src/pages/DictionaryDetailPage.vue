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
        <h2 class="text-h3 mb-0">Dictionary: {{ dictionary.file_name.replace('.yaml', '') }}</h2>
        <div class="d-flex gap-2">
          <v-btn
            v-if="dictionary._locked"
            color="warning"
            variant="elevated"
            @click="unlockType"
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
            v-if="!dictionary._locked"
            color="error"
            variant="elevated"
            @click="handleDelete"
            class="font-weight-bold"
            data-test="delete-dictionary-btn"
          >
            <v-icon start>mdi-delete</v-icon>
            Delete
          </v-btn>
        </div>
      </header>
      
      <!-- Root Property Editor with Card Layout -->
      <BaseCard
        v-if="dictionary.root"
        icon="mdi-shape"
        data-test="root-property-card"
      >
        <template #title>
          <!-- Description Display/Edit -->
          <div class="description-section" :style="{ minWidth: '200px' }">
            <div v-if="!isEditingDescription" 
                 class="description-display" 
                 @click="startEditDescription"
                 data-test="root-description-display">
              <span v-if="dictionary.root.description" class="description-text" data-test="root-description-text">{{ dictionary.root.description }}</span>
              <span v-else class="description-placeholder" data-test="root-description-placeholder">Click to add description</span>
            </div>
            <v-text-field
              v-if="isEditingDescription"
              v-model="editableDescription"
              variant="plain"
              density="compact"
              hide-details
              :disabled="dictionary._locked"
              :style="{ minWidth: '200px' }"
              placeholder="Description"
              @blur="finishEditDescription"
              @keyup.enter="finishEditDescription"
              @input="handleDescriptionInput"
              ref="descriptionInput"
              data-test="root-description-input-edit"
            />
          </div>
        </template>
        
        <template #header-actions>
          <!-- Type Picker and Action Icons - Right aligned -->
          <div class="d-flex align-center">
            <!-- Type Picker -->
            <div class="property-type-section" data-test="property-type-section">
              <TypeChipPicker
                v-model="editableType"
                :is-root="true"
                :is-dictionary="true"
                :disabled="dictionary._locked"
                @update:model-value="handleTypeChange"
                data-test="root-type-chip-picker"
              />
            </div>
            
            <!-- Object Action Icons (only for object types, not void) -->
            <ObjectPropertyExtension
              v-if="dictionary.root && dictionary.root.type === 'object'"
              :property="dictionary.root as any"
              :disabled="dictionary._locked"
              @change="handleRootPropertyChange"
              @addProperty="handleAddProperty"
              @toggleCollapsed="handleToggleCollapsed"
              data-test="root-object-extension"
            />
            
            <!-- Array Items Type Picker (only for array types, not void) -->
            <ArrayPropertyExtension
              v-if="dictionary.root && isArrayProperty(dictionary.root) && (!dictionary.root.items || dictionary.root.items.type !== 'object')"
              :property="dictionary.root as any"
              :is-dictionary="true"
              :disabled="dictionary._locked"
              @change="handleRootPropertyChange"
              data-test="root-array-extension"
            />
            
            <!-- Array of Object Extension (for array with object items, not void) -->
            <ArrayOfObjectExtension
              v-if="dictionary.root && isArrayProperty(dictionary.root) && dictionary.root.items && dictionary.root.items.type === 'object'"
              :property="dictionary.root as any"
              :is-dictionary="true"
              :disabled="dictionary._locked"
              @change="handleRootPropertyChange"
              @addProperty="handleAddArrayObjectProperty"
              @collapsed="handleArrayObjectCollapsed"
              data-test="root-array-of-object-extension"
            />
          </div>
        </template>
        
        <!-- Property Editor Body -->
        <PropertyEditor
          :property="dictionary.root"
          :is-root="true"
          :is-dictionary="true"
          :disabled="dictionary._locked"
          @change="handleRootPropertyChange"
        />
      </BaseCard>
    </div>
  </v-container>

  <!-- Delete Confirmation Dialog -->
  <v-dialog v-model="showDeleteDialog" max-width="500">
    <v-card>
      <v-card-title class="text-h5">
        Delete Dictionary?
      </v-card-title>
      <v-card-text>
        <p>Are you sure you want to delete "{{ dictionary?.file_name }}"?</p>
        <p class="text-caption text-medium-emphasis">
          This action cannot be undone.
        </p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="cancelDelete" data-test="delete-dialog-cancel-btn">Cancel</v-btn>
        <v-btn color="error" @click="confirmDelete" data-test="delete-dialog-confirm-btn">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Unlock Confirmation Dialog -->
  <v-dialog v-model="showUnlockDialog" max-width="500" data-test="unlock-type-dialog">
    <v-card>
      <v-card-title class="text-h5 d-flex align-center">
        <v-icon color="warning" class="mr-3">mdi-alert-circle</v-icon>
        Unlock Dictionary
      </v-card-title>
      <v-card-text>
        <p class="mb-3" data-test="unlock-confirmation-message">
          <strong>Are you sure you want to unlock "{{ dictionary?.file_name.replace('.yaml', '') }}"?</strong>
        </p>
        <p class="text-body-2 text-medium-emphasis" data-test="unlock-warning-message">
          This will allow the dictionary to be modified. Changes will be saved automatically.
        </p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="cancelUnlock" data-test="unlock-cancel-btn">Cancel</v-btn>
        <v-btn 
          color="warning" 
          variant="elevated"
          @click="confirmUnlock"
          data-test="unlock-confirm-btn"
        >
          Unlock
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { apiService } from '@/utils/api'
import BaseCard from '@/components/BaseCard.vue'
import TypeChipPicker from '@/components/TypeChipPicker.vue'
import ObjectPropertyExtension from '@/components/ObjectPropertyExtension.vue'
import ArrayPropertyExtension from '@/components/ArrayPropertyExtension.vue'
import ArrayOfObjectExtension from '@/components/ArrayOfObjectExtension.vue'
import PropertyEditor from '@/components/PropertyEditor.vue'
import type { DictionaryData, TypeProperty } from '@/types/types'
import { isArrayProperty, isObjectProperty } from '@/types/types'

const route = useRoute()
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const dictionary = ref<DictionaryData | null>(null)
const showDeleteDialog = ref(false)
const showUnlockDialog = ref(false)
const isEditingDescription = ref(false)
const editableDescription = ref('')
const editableType = ref('')
const descriptionInput = ref<HTMLElement>()

// Methods
const startEditDescription = () => {
  if (!dictionary.value?._locked) {
    isEditingDescription.value = true
    editableDescription.value = dictionary.value?.root?.description || ''
    // Focus the input after it's rendered
    nextTick(() => {
      if (descriptionInput.value) {
        (descriptionInput.value as HTMLInputElement).focus()
      }
    })
  }
}

const finishEditDescription = () => {
  isEditingDescription.value = false
  if (dictionary.value?.root && editableDescription.value !== dictionary.value.root.description) {
    dictionary.value.root.description = editableDescription.value
    autoSave()
  }
}

const handleDescriptionInput = () => {
  // Auto-save on every keystroke while editing
  if (dictionary.value?.root) {
    dictionary.value.root.description = editableDescription.value
    autoSave()
  }
}

const handleTypeChange = (newType: string) => {
  if (dictionary.value?.root && newType !== dictionary.value.root.type) {
    // Create a new property with the updated type
    let updatedProperty: any = {
      ...dictionary.value.root,
      type: newType
    }
    
    // Set default values for different types
    if (newType === 'object') {
      updatedProperty.properties = []
      updatedProperty.additional_properties = false
    } else if (newType === 'array') {
      updatedProperty.name = updatedProperty.name || 'root'
      updatedProperty.items = {
        name: 'item',
        description: 'Array item',
        type: 'word',
        required: false
      }
    }
    
    handleRootPropertyChange(updatedProperty)
  }
}

const handleAddProperty = () => {
  if (dictionary.value?.root && isObjectProperty(dictionary.value.root)) {
    const newProperty = {
      name: '',
      description: '',
      type: 'void',
      required: false
    }
    
    if (!dictionary.value.root.properties) {
      dictionary.value.root.properties = []
    }
    
    dictionary.value.root.properties.push(newProperty)
    handleRootPropertyChange(dictionary.value.root)
  }
}

const handleToggleCollapsed = (collapsed: boolean) => {
  if (dictionary.value?.root) {
    const updatedRoot = {
      ...dictionary.value.root,
      _collapsed: collapsed
    }
    handleRootPropertyChange(updatedRoot)
  }
}

const handleAddArrayObjectProperty = () => {
  if (dictionary.value?.root && isArrayProperty(dictionary.value.root) && dictionary.value.root.items && dictionary.value.root.items.type === 'object') {
    const items = dictionary.value.root.items as any
    if (!items.properties) {
      items.properties = []
    }
    
    const newProperty = {
      name: '',
      description: '',
      type: 'void',
      required: false
    }
    
    items.properties.push(newProperty)
    handleRootPropertyChange(dictionary.value.root)
  }
}

const handleArrayObjectCollapsed = (collapsed: boolean) => {
  if (dictionary.value?.root && isArrayProperty(dictionary.value.root) && dictionary.value.root.items && dictionary.value.root.items.type === 'object') {
    const items = dictionary.value.root.items as any
    const updatedItems = {
      ...items,
      _collapsed: collapsed
    }
    
    const updatedRoot = {
      ...dictionary.value.root,
      items: updatedItems
    }
    
    handleRootPropertyChange(updatedRoot)
  }
}

const loadDictionary = async () => {
  loading.value = true
  error.value = null
  
  try {
    const fileName = route.params.fileName as string
    dictionary.value = await apiService.getDictionary(fileName)
    
    // Initialize reactive variables
    if (dictionary.value?.root) {
      editableDescription.value = dictionary.value.root.description || ''
      editableType.value = dictionary.value.root.type || 'void'
    } else {
      // Create default root property if it doesn't exist
      if (dictionary.value) {
        dictionary.value.root = {
          name: 'root',
          description: '',
          type: 'void',
          required: false
        }
        editableDescription.value = ''
        editableType.value = 'void'
      }
    }
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

const handleRootPropertyChange = (updatedProperty: TypeProperty) => {
  if (dictionary.value) {
    dictionary.value.root = updatedProperty
    autoSave()
  }
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

const unlockType = async () => {
  if (!dictionary.value) return
  showUnlockDialog.value = true
}

const confirmUnlock = async () => {
  if (!dictionary.value) return
  try {
    // Update local state
    dictionary.value._locked = false
    showUnlockDialog.value = false
    
    // Save the unlocked state to the backend
    await autoSave()
  } catch (err: any) {
    error.value = err.message || 'Failed to unlock dictionary'
    console.error('Failed to unlock dictionary:', err)
  }
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

/* Root property card title styling */
.description-display {
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 1.2;
}

.description-display:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

.description-text {
  color: white;
}

.description-placeholder {
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
}

/* Ensure the type picker in the card title has proper styling */
.type-section {
  flex-shrink: 0;
}

.description-section {
  flex: 1;
  min-width: 0;
}
</style> 