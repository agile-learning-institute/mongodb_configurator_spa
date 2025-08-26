<template>
  <div class="array-of-array-extension" data-test="array-of-array-extension">
    <!-- Extend the base array extension (items type picker) -->
    <ArrayPropertyExtension
      :property="props.property"
      :is-dictionary="props.isDictionary"
      :is-type="props.isType"
      :disabled="props.disabled"
      @change="handleArrayChange"
      data-test="array-property-extension"
    />
    
    <!-- Array-specific actions -->
    <div class="array-actions" data-test="array-actions">
      <!-- Show/Hide Items chevron -->
      <div v-if="!props.disabled" class="action-section" data-test="collapse-action-section">
        <v-tooltip :text="collapsed ? 'Show Items' : 'Hide Items'" location="top">
          <template v-slot:activator="{ props }">
            <v-btn
              :icon="collapsed ? 'mdi-chevron-left' : 'mdi-chevron-down'"
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
import { ref } from 'vue'
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
  collapsed: [collapsed: boolean]
}>()

// Local state
const collapsed = ref(false)

// Methods
const handleArrayChange = (updatedProperty: Property) => {
  emit('change', updatedProperty)
}

const toggleCollapsed = () => {
  collapsed.value = !collapsed.value
  emit('collapsed', collapsed.value)
}
</script>

<style scoped>
.array-of-array-extension {
  display: flex;
  align-items: center;
  gap: 8px;
}

.array-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-section {
  display: flex;
  align-items: center;
}
</style>
