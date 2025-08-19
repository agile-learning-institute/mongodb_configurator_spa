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
          <!-- Show the nested array's properties -->
          <PropertyEditor
            :property="property.items"
            :is-root="false"
            :is-dictionary="isDictionary"
            :is-type="isType"
            :disabled="disabled"
            @change="handleItemsChange"
          />
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
</style> 