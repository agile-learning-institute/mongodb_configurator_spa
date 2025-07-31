<template>
  <div class="object-property-editor">
    <div class="object-header">
      <v-icon icon="mdi-shape-outline" class="mr-2" />
      <span class="text-subtitle-2">Object Properties</span>
      <v-spacer />
      <v-btn
        icon="mdi-chevron-down"
        variant="text"
        size="small"
        @click="expanded = !expanded"
      />
    </div>
    
    <div v-if="expanded" class="object-body">
      <!-- Additional Properties Toggle -->
      <div class="additional-properties-section">
        <v-checkbox
          v-model="additionalProperties"
          label="Allow Additional Properties"
          hide-details
          @update:model-value="handleAdditionalPropertiesChange"
        />
      </div>
      
      <!-- Properties List -->
      <div class="properties-section">
        <div class="properties-header">
          <h4 class="text-subtitle-2">Properties</h4>
          <v-btn
            prepend-icon="mdi-plus"
            variant="outlined"
            size="small"
            @click="addProperty"
          >
            Add Property
          </v-btn>
        </div>
        
        <div class="properties-list">
          <div
            v-for="(property, index) in property.properties"
            :key="index"
            class="property-item"
          >
            <PropertyEditor
              :property="property"
              :is-root="false"
              :is-dictionary="isDictionary"
              :is-type="isType"
              @change="(updatedProperty) => updateProperty(index, updatedProperty)"
              @delete="() => removeProperty(index)"
            />
          </div>
          
          <div v-if="property.properties.length === 0" class="no-properties">
            <v-alert
              type="info"
              variant="tonal"
              text="No properties defined. Click 'Add Property' to get started."
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { type ObjectProperty, type Property } from '@/types/types'
import PropertyEditor from '../PropertyEditor.vue'

const props = defineProps<{
  property: ObjectProperty
  isDictionary?: boolean
  isType?: boolean
}>()

const emit = defineEmits<{
  change: [property: ObjectProperty]
}>()

const expanded = ref(true)

const additionalProperties = computed({
  get: () => props.property.additional_properties ?? false,
  set: (value: boolean) => {
    const updatedProperty = {
      ...props.property,
      additional_properties: value
    }
    emit('change', updatedProperty)
  }
})

const handleAdditionalPropertiesChange = (value: boolean) => {
  additionalProperties.value = value
}

const addProperty = () => {
  const newProperty: Property = {
    name: `property_${props.property.properties.length + 1}`,
    description: '',
    type: 'string',
    required: false
  }
  
  const updatedProperty = {
    ...props.property,
    properties: [...props.property.properties, newProperty]
  }
  emit('change', updatedProperty)
}

const updateProperty = (index: number, updatedProperty: Property) => {
  const updatedProperties = [...props.property.properties]
  updatedProperties[index] = updatedProperty
  
  const updatedObjectProperty = {
    ...props.property,
    properties: updatedProperties
  }
  emit('change', updatedObjectProperty)
}

const removeProperty = (index: number) => {
  const updatedProperties = props.property.properties.filter((_, i) => i !== index)
  
  const updatedObjectProperty = {
    ...props.property,
    properties: updatedProperties
  }
  emit('change', updatedObjectProperty)
}
</script>

<style scoped>
.object-property-editor {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.object-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.object-body {
  padding: 16px;
  background-color: #fafafa;
}

.additional-properties-section {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.properties-section {
  margin-top: 16px;
}

.properties-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.properties-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.property-item {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: white;
}

.no-properties {
  margin-top: 16px;
}
</style> 