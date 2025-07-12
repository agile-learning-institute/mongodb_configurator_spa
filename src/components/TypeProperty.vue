<template>
  <div class="property-row">
    <!-- Compact Single Row Layout -->
    <div class="d-flex align-center pa-3 border rounded mb-2">
      <!-- Property Name (filename without .yaml) -->
      <div class="property-name mr-4">
        <span class="text-subtitle-2 font-weight-medium">{{ getPropertyName() }}</span>
      </div>
      
      <!-- Description -->
      <div class="property-description flex-grow-1 mr-4">
        <v-text-field
          v-model="property.description"
          label="Description"
          density="compact"
          variant="outlined"
          hide-details
          :disabled="disabled"
          @update:model-value="handleChange"
        />
      </div>
      
      <!-- Type Selector -->
      <div class="property-type mr-4" style="min-width: 150px;">
        <TypePicker
          v-model="property.type"
          label="Type"
          density="compact"
          :disabled="disabled"
          :exclude-type="excludeType"
          @update:model-value="handleTypeChange"
        />
      </div>
      
      <!-- Required Checkbox -->
      <div class="property-required mr-2">
        <v-checkbox
          v-model="property.required"
          label="Required"
          density="compact"
          hide-details
          :disabled="disabled"
          @update:model-value="handleChange"
        />
      </div>
      
      <!-- Additional Properties (for objects) -->
      <div v-if="isObjectType()" class="property-additional mr-2">
        <v-checkbox
          v-model="property.additionalProperties"
          label="Additional"
          density="compact"
          hide-details
          :disabled="disabled"
          @update:model-value="handleChange"
        />
      </div>
      
      <!-- Expand/Collapse Button -->
      <div class="property-actions">
        <v-btn
          v-if="hasExpandableContent()"
          icon
          size="small"
          variant="text"
          @click="expanded = !expanded"
          :title="expanded ? 'Collapse' : 'Expand'"
        >
          <v-icon size="18">{{ expanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- Expanded Content (only for list/object types) -->
    <div v-if="expanded && hasExpandableContent()" class="expanded-content pa-3 border rounded mb-2">
      <!-- List Items Editor -->
      <div v-if="isListType()">
        <div class="text-subtitle-2 mb-2">List Items</div>
        <v-row>
          <v-col cols="12" md="6">
            <TypePicker
              v-model="property.items!.type"
              label="Item Type"
              density="compact"
              :disabled="disabled"
              :exclude-type="excludeType"
              @update:model-value="handleChange"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="property.items!.description"
              label="Item Description"
              density="compact"
              variant="outlined"
              :disabled="disabled"
              @update:model-value="handleChange"
            />
          </v-col>
        </v-row>
      </div>

      <!-- Object Properties Editor -->
      <div v-if="isObjectType()">
        <div class="d-flex justify-space-between align-center mb-3">
          <div class="text-subtitle-2">Properties</div>
          <v-btn
            color="primary"
            variant="outlined"
            size="small"
            @click="addSubProperty"
            :disabled="disabled"
          >
            <v-icon start size="small">mdi-plus</v-icon>
            Add Property
          </v-btn>
        </div>
        
        <div v-if="!property.properties || Object.keys(property.properties).length === 0" class="text-center pa-4">
          <v-icon size="32" color="grey">mdi-cube-outline</v-icon>
          <div class="text-body-2 text-medium-emphasis mt-2">No properties defined</div>
        </div>
        
        <div v-else>
          <TypeProperty
            v-for="(subProperty, subPropertyName) in property.properties"
            :key="subPropertyName"
            :property-name="subPropertyName"
            :property="subProperty"
            :disabled="disabled"
            @change="handleSubPropertyChange(subPropertyName, $event)"
            @delete="deleteSubProperty(subPropertyName)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import TypePicker from './TypePicker.vue'

interface PropertyItems {
  type: string
  description: string
}

interface Property {
  description: string
  type: string
  required: boolean
  additionalProperties?: boolean
  items?: PropertyItems
  properties?: Record<string, Property>
}

interface Props {
  propertyName: string
  property: Property
  disabled?: boolean
  excludeType?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  excludeType: ''
})

const emit = defineEmits<{
  change: [property: Property]
  delete: []
}>()

const expanded = ref(false)

// Property name formatting (remove .yaml extension)
const getPropertyName = (): string => {
  return props.propertyName.replace(/\.yaml$/, '')
}

// Property type detection
const isListType = (): boolean => {
  return props.property.type === 'array' || props.property.type === 'list'
}

const isObjectType = (): boolean => {
  return props.property.type === 'object'
}

const isCustomType = (): boolean => {
  return !isListType() && !isObjectType()
}

const hasExpandableContent = (): boolean => {
  return isListType() || isObjectType()
}

// Event handlers
const handleChange = () => {
  emit('change', props.property)
}

const handleTypeChange = () => {
  // Clear type-specific properties when type changes
  if (!isListType()) {
    delete props.property.items
  }
  if (!isObjectType()) {
    delete props.property.properties
    delete props.property.additionalProperties
  }
  
  // Initialize type-specific properties
  if (isListType() && !props.property.items) {
    props.property.items = {
      type: 'string',
      description: ''
    }
  }
  if (isObjectType() && !props.property.properties) {
    props.property.properties = {}
  }
  
  // Auto-expand if switching to expandable type
  if (hasExpandableContent()) {
    expanded.value = true
  } else {
    expanded.value = false
  }
  
  emit('change', props.property)
}

const addSubProperty = () => {
  if (!props.property.properties) {
    props.property.properties = {}
  }
  
  const propertyName = `new_property_${Object.keys(props.property.properties).length + 1}`
  props.property.properties[propertyName] = {
    description: '',
    type: 'string',
    required: false,
    additionalProperties: false
  }
  
  emit('change', props.property)
}

const deleteSubProperty = (propertyName: string) => {
  if (props.property.properties) {
    delete props.property.properties[propertyName]
    emit('change', props.property)
  }
}

const handleSubPropertyChange = (propertyName: string, updatedProperty: Property) => {
  if (props.property.properties) {
    props.property.properties[propertyName] = updatedProperty
    emit('change', props.property)
  }
}
</script>

<style scoped>
.property-row {
  width: 100%;
}

.property-name {
  min-width: 120px;
  max-width: 200px;
}

.property-description {
  min-width: 200px;
}

.property-type {
  min-width: 150px;
}

.property-required {
  min-width: 80px;
}

.property-additional {
  min-width: 100px;
}

.property-actions {
  min-width: 40px;
}

.expanded-content {
  background-color: rgba(0, 0, 0, 0.02);
  border-left: 4px solid #667eea;
}
</style> 