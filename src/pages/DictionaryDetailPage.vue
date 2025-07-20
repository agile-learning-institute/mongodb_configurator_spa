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

      <!-- Unified Dictionary Card -->
      <DictionaryTypeCard
        :name="dictionary.file_name.replace('.yaml', '')"
        :description="descriptionValue"
        :model-value="typeValue"
        :icon="getCardIcon()"
        :is-sub-card="false"
        :disabled="dictionary._locked"
        :exclude-type="dictionary.file_name"
        :disable-name-editing="true"
        @update:description="descriptionValue = $event"
        @update:model-value="typeValue = $event"
      >
        <template #extra>
          <!-- Items Type Picker (for array types) -->
          <div v-if="isListType()" class="d-flex align-center mr-3">
            <span class="text-white mr-2">Items Type:</span>
            <DictionaryTypePicker
              :model-value="dictionary.root.items?.type || 'string'"
              @update:model-value="(value) => { 
                if (dictionary?.root?.items) {
                  dictionary.root.items.type = value
                } else if (dictionary?.root) {
                  dictionary.root.items = { description: 'Items in the list', type: value, required: false }
                }
                autoSave()
              }"
              label="Type"
              density="compact"
              :disabled="dictionary._locked"
              :exclude-type="dictionary.file_name"
              class="flex-grow-1"
              style="min-width: 150px;"
            />
          </div>
          <!-- Items Enumerators Picker (for array types with enum items) -->
          <div v-if="isListType() && (dictionary.root.items?.type === 'enum' || dictionary.root.items?.type === 'enum_array')" class="d-flex align-center mr-3">
            <span class="text-white mr-2">Enumerators:</span>
            <EnumPicker
              v-model="dictionary.root.items.enums"
              label="Select Enum"
              density="compact"
              :disabled="dictionary._locked"
              class="flex-grow-1"
              style="min-width: 150px;"
            />
          </div>
          <!-- Items Add Property Button (for array types with object items) -->
          <div v-if="isListType() && dictionary.root.items?.type === 'object'" class="d-flex align-center mr-3">
            <v-btn
              color="success"
              variant="elevated"
              size="small"
              @click="addArrayItemProperty"
              :disabled="dictionary._locked"
              class="font-weight-bold"
            >
              <v-icon start size="small">mdi-plus</v-icon>
              Add Property
            </v-btn>
          </div>
          <!-- Enum Picker (for enum types) -->
          <div v-if="isEnumType()" class="d-flex align-center mr-3">
            <span class="text-white mr-2">Enumerators:</span>
            <EnumPicker
              v-model="dictionary.root.enums"
              label="Select Enum"
              density="compact"
              :disabled="dictionary._locked"
              class="flex-grow-1"
              style="min-width: 150px;"
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
          <!-- Additional Properties Icon (for objects) -->
          <v-tooltip v-if="isObjectType()" location="top">
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
          <!-- Add Property Button (for objects) -->
          <v-btn
            v-if="isObjectType()"
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
        
        <!-- Content based on type -->
        <template #content>
          <!-- Object Type Content -->
          <div v-if="isObjectType()" class="pa-1">
            <DictionaryTypeCard
              v-for="(property, propertyName) in dictionary.root.properties"
              :key="propertyName"
              :name="propertyName"
              :description="property.description"
              :model-value="property.type"
              @update:model-value="(value) => { 
                property.type = value; 
                // Initialize type-specific properties
                if (value === 'array' || value === 'list') {
                  if (!property.items) {
                    property.items = { description: 'Items in the list', type: 'string', required: false }
                  }
                } else if (value === 'object') {
                  if (!property.properties) {
                    property.properties = {}
                  }
                } else if (value === 'enum' || value === 'enum_array') {
                  if (!property.enums) {
                    property.enums = ''
                  }
                }
                autoSave() 
              }"
              @update:name="(value) => { 
                if (value && value !== propertyName && dictionary?.root?.properties) {
                  const newProperties = { ...dictionary.root.properties }
                  delete newProperties[propertyName]
                  newProperties[value] = property
                  dictionary.root.properties = newProperties
                  autoSave()
                }
              }"
              @update:description="(value) => { property.description = value; autoSave() }"
              :icon="getPropertyIcon(property.type)"
              :is-sub-card="true"
              :disabled="dictionary._locked"
              :exclude-type="dictionary.file_name"
            >
              <template #extra>
                <!-- Add Property Button (for object types) -->
                <v-btn
                  v-if="property.type === 'object'"
                  color="success"
                  variant="elevated"
                  size="small"
                  @click="addSubProperty(propertyName)"
                  :disabled="dictionary._locked"
                  class="font-weight-bold mr-3"
                >
                  <v-icon start size="small">mdi-plus</v-icon>
                  Add Property
                </v-btn>
                <!-- Items Type Picker (only for array types) -->
                <div v-if="property.type === 'array' || property.type === 'list'" class="d-flex align-center mr-3">
                  <span class="text-dark mr-2">Items Type:</span>
                  <DictionaryTypePicker
                    :model-value="property.items?.type || 'string'"
                    @update:model-value="(value) => { 
                      if (property.items) {
                        property.items.type = value
                      } else {
                        property.items = { description: 'Items in the list', type: value, required: false }
                      }
                      autoSave()
                    }"
                    label="Type"
                    density="compact"
                    :disabled="dictionary._locked"
                    :exclude-type="dictionary.file_name"
                    class="flex-grow-1"
                    style="min-width: 150px;"
                  />
                </div>
                <!-- Items Enumerators Picker (only for array types with enum items) -->
                <div v-if="(property.type === 'array' || property.type === 'list') && (property.items?.type === 'enum' || property.items?.type === 'enum_array')" class="d-flex align-center mr-3">
                  <span class="text-dark mr-2">Enumerators:</span>
                  <EnumPicker
                    v-model="property.items.enums"
                    label="Select Enum"
                    density="compact"
                    :disabled="dictionary._locked"
                    class="flex-grow-1"
                    style="min-width: 150px;"
                  />
                </div>
                <!-- Items Add Property Button (only for array types with object items) -->
                <div v-if="(property.type === 'array' || property.type === 'list') && property.items?.type === 'object'" class="d-flex align-center mr-3">
                  <v-btn
                    color="success"
                    variant="elevated"
                    size="small"
                    @click="addArraySubItemProperty(propertyName)"
                    :disabled="dictionary._locked"
                    class="font-weight-bold"
                  >
                    <v-icon start size="small">mdi-plus</v-icon>
                    Add Property
                  </v-btn>
                </div>
                <!-- Enum Picker (only for enum types) -->
                <div v-if="property.type === 'enum' || property.type === 'enum_array'" class="d-flex align-center mr-3">
                  <span class="text-dark mr-2">Enumerators:</span>
                  <EnumPicker
                    v-model="property.enums"
                    label="Select Enum"
                    density="compact"
                    :disabled="dictionary._locked"
                    class="flex-grow-1"
                    style="min-width: 150px;"
                  />
                </div>
              </template>
              
              <template #actions>
                <!-- Required Icon -->
                <v-tooltip location="top">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      icon
                      size="x-small"
                      variant="text"
                      :color="property.required ? 'primary' : 'grey'"
                      :disabled="dictionary._locked"
                      v-bind="props"
                      @click="property.required = !property.required; autoSave()"
                      class="pa-0 ma-0 mr-2"
                    >
                      <v-icon size="16">mdi-star</v-icon>
                    </v-btn>
                  </template>
                  <span>Required</span>
                </v-tooltip>
                <!-- Delete Button -->
                <v-tooltip location="top">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      icon
                      size="x-small"
                      variant="text"
                      color="error"
                      :disabled="dictionary._locked"
                      v-bind="props"
                      @click="deleteProperty(propertyName)"
                      class="pa-0 ma-0"
                    >
                      <v-icon size="16">mdi-delete</v-icon>
                    </v-btn>
                  </template>
                  <span>Delete Property</span>
                </v-tooltip>
              </template>
              
              <template #content>
                <!-- Only show content for object properties -->
                <div v-if="isPropertyObjectType(property)" class="pa-1">
                  <!-- Recursive object properties -->
                  <div v-if="!property.properties || Object.keys(property.properties).length === 0" class="text-center pa-4">
                    <v-icon size="32" color="grey">mdi-cube-outline</v-icon>
                    <div class="text-body-2 text-medium-emphasis mt-2">No properties defined</div>
                  </div>
                  
                  <div v-else>
                    <DictionaryTypeCard
                      v-for="(subProperty, subPropertyName) in property.properties"
                      :key="subPropertyName"
                      :name="subPropertyName"
                      :description="subProperty.description"
                      :model-value="subProperty.type"
                      @update:model-value="(value) => { 
                        subProperty.type = value; 
                        // Initialize type-specific properties
                        if (value === 'array' || value === 'list') {
                          if (!subProperty.items) {
                            subProperty.items = { description: 'Items in the list', type: 'string', required: false }
                          }
                        } else if (value === 'object') {
                          if (!subProperty.properties) {
                            subProperty.properties = {}
                          }
                        } else if (value === 'enum' || value === 'enum_array') {
                          if (!subProperty.enums) {
                            subProperty.enums = ''
                          }
                        }
                        autoSave() 
                      }"
                      @update:name="(value) => { 
                        if (value && value !== subPropertyName && property?.properties) {
                          const newProperties = { ...property.properties }
                          delete newProperties[subPropertyName]
                          newProperties[value] = subProperty
                          property.properties = newProperties
                          autoSave()
                        }
                      }"
                      @update:description="(value) => { subProperty.description = value; autoSave() }"
                      :icon="getPropertyIcon(subProperty.type)"
                      :is-sub-card="true"
                      :disabled="dictionary._locked"
                      :exclude-type="dictionary.file_name"
                    >
                      <template #extra>
                        <!-- Items Type Picker (only for array types) -->
                        <div v-if="subProperty.type === 'array' || subProperty.type === 'list'" class="d-flex align-center mr-3">
                          <span class="text-dark mr-2">Items Type:</span>
                          <DictionaryTypePicker
                            :model-value="subProperty.items?.type || 'string'"
                            @update:model-value="(value) => { 
                              if (subProperty.items) {
                                subProperty.items.type = value
                              } else {
                                subProperty.items = { description: 'Items in the list', type: value, required: false }
                              }
                              autoSave()
                            }"
                            label="Type"
                            density="compact"
                            :disabled="dictionary._locked"
                            :exclude-type="dictionary.file_name"
                            class="flex-grow-1"
                            style="min-width: 150px;"
                          />
                        </div>
                        <!-- Items Enumerators Picker (only for array types with enum items) -->
                        <div v-if="(subProperty.type === 'array' || subProperty.type === 'list') && (subProperty.items?.type === 'enum' || subProperty.items?.type === 'enum_array')" class="d-flex align-center mr-3">
                          <span class="text-dark mr-2">Enumerators:</span>
                          <EnumPicker
                            v-model="subProperty.items.enums"
                            label="Select Enum"
                            density="compact"
                            :disabled="dictionary._locked"
                            class="flex-grow-1"
                            style="min-width: 150px;"
                          />
                        </div>
                        <!-- Items Add Property Button (only for array types with object items) -->
                        <div v-if="(subProperty.type === 'array' || subProperty.type === 'list') && subProperty.items?.type === 'object'" class="d-flex align-center mr-3">
                          <v-btn
                            color="success"
                            variant="elevated"
                            size="small"
                            @click="addArraySubSubItemProperty(propertyName, subPropertyName)"
                            :disabled="dictionary._locked"
                            class="font-weight-bold"
                          >
                            <v-icon start size="small">mdi-plus</v-icon>
                            Add Property
                          </v-btn>
                        </div>
                        <!-- Enum Picker (only for enum types) -->
                        <div v-if="subProperty.type === 'enum' || subProperty.type === 'enum_array'" class="d-flex align-center mr-3">
                          <span class="text-dark mr-2">Enumerators:</span>
                          <EnumPicker
                            v-model="subProperty.enums"
                            label="Select Enum"
                            density="compact"
                            :disabled="dictionary._locked"
                            class="flex-grow-1"
                            style="min-width: 150px;"
                          />
                        </div>
                      </template>
                      
                      <template #actions>
                        <!-- Required Icon -->
                        <v-tooltip location="top">
                          <template v-slot:activator="{ props }">
                            <v-btn
                              icon
                              size="x-small"
                              variant="text"
                              :color="subProperty.required ? 'primary' : 'grey'"
                              :disabled="dictionary._locked"
                              v-bind="props"
                              @click="subProperty.required = !subProperty.required; autoSave()"
                              class="pa-0 ma-0 mr-2"
                            >
                              <v-icon size="16">mdi-star</v-icon>
                            </v-btn>
                          </template>
                          <span>Required</span>
                        </v-tooltip>
                        <!-- Delete Button -->
                        <v-tooltip location="top">
                          <template v-slot:activator="{ props }">
                            <v-btn
                              icon
                              size="x-small"
                              variant="text"
                              color="error"
                              :disabled="dictionary._locked"
                              v-bind="props"
                              @click="deleteSubProperty(propertyName, subPropertyName)"
                              class="pa-0 ma-0"
                            >
                              <v-icon size="16">mdi-delete</v-icon>
                            </v-btn>
                          </template>
                          <span>Delete Property</span>
                        </v-tooltip>
                      </template>
                    </DictionaryTypeCard>
                  </div>
                </div>
              </template>
            </DictionaryTypeCard>
          </div>
          
          <!-- Array Type Content (for object items) -->
          <div v-if="isListType() && dictionary.root.items?.type === 'object'" class="pa-1">
            <!-- Array items properties -->
            <div v-if="!dictionary.root.items.properties || Object.keys(dictionary.root.items.properties).length === 0" class="text-center pa-4">
              <v-icon size="32" color="grey">mdi-cube-outline</v-icon>
              <div class="text-body-2 text-medium-emphasis mt-2">No item properties defined</div>
            </div>
            
            <div v-else>
              <DictionaryTypeCard
                v-for="(itemProperty, itemPropertyName) in dictionary.root.items.properties"
                :key="itemPropertyName"
                :name="itemPropertyName"
                :description="itemProperty.description"
                :model-value="itemProperty.type"
                @update:model-value="(value) => { 
                  itemProperty.type = value; 
                  // Initialize type-specific properties
                  if (value === 'array' || value === 'list') {
                    if (!itemProperty.items) {
                      itemProperty.items = { description: 'Items in the list', type: 'string', required: false }
                    }
                  } else if (value === 'object') {
                    if (!itemProperty.properties) {
                      itemProperty.properties = {}
                    }
                  } else if (value === 'enum' || value === 'enum_array') {
                    if (!itemProperty.enums) {
                      itemProperty.enums = ''
                    }
                  }
                  autoSave() 
                }"
                @update:name="(value) => { 
                  if (value && value !== itemPropertyName && dictionary?.root?.items?.properties) {
                    const newProperties = { ...dictionary.root.items.properties }
                    delete newProperties[itemPropertyName]
                    newProperties[value] = itemProperty
                    dictionary.root.items.properties = newProperties
                    autoSave()
                  }
                }"
                @update:description="(value) => { itemProperty.description = value; autoSave() }"
                :icon="getPropertyIcon(itemProperty.type)"
                :is-sub-card="true"
                :disabled="dictionary._locked"
                :exclude-type="dictionary.file_name"
              >
                <template #extra>
                  <!-- Items Type Picker (only for array types) -->
                  <div v-if="itemProperty.type === 'array' || itemProperty.type === 'list'" class="d-flex align-center mr-3">
                    <span class="text-dark mr-2">Items Type:</span>
                    <DictionaryTypePicker
                      :model-value="itemProperty.items?.type || 'string'"
                      @update:model-value="(value) => { 
                        if (itemProperty.items) {
                          itemProperty.items.type = value
                        } else {
                          itemProperty.items = { description: 'Items in the list', type: value, required: false }
                        }
                        autoSave()
                      }"
                      label="Type"
                      density="compact"
                      :disabled="dictionary._locked"
                      :exclude-type="dictionary.file_name"
                      class="flex-grow-1"
                      style="min-width: 150px;"
                    />
                  </div>
                  <!-- Items Enumerators Picker (only for array types with enum items) -->
                  <div v-if="(itemProperty.type === 'array' || itemProperty.type === 'list') && (itemProperty.items?.type === 'enum' || itemProperty.items?.type === 'enum_array')" class="d-flex align-center mr-3">
                    <span class="text-dark mr-2">Enumerators:</span>
                    <EnumPicker
                      v-model="itemProperty.items.enums"
                      label="Select Enum"
                      density="compact"
                      :disabled="dictionary._locked"
                      class="flex-grow-1"
                      style="min-width: 150px;"
                    />
                  </div>
                  <!-- Enum Picker (only for enum types) -->
                  <div v-if="itemProperty.type === 'enum' || itemProperty.type === 'enum_array'" class="d-flex align-center mr-3">
                    <span class="text-dark mr-2">Enumerators:</span>
                    <EnumPicker
                      v-model="itemProperty.enums"
                      label="Select Enum"
                      density="compact"
                      :disabled="dictionary._locked"
                      class="flex-grow-1"
                      style="min-width: 150px;"
                    />
                  </div>
                </template>
                
                <template #actions>
                  <!-- Required Icon -->
                  <v-tooltip location="top">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        icon
                        size="x-small"
                        variant="text"
                        :color="itemProperty.required ? 'primary' : 'grey'"
                        :disabled="dictionary._locked"
                        v-bind="props"
                        @click="itemProperty.required = !itemProperty.required; autoSave()"
                        class="pa-0 ma-0 mr-2"
                      >
                        <v-icon size="16">mdi-star</v-icon>
                      </v-btn>
                    </template>
                    <span>Required</span>
                  </v-tooltip>
                  <!-- Delete Button -->
                  <v-tooltip location="top">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        icon
                        size="x-small"
                        variant="text"
                        color="error"
                        :disabled="dictionary._locked"
                        v-bind="props"
                        @click="deleteArrayItemProperty(itemPropertyName)"
                        class="pa-0 ma-0"
                      >
                        <v-icon size="16">mdi-delete</v-icon>
                      </v-btn>
                    </template>
                    <span>Delete Property</span>
                  </v-tooltip>
                </template>
              </DictionaryTypeCard>
            </div>
          </div>
        </template>
      </DictionaryTypeCard>
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
import EnumPicker from '@/components/EnumPicker.vue'
import DictionaryTypeCard from '@/components/DictionaryTypeCard.vue'
import DictionaryTypePicker from '@/components/DictionaryTypePicker.vue'

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
const titleField = ref<any>(null)

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

// Helper function to check if root is enum type
const isEnumType = () => {
  return dictionary.value?.root.type === 'enum' || dictionary.value?.root.type === 'enum_array'
}

// Helper function to get card icon based on type
const getCardIcon = () => {
  if (!dictionary.value) return 'mdi-cube-outline'
  if (isObjectType()) return 'mdi-cube-outline'
  if (isListType()) return 'mdi-format-list-bulleted'
  if (isEnumType()) return 'mdi-format-list-checks'
  return 'mdi-cube-outline'
}

// Helper function to get icon based on property type
const getPropertyIcon = (type: string) => {
  if (type === 'object') return 'mdi-cube-outline'
  if (type === 'list' || type === 'array') return 'mdi-format-list-bulleted'
  if (type === 'enum' || type === 'enum_array') return 'mdi-format-list-checks'
  return 'mdi-shape'
}

// Helper function to check if property is object type
const isPropertyObjectType = (property: DictionaryProperty) => {
  return property.type === 'object'
}

// Computed property for description field
const descriptionValue = computed({
  get: () => {
    if (!dictionary.value) return ''
    if (isListType()) {
      return dictionary.value.root.items?.description || ''
    }
    return dictionary.value.root.description || ''
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
    return dictionary.value.root.type || 'string'
  },
  set: (value: string) => {
    if (!dictionary.value) return
    dictionary.value.root.type = value
    
    // Ensure items property exists for array/list types
    if (value === 'array' || value === 'list') {
      if (!dictionary.value.root.items) {
        dictionary.value.root.items = { description: '', type: 'string', required: false }
      }
    }
    
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

// Delete property function
const deleteProperty = (propertyName: string) => {
  if (!dictionary.value || dictionary.value._locked) return
  
  if (dictionary.value.root.properties) {
    delete dictionary.value.root.properties[propertyName]
    autoSave()
  }
}

// Add sub-property function
const addSubProperty = (propertyName: string) => {
  if (!dictionary.value || dictionary.value._locked) return
  
  const property = dictionary.value?.root.properties?.[propertyName]
  if (!property) return

  if (!property.properties) {
    property.properties = {}
  }
  
  // Generate a default sub-property name
  const subPropertyName = `sub_property_${Object.keys(property.properties).length + 1}`
  
  property.properties[subPropertyName] = {
    description: '',
    type: 'string',
    required: false
  }
  
  autoSave()
}

// Delete sub-property function
const deleteSubProperty = (propertyName: string, subPropertyName: string) => {
  if (!dictionary.value || dictionary.value._locked) return
  
  const property = dictionary.value?.root.properties?.[propertyName]
  if (!property) return

  if (property.properties) {
    delete property.properties[subPropertyName]
    autoSave()
  }
}

// Add property to array items (for object items)
const addArrayItemProperty = () => {
  if (!dictionary.value || dictionary.value._locked) return
  
  const itemsProperty = dictionary.value?.root.items
  if (!itemsProperty || itemsProperty.type !== 'object') return

  if (!itemsProperty.properties) {
    itemsProperty.properties = {}
  }
  
  // Generate a default sub-property name
  const subPropertyName = `item_property_${Object.keys(itemsProperty.properties).length + 1}`
  
  itemsProperty.properties[subPropertyName] = {
    description: '',
    type: 'string',
    required: false
  }
  
  autoSave()
}

// Add sub-property to array items (for object items)
const addArraySubItemProperty = (propertyName: string) => {
  if (!dictionary.value || dictionary.value._locked) return
  
  const property = dictionary.value?.root.properties?.[propertyName]
  if (!property || property.type !== 'array' && property.type !== 'list') return
  
  const itemsProperty = property.items
  if (!itemsProperty || itemsProperty.type !== 'object') return

  if (!itemsProperty.properties) {
    itemsProperty.properties = {}
  }
  
  // Generate a default sub-property name
  const subPropertyName = `item_sub_property_${Object.keys(itemsProperty.properties).length + 1}`
  
  itemsProperty.properties[subPropertyName] = {
    description: '',
    type: 'string',
    required: false
  }
  
  autoSave()
}

// Add sub-property to array items (for object items)
const addArraySubSubItemProperty = (propertyName: string, subPropertyName: string) => {
  if (!dictionary.value || dictionary.value._locked) return
  
  const property = dictionary.value?.root.properties?.[propertyName]
  if (!property || property.type !== 'array' && property.type !== 'list') return
  
  const subProperty = property.properties?.[subPropertyName]
  if (!subProperty || subProperty.type !== 'array' && subProperty.type !== 'list') return
  
  const itemsProperty = subProperty.items
  if (!itemsProperty || itemsProperty.type !== 'object') return

  if (!itemsProperty.properties) {
    itemsProperty.properties = {}
  }
  
  // Generate a default sub-property name
  const subSubPropertyName = `item_sub_sub_property_${Object.keys(itemsProperty.properties).length + 1}`
  
  itemsProperty.properties[subSubPropertyName] = {
    description: '',
    type: 'string',
    required: false
  }
  
  autoSave()
}

// Delete array item property function
const deleteArrayItemProperty = (itemPropertyName: string) => {
  if (!dictionary.value || dictionary.value._locked) return
  
  const itemsProperty = dictionary.value?.root.items
  if (!itemsProperty) return

  if (itemsProperty.properties) {
    delete itemsProperty.properties[itemPropertyName]
    autoSave()
  }
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