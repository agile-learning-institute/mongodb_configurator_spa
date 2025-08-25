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
            icon="mdi-plus"
            variant="text"
            size="small"
            color="default"
            v-bind="props"
            @click="handleAddProperty"
            data-test="add-property-btn"
          />
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
            :icon="getAdditionalPropsIcon()"
            variant="text"
            size="large"
            v-bind="props"
            @click="toggleAdditionalProperties"
            data-test="additional-props-toggle-btn"
          />
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
            :icon="collapsed ? 'mdi-chevron-left' : 'mdi-chevron-down'"
            variant="text"
            size="small"
            color="default"
            v-bind="props"
            @click="toggleCollapsed"
            data-test="collapse-toggle-btn"
          />
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
    return props.property.additional_properties ? 'mdi-checkbox-marked-circle' : 'mdi-checkbox-blank-circle-outline'
  }
  return 'mdi-checkbox-blank-circle-outline'
}
</script>

<style scoped>
.object-property-extension {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.property-add-section {
  margin-left: 8px;
}

.property-additional-props-section {
  margin-left: 8px;
}

.property-collapse-section {
  margin-left: 8px;
}
</style>
