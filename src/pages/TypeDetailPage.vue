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
          <div class="d-flex align-center gap-3">
            <!-- Description Display/Edit -->
            <div class="description-section" :style="{ minWidth: '200px', flex: '1' }">
              <div v-if="!isEditingDescription" 
                   class="description-display" 
                   @click="startEditDescription"
                   data-test="root-description-display">
                <span v-if="typeData.root.description" class="description-text" data-test="root-description-text">{{ typeData.root.description }}</span>
                <span v-else class="description-placeholder" data-test="root-description-placeholder">Click to add description</span>
              </div>
              <v-text-field
                v-if="isEditingDescription"
                v-model="editableDescription"
                variant="plain"
                density="compact"
                hide-details
                :disabled="typeData._locked"
                :style="{ minWidth: '200px', flex: '1' }"
                placeholder="Description"
                @blur="finishEditDescription"
                @keyup.enter="finishEditDescription"
                @input="handleDescriptionInput"
                ref="descriptionInput"
                data-test="root-description-input-edit"
              />
            </div>
            
            <!-- Type Picker -->
            <div class="type-section">
              <TypeChipPicker
                v-model="editableType"
                :is-root="true"
                :is-type="true"
                :disabled="typeData._locked"
                @update:model-value="handleTypeChange"
                data-test="root-type-chip-picker"
              />
            </div>
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
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiService } from '@/utils/api'
import PropertyEditor from '@/components/PropertyEditor.vue'
import BaseCard from '@/components/BaseCard.vue'
import TypeChipPicker from '@/components/TypeChipPicker.vue'
import type { TypeProperty, TypeData } from '@/types/types'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const showDeleteDialog = ref(false)
const showUnlockDialog = ref(false)
const typeData = ref<TypeData | null>(null)
const isEditingDescription = ref(false)
const editableDescription = ref('')
const editableType = ref('')
const descriptionInput = ref<HTMLElement>()

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

const startEditDescription = () => {
  if (!typeData.value?._locked) {
    isEditingDescription.value = true
    // Focus the input after it's rendered
    nextTick(() => {
      if (descriptionInput.value) {
        descriptionInput.value.focus()
      }
    })
  }
}

const handleDescriptionInput = () => {
  // Auto-save on every keystroke while editing
  if (typeData.value?.root) {
    typeData.value.root.description = editableDescription.value
    autoSave()
  }
}

const finishEditDescription = () => {
  isEditingDescription.value = false
  if (typeData.value?.root && editableDescription.value !== typeData.value.root.description) {
    typeData.value.root.description = editableDescription.value
    autoSave()
  }
}

const handleTypeChange = (newType: string) => {
  if (typeData.value?.root && newType !== typeData.value.root.type) {
    // Create a new property with the updated type
    const updatedProperty = {
      ...typeData.value.root,
      type: newType
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

// Load type on mount
onMounted(() => {
  loadType()
})
</script>

<style scoped>
/* Type content styling */
.type-content {
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