<template>
  <div class="one-of-property-editor">
    <div class="one-of-header">
      <v-icon icon="mdi-shape-outline" class="mr-2" />
      <span class="text-subtitle-2">One Of Properties</span>
      <v-spacer />
      <v-btn
        icon="mdi-chevron-down"
        variant="text"
        size="small"
        @click="expanded = !expanded"
      />
    </div>
    
    <div v-if="expanded" class="one-of-body">
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
import { ref } from 'vue'
import { type OneOfProperty, type Property } from '@/types/types'
import PropertyEditor from '../PropertyEditor.vue'

const props = defineProps<{
  property: OneOfProperty
  isDictionary?: boolean
  isType?: boolean
}>()

const emit = defineEmits<{
  change: [property: OneOfProperty]
}>()

const expanded = ref(true)

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
  
  const updatedOneOfProperty = {
    ...props.property,
    properties: updatedProperties
  }
  emit('change', updatedOneOfProperty)
}

const removeProperty = (index: number) => {
  const updatedProperties = props.property.properties.filter((_, i) => i !== index)
  
  const updatedOneOfProperty = {
    ...props.property,
    properties: updatedProperties
  }
  emit('change', updatedOneOfProperty)
}
</script>

<style scoped>
.one-of-property-editor {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.one-of-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.one-of-body {
  padding: 16px;
  background-color: #fafafa;
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