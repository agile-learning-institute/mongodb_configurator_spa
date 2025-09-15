<template>
  <div class="array-of-oneof-extension" data-test="array-of-oneof-extension">
    <!-- Extend the base array extension (items type picker) -->
    <ArrayPropertyExtension
      :property="property"
      :is-dictionary="isDictionary"
      :is-type="isType"
      :disabled="disabled"
      @change="handleArrayChange"
      data-test="array-property-extension"
    />
    
    <!-- OneOf-specific actions -->
    <div class="oneof-actions" data-test="oneof-actions">
      <!-- Add Property button -->
      <div v-if="!disabled" class="action-section" data-test="add-property-action-section">
        <v-tooltip text="Add Property" location="top">
          <template v-slot:activator="{ props }">
            <v-btn
              size="normal"
              density="compact"
              variant="text"
              color="default"
              v-bind="props"
              @click="handleAddProperty"
              data-test="add-property-btn"
            >
              <span class="material-symbols-outlined">list_alt_add</span>
            </v-btn>
          </template>
        </v-tooltip>
      </div>

      <!-- Show/Hide Properties chevron -->
      <div class="action-section" data-test="collapse-action-section">
        <v-tooltip :text="collapsed ? 'Show Properties' : 'Hide Properties'" location="top">
          <template v-slot:activator="{ props }">
            <v-btn
              size="normal"
              density="compact"
              variant="text"
              color="default"
              v-bind="props"
              @click="toggleCollapsed"
              data-test="collapse-toggle-btn"
            >
              <span class="material-symbols-outlined">{{ collapsed ? 'expand_content' : 'collapse_content' }}</span>
            </v-btn>
          </template>
        </v-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
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

// Track collapsed state
const collapsed = ref(false)

// Initialize collapsed state from property
if (props.property && 'items' in props.property && props.property.items && typeof props.property.items === 'object' && '_collapsed' in props.property.items) {
  collapsed.value = (props.property.items as any)._collapsed || false
}

const handleArrayChange = (updatedProperty: Property) => {
  emit('change', updatedProperty)
}

const handleAddProperty = () => {
  emit('addProperty')
}

const toggleCollapsed = () => {
  collapsed.value = !collapsed.value
  emit('collapsed', collapsed.value)
}

// Watch for changes to the property's collapsed state
watch(() => (props.property as any).items?._collapsed, (newCollapsed) => {
  if (newCollapsed !== undefined) {
    collapsed.value = newCollapsed
  }
})
</script>

<style scoped>
.array-of-oneof-extension {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.oneof-actions {
  display: flex;
  align-items: center;
  gap: 2px;
}

.action-section {
  display: flex;
  align-items: center;
  margin-left: 2px;
}
</style>
