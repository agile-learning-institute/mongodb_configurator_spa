<template>
  <BasePropertyEditor
    :property="property"
    :is-root="isRoot"
    :is-dictionary="isDictionary"
    :is-type="isType"
    :disabled="disabled"
    @change="handleChange"
    @delete="handleDelete"
  >
    <!-- Extension slot for type-specific controls -->
    <template #extension>
      <!-- Array extensions: Type-specific based on items type -->
      <ArrayOfObjectExtension
        v-if="isArrayProperty(property) && property.items && property.items.type === 'object'"
        :property="property"
        :is-dictionary="isDictionary"
        :is-type="isType"
        :disabled="disabled"
        @change="handleChange"
        @add-property="handleAddProperty"
        @collapsed="handleArrayObjectCollapsed"
      />
      
      <ArrayOfArrayExtension
        v-else-if="isArrayProperty(property) && property.items && property.items.type === 'array'"
        :property="property"
        :is-dictionary="isDictionary"
        :is-type="isType"
        :disabled="disabled"
        @change="handleChange"
        @collapsed="handleArrayArrayCollapsed"
      />
      
      <ArrayPropertyExtension
        v-else-if="isArrayProperty(property)"
        :property="property"
        :is-dictionary="isDictionary"
        :is-type="isType"
        :disabled="disabled"
        @change="handleChange"
      />
      
      <!-- Object extension: Action icons -->
      <ObjectPropertyExtension
        v-if="isObjectProperty(property)"
        :property="property"
        :disabled="disabled"
        @change="handleChange"
        @add-property="handleAddProperty"
        @toggle-collapsed="handleToggleCollapsed"
      />
    </template>
    
    <!-- Body slot for type-specific content -->
    <template #body>
      <!-- Array property body - handle different items types -->
      <!-- Array of Object: Show object properties directly (only when not collapsed) -->
      <div v-if="isArrayProperty(property) && property.items && property.items.type === 'object' && !(property.items as any)._collapsed" class="array-property-body">
        <div class="object-properties">
          <div v-if="!(property.items as any).properties || (property.items as any).properties.length === 0" class="text-center pa-4">
            <v-icon size="48" color="grey">mdi-format-list-bulleted</v-icon>
            <p class="text-body-2 text-medium-emphasis mt-2">No properties defined. Click the <v-icon icon="mdi-plus" size="small" class="mx-1" /> icon to add your first property</p>
          </div>
          
          <div v-else class="properties-section">
            <PropertyEditor
              v-for="(prop, index) in (property.items as any).properties"
              :key="prop.name || index"
              :property="prop"
              :is-root="false"
              :is-dictionary="isDictionary"
              :is-type="isType"
              :disabled="disabled"
              @change="(updatedProp) => handleArrayObjectPropertyChange(index, updatedProp)"
              @delete="() => handleArrayObjectPropertyDelete(index)"
            />
          </div>
        </div>
      </div>
      
      <!-- Array of Array: Show nested array editor (only when not collapsed) -->
      <div v-else-if="isArrayProperty(property) && property.items && property.items.type === 'array' && !(property.items as any)._collapsed" class="array-property-body">
        <div class="array-item-editor">
          <!-- Show nested array with only items type picker (no type selector) -->
          <div class="nested-array-header">
            <div class="nested-array-name">
              <span class="text-body-2">{{ (property.items as any).name || 'item' }}</span>
            </div>
            <div class="nested-array-description">
              <span class="text-body-2 text-medium-emphasis">{{ (property.items as any).description || '' }}</span>
            </div>
            <div class="nested-array-items-type">
              <span class="text-caption text-medium-emphasis mr-2">Items:</span>
              <TypeChipPicker
                v-model="nestedArrayItemsType"
                :is-root="false"
                :is-dictionary="isDictionary"
                :is-type="isType"
                :disabled="disabled"
                @update:model-value="handleNestedArrayItemsTypeChange"
              />
            </div>
          </div>
          
          <!-- Show nested array content if it has items -->
          <div v-if="(property.items as any).items" class="nested-array-content">
            <PropertyEditor
              :property="(property.items as any).items"
              :is-root="false"
              :is-dictionary="isDictionary"
              :is-type="isType"
              :disabled="disabled"
              @change="handleNestedArrayChange"
            />
          </div>
        </div>
      </div>

      
      <!-- Object property body -->
      <div v-else-if="isObjectProperty(property)" class="object-property-body">
        <div v-if="!property.properties || property.properties.length === 0" class="text-center pa-4">
          <v-icon size="48" color="grey">mdi-format-list-bulleted</v-icon>
          <p class="text-body-2 text-medium-emphasis mt-2">No properties defined. Click the <v-icon icon="mdi-plus" size="small" class="mx-1" /> icon to add your first property</p>
        </div>
        
        <div v-else class="properties-section">
          <PropertyEditor
            v-for="(prop, index) in property.properties"
            :key="prop.name || index"
            :property="prop"
            :is-root="false"
            :is-dictionary="isDictionary"
            :is-type="isType"
            :disabled="disabled"
            @change="(updatedProp) => handlePropertyChange(index, updatedProp)"
            @delete="() => handlePropertyDelete(index)"
          />
        </div>
      </div>
    </template>
  </BasePropertyEditor>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  type Property,
  isArrayProperty,
  isObjectProperty
} from '@/types/types'
import BasePropertyEditor from './BasePropertyEditor.vue'
import ArrayPropertyExtension from './ArrayPropertyExtension.vue'
import ArrayOfObjectExtension from './ArrayOfObjectExtension.vue'
import ArrayOfArrayExtension from './ArrayOfArrayExtension.vue'
import ObjectPropertyExtension from './ObjectPropertyExtension.vue'
import TypeChipPicker from './TypeChipPicker.vue'

const props = defineProps<{
  property: Property
  isRoot?: boolean
  isDictionary?: boolean
  isType?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  change: [property: Property]
  delete: []
}>()

// Computed properties
const isRoot = computed(() => props.isRoot || false)
const isDictionary = computed(() => props.isDictionary || false)
const isType = computed(() => props.isType || false)



// Methods
const handleChange = (updatedProperty: Property) => {
  emit('change', updatedProperty)
}

const handleDelete = () => {
  emit('delete')
}

const handleItemsChange = (updatedItems: any) => {
  if (isArrayProperty(props.property)) {
    const updatedProperty = {
      ...props.property,
      items: updatedItems
    }
    emit('change', updatedProperty)
  }
}

const handleAddProperty = () => {
  if (isObjectProperty(props.property)) {
    if (!props.property.properties) {
      props.property.properties = []
    }
    
    const newProperty = {
      name: '',
      description: '',
      type: 'word',
      required: false
    }
    
    props.property.properties.push(newProperty)
    emit('change', props.property)
  } else if (isArrayProperty(props.property) && props.property.items && props.property.items.type === 'object') {
    // Handle adding property to array of object items
    const items = props.property.items as any // Type assertion for object properties
    if (!items.properties) {
      items.properties = []
    }
    
    const newProperty = {
      name: '',
      description: '',
      type: 'word',
      required: false
    }
    
    items.properties.push(newProperty)
    emit('change', props.property)
  }
}

const handleToggleCollapsed = () => {
  // Handle collapse state if needed
  // For now, we'll just emit the change
  emit('change', props.property)
}

const handlePropertyChange = (index: number, updatedProp: Property) => {
  if (isObjectProperty(props.property) && props.property.properties) {
    props.property.properties[index] = updatedProp
    emit('change', props.property)
  }
}

const handlePropertyDelete = (index: number) => {
  if (isObjectProperty(props.property) && props.property.properties) {
    props.property.properties.splice(index, 1)
    emit('change', props.property)
  }
}

const handleArrayObjectPropertyChange = (index: number, updatedProp: Property) => {
  if (isArrayProperty(props.property) && props.property.items && props.property.items.type === 'object') {
    const items = props.property.items as any
    if (items.properties) {
      items.properties[index] = updatedProp
      emit('change', props.property)
    }
  }
}

const handleArrayObjectPropertyDelete = (index: number) => {
  if (isArrayProperty(props.property) && props.property.items && props.property.items.type === 'object') {
    const items = props.property.items as any
    if (items.properties) {
      items.properties.splice(index, 1)
      emit('change', props.property)
    }
  }
}

const handleArrayObjectCollapsed = (collapsed: boolean) => {
  // Store the collapsed state locally for this array of object
  if (isArrayProperty(props.property) && props.property.items && props.property.items.type === 'object') {
    // We'll use a WeakMap or similar to store the collapsed state, but for now
    // we'll just store it on the property itself as a temporary UI state
    ;(props.property.items as any)._collapsed = collapsed
  }
}

const handleArrayArrayCollapsed = (collapsed: boolean) => {
  // Store the collapsed state locally for this array of array
  if (isArrayProperty(props.property) && props.property.items && props.property.items.type === 'array') {
    ;(props.property.items as any)._collapsed = collapsed
  }
}

const handleNestedArrayItemsTypeChange = (newType: string) => {
  if (isArrayProperty(props.property) && props.property.items && props.property.items.type === 'array') {
    const currentItems = (props.property.items as any).items
    
    // Create a new items property with the selected type
    const newItems = {
      name: '',
      description: '',
      type: newType,
      required: false
    }
    
    // Create a new property object to ensure proper reactivity
    const newProperty = {
      ...props.property,
      items: {
        ...props.property.items,
        items: newItems
      }
    }
    
    emit('change', newProperty)
  }
}

const handleNestedArrayChange = (updatedNestedArray: Property) => {
  if (isArrayProperty(props.property) && props.property.items && props.property.items.type === 'array') {
    const newProperty = {
      ...props.property,
      items: {
        ...props.property.items,
        items: updatedNestedArray
      }
    }
    emit('change', newProperty)
  }
}

// Computed property for nested array items type
const nestedArrayItemsType = computed(() => {
  if (isArrayProperty(props.property) && props.property.items && props.property.items.type === 'array') {
    return (props.property.items as any).items?.type || ''
  }
  return ''
})
</script>

<style scoped>
.array-property-body {
  padding: 16px;
  background-color: #ffffff;
}

.object-property-body {
  padding: 16px;
  background-color: #ffffff;
}

.object-properties {
  padding: 16px;
  background-color: #ffffff;
}

.array-item-editor {
  margin-top: 8px;
}

.properties-section {
  margin-top: 0;
}

.nested-array-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 8px;
}

.nested-array-name {
  min-width: 120px;
}

.nested-array-description {
  flex: 1;
  min-width: 0;
}

.nested-array-items-type {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.nested-array-content {
  margin-left: 16px;
}
</style> 