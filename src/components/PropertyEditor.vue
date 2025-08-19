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
      <!-- Array extension: Items type picker -->
      <ArrayPropertyExtension
        v-if="isArrayProperty(property)"
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
      <!-- Array property body -->
      <div v-if="isArrayProperty(property)" class="array-property-body">
        <div class="array-item-editor">
          <PropertyEditor
            :property="property.items"
            :is-root="false"
            :is-dictionary="isDictionary"
            :is-type="isType"
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
  type ArrayProperty,
  type ObjectProperty,
  isArrayProperty,
  isObjectProperty
} from '@/types/types'
import BasePropertyEditor from './BasePropertyEditor.vue'
import ArrayPropertyExtension from './ArrayPropertyExtension.vue'
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
  }
}

const handleToggleCollapsed = (collapsed: boolean) => {
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

.array-item-editor {
  margin-top: 8px;
}

.properties-section {
  margin-top: 0;
}
</style> 