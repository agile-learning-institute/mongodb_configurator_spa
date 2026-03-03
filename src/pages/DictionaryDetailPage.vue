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
      <!-- Page Header: dictionary name (no version) + actions -->
      <header class="dictionary-header d-flex align-center mb-6">
        <h2 class="text-h5 font-weight-medium dictionary-name flex-grow-1 text-truncate mr-4" data-test="dictionary-header-name">
          {{ displayName }}
        </h2>
        <div class="d-flex align-center flex-shrink-0 gap-1">
          <!-- Version pill: constant width, tooltips, v prefix, version links to config -->
          <VersionPill
            v-if="versionDisplay"
            :version="versionDisplay"
            :has-previous="hasPreviousVersion"
            :has-next="hasNextVersion"
            :link-to="configRoute"
            data-test="dictionary-version-pill"
            @previous="navigateToPreviousVersion"
            @next="navigateToNextVersion"
          />
          <!-- Delete only for non-versioned dictionaries; lock/unlock are controlled via configuration versions -->
          <v-tooltip
            v-if="!isReadOnly && !dictionary._locked && !isVersionedDictionary"
            text="Delete Dictionary"
            location="bottom"
          >
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon="mdi-delete"
                variant="text"
                size="small"
                color="error"
                @click="handleDelete"
                data-test="delete-dictionary-btn"
              />
            </template>
          </v-tooltip>
          <v-tooltip v-if="configFileName" text="Download JSON Schema" location="bottom">
            <template #activator="{ props }">
              <v-chip
                v-bind="props"
                variant="outlined"
                size="small"
                color="default"
                class="cursor-pointer"
                @click="downloadJsonSchema"
                data-test="dictionary-json-schema-btn"
              >
                json
              </v-chip>
            </template>
          </v-tooltip>
          <v-tooltip v-if="configFileName" text="Download BSON Schema" location="bottom">
            <template #activator="{ props }">
              <v-chip
                v-bind="props"
                variant="outlined"
                size="small"
                color="default"
                class="cursor-pointer"
                @click="downloadBsonSchema"
                data-test="dictionary-bson-schema-btn"
              >
                bson
              </v-chip>
            </template>
          </v-tooltip>
        </div>
      </header>
      
      <!-- Root Property Editor with Card Layout -->
      <BaseCard
        v-if="dictionary.root"
        icon="mdi-shape"
        data-test="root-property-card"
      >
        <template #title>
          <!-- Description Input - expands to fill available space -->
          <div class="description-section flex-grow-1 min-width-0" data-test="root-description-input">
            <v-text-field
              v-model="editableDescription"
              variant="plain"
              density="compact"
              hide-details
              :readonly="isDisabled"
              class="root-description-input"
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
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiService } from '@/utils/api'
import { useConfig } from '@/composables/useConfig'
import { useEvents } from '@/composables/useEvents'
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
import VersionPill from '@/components/VersionPill.vue'

const route = useRoute()
const router = useRouter()
const { isReadOnly } = useConfig()
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const dictionary = ref<DictionaryData | null>(null)
const showDeleteDialog = ref(false)
const editableDescription = ref('')
const editableType = ref('')
const siblingDictionaries = ref<string[]>([])

// Parse dictionary file name: collection.MAJOR.MINOR.PATCH.yaml -> { collection, version }
const parseDictionaryFileName = (fileName: string) => {
  const match = fileName.match(/^(.+)\.(\d+)\.(\d+)\.(\d+)\.yaml$/)
  if (!match) return null
  return { collection: match[1], version: `${match[2]}.${match[3]}.${match[4]}` }
}

const isVersionedDictionary = computed(() => {
  const fileName = dictionary.value?.file_name ?? ''
  return /\.\d+\.\d+\.\d+\.yaml$/.test(fileName)
})

// Display name (collection only, no version) e.g. "sample"
const displayName = computed(() => {
  const parsed = dictionary.value ? parseDictionaryFileName(dictionary.value.file_name) : null
  return parsed?.collection ?? dictionary.value?.file_name.replace(/\.yaml$/, '') ?? ''
})

// Version display (e.g. 1.0.0)
const versionDisplay = computed(() => {
  const parsed = dictionary.value ? parseDictionaryFileName(dictionary.value.file_name) : null
  return parsed?.version ?? ''
})

// Config route: /configurations/collectionName.yaml
const configRoute = computed(() => {
  const parsed = dictionary.value ? parseDictionaryFileName(dictionary.value.file_name) : null
  return parsed ? `/configurations/${parsed.collection}.yaml` : '/dictionaries'
})

// Config file name and version for schema downloads (config version = dict version + .0 for enumerators)
const configFileName = computed(() => {
  const parsed = dictionary.value ? parseDictionaryFileName(dictionary.value.file_name) : null
  return parsed ? `${parsed.collection}.yaml` : null
})
const configVersion = computed(() => {
  const parsed = dictionary.value ? parseDictionaryFileName(dictionary.value.file_name) : null
  return parsed ? `${parsed.version}.0` : ''
})

// Prev/next version navigation
const hasPreviousVersion = computed(() => {
  if (!dictionary.value || siblingDictionaries.value.length < 2) return false
  const idx = siblingDictionaries.value.indexOf(dictionary.value.file_name)
  return idx > 0
})

const hasNextVersion = computed(() => {
  if (!dictionary.value || siblingDictionaries.value.length < 2) return false
  const idx = siblingDictionaries.value.indexOf(dictionary.value.file_name)
  return idx >= 0 && idx < siblingDictionaries.value.length - 1
})

const navigateToPreviousVersion = () => {
  if (!hasPreviousVersion.value || !dictionary.value) return
  const idx = siblingDictionaries.value.indexOf(dictionary.value.file_name)
  const prevFile = siblingDictionaries.value[idx - 1]
  router.push(`/dictionaries/${prevFile}`)
}

const navigateToNextVersion = () => {
  if (!hasNextVersion.value || !dictionary.value) return
  const idx = siblingDictionaries.value.indexOf(dictionary.value.file_name)
  const nextFile = siblingDictionaries.value[idx + 1]
  router.push(`/dictionaries/${nextFile}`)
}

// Computed disabled state - read-only mode OR locked
const isDisabled = computed(() => isReadOnly.value || (dictionary.value?._locked || false))

// Schema download helpers
const parseBlobEvent = async (blob: Blob): Promise<any | null> => {
  try {
    const text = await blob.text()
    const eventData = JSON.parse(text)
    if (eventData.id && eventData.type && eventData.status) return eventData
  } catch {
    /* not valid JSON or not an event structure */
  }
  return null
}

const downloadJsonSchema = async () => {
  if (!configFileName.value) return
  const { showEvent, showError } = useEvents()
  try {
    const blob = await apiService.downloadJsonSchema(configFileName.value, configVersion.value)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${configFileName.value}_${configVersion.value}_json_schema.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (err: any) {
    if (err.response?.data instanceof Blob) {
      const eventData = await parseBlobEvent(err.response.data)
      if (eventData) showEvent(eventData, 'JSON Schema Generation Error', 'Failed to generate JSON schema')
      else showError('Failed to download JSON schema', 'JSON Schema Generation Error')
    } else {
      showError(err.message || 'Failed to download JSON schema', 'JSON Schema Generation Error')
    }
  }
}

const downloadBsonSchema = async () => {
  if (!configFileName.value) return
  const { showEvent, showError } = useEvents()
  try {
    const blob = await apiService.downloadBsonSchema(configFileName.value, configVersion.value)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${configFileName.value}_${configVersion.value}_bson_schema.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (err: any) {
    if (err.response?.data instanceof Blob) {
      const eventData = await parseBlobEvent(err.response.data)
      if (eventData) showEvent(eventData, 'BSON Schema Generation Error', 'Failed to generate BSON schema')
      else showError('Failed to download BSON schema', 'BSON Schema Generation Error')
    } else {
      showError(err.message || 'Failed to download BSON schema', 'BSON Schema Generation Error')
    }
  }
}

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

const loadSiblingDictionaries = async (fileName: string) => {
  const parsed = parseDictionaryFileName(fileName)
  if (!parsed) {
    siblingDictionaries.value = [fileName]
    return
  }
  try {
    const allDicts = await apiService.getDictionaries()
    const sameCollection = (allDicts || [])
      .filter((f: { file_name: string }) => f.file_name.startsWith(`${parsed.collection}.`) && f.file_name.endsWith('.yaml'))
      .map((f: { file_name: string }) => f.file_name)
    // Sort by version (major.minor.patch)
    sameCollection.sort((a: string, b: string) => {
      const va = parseDictionaryFileName(a)?.version ?? ''
      const vb = parseDictionaryFileName(b)?.version ?? ''
      const [ma, mia, pa] = va.split('.').map(Number)
      const [mb, mib, pb] = vb.split('.').map(Number)
      if (ma !== mb) return ma - mb
      if (mia !== mib) return mia - mib
      return pa - pb
    })
    siblingDictionaries.value = sameCollection
  } catch {
    siblingDictionaries.value = [fileName]
  }
}

const loadDictionary = async () => {
  loading.value = true
  error.value = null
  
  try {
    const fileName = route.params.fileName as string
    dictionary.value = await apiService.getDictionary(fileName)
    await loadSiblingDictionaries(fileName)
    
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

// Handle page unload - blur active inputs to trigger save handlers
const handleBeforeUnload = () => {
  // Blur the active element if it's an input to trigger save handlers
  const activeElement = document.activeElement
  if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
    ;(activeElement as HTMLElement).blur()
  }
}

// Load dictionary on mount and when route changes
onMounted(() => {
  loadDictionary()
  window.addEventListener('beforeunload', handleBeforeUnload)
})

watch(() => route.params.fileName, (newFileName) => {
  if (newFileName) loadDictionary()
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<style scoped>
.dictionary-header {
  min-width: 0;
}

.dictionary-name {
  min-width: 0;
}

.cursor-pointer {
  cursor: pointer;
}

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
  display: flex;
}

.root-description-input {
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
  min-width: 0;
  overflow: visible;
  text-overflow: clip;
}

.root-description-input :deep(input)::placeholder {
  color: rgba(255, 255, 255, 0.7) !important;
  opacity: 1 !important;
  font-style: italic;
}

/* Allow description field to expand without truncation */
.root-description-input :deep(.v-field) {
  flex: 1;
  min-width: 0;
}
</style> 