<template>
  <div class="object-property-extension">
    <div class="property-add-section" v-if="!disabled">
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
          />
        </template>
      </v-tooltip>
    </div>
    
    <div class="property-additional-props-section" v-if="!disabled">
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
          />
        </template>
      </v-tooltip>
    </div>
    
    <div class="property-collapse-section" v-if="!disabled">
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
          />
        </template>
      </v-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
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

// Computed properties
const canHaveAdditionalProperties = computed(() => {
  return isObjectProperty(props.property)
})

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
