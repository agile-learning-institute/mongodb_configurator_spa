<template>
  <BasePropertyEditor
    v-if="shouldRenderPropertyEditor"
    :property="property"
    :is-root="isRoot"
    :is-dictionary="isDictionary"
    :is-type="isType"
    :disabled="disabled"
    :hideTypeSelector="hideTypeSelector"
    @change="handleChange"
    @delete="handleDelete"
    :data-test="`property-editor-${property.name || 'root'}`"
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
        data-test="array-of-object-extension"
      />
      
      <ArrayOfArrayExtension
        v-else-if="isArrayProperty(property) && property.items && property.items.type === 'array'"
        :property="property"
        :is-dictionary="isDictionary"
        :is-type="isType"
        :disabled="disabled"
        @change="handleChange"
        @collapsed="handleArrayArrayCollapsed"
        data-test="array-of-array-extension"
      />
      
      <ArrayPropertyExtension
        v-else-if="isArrayProperty(property)"
        :property="property"
        :is-dictionary="isDictionary"
        :is-type="isType"
        :disabled="disabled"
        @change="handleChange"
        data-test="array-property-extension"
      />
      
      <!-- Object extension: Action icons -->
      <ObjectPropertyExtension
        v-if="isObjectProperty(property)"
        :property="property"
        :disabled="disabled"
        @change="handleChange"
        @add-property="handleAddProperty"
        @toggle-collapsed="handleToggleCollapsed"
        data-test="object-property-extension"
      />
    </template>
    
    <!-- Body slot for type-specific content -->
    <template #body>
      <!-- Array property body - handle different items types -->
      <!-- Array of Object: Show object properties directly (only when not collapsed) -->
      <div v-if="isArrayProperty(property) && property.items && property.items.type === 'object' && !(property.items as any)._collapsed" class="array-property-body" data-test="array-of-object-body">
        <div class="object-properties">
          <div v-if="!(property.items as any).properties || (property.items as any).properties.length === 0" class="text-center pa-4" data-test="no-properties-message">
            <v-icon size="48" color="grey" data-test="no-properties-icon">mdi-format-list-bulleted</v-icon>
            <p class="text-body-2 text-medium-emphasis mt-2" data-test="no-properties-text">No properties defined. Click the <v-icon icon="mdi-plus" size="small" class="mx-1" data-test="add-property-icon" /> icon to add your first property</p>
          </div>
          
          <div v-else class="properties-section" data-test="properties-section">
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
              :data-test="`nested-property-${prop.name || index}`"
            />
          </div>
        </div>
      </div>
      
      <!-- Array of Array: Show nested array editor (only when not collapsed) -->
      <div v-else-if="isArrayProperty(property) && property.items && property.items.type === 'array' && !(property.items as any)._collapsed" class="array-property-body" data-test="array-of-array-body">
        <div class="array-item-editor">
          <!-- Use PropertyEditor for the nested array with type selector hidden -->
          <PropertyEditor
            :property="property.items"
            :is-root="false"
            :is-dictionary="isDictionary"
            :is-type="isType"
            :disabled="disabled"
            :hideTypeSelector="true"
            @change="handleItemsChange"
            data-test="nested-array-property"
          />
        </div>
      </div>

      
      <!-- Object property body -->
      <div v-else-if="isObjectProperty(property) && !(property as any)._collapsed" class="object-property-body" data-test="object-property-body">
        <div v-if="!property.properties || property.properties.length === 0" class="text-center pa-4" data-test="no-object-properties-message">
          <v-icon size="48" color="grey" data-test="no-object-properties-icon">mdi-format-list-bulleted</v-icon>
          <p class="text-body-2 text-medium-emphasis mt-2" data-test="no-object-properties-text">No properties defined. Click the <v-icon icon="mdi-plus" size="small" class="mx-1" data-test="add-object-property-icon" /> icon to add your first property</p>
        </div>
        
        <div v-else class="properties-section" data-test="object-properties-section">
          <template v-for="(prop, index) in property.properties" :key="prop.name || index">
            <!-- Drop zone before each property -->
            <div 
              class="drop-zone" 
              :class="{ 'drag-over': dragOverIndex === index }"
              :data-test="`drop-zone-${index}`"
              @dragover.prevent="handleDragOver(index)"
              @dragenter.prevent="handleDragEnter(index)"
              @dragleave="handleDragLeave(index)"
              @drop="(event) => handleDrop(event, index)"
            >
              <div class="drop-indicator"></div>
            </div>
            
            <PropertyEditor
              :property="prop"
              :is-root="false"
              :is-dictionary="isDictionary"
              :is-type="isType"
              :disabled="disabled"
              @change="(updatedProp) => handlePropertyChange(index, updatedProp)"
              @delete="() => handlePropertyDelete(index)"
              :data-test="`object-property-${prop.name || index}`"
            />
          </template>
          
          <!-- Drop zone after last property -->
          <div 
            class="drop-zone" 
            :class="{ 'drag-over': dragOverIndex === (isObjectProperty(property) ? property.properties.length : 0) }"
            :data-test="`drop-zone-${isObjectProperty(property) ? property.properties.length : 0}`"
            @dragover.prevent="handleDragOver(isObjectProperty(property) ? property.properties.length : 0)"
            @dragenter.prevent="handleDragEnter(isObjectProperty(property) ? property.properties.length : 0)"
            @dragleave="handleDragLeave(isObjectProperty(property) ? property.properties.length : 0)"
            @drop="(event) => handleDrop(event, isObjectProperty(property) ? property.properties.length : 0)"
          >
            <div class="drop-indicator"></div>
          </div>
        </div>
      </div>
      
      <!-- Simple property body - show schema configuration -->
      <div v-else-if="isSimpleProperty(property)" class="simple-property-body" data-test="simple-property-body">
        <div class="schema-configuration pa-4">
          <h4 class="text-h6 mb-3" data-test="schema-configuration-title">Schema Configuration</h4>
          
          <v-textarea
            v-model="simplePropertySchema"
            label="JSON Schema"
            variant="outlined"
            rows="6"
            :readonly="disabled"
            persistent-hint
            @update:model-value="handleSimplePropertySchemaChange"
            data-test="simple-property-schema-input"
          />
        </div>
      </div>
      
      <!-- Complex property body - show JSON and BSON type configuration -->
      <div v-else-if="isComplexProperty(property)" class="complex-property-body" data-test="complex-property-body">
        <div class="type-configuration pa-4">
          <h4 class="text-h6 mb-3" data-test="type-configuration-title">Type Configuration</h4>
          
          <v-row>
            <v-col cols="12" md="6">
              <v-textarea
                v-model="complexPropertyJsonType"
                label="JSON Type Definition"
                variant="outlined"
                rows="6"
                :readonly="disabled"
                persistent-hint
                @update:model-value="handleComplexPropertyJsonTypeChange"
                data-test="complex-property-json-input"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-textarea
                v-model="complexPropertyBsonType"
                label="BSON Type Definition"
                variant="outlined"
                rows="6"
                :readonly="disabled"
                persistent-hint
                @update:model-value="handleComplexPropertyBsonTypeChange"
                data-test="complex-property-bson-input"
              />
            </v-col>
          </v-row>
        </div>
      </div>
    </template>
  </BasePropertyEditor>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { 
  type Property,
  isArrayProperty,
  isObjectProperty,
  isSimpleProperty,
  isComplexProperty
} from '@/types/types'
import BasePropertyEditor from './BasePropertyEditor.vue'
import ArrayPropertyExtension from './ArrayPropertyExtension.vue'

// Drag and drop state
const dragOverIndex = ref<number | null>(null)
import ArrayOfObjectExtension from './ArrayOfObjectExtension.vue'
import ArrayOfArrayExtension from './ArrayOfArrayExtension.vue'
import ObjectPropertyExtension from './ObjectPropertyExtension.vue'


const props = defineProps<{
  property: Property
  isRoot?: boolean
  isDictionary?: boolean
  isType?: boolean
  disabled?: boolean
  hideTypeSelector?: boolean
}>()

const emit = defineEmits<{
  change: [property: Property]
  delete: []
}>()

// Computed properties
const isRoot = computed(() => props.isRoot || false)
const isDictionary = computed(() => props.isDictionary || false)
const isType = computed(() => props.isType || false)

// Only render PropertyEditor for root properties when there's content to show
const shouldRenderPropertyEditor = computed(() => {
  if (!isRoot.value) {
    return true // Always render for non-root properties
  }
  
  // For root properties, only render if there's content to show
  return isObjectProperty(props.property) || 
         isArrayProperty(props.property) || 
         isSimpleProperty(props.property) || 
         isComplexProperty(props.property)
})

// Computed properties for Simple and Complex property editing
const simplePropertySchema = computed(() => {
  if (isSimpleProperty(props.property)) {
    return JSON.stringify(props.property.schema || { type: "string", maxLength: 40 }, null, 2)
  }
  return JSON.stringify({ type: "string", maxLength: 40 }, null, 2)
})

const complexPropertyJsonType = computed(() => {
  if (isComplexProperty(props.property)) {
    return JSON.stringify(props.property.json_type || { type: "string", maxLength: 40 }, null, 2)
  }
  return JSON.stringify({ type: "string", maxLength: 40 }, null, 2)
})

const complexPropertyBsonType = computed(() => {
  if (isComplexProperty(props.property)) {
    return JSON.stringify(props.property.bson_type || { type: "string", maxLength: 40 }, null, 2)
  }
  return JSON.stringify({ type: "string", maxLength: 40 }, null, 2)
})


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
  if (isArrayProperty(props.property) && props.property.items && isObjectProperty(props.property.items)) {
    const updatedProperties = [...(props.property.items as any).properties]
    updatedProperties.splice(index, 1)
    
    const updatedProperty = {
      ...props.property,
      items: {
        ...props.property.items,
        properties: updatedProperties
      }
    }
    
    emit('change', updatedProperty)
  }
}

const handleDragOver = (index: number) => {
  dragOverIndex.value = index
}

const handleDragEnter = (index: number) => {
  dragOverIndex.value = index
}

const handleDragLeave = (index: number) => {
  // Only clear if we're leaving this specific drop zone
  if (dragOverIndex.value === index) {
    dragOverIndex.value = null
  }
}

const handleDrop = (event: DragEvent, dropIndex: number) => {
  event.preventDefault()
  dragOverIndex.value = null
  
  if (!event.dataTransfer) return
  
  const draggedPropertyName = event.dataTransfer.getData('text/plain')
  if (!draggedPropertyName) return
  
  if (isObjectProperty(props.property) && props.property.properties) {
    // Find the dragged property index
    const draggedIndex = props.property.properties.findIndex(prop => prop.name === draggedPropertyName)
    if (draggedIndex === -1) return
    
    // Don't do anything if dropping on itself
    if (draggedIndex === dropIndex) return
    
    // Create new properties array with reordered items
    const newProperties = [...props.property.properties]
    const [draggedProperty] = newProperties.splice(draggedIndex, 1)
    
    // Adjust drop index if dragging from before the drop position
    const adjustedDropIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex
    newProperties.splice(adjustedDropIndex, 0, draggedProperty)
    
    // Update the property
    const updatedProperty = {
      ...props.property,
      properties: newProperties
    }
    
    emit('change', updatedProperty)
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

const handleSimplePropertySchemaChange = (value: string) => {
  if (isSimpleProperty(props.property)) {
    try {
      if (value.trim()) {
        const parsedSchema = JSON.parse(value);
        const updatedProperty = {
          ...props.property,
          schema: parsedSchema
        };
        emit('change', updatedProperty);
      }
    } catch (error) {
      // Don't save on invalid JSON - user might be in the middle of typing
    }
  }
};

const handleComplexPropertyJsonTypeChange = (value: string) => {
  if (isComplexProperty(props.property)) {
    try {
      if (value.trim()) {
        const parsedJsonType = JSON.parse(value);
        const updatedProperty = {
          ...props.property,
          json_type: parsedJsonType
        };
        emit('change', updatedProperty);
      }
    } catch (error) {
      // Don't save on invalid JSON - user might be in the middle of typing
    }
  }
};

const handleComplexPropertyBsonTypeChange = (value: string) => {
  if (isComplexProperty(props.property)) {
    try {
      if (value.trim()) {
        const parsedBsonType = JSON.parse(value);
        const updatedProperty = {
          ...props.property,
          bson_type: parsedBsonType
        };
        emit('change', updatedProperty);
      }
    } catch (error) {
      // Don't save on invalid JSON - user might be in the middle of typing
    }
  }
};








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

.nested-array-level {
  margin-bottom: 8px;
}

.nested-object-properties {
  margin-top: 8px;
}

.nested-object-header {
  display: flex;
  justify-content: flex-end;
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 8px;
}

.nested-object-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nested-object-properties-list {
  margin-left: 16px;
}

.simple-property-body {
  padding: 16px;
  background-color: #ffffff;
}

.complex-property-body {
  padding: 16px;
  background-color: #ffffff;
}

.schema-configuration {
  /* Add specific styles for schema configuration if needed */
}

.type-configuration {
  /* Add specific styles for type configuration if needed */
}

/* Drop zone styling */
.drop-zone {
  min-height: 8px;
  margin: 4px 0;
  transition: all 0.2s ease;
  border-radius: 4px;
}

.drop-zone:hover {
  background-color: rgba(25, 118, 210, 0.1);
}

.drop-zone.drag-over {
  background-color: rgba(25, 118, 210, 0.2);
  border: 2px dashed #1976d2;
}

.drop-indicator {
  height: 2px;
  background-color: transparent;
  transition: background-color 0.2s ease;
}

.drop-zone:hover .drop-indicator {
  background-color: #1976d2;
}

.drop-zone.drag-over .drop-indicator {
  background-color: #1976d2;
  height: 3px;
}
</style> 