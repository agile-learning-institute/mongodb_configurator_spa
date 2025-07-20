<template>
  <BaseCard
    :title="cardTitle"
    :icon="icon"
    :is-secondary="isSubCard"
    :clickable="false"
  >
    <template #title>
      <div class="d-flex align-center">
        <v-icon v-if="icon" class="mr-3" :size="isSubCard ? 16 : 20" :color="isSubCard ? 'dark' : 'white'">{{ icon }}</v-icon>
        
        <!-- Name (editable) -->
        <span 
          v-if="!editingName"
          class="clickable-text mr-1"
          :class="isSubCard ? 'text-body-2 text-dark' : 'text-h6 text-white'"
          @click="startEditName"
        >
          {{ name }}:
        </span>
        <v-text-field
          v-else
          v-model="editingNameValue"
          variant="outlined"
          density="compact"
          :class="isSubCard ? 'text-body-2 text-dark' : 'text-h6 text-white'"
          :disabled="disabled"
          @blur="stopEditName"
          @keyup.enter="stopEditName"
          @keyup.esc="cancelEditName"
          ref="nameField"
          hide-details
          autofocus
          style="min-width: 120px; max-width: 200px;"
        />
        
        <!-- Description (editable) -->
        <span 
          v-if="!editingDescription"
          class="clickable-text flex-grow-1"
          :class="isSubCard ? 'text-body-2 text-dark' : 'text-h6 text-white'"
          @click="startEditDescription"
        >
          {{ description }}
        </span>
        <v-text-field
          v-else
          v-model="editingDescriptionValue"
          variant="outlined"
          density="compact"
          :class="isSubCard ? 'text-body-2 text-dark' : 'text-h6 text-white'"
          :disabled="disabled"
          @blur="stopEditDescription"
          @keyup.enter="stopEditDescription"
          @keyup.esc="cancelEditDescription"
          ref="descriptionField"
          hide-details
          autofocus
          class="flex-grow-1"
        />
      </div>
    </template>
    
    <template #header-actions>
      <!-- Type Picker -->
      <div class="mr-3" style="min-width: 120px;">
        <DictionaryTypePicker
          :model-value="modelValue"
          @update:model-value="(value) => emit('update:modelValue', value)"
          label="Type"
          density="compact"
          :disabled="disabled"
          :exclude-type="excludeType"
          class="items-type-picker"
        />
      </div>
      
      <!-- Extra slot for type-specific controls -->
      <slot name="extra" />
      
      <!-- Actions slot for standard actions -->
      <slot name="actions" />
    </template>
    
    <!-- Content slot - only used for object types -->
    <slot name="content" />
  </BaseCard>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import BaseCard from './BaseCard.vue'
import DictionaryTypePicker from './DictionaryTypePicker.vue'

interface Props {
  name: string
  description?: string
  modelValue: string
  icon?: string
  isSubCard?: boolean
  disabled?: boolean
  excludeType?: string
}

const props = withDefaults(defineProps<Props>(), {
  description: 'No description',
  icon: 'mdi-cube-outline',
  isSubCard: false,
  disabled: false,
  excludeType: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:name': [value: string]
  'update:description': [value: string]
}>()

// Edit mode states
const editingName = ref(false)
const editingDescription = ref(false)
const editingNameValue = ref('')
const editingDescriptionValue = ref('')
const nameField = ref<any>(null)
const descriptionField = ref<any>(null)

// Computed card title (for fallback)
const cardTitle = computed(() => {
  return `${props.name}: ${props.description}`
})

// Name editing functions
const startEditName = () => {
  if (props.disabled) return
  editingNameValue.value = props.name
  editingName.value = true
  nextTick(() => {
    nameField.value?.focus()
  })
}

const stopEditName = () => {
  editingName.value = false
  if (editingNameValue.value.trim() !== props.name) {
    emit('update:name', editingNameValue.value.trim())
  }
}

const cancelEditName = () => {
  editingName.value = false
  editingNameValue.value = props.name
}

// Description editing functions
const startEditDescription = () => {
  if (props.disabled) return
  editingDescriptionValue.value = props.description || ''
  editingDescription.value = true
  nextTick(() => {
    descriptionField.value?.focus()
  })
}

const stopEditDescription = () => {
  editingDescription.value = false
  if (editingDescriptionValue.value !== props.description) {
    emit('update:description', editingDescriptionValue.value)
  }
}

const cancelEditDescription = () => {
  editingDescription.value = false
  editingDescriptionValue.value = props.description || ''
}
</script>

<style scoped>
.clickable-text {
  cursor: pointer;
  transition: background-color 0.2s;
}

.clickable-text:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 2px 4px;
}

.clickable-text:active {
  background-color: rgba(255, 255, 255, 0.2);
}
</style> 