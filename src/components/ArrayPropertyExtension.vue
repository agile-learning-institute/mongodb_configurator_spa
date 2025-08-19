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
        v-model="editableItemsType"
        :is-root="false"
        :is-dictionary="isDictionary"
        :is-type="isType"
        :disabled="disabled"
        @update:model-value="handleItemsTypeChange"
      />
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
</style>
