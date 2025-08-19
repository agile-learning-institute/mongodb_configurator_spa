<template>
  <div class="object-property-editor">
    <!-- Properties List -->
    <div class="properties-section">
      <div class="d-flex align-center justify-space-between mb-3">
        <h4 class="text-h6">Properties</h4>
        <v-btn
          prepend-icon="mdi-plus"
          variant="outlined"
          size="small"
          @click="addProperty"
          :disabled="disabled"
        >
          Add Property
        </v-btn>
      </div>

      <!-- Empty state -->
      <div v-if="!properties || properties.length === 0" class="text-center pa-4">
        <v-icon size="48" color="grey">mdi-format-list-bulleted</v-icon>
        <p class="text-body-2 text-medium-emphasis mt-2">No properties defined</p>
        <p class="text-caption text-medium-emphasis">Click "Add Property" to get started</p>
      </div>

      <!-- Properties list -->
      <div v-else class="properties-list">
        <div
          v-for="(prop, index) in properties"
          :key="index"
          class="property-item"
        >
          <PropertyEditor
            :property="prop"
            :is-dictionary="isDictionary"
            :is-type="isType"
            @change="handlePropertyChange(index, $event)"
            @delete="removeProperty(index)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { isObjectProperty, type ObjectProperty } from '@/types/types'
import PropertyEditor from '../PropertyEditor.vue'

const props = defineProps<{
  property: ObjectProperty
  isDictionary?: boolean
  isType?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  change: [property: ObjectProperty]
}>()

// Computed properties
const properties = computed(() => {
  if (isObjectProperty(props.property)) {
    return props.property.properties || []
  }
  return []
})



const addProperty = () => {
  if (isObjectProperty(props.property)) {
    if (!props.property.properties) {
      props.property.properties = []
    }
    
    const newProperty = {
      name: `property_${props.property.properties.length + 1}`,
      description: '',
      type: 'string',
      required: false
    }
    
    props.property.properties.push(newProperty)
    emit('change', props.property)
  }
}

const handlePropertyChange = (index: number, updatedProperty: any) => {
  if (isObjectProperty(props.property) && props.property.properties) {
    props.property.properties[index] = updatedProperty
    emit('change', props.property)
  }
}

const removeProperty = (index: number) => {
  if (isObjectProperty(props.property) && props.property.properties) {
    props.property.properties.splice(index, 1)
    emit('change', props.property)
  }
}
</script>

<style scoped>
.object-property-editor {
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fafafa;
}

.properties-section {
  margin-top: 0;
}

.properties-list {
  max-height: 400px;
  overflow-y: auto;
}

.property-item {
  background-color: transparent;
  border-bottom: 1px solid #e0e0e0;
}

.property-item:last-child {
  border-bottom: none;
}
</style> 