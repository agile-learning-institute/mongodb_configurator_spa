<template>
  <div class="object-property-extension" data-test="object-property-extension">
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
            size="small"
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
    
    <div class="property-additional-props-section" v-if="!disabled" data-test="property-additional-props-section">
      <v-tooltip 
        text="Allow additional properties"
        location="top"
        color="primary"
        text-color="white"
      >
        <template v-slot:activator="{ props }">
          <v-btn
            variant="text"
            size="small"
            density="compact"
            v-bind="props"
            @click="toggleAdditionalProperties"
            data-test="additional-props-toggle-btn"
          >
            <span class="material-symbols-outlined">{{ getAdditionalPropsIcon() }}</span>
          </v-btn>
        </template>
      </v-tooltip>
    </div>
    
    <div class="property-collapse-section" v-if="!disabled" data-test="property-collapse-section">
      <v-tooltip 
        :text="collapsed ? 'Show properties' : 'Hide properties'"
        location="top"
        color="primary"
        text-color="white"
      >
        <template v-slot:activator="{ props }">
          <v-btn
            variant="text"
            size="small"
            density="compact"
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
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { type ObjectProperty, isObjectProperty } from '@/types/types'

const props = defineProps<{
  property: ObjectProperty
  disabled?: boolean
}>()

const emit = defineEmits<{
  change: [property: ObjectProperty]
  addProperty: []
  toggleCollapsed: [collapsed: boolean]
}>()

// Reactive state
const collapsed = ref(false)



// Methods
const handleAddProperty = () => {
  emit('addProperty')
}

const toggleAdditionalProperties = () => {
  if (isObjectProperty(props.property)) {
    props.property.additional_properties = !props.property.additional_properties
    emit('change', props.property)
  }
}

const toggleCollapsed = () => {
  collapsed.value = !collapsed.value
  emit('toggleCollapsed', collapsed.value)
}

const getAdditionalPropsIcon = (): string => {
  if (isObjectProperty(props.property)) {
    return props.property.additional_properties ? 'list_alt_check' : 'list_alt'
  }
  return 'list_alt'
}
</script>

<style scoped>
.object-property-extension {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.property-add-section {
  margin-left: 2px;
}

.property-additional-props-section {
  margin-left: 2px;
}

.property-collapse-section {
  margin-left: 2px;
}
</style>
