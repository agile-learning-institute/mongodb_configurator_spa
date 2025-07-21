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
      <!-- File Header -->
      <div class="d-flex align-center justify-space-between mb-6">
        <div class="flex-grow-1">
          <!-- File name and title row -->
          <div class="d-flex align-center mb-2">
            <h2 class="text-h5 text-medium-emphasis mr-4 mb-0">{{ dictionary.file_name }}</h2>
            <div v-if="!editingTitle" @click="startEditTitle" class="title-display">
              <h1 class="title-text mb-0 cursor-pointer">{{ dictionary.title || 'Enter dictionary title...' }}</h1>
            </div>
            <v-text-field
              v-else
              v-model="dictionary.title"
              variant="plain"
              density="compact"
              class="title-edit-field h1-style"
              hide-details
              @update:model-value="autoSave"
              @blur="finishEditTitle"
              @keyup.enter="finishEditTitle"
              ref="titleInput"
            />
          </div>
          
          <!-- Description row -->
          <div v-if="!editingDescription" @click="startEditDescription" class="description-display">
            <p class="description-text mb-0 cursor-pointer">{{ dictionary.root?.description || 'Enter dictionary description...' }}</p>
          </div>
          <v-text-field
            v-else
            v-model="dictionary.root.description"
            placeholder="Enter dictionary description..."
            variant="plain"
            density="compact"
            class="description-edit-field"
            hide-details
            @update:model-value="autoSave"
            @blur="finishEditDescription"
            @keyup.enter="finishEditDescription"
            ref="descriptionInput"
          />
        </div>
        
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
      </div>

      <!-- Dictionary Content -->
      <div class="dictionary-content">
        <BaseCard 
          title="Dictionary Properties"
          icon="mdi-shape"
          :is-secondary="false"
        >
          <div v-if="dictionary.root" class="pa-4">
            <PropertyEditor
              :property="dictionary.root"
              property-name="root"
              :disabled="dictionary._locked"
              :exclude-type="dictionary.file_name"
              :top-level="true"
              :top-level-name="dictionary.file_name.replace('.yaml', '')"
              type-picker-component="DictionaryTypePicker"
              @change="handleRootPropertyChange"
            />
          </div>
          <div v-else class="pa-4">
            <v-alert type="error">
              No root property found in dictionary
            </v-alert>
          </div>
        </BaseCard>
      </div>
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
import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { apiService } from '@/utils/api'
import BaseCard from '@/components/BaseCard.vue'
import PropertyEditor from '@/components/PropertyEditor.vue'

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
const editingTitle = ref(false)
const editingDescription = ref(false)
const titleInput = ref<HTMLElement | null>(null)
const descriptionInput = ref<HTMLElement | null>(null)

// Computed properties (unused but kept for future use)
// const descriptionValue = computed(() => dictionary.value?.root?.description || '')
// const typeValue = computed(() => dictionary.value?.root?.type || 'string')

// Methods
const loadDictionary = async () => {
  loading.value = true
  error.value = null
  
  try {
    const fileName = route.params.fileName as string
    console.log('Loading dictionary:', fileName)
    dictionary.value = await apiService.getDictionary(fileName)
    console.log('Dictionary loaded:', dictionary.value)
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
    await apiService.saveDictionary(dictionary.value.file_name, dictionary.value)
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



// Edit-in-place methods
const startEditTitle = () => {
  editingTitle.value = true
  nextTick(() => {
    titleInput.value?.focus()
  })
}

const finishEditTitle = () => {
  editingTitle.value = false
  autoSave()
}

const startEditDescription = () => {
  editingDescription.value = true
  nextTick(() => {
    descriptionInput.value?.focus()
  })
}

const finishEditDescription = () => {
  editingDescription.value = false
  autoSave()
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
  console.log('DictionaryDetailPage mounted')
  loadDictionary()
})
</script>

<style scoped>
/* Edit-in-place styling */
.title-display {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.title-display:hover {
  background-color: rgba(46, 125, 50, 0.04);
  border-radius: 4px;
  padding: 4px;
  margin: -4px;
}

.description-display {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.description-display:hover {
  background-color: rgba(46, 125, 50, 0.04);
  border-radius: 4px;
  padding: 4px;
  margin: -4px;
}

.title-text {
  font-size: 2rem;
  font-weight: 300;
  color: rgba(0, 0, 0, 0.87);
  margin: 0;
}

.description-text {
  font-size: 1rem;
  color: rgba(0, 0, 0, 0.6);
  margin: 0;
}

.title-edit-field {
  font-size: 2rem !important;
  font-weight: 300 !important;
}

.description-edit-field {
  font-size: 1rem !important;
}

.h1-style {
  font-size: 2rem !important;
  font-weight: 300 !important;
}

.cursor-pointer {
  cursor: pointer;
}

/* Dictionary content styling */
.dictionary-content {
  margin-top: 24px;
}
</style> 