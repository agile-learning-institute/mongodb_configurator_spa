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

    <!-- Content -->
    <div v-else-if="typeData">
      <!-- Page Header -->
      <header class="d-flex align-center justify-space-between mb-6">
        <h2 class="text-h3 mb-0">Type: {{ typeData.file_name.replace('.yaml', '') }}</h2>
        <div class="d-flex gap-2" v-if="!typeData._locked">
          <v-btn
            color="warning"
            variant="elevated"
            @click="lockType"
            class="font-weight-bold"
            data-test="lock-type-btn"
          >
            <v-icon start>mdi-lock</v-icon>
            Lock
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            @click="handleDelete"
            class="font-weight-bold"
            data-test="delete-type-btn"
          >
            <v-icon start>mdi-delete</v-icon>
            Delete
          </v-btn>
        </div>
        <div v-else class="d-flex gap-2">
          <v-btn
            color="success"
            variant="elevated"
            @click="unlockType"
            class="font-weight-bold"
            data-test="unlock-type-btn"
          >
            <v-icon start>mdi-lock-open</v-icon>
            Unlock
          </v-btn>
        </div>
      </header>
      
      <!-- Root Property Editor with Card Layout -->
      <BaseCard
        v-if="typeData.root"
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
              :readonly="typeData._locked"
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
                :is-type="true"
                :disabled="typeData._locked"
                @update:model-value="handleTypeChange"
                data-test="root-type-chip-picker"
              />
            </div>
            
            <!-- Object Action Icons (only for object types) -->
            <ObjectPropertyExtension
              v-if="typeData.root && typeData.root.type === 'object'"
              :property="typeData.root as any"
              :disabled="typeData._locked"
              @change="handleRootPropertyChange"
              @addProperty="handleAddProperty"
              @toggleCollapsed="handleToggleCollapsed"
              data-test="root-object-extension"
            />
            
            <!-- Array Items Type Picker (only for array types) -->
            <ArrayPropertyExtension
              v-if="typeData.root && isArrayProperty(typeData.root) && (!typeData.root.items || typeData.root.items.type !== 'object')"
              :property="typeData.root as any"
              :is-type="true"
              :disabled="typeData._locked"
              @change="handleRootPropertyChange"
              data-test="root-array-extension"
            />
            
            <!-- Array of Object Extension (for array with object items) -->
            <ArrayOfObjectExtension
              v-if="typeData.root && isArrayProperty(typeData.root) && typeData.root.items && typeData.root.items.type === 'object'"
              :property="typeData.root as any"
              :is-type="true"
              :disabled="typeData._locked"
              @change="handleRootPropertyChange"
              @addProperty="handleAddArrayObjectProperty"
              @collapsed="handleArrayObjectCollapsed"
              data-test="root-array-of-object-extension"
            />
          </div>
        </template>
        
        <PropertyEditor
          :property="typeData.root"
          :is-root="true"
          :is-type="true"
          :disabled="typeData._locked"
          :hideTypeSelector="true"
          @change="handleRootPropertyChange"
        />
      </BaseCard>
    </div>
  </v-container>

  <!-- Delete Confirmation Dialog -->
  <v-dialog v-model="showDeleteDialog" max-width="500" data-test="delete-type-dialog">
    <v-card>
      <v-card-title class="text-h5 d-flex align-center">
        <v-icon color="error" class="mr-3">mdi-alert-circle</v-icon>
        Delete Type
      </v-card-title>
      <v-card-text>
        <p class="mb-3" data-test="delete-confirmation-message">
          <strong>Are you sure you want to delete "{{ typeData?.file_name.replace('.yaml', '') }}"?</strong>
        </p>
        <p class="text-body-2 text-medium-emphasis" data-test="delete-warning-message">
          This action cannot be undone. The type will be permanently removed from the system.
        </p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="cancelDelete" data-test="delete-cancel-btn">Cancel</v-btn>
        <v-btn 
          color="error" 
          variant="elevated"
          @click="confirmDelete"
          data-test="delete-confirm-btn"
        >
          Delete
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Unlock Confirmation Dialog -->
  <v-dialog v-model="showUnlockDialog" max-width="500" data-test="unlock-type-dialog">
    <v-card>
      <v-card-title class="text-h5 d-flex align-center">
        <v-icon color="warning" class="mr-3">mdi-alert-circle</v-icon>
        Unlock Type
      </v-card-title>
      <v-card-text>
        <p class="mb-3" data-test="unlock-confirmation-message">
          <strong>Are you sure you want to unlock "{{ typeData?.file_name.replace('.yaml', '') }}"?</strong>
        </p>
        <p class="text-body-2 text-medium-emphasis" data-test="unlock-warning-message">
          This will allow the type to be modified. Changes will be saved automatically.
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
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiService } from '@/utils/api'
import PropertyEditor from '@/components/PropertyEditor.vue'
import BaseCard from '@/components/BaseCard.vue'
import TypeChipPicker from '@/components/TypeChipPicker.vue'
import ObjectPropertyExtension from '@/components/ObjectPropertyExtension.vue'
import ArrayPropertyExtension from '@/components/ArrayPropertyExtension.vue'
import ArrayOfObjectExtension from '@/components/ArrayOfObjectExtension.vue'
import type { TypeProperty, TypeData } from '@/types/types'
import { isArrayProperty } from '@/types/types'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const showDeleteDialog = ref(false)
const showUnlockDialog = ref(false)
const typeData = ref<TypeData | null>(null)
const editableDescription = ref('')
const editableType = ref('')

// Methods
const loadType = async () => {
  loading.value = true
  error.value = null
  try {
    const fileName = route.params.fileName as string
    typeData.value = await apiService.getType(fileName)
    
    // Initialize local state
    if (typeData.value?.root) {
      editableDescription.value = typeData.value.root.description || ''
      editableType.value = typeData.value.root.type
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load type'
    console.error('Failed to load type:', err)
  } finally {
    loading.value = false
  }
}

const autoSave = async () => {
  if (!typeData.value) return
  saving.value = true
  error.value = null
  try {
    await apiService.saveType(typeData.value.file_name, typeData.value)
    // No need to get after put with the new API
  } catch (err: any) {
    error.value = err.message || 'Failed to save type'
    console.error('Failed to save type:', err)
  } finally {
    saving.value = false
  }
}

const handleRootPropertyChange = (updatedProperty: TypeProperty) => {
  if (typeData.value) {
    typeData.value.root = updatedProperty
    // Update local state
    editableDescription.value = updatedProperty.description || ''
    editableType.value = updatedProperty.type
    autoSave()
  }
}

const handleDescriptionChange = () => {
  if (typeData.value?.root && editableDescription.value !== typeData.value.root.description) {
    typeData.value.root.description = editableDescription.value
    autoSave()
  }
}

const handleTypeChange = (newType: string) => {
  if (typeData.value?.root && newType !== typeData.value.root.type) {
    // Create a new property with the updated type
    let updatedProperty: any = {
      ...typeData.value.root,
      type: newType
    }
    
    // Set default values for simple, complex, object, and array types
    if (newType === 'simple') {
      updatedProperty.schema = { type: "string", maxLength: 40 }
    } else if (newType === 'complex') {
      updatedProperty.json_type = { type: "string", maxLength: 40 }
      updatedProperty.bson_type = { type: "string", maxLength: 40 }
    } else if (newType === 'object') {
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

const lockType = async () => {
  if (!typeData.value) return
  try {
    // Update local state
    typeData.value._locked = true
    
    // Save the locked state to the backend
    await autoSave()
  } catch (err: any) {
    error.value = err.message || 'Failed to lock type'
    console.error('Failed to lock type:', err)
  }
}

const handleAddProperty = () => {
  if (typeData.value?.root && typeData.value.root.type === 'object') {
    const newProperty = {
      name: '',
      type: 'void' as const,
      description: '',
      required: false
    }
    
    const updatedRoot = {
      ...typeData.value.root,
      properties: [...((typeData.value.root as any).properties || []), newProperty]
    }
    
    handleRootPropertyChange(updatedRoot)
  }
}

const handleToggleCollapsed = (collapsed: boolean) => {
  if (typeData.value?.root && typeData.value.root.type === 'object') {
    const updatedRoot = {
      ...typeData.value.root,
      _collapsed: collapsed
    }
    
    handleRootPropertyChange(updatedRoot)
  }
}

const handleAddArrayObjectProperty = () => {
  if (typeData.value?.root && isArrayProperty(typeData.value.root) && typeData.value.root.items && typeData.value.root.items.type === 'object') {
    const items = typeData.value.root.items as any
    if (!items.properties) {
      items.properties = []
    }
    
    const newProperty = {
      name: '',
      type: 'void' as const,
      description: '',
      required: false
    }
    
    items.properties.push(newProperty)
    handleRootPropertyChange(typeData.value.root)
  }
}

const handleArrayObjectCollapsed = (collapsed: boolean) => {
  if (typeData.value?.root && isArrayProperty(typeData.value.root) && typeData.value.root.items && typeData.value.root.items.type === 'object') {
    const items = typeData.value.root.items as any
    const updatedItems = {
      ...items,
      _collapsed: collapsed
    }
    
    const updatedRoot = {
      ...typeData.value.root,
      items: updatedItems
    }
    
    handleRootPropertyChange(updatedRoot)
  }
}

const unlockType = async () => {
  if (!typeData.value) return
  showUnlockDialog.value = true
}

const handleDelete = () => {
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!typeData.value) return
  try {
    await apiService.deleteType(typeData.value.file_name)
    router.push('/types')
  } catch (err: any) {
    error.value = err.message || 'Failed to delete type'
    console.error('Failed to delete type:', err)
  }
}

const cancelDelete = () => {
  showDeleteDialog.value = false
}

const confirmUnlock = async () => {
  if (!typeData.value) return
  try {
    // Update local state
    typeData.value._locked = false
    showUnlockDialog.value = false
    
    // Save the unlocked state to the backend
    await autoSave()
  } catch (err: any) {
    error.value = err.message || 'Failed to unlock type'
    console.error('Failed to unlock type:', err)
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

// Load type on mount
onMounted(() => {
  loadType()
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<style scoped>
/* Type content styling */
.type-content {
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
</style> 