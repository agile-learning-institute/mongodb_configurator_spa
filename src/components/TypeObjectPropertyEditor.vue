<template>
  <div class="type-object-property-editor">
    <!-- Title pane = property editor -->
    <div class="property-title-row d-flex align-center pa-4 border-b">
      <v-icon icon="mdi-cube-outline" class="mr-3" color="primary" />
      <v-text-field
        v-model="property.description"
        placeholder="Description"
        density="compact"
        variant="outlined"
        hide-details
        :disabled="locked"
        @update:model-value="handleChange"
        class="mr-2"
        style="max-width: 300px;"
      />
      <TypeTypePicker
        v-model="property.type"
        label="Type"
        density="compact"
        :disabled="locked"
        :exclude-type="excludeType"
        :root-level="isRoot"
        @update:model-value="handleChange"
        class="mr-2"
        style="max-width: 120px;"
      />
      <v-tooltip 
        v-if="property.required" 
        location="top" 
        class="tooltip-dark"
        :open-delay="0"
        :close-delay="0"
        theme="dark"
      >
        <template v-slot:activator="{ props }">
          <v-btn
            icon
            size="x-small"
            variant="text"
            :color="property.required ? 'primary' : 'grey'"
            :disabled="locked"
            v-bind="props"
            @click="property.required = !property.required; handleChange()"
            class="pa-0 ma-0"
          >
            <v-icon size="16">mdi-star</v-icon>
          </v-btn>
        </template>
        <span>Required</span>
      </v-tooltip>
      
      <!-- Add Property Button -->
      <v-btn
        v-if="!locked"
        color="primary"
        variant="outlined"
        size="small"
        @click="addProperty"
        class="ml-auto"
      >
        <v-icon start size="small">mdi-plus</v-icon>
        Add Property
      </v-btn>
    </div>
    
    <!-- Content pane = properties list only -->
    <div class="property-content pa-4">
      <div v-if="property.properties && Object.keys(property.properties).length > 0">
        <div v-for="(prop, propName) in property.properties" :key="propName" class="mb-3">
          <TypePropertyEditorFactory
            :property="prop"
            :property-name="propName"
            :is-root="false"
            @change="updated => updateChildProperty(propName, updated)"
            @delete="() => removeProperty(propName)"
          />
        </div>
      </div>
      <div v-else class="text-center text-grey">
        <v-icon size="48" color="grey-lighten-1">mdi-folder-open</v-icon>
        <div class="text-body-2 mt-2">No properties defined</div>
        <div class="text-caption">Use the "Add Property" button to add properties</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits, ref, watch } from 'vue'
import { useTypeObjectPropertyEditor } from '@/composables/useTypeObjectPropertyEditor'
import type { TypeProperty } from '@/types/types'
import TypePropertyEditorFactory from './TypePropertyEditorFactory.vue'
import TypeTypePicker from './TypeTypePicker.vue'

interface Props {
  property: TypeProperty
  isRoot?: boolean
  excludeType?: string
}

const props = withDefaults(defineProps<Props>(), {
  isRoot: false,
  excludeType: ''
})

const emit = defineEmits(['change'])

// Use composable for logic
const propertyRef = ref(props.property)
const { addProperty, removeProperty, updateChildProperty } = useTypeObjectPropertyEditor(propertyRef, emit)

// Keep propertyRef in sync with prop
watch(() => props.property, (newVal) => {
  propertyRef.value = newVal
})

const handleChange = (newValue?: string | any) => {
  if (newValue && typeof newValue === 'object' && 'type' in newValue) {
    emit('change', { ...newValue })
  } else {
    emit('change', propertyRef.value)
  }
}

const locked = computed(() => false) // TODO: wire up lock state
</script>

<style scoped>
.type-object-property-editor {
  width: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  margin-bottom: 16px;
}

.property-title-row {
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.property-name-input {
  max-width: 150px;
}

.property-content {
  background: white;
}

/* Tooltip styling to ensure visibility */
:deep(.tooltip-dark) {
  background-color: #424242 !important;
  color: white !important;
}

:deep(.tooltip-dark .v-tooltip__content) {
  background-color: #424242 !important;
  color: white !important;
}
</style> 