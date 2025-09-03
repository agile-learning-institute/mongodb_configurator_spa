<template>
  <div class="array-of-object-extension" data-test="array-of-object-extension">
    <!-- Extend the base array extension (items type picker) -->
    <ArrayPropertyExtension
      :property="property"
      :is-dictionary="isDictionary"
      :is-type="isType"
      :disabled="disabled"
      @change="handleArrayChange"
      data-test="array-property-extension"
    />
    
    <!-- Object-specific actions -->
    <div class="object-actions" data-test="object-actions">
      <!-- Add Property button -->
      <div v-if="!disabled" class="action-section" data-test="add-property-action-section">
        <v-tooltip text="Add Property" location="top">
          <template v-slot:activator="{ props }">
            <v-btn
              icon="list-alt-add"
              size="small"
              variant="text"
              color="primary"
              v-bind="props"
              @click="handleAddProperty"
              data-test="add-property-btn"
            />
          </template>
        </v-tooltip>
      </div>
      
      <!-- Allow Additional Properties toggle -->
      <div v-if="!disabled" class="action-section" data-test="additional-props-action-section">
        <v-tooltip :text="additionalPropsTooltip" location="top">
          <template v-slot:activator="{ props }">
            <v-btn
              :icon="additionalPropsIcon"
              size="small"
              variant="text"
              color="primary"
              v-bind="props"
              @click="toggleAdditionalProperties"
              data-test="additional-props-toggle-btn"
            />
          </template>
        </v-tooltip>
      </div>
      
      <!-- Show/Hide Properties chevron -->
      <div v-if="!disabled" class="action-section" data-test="collapse-action-section">
        <v-tooltip :text="collapsed ? 'Show Properties' : 'Hide Properties'" location="top">
          <template v-slot:activator="{ props }">
            <v-btn
              :icon="collapsed ? 'expand-content' : 'collapse-content'"
              size="small"
              variant="text"
              color="primary"
              v-bind="props"
              @click="toggleCollapsed"
              data-test="collapse-toggle-btn"
            />
          </template>
        </v-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { type Property } from '@/types/types'
import ArrayPropertyExtension from './ArrayPropertyExtension.vue'

const props = defineProps<{
  property: Property
  isDictionary?: boolean
  isType?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  change: [property: Property]
  addProperty: []
  collapsed: [collapsed: boolean]
}>()

// Local state
const collapsed = ref(false)

// Computed properties
const additionalPropsTooltip = computed(() => {
  if (props.property.type === 'array' && 'items' in props.property && props.property.items.type === 'object') {
    const items = props.property.items as any
    const hasAdditionalProps = items.additional_properties !== undefined ? items.additional_properties : false
    return hasAdditionalProps ? 'Disable additional properties' : 'Allow additional properties'
  }
  return 'Allow additional properties'
})

const additionalPropsIcon = computed(() => {
  if (props.property.type === 'array' && 'items' in props.property && props.property.items.type === 'object') {
    const items = props.property.items as any
    const hasAdditionalProps = items.additional_properties !== undefined ? items.additional_properties : false
    return hasAdditionalProps ? 'list-alt-check' : 'list-alt'
  }
  return 'list-alt'
})

// Methods
const handleArrayChange = (updatedProperty: Property) => {
  emit('change', updatedProperty)
}

const handleAddProperty = () => {
  emit('addProperty')
}

const toggleAdditionalProperties = () => {
  if (props.property.type === 'array' && 'items' in props.property && props.property.items.type === 'object') {
    const items = props.property.items as any
    const currentAdditionalProps = items.additional_properties !== undefined ? items.additional_properties : false
    const newItems = {
      ...items,
      additional_properties: !currentAdditionalProps
    }
    
    const newProperty = {
      ...props.property,
      items: newItems
    }
    
    emit('change', newProperty)
  }
}

const toggleCollapsed = () => {
  collapsed.value = !collapsed.value
  emit('collapsed', collapsed.value)
}
</script>

<style scoped>
.array-of-object-extension {
  display: flex;
  align-items: center;
  gap: 8px;
}

.object-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-section {
  display: flex;
  align-items: center;
}
</style>
