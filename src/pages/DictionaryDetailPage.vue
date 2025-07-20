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
        <div class="flex-grow-1">
          <!-- Editable Title -->
          <div class="mb-2">
            <!-- View Mode -->
            <h1 
              v-if="!editingTitle" 
              class="text-h4 clickable-title"
              @click="startEditTitle"
            >
              {{ dictionary.title || dictionary.file_name.replace('.yaml', '') }}
            </h1>
            <!-- Edit Mode -->
            <v-text-field
              v-else
              v-model="dictionary.title"
              variant="outlined"
              density="compact"
              class="text-h4"
              :disabled="dictionary._locked"
              @update:model-value="autoSave"
              @blur="stopEditTitle"
              @keyup.enter="stopEditTitle"
              @keyup.esc="cancelEditTitle"
              ref="titleField"
              hide-details
              autofocus
            />
          </div>

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
            v-if="dictionary._locked"
            color="warning"
            variant="elevated"
            @click="showUnlockDialog = true"
            class="mr-2 font-weight-bold"
          >
            <v-icon start>mdi-lock-open</v-icon>
            Unlock
          </v-btn>
          <v-btn
            v-else
            color="info"
            variant="elevated"
            @click="lockDictionary"
            class="mr-2 font-weight-bold"
          >
            <v-icon start>mdi-lock</v-icon>
            Lock
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            @click="showDeleteDialog = true"
            class="mr-2 font-weight-bold"
          >
            <v-icon start>mdi-delete</v-icon>
            Delete
          </v-btn>
        </div>
      </div>

      <!-- Object Type Card (Properties) -->
      <BaseCard 
        v-if="isObjectType()"
        title="Properties"
        icon="mdi-cube-outline"
      >
        <template #title>
          <div class="d-flex align-center">
            <span class="text-h6 text-white mr-2">{{ dictionary.file_name.replace('.yaml', '') }}</span>
            <!-- Object Description (edit-in-place) -->
            <span 
              v-if="!editingDescription"
              class="text-h6 text-white clickable-description"
              @click="startEditDescription"
            >
              {{ dictionary.root.description || 'No description provided' }}
            </span>
            <!-- Edit Mode -->
            <v-text-field
              v-else
              v-model="descriptionValue"
              variant="outlined"
              density="compact"
              class="text-h6 text-white flex-grow-1"
              :disabled="dictionary._locked"
              @blur="stopEditDescription"
              @keyup.enter="stopEditDescription"
              @keyup.esc="cancelEditDescription"
              ref="descriptionField"
              hide-details
              autofocus
              style="min-width: 200px;"
            />
          </div>
        </template>
        
        <template #header-actions>
          <!-- Object Type Picker -->
          <div class="mr-2" style="min-width: 120px;">
            <DictionaryTypePicker
              v-model="typeValue"
              label="Type"
              density="compact"
              :disabled="dictionary._locked"
              :exclude-type="dictionary.file_name"
              class="items-type-picker"
            />
          </div>
          <!-- Required Icon -->
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-btn
                icon
                size="x-small"
                variant="text"
                :color="dictionary.root.required ? 'primary' : 'grey'"
                :disabled="dictionary._locked"
                v-bind="props"
                @click="dictionary.root.required = !dictionary.root.required; autoSave()"
                class="pa-0 ma-0 mr-2"
              >
                <v-icon size="16">mdi-star</v-icon>
              </v-btn>
            </template>
            <span>Required</span>
          </v-tooltip>
          <!-- Additional Properties Icon -->
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-btn
                icon
                size="x-small"
                variant="text"
                :color="dictionary.root.additionalProperties ? 'primary' : 'grey'"
                :disabled="dictionary._locked"
                v-bind="props"
                @click="dictionary.root.additionalProperties = !dictionary.root.additionalProperties; autoSave()"
                class="pa-0 ma-0 mr-2"
              >
                <v-icon size="16">mdi-plus-circle</v-icon>
              </v-btn>
            </template>
            <span>Additional Properties</span>
          </v-tooltip>
          <!-- Add Property Button -->
          <v-btn
            color="success"
            variant="elevated"
            size="small"
            @click="addProperty"
            :disabled="dictionary._locked"
            class="font-weight-bold"
          >
            <v-icon start size="small">mdi-plus</v-icon>
            Add Property
          </v-btn>
        </template>
        
        <DictionaryProperty
          property-name="root"
          :property="dictionary.root"
          :disabled="dictionary._locked"
          :exclude-type="dictionary.file_name"
          :top-level="true"
          :top-level-name="dictionary.file_name.replace('.yaml', '')"
          :hide-top-level-row="true"
          :hide-properties-header="true"
          @change="handleTopLevelPropertyChange"
        />
      </BaseCard>

      <!-- Array Type Card (Items) -->
      <BaseCard 
        v-if="isListType()"
        title="Items"
        icon="mdi-format-list-bulleted"
      >
        <template #title>
          <div class="d-flex align-center">
            <span class="text-h6 text-white mr-2">Items</span>
            <!-- View Mode -->
            <span 
              v-if="!editingItemsDescription"
              class="text-h6 text-white clickable-description"
              @click="startEditItemsDescription"
            >
              {{ descriptionValue || 'No items description provided' }}
            </span>
            <!-- Edit Mode -->
            <v-text-field
              v-else
              v-model="descriptionValue"
              variant="outlined"
              density="compact"
              class="text-h6 text-white flex-grow-1"
              :disabled="dictionary._locked"
              @blur="stopEditItemsDescription"
              @keyup.enter="stopEditItemsDescription"
              @keyup.esc="cancelEditItemsDescription"
              ref="itemsDescriptionField"
              hide-details
              autofocus
              style="min-width: 200px;"
            />
          </div>
        </template>
        
        <template #header-actions>
          <!-- Items Type Picker -->
          <div class="mr-2" style="min-width: 120px;">
            <DictionaryTypePicker
              v-model="typeValue"
              label="Items Type"
              density="compact"
              :disabled="dictionary._locked"
              :exclude-type="dictionary.file_name"
              class="items-type-picker"
            />
          </div>
          <!-- Required Icon for Items -->
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-btn
                icon
                size="x-small"
                variant="text"
                :color="dictionary.root.items?.required ? 'primary' : 'grey'"
                :disabled="dictionary._locked"
                v-bind="props"
                @click="toggleItemsRequired"
                class="pa-0 ma-0 mr-2"
              >
                <v-icon size="16">mdi-star</v-icon>
              </v-btn>
            </template>
            <span>Required</span>
          </v-tooltip>
        </template>
        
        <!-- Content for enum and enum_array types -->
        <div v-if="isEnumType()" class="pa-1">
          <div class="d-flex align-center mb-3">
            <span class="text-h6 font-weight-bold mr-3">Enum:</span>
            <EnumPicker
              v-model="enumValue"
              label="Select Enum"
              density="compact"
              :disabled="dictionary._locked"
              class="flex-grow-1"
            />
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Unlock Dialog -->
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

    <!-- Delete Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title>Delete Dictionary?</v-card-title>
        <v-card-text>
          This action cannot be undone. Are you sure you want to delete this dictionary?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="deleteDictionary">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiService } from '@/utils/api'
import DictionaryProperty from '@/components/DictionaryProperty.vue'
import DictionaryTypePicker from '@/components/DictionaryTypePicker.vue'
import BaseCard from '@/components/BaseCard.vue'
import EnumPicker from '@/components/EnumPicker.vue'

interface DictionaryProperty {
  description: string
  type: string
  required: boolean
  enums?: string
  ref?: string
  properties?: Record<string, DictionaryProperty>
  items?: DictionaryProperty
  additionalProperties?: boolean
}

interface Dictionary {
  file_name: string
  title?: string
  description?: string
  _locked: boolean
  root: DictionaryProperty
}

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const dictionary = ref<Dictionary | null>(null)

// Edit mode states
const editingTitle = ref(false)
const editingDescription = ref(false)
const editingItemsDescription = ref(false)
const titleField = ref<any>(null)
const descriptionField = ref<any>(null)
const itemsDescriptionField = ref<any>(null)

// Dialog states
const showUnlockDialog = ref(false)
const showDeleteDialog = ref(false)

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

// Helper function to check if root is object type
const isObjectType = () => {
  return dictionary.value?.root.type === 'object'
}

// Helper function to check if root is list type
const isListType = () => {
  return dictionary.value?.root.type === 'list' || dictionary.value?.root.type === 'array'
}

// Helper function to check if items type is enum
const isEnumType = () => {
  return dictionary.value?.root.items?.type === 'enum' || dictionary.value?.root.items?.type === 'enum_array'
}

// Computed property for description field
const descriptionValue = computed({
  get: () => {
    if (!dictionary.value) return ''
    return isListType() 
      ? (dictionary.value.root.items?.description || '')
      : (dictionary.value.root.description || '')
  },
  set: (value: string) => {
    if (!dictionary.value) return
    if (isListType()) {
      if (!dictionary.value.root.items) {
        dictionary.value.root.items = { description: '', type: 'string', required: false }
      }
      dictionary.value.root.items.description = value
    } else {
      dictionary.value.root.description = value
    }
    autoSave()
  }
})

// Computed property for type field
const typeValue = computed({
  get: () => {
    if (!dictionary.value) return ''
    return isListType() 
      ? (dictionary.value.root.items?.type || 'string')
      : (dictionary.value.root.type || 'string')
  },
  set: (value: string) => {
    if (!dictionary.value) return
    if (isListType()) {
      if (!dictionary.value.root.items) {
        dictionary.value.root.items = { description: '', type: 'string', required: false }
      }
      dictionary.value.root.items.type = value
    } else {
      dictionary.value.root.type = value
    }
    autoSave()
  }
})

// Computed property for enum field
const enumValue = computed({
  get: () => {
    if (!dictionary.value) return ''
    return dictionary.value.root.items?.enums || ''
  },
  set: (value: string) => {
    if (!dictionary.value) return
    if (!dictionary.value.root.items) {
      dictionary.value.root.items = { description: '', type: 'string', required: false }
    }
    dictionary.value.root.items.enums = value
    autoSave()
  }
})


// Edit mode functions
const startEditTitle = () => {
  if (dictionary.value?._locked) return
  editingTitle.value = true
  nextTick(() => {
    titleField.value.focus()
  })
}

const stopEditTitle = () => {
  editingTitle.value = false
  autoSave()
}

const cancelEditTitle = () => {
  editingTitle.value = false
}

const startEditDescription = () => {
  if (dictionary.value?._locked) return
  editingDescription.value = true
  nextTick(() => {
    descriptionField.value.focus()
  })
}

const stopEditDescription = () => {
  editingDescription.value = false
  autoSave()
}

const cancelEditDescription = () => {
  editingDescription.value = false
}

const startEditItemsDescription = () => {
  if (dictionary.value?._locked) return
  editingItemsDescription.value = true
  nextTick(() => {
    itemsDescriptionField.value.focus()
  })
}

const stopEditItemsDescription = () => {
  editingItemsDescription.value = false
  autoSave()
}

const cancelEditItemsDescription = () => {
  editingItemsDescription.value = false
}

// Lock/unlock functionality
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

// Delete functionality
const deleteDictionary = async () => {
  if (!dictionary.value) return
  
  try {
    await apiService.deleteDictionary(dictionary.value.file_name)
    showDeleteDialog.value = false
    router.push('/dictionaries')
  } catch (err: any) {
    error.value = err.message || 'Failed to delete dictionary'
    console.error('Failed to delete dictionary:', err)
  }
}

const handleTopLevelPropertyChange = (updated: any) => {
  if (!dictionary.value) return
  // Update the root property with the changes
  dictionary.value.root = updated
  autoSave()
}

// Add property function
const addProperty = () => {
  if (!dictionary.value || dictionary.value._locked) return
  
  if (!dictionary.value.root.properties) {
    dictionary.value.root.properties = {}
  }
  
  // Generate a default property name
  const propertyName = `property_${Object.keys(dictionary.value.root.properties).length + 1}`
  
  dictionary.value.root.properties[propertyName] = {
    description: '',
    type: 'string',
    required: false
  }
  
  autoSave()
}

// Toggle items required function
const toggleItemsRequired = () => {
  if (!dictionary.value || dictionary.value._locked) return
  
  if (!dictionary.value.root.items) {
    dictionary.value.root.items = { description: '', type: 'string', required: false }
  }
  
  dictionary.value.root.items.required = !dictionary.value.root.items.required
  autoSave()
}

// Load dictionary on mount
onMounted(() => {
  loadDictionary()
})
</script>

<style scoped>
.clickable-title {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.clickable-title:hover {
  background-color: rgba(46, 125, 50, 0.04);
  border-radius: 4px;
  padding: 4px;
  margin: -4px;
}

.clickable-description {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.clickable-description:hover {
  background-color: rgba(46, 125, 50, 0.04);
  border-radius: 4px;
  padding: 4px;
  margin: -4px;
}

/* Items description field styling */
.items-description-field :deep(.v-field__outline) {
  border-color: rgba(0, 0, 0, 0.6) !important;
}

.items-description-field :deep(.v-field__outline--focused) {
  border-color: rgb(76, 175, 80) !important;
}

/* Items type picker styling for better contrast */
.items-type-picker :deep(.v-chip) {
  background-color: white !important;
  color: black !important;
  border-color: black !important;
}

.items-type-picker :deep(.v-chip__content) {
  color: black !important;
}

.items-type-picker :deep(.v-chip__prepend) {
  color: black !important;
}
</style> 