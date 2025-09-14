<template>
  <div class="one-of-property-extension" data-test="one-of-property-extension">
    <div class="property-add-section" v-if="!disabled" data-test="property-add-section">
      <v-tooltip 
        text="Add Property"
        location="top"
        color="primary"
        text-color="white"
      >
        <template v-slot:activator="{ props }">
          <v-btn
            variant="text"
            size="normal"
            density="compact"
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
    
    <!-- Note: OneOf properties do NOT have additional_properties toggle -->
    
    <div class="property-collapse-section" data-test="property-collapse-section">
      <v-tooltip 
        :text="collapsed ? 'Show properties' : 'Hide properties'"
        location="top"
        color="primary"
        text-color="white"
      >
        <template v-slot:activator="{ props }">
          <v-btn
            variant="text"
            size="normal"
            density="compact"
            color="default"
            v-bind="props"
            @click="toggleCollapsed"
            :disabled="false"
            data-test="collapse-toggle-btn"
          >
            <span class="material-symbols-outlined">{{ collapsed ? 'expand_content' : 'collapse_content' }}</span>
          </v-btn>
        </template>
      </v-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { type OneOfProperty } from '@/types/types'

const props = defineProps<{
  property: OneOfProperty
  disabled?: boolean
}>()

const emit = defineEmits<{
  change: [property: OneOfProperty]
  addProperty: []
  toggleCollapsed: [collapsed: boolean]
}>()

// Reactive state - initialize from property's collapsed state
const collapsed = ref((props.property as any)._collapsed || false)

// Watch for changes to the property's collapsed state
watch(() => (props.property as any)._collapsed, (newCollapsed) => {
  if (newCollapsed !== undefined) {
    collapsed.value = newCollapsed
  }
})

// Methods
const handleAddProperty = () => {
  emit('addProperty')
}

const toggleCollapsed = () => {
  collapsed.value = !collapsed.value
  // Update the property's collapsed state
  ;(props.property as any)._collapsed = collapsed.value
  emit('toggleCollapsed', collapsed.value)
}
</script>

<style scoped>
.one-of-property-extension {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.property-add-section {
  margin-left: 2px;
}

.property-collapse-section {
  margin-left: 2px;
}
</style>
