<template>
  <div class="array-property-extension">
    <div class="items-type-section">
      <v-tooltip 
        text="Array items type"
        location="top"
        color="primary"
        text-color="white"
      >
        <template v-slot:activator="{ props }">
          <div class="items-type-label mr-2" v-bind="props">
            <span class="text-caption text-medium-emphasis">Items:</span>
          </div>
        </template>
      </v-tooltip>
      
      <TypeChipPicker
        v-if="!disabled"
        v-model="editableItemsType"
        :is-root="false"
        :is-dictionary="isDictionary"
        :is-type="isType"
        @update:model-value="handleItemsTypeChange"
      />
      
      <!-- Show items type when disabled (read-only) -->
      <div v-else class="items-type-display">
        <span class="text-caption text-medium-emphasis mr-2">Items:</span>
        <v-chip
          :color="getChipColor(editableItemsType)"
          :variant="getChipVariant(editableItemsType)"
          size="small"
        >
          <v-icon start :icon="getTypeIcon(editableItemsType)" size="small" />
          {{ getDisplayName(editableItemsType) }}
        </v-chip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { type ArrayProperty } from '@/types/types'
import TypeChipPicker from './TypeChipPicker.vue'

const props = defineProps<{
  property: ArrayProperty
  isDictionary?: boolean
  isType?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  change: [property: ArrayProperty]
}>()

// Reactive state
const editableItemsType = ref(props.property.items?.type || 'string')



// Computed properties
const isDictionary = computed(() => props.isDictionary || false)
const isType = computed(() => props.isType || false)

// Methods
const handleItemsTypeChange = (newItemsType: string) => {
  if (newItemsType !== editableItemsType.value) {
    editableItemsType.value = newItemsType
    
    // Update the property items type
    if (!props.property.items) {
      props.property.items = {
        name: 'item',
        description: 'Array item',
        type: newItemsType,
        required: false
      }
    } else {
      props.property.items.type = newItemsType
    }
    
    emit('change', props.property)
  }
}

// Helper methods for read-only display
const getChipColor = (type: string): string => {
  switch (type) {
    case 'array': return 'blue'
    case 'object': return 'green'
    case 'string': return 'orange'
    case 'number': return 'purple'
    case 'boolean': return 'red'
    case 'custom': return 'indigo'
    default: return 'grey'
  }
}

const getChipVariant = (type: string): string => {
  return 'outlined'
}

const getTypeIcon = (type: string): string => {
  switch (type) {
    case 'array': return 'mdi-format-list-bulleted'
    case 'object': return 'mdi-cube-outline'
    case 'string': return 'mdi-format-text'
    case 'number': return 'mdi-numeric'
    case 'boolean': return 'mdi-checkbox-marked-outline'
    case 'custom': return 'mdi-cog'
    default: return 'mdi-help-circle'
  }
}

const getDisplayName = (type: string): string => {
  switch (type) {
    case 'array': return 'Array'
    case 'object': return 'Object'
    case 'string': return 'String'
    case 'number': return 'Number'
    case 'boolean': return 'Boolean'
    case 'custom': return 'Custom'
    default: return type
  }
}

// Watch for property changes and update local state
watch(() => props.property.items?.type, (newItemsType) => {
  if (newItemsType && newItemsType !== editableItemsType.value) {
    editableItemsType.value = newItemsType
  }
}, { deep: true })
</script>

<style scoped>
.array-property-extension {
  flex-shrink: 0;
}

.items-type-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.items-type-label {
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.items-type-display {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
