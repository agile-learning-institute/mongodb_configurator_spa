<template>
  <BaseCard 
    :icon="icon" 
    :is-secondary="isSubCard"
  >
    <!-- Title slot with name and description -->
    <template #title>
      <div class="d-flex align-center flex-grow-1">
        <!-- Name (editable) -->
        <span 
          v-if="!editingName"
          class="clickable-text mr-1"
          :class="isSubCard ? 'text-body-2 text-dark' : 'text-h6 text-white'"
          @click.stop="startEditName"
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
          class="clickable-text ml-2 flex-grow-1 description-text"
          :class="isSubCard ? 'text-body-2 text-dark' : 'text-h6 text-white'"
          @click="handleDescriptionClick"
          style="min-width: 100px; position: relative; z-index: 100;"
          title="Click to edit description"
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
          class="ml-2 flex-grow-1"
          style="min-width: 150px;"
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
import { ref, nextTick, onMounted, watch } from 'vue'
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

// Component lifecycle logging
onMounted(() => {
  console.log('🎬 DictionaryTypeCard mounted')
  console.log('  - name:', props.name)
  console.log('  - description:', props.description)
  console.log('  - isSubCard:', props.isSubCard)
  console.log('  - disabled:', props.disabled)
})

// Watch for editing state changes
watch(editingDescription, (newVal, oldVal) => {
  console.log('👀 editingDescription changed:', oldVal, '->', newVal)
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
  console.log('🔍 startEditDescription called')
  console.log('  - disabled:', props.disabled)
  console.log('  - isSubCard:', props.isSubCard)
  console.log('  - description:', props.description)
  console.log('  - current editingDescription:', editingDescription.value)
  
  if (props.disabled) {
    console.log('  ❌ Disabled, returning early')
    return
  }
  
  editingDescriptionValue.value = props.description || ''
  editingDescription.value = true
  console.log('  ✅ Set editingDescription to true')
  console.log('  - editingDescriptionValue:', editingDescriptionValue.value)
  
  nextTick(() => {
    console.log('  🔍 nextTick - focusing description field')
    descriptionField.value?.focus()
    console.log('  - descriptionField ref:', descriptionField.value)
  })
}

const stopEditDescription = () => {
  console.log('🔍 stopEditDescription called')
  console.log('  - editingDescriptionValue:', editingDescriptionValue.value)
  console.log('  - original description:', props.description)
  
  editingDescription.value = false
  if (editingDescriptionValue.value !== props.description) {
    console.log('  ✅ Emitting update:description')
    emit('update:description', editingDescriptionValue.value)
  } else {
    console.log('  ℹ️ No change, not emitting')
  }
}

const cancelEditDescription = () => {
  console.log('🔍 cancelEditDescription called')
  editingDescription.value = false
  editingDescriptionValue.value = props.description || ''
  console.log('  ✅ Reset editingDescription to false')
}

const handleDescriptionClick = (event: Event) => {
  console.log('🎯 Description span clicked!')
  console.log('  - isSubCard:', props.isSubCard)
  console.log('  - event:', event)
  event.stopPropagation()
  startEditDescription()
}
</script>

<style scoped>
/* Make description text more obvious */
.description-text {
  border: 1px dashed transparent;
  transition: border-color 0.2s;
  position: relative;
  z-index: 100;
  pointer-events: auto;
  cursor: pointer;
  display: inline-block;
  min-height: 1.2em;
}

.description-text:hover {
  border-color: rgba(255, 255, 255, 0.5);
  background-color: rgba(255, 255, 255, 0.1);
}

.description-text:active {
  background-color: rgba(255, 255, 255, 0.2);
}

/* Ensure clickable areas are above other elements */
.clickable-text {
  cursor: pointer;
  transition: background-color 0.2s;
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  user-select: none;
  position: relative;
  z-index: 10;
  pointer-events: auto;
}

.clickable-text:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.clickable-text:active {
  background-color: rgba(255, 255, 255, 0.3);
}

/* Ensure text fields don't interfere with click events */
.v-text-field {
  z-index: 1;
}

/* Debug styling to make clickable areas visible */
.clickable-text::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: -1;
}
</style> 