<template>
  <v-card class="mb-3">
    <!-- Property Header -->
    <div class="header-section pa-4 d-flex justify-space-between align-center">
      <div class="d-flex align-center">
        <v-icon class="mr-3" size="24" color="white">{{ getPropertyIcon() }}</v-icon>
        <div>
          <div class="text-h6 text-white">{{ propertyName }}</div>
          <div class="text-caption text-white text-opacity-80">{{ property.description || 'No description' }}</div>
        </div>
      </div>
      
      <!-- Action buttons on header background -->
      <div class="d-flex align-center">
        <v-switch
          v-model="property.required"
          color="white"
          hide-details
          density="compact"
          class="mr-2"
          :disabled="disabled"
          @update:model-value="handleRequiredChange"
        >
          <template v-slot:label>
            <span class="text-white text-caption">Required</span>
          </template>
        </v-switch>
        
        <v-switch
          v-if="isObjectType()"
          v-model="property.additionalProperties"
          color="white"
          hide-details
          density="compact"
          class="mr-2"
          :disabled="disabled"
          @update:model-value="handleAdditionalPropertiesChange"
        >
          <template v-slot:label>
            <span class="text-white text-caption">Additional Props</span>
          </template>
        </v-switch>
        
        <v-btn
          v-if="isObjectType()"
          icon
          size="small"
          variant="text"
          color="white"
          @click="addSubProperty"
          :disabled="disabled"
          title="Add Property"
        >
          <v-icon size="18">mdi-plus</v-icon>
        </v-btn>
        
        <!-- Expand/collapse button -->
        <v-btn
          icon
          size="small"
          variant="text"
          color="white"
          @click="expanded = !expanded"
          :title="expanded ? 'Collapse' : 'Expand'"
        >
          <v-icon size="18">{{ expanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- Property Content -->
    <div v-if="expanded" class="pa-4">
      <!-- Basic Property Info -->
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="property.description"
            label="Description"
            :disabled="disabled"
            @update:model-value="handleChange"
          />
        </v-col>
        <v-col cols="12" md="6">
          <TypePicker
            v-model="property.type"
            label="Type"
            :disabled="disabled"
            @update:model-value="handleTypeChange"
          />
        </v-col>
      </v-row>

      <!-- List Items Editor -->
      <div v-if="isListType()" class="mt-4">
        <v-card variant="outlined" class="pa-4">
          <v-card-title class="text-subtitle-1">List Items</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <TypePicker
                  v-model="property.items!.type"
                  label="Item Type"
                  :disabled="disabled"
                  @update:model-value="handleChange"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="property.items!.description"
                  label="Item Description"
                  :disabled="disabled"
                  @update:model-value="handleChange"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </div>

      <!-- Object Properties Editor -->
      <div v-if="isObjectType()" class="mt-4">
        <v-card variant="outlined">
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Object Properties</span>
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
          </v-card-title>
          <v-card-text>
            <div v-if="!property.properties || Object.keys(property.properties).length === 0" class="text-center pa-8">
              <v-icon size="48" color="grey">mdi-cube-outline</v-icon>
              <h4 class="text-h6 mt-4">No Properties</h4>
              <p class="text-body-2 text-medium-emphasis">Add properties to define the object structure.</p>
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
          </v-card-text>
        </v-card>
      </div>
    </div>
  </v-card>
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
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  change: [property: Property]
  delete: []
}>()

const expanded = ref(false)

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

const getPropertyIcon = (): string => {
  if (isListType()) return 'mdi-format-list-bulleted'
  if (isObjectType()) return 'mdi-cube-outline'
  return 'mdi-shape'
}

// Event handlers
const handleChange = () => {
  emit('change', props.property)
}

const handleRequiredChange = () => {
  emit('change', props.property)
}

const handleAdditionalPropertiesChange = () => {
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
    required: false
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
.header-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px 4px 0 0;
}
</style> 