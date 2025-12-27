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
        <div class="d-flex gap-2" v-if="!isReadOnly">
          <v-btn
            v-if="dictionary._locked"
            color="warning"
            variant="elevated"
            @click="unlockType"
            class="font-weight-bold"
            data-test="unlock-dictionary-btn"
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
            data-test="lock-dictionary-btn"
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
          <!-- Description Input -->
          <div class="description-section" :style="{ minWidth: '200px' }" data-test="root-description-input">
            <v-text-field
              v-model="editableDescription"
              variant="plain"
              density="compact"
              hide-details
              :readonly="isDisabled"
              class="root-description-input"
              :style="{ minWidth: '200px' }"
              placeholder="Description"
              @blur="handleDescriptionChange"
              @keyup.enter="handleDescriptionChange"
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
                :disabled="isDisabled"
                @update:model-value="handleTypeChange"
                data-test="root-type-chip-picker"
              />
            </div>
            
            <!-- Object Action Icons (only for object types, not void) -->
            <ObjectPropertyExtension
              v-if="dictionary.root && dictionary.root.type === 'object'"
              :property="dictionary.root as any"
              :disabled="isDisabled"
              @change="handleRootPropertyChange"
              @addProperty="handleAddProperty"
              @toggleCollapsed="handleToggleCollapsed"
              data-test="root-object-extension"
            />
            
            <!-- OneOf Action Icons (only for one_of types, not void) -->
            <OneOfPropertyExtension
              v-if="dictionary.root && isOneOfProperty(dictionary.root)"
              :property="dictionary.root as any"
              :disabled="isDisabled"
              @change="handleRootPropertyChange"
              @addProperty="handleAddProperty"
              @toggleCollapsed="handleToggleCollapsed"
              data-test="root-oneof-extension"
            />
            
            <!-- Array Items Type Picker (only for array types, not object/one_of/ref/array) -->
            <ArrayPropertyExtension
              v-if="dictionary.root && isArrayProperty(dictionary.root) && (!dictionary.root.items || !['object','one_of','ref','array'].includes(dictionary.root.items.type))"
              :property="dictionary.root as any"
              :is-dictionary="true"
              :disabled="isDisabled"
              @change="handleRootPropertyChange"
              data-test="root-array-extension"
            />
            
            <!-- Array of Object Extension (for array with object items, not void) -->
            <ArrayOfObjectExtension
              v-if="dictionary.root && isArrayProperty(dictionary.root) && dictionary.root.items && dictionary.root.items.type === 'object'"
              :property="dictionary.root as any"
              :is-dictionary="true"
              :disabled="isDisabled"
              @change="handleRootPropertyChange"
              @addProperty="handleAddArrayObjectProperty"
              @collapsed="handleArrayObjectCollapsed"
              data-test="root-array-of-object-extension"
            />
            
            <!-- Array of OneOf Extension (for array with one_of items, not void) -->
            <ArrayOfOneOfExtension
              v-if="dictionary.root && isArrayProperty(dictionary.root) && dictionary.root.items && dictionary.root.items.type === 'one_of'"
              :property="dictionary.root as any"
              :is-dictionary="true"
              :disabled="isDisabled"
              @change="handleRootPropertyChange"
              @addProperty="handleAddArrayOneOfProperty"
              @collapsed="handleArrayOneOfCollapsed"
              data-test="root-array-of-oneof-extension"
            />

            <!-- Array of Array Extension (for array with array items, not void) -->
            <ArrayOfArrayExtension
              v-if="dictionary.root && isArrayProperty(dictionary.root) && dictionary.root.items && dictionary.root.items.type === 'array'"
              :property="dictionary.root as any"
              :is-dictionary="true"
              :disabled="isDisabled"
              @change="handleRootPropertyChange"
              @collapsed="handleArrayArrayCollapsed"
              data-test="root-array-of-array-extension"
            />
            
            <!-- Array of Ref Extension (for array with ref items, not void) -->
            <ArrayOfRefExtension
              v-if="dictionary.root && isArrayProperty(dictionary.root) && dictionary.root.items && dictionary.root.items.type === 'ref'"
              :property="dictionary.root as any"
              :is-dictionary="true"
              :disabled="isDisabled"
              @change="handleRootPropertyChange"
              data-test="root-array-of-ref-extension"
            />
            
          </div>
        </template>
        
        <!-- Property Editor Body -->
        <PropertyEditor
          :property="dictionary.root"
          :is-root="true"
          :is-dictionary="true"
          :disabled="isDisabled"
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
          This action cannot be undone in the WebUI. If you think you may want to undo this action you should commit changes in git first.
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
  <v-dialog v-model="showUnlockDialog" max-width="500" data-test="unlock-dictionary-dialog">
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
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRoute } from 'vue-router'
import { apiService } from '@/utils/api'
import { useConfig } from '@/composables/useConfig'
import BaseCard from '@/components/BaseCard.vue'
import TypeChipPicker from '@/components/TypeChipPicker.vue'
import ObjectPropertyExtension from '@/components/ObjectPropertyExtension.vue'
import OneOfPropertyExtension from '@/components/OneOfPropertyExtension.vue'
import ArrayPropertyExtension from '@/components/ArrayPropertyExtension.vue'
import ArrayOfObjectExtension from '@/components/ArrayOfObjectExtension.vue'
import ArrayOfOneOfExtension from '@/components/ArrayOfOneOfExtension.vue'
import PropertyEditor from '@/components/PropertyEditor.vue'
import ArrayOfRefExtension from '@/components/ArrayOfRefExtension.vue'
import type { DictionaryData, TypeProperty } from '@/types/types'
import { isArrayProperty, isObjectProperty, isOneOfProperty } from '@/types/types'
import ArrayOfArrayExtension from '@/components/ArrayOfArrayExtension.vue'

const route = useRoute()
const { isReadOnly } = useConfig()
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const dictionary = ref<DictionaryData | null>(null)
const showDeleteDialog = ref(false)
const showUnlockDialog = ref(false)
const editableDescription = ref('')
const editableType = ref('')

// Computed disabled state - read-only mode OR locked
const isDisabled = computed(() => isReadOnly.value || (dictionary.value?._locked || false))

// Methods
const handleDescriptionChange = () => {
  if (dictionary.value?.root && editableDescription.value !== dictionary.value.root.description) {
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
    } else if (newType === 'one_of') {
      updatedProperty.properties = []
      updatedProperty._collapsed = false
    } else if (newType === 'array') {
      updatedProperty.name = updatedProperty.name || 'root'
      updatedProperty.items = {
        name: 'item',
        description: 'Array item',
        type: 'word',
        required: false
      }
    } else if (newType === 'enum') {
      updatedProperty.enums = ''
    } else if (newType === 'enum_array') {
      updatedProperty.enums = ''
    } else if (newType === 'ref') {
      updatedProperty.ref = ''
    } else if (newType === 'constant') {
      updatedProperty.constant = ''
    }
    
    handleRootPropertyChange(updatedProperty)
  }
}

const handleAddProperty = () => {
  if (dictionary.value?.root && (isObjectProperty(dictionary.value.root) || isOneOfProperty(dictionary.value.root))) {
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

const handleAddArrayOneOfProperty = () => {
  if (dictionary.value?.root && isArrayProperty(dictionary.value.root) && dictionary.value.root.items && dictionary.value.root.items.type === 'one_of') {
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

const handleArrayOneOfCollapsed = (collapsed: boolean) => {
  if (dictionary.value?.root && isArrayProperty(dictionary.value.root) && dictionary.value.root.items && dictionary.value.root.items.type === 'one_of') {
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

const handleArrayArrayCollapsed = (collapsed: boolean) => {
  if (dictionary.value?.root && isArrayProperty(dictionary.value.root) && dictionary.value.root.items && dictionary.value.root.items.type === 'array') {
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
  if (!dictionary.value || isReadOnly.value) return
  
  saving.value = true
  error.value = null
  
  try {
    await apiService.saveDictionary(dictionary.value.file_name, dictionary.value)
    // No need to get after put with the new API
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

// Handle page unload - blur active inputs to trigger save handlers
const handleBeforeUnload = () => {
  // Blur the active element if it's an input to trigger save handlers
  const activeElement = document.activeElement
  if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
    ;(activeElement as HTMLElement).blur()
  }
}

// Load dictionary on mount
onMounted(() => {
  loadDictionary()
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<style scoped>
/* Dictionary content styling */
.dictionary-content {
  margin-top: 24px;
}

/* Ensure the type picker in the card title has proper styling */
.type-section {
  flex-shrink: 0;
}

.description-section {
  flex: 1;
  min-width: 0;
}

/* Style the root description input to look like H2/H3 in the card header */
.root-description-input :deep(.v-field__input) {
  color: white !important;
  font-size: 1.25rem !important; /* text-h6 size */
  font-weight: 500 !important;
  line-height: 1.2 !important;
  padding: 0 !important;
}

.root-description-input :deep(.v-field__input)::placeholder {
  color: rgba(255, 255, 255, 0.7) !important;
  opacity: 1 !important;
  font-style: italic;
}

.root-description-input :deep(.v-field) {
  padding: 0 !important;
  min-height: auto !important;
}

.root-description-input :deep(.v-field__outline) {
  display: none !important;
}

.root-description-input :deep(input) {
  color: white !important;
  font-size: 1.25rem !important;
  font-weight: 500 !important;
  line-height: 1.2 !important;
}

.root-description-input :deep(input)::placeholder {
  color: rgba(255, 255, 255, 0.7) !important;
  opacity: 1 !important;
  font-style: italic;
}
</style> 