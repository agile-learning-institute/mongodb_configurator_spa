<template>
  <div class="json-array-editor">
    <!-- Header with title and add button -->
    <div class="d-flex align-center mb-3">
      <div class="text-h6 font-weight-bold mr-3">{{ title }}</div>
      <v-btn
        color="primary"
        variant="outlined"
        size="small"
        @click="addItem"
        :disabled="disabled"
      >
        <v-icon start size="small">mdi-plus</v-icon>
        Add {{ itemLabel }}
      </v-btn>
    </div>

    <!-- Empty state -->
    <div v-if="!modelValue || modelValue.length === 0" class="text-center pa-4">
      <v-icon size="32" color="grey">mdi-format-list-bulleted</v-icon>
      <div class="text-body-2 text-medium-emphasis mt-2">No {{ itemLabel }}s defined</div>
    </div>

    <!-- List of JSON objects with configurable accordion behavior -->
    <div v-else>
      <v-expansion-panels v-model="expandedPanel" :multiple="allowMultiple">
        <v-expansion-panel
          v-for="(_, index) in modelValue"
          :key="index"
          class="mb-2"
        >
          <v-expansion-panel-title>
            <div class="d-flex justify-space-between align-center w-100">
              <div class="d-flex align-center">
                <span class="text-caption text-medium-emphasis mr-2">
                  {{ itemLabel }} {{ index + 1 }}
                </span>
              </div>
              <v-btn
                icon
                size="x-small"
                variant="text"
                color="error"
                @click.stop="removeItem(index)"
                :disabled="disabled"
                class="pa-0 ma-0"
              >
                <v-icon size="16">mdi-delete</v-icon>
              </v-btn>
            </div>
          </v-expansion-panel-title>
          
          <v-expansion-panel-text>
            <v-textarea
              v-model="itemTexts[index]"
              :placeholder="`Enter ${itemLabel} as JSON`"
              variant="outlined"
              density="compact"
              hide-details
              :disabled="disabled"
              :error="!!itemErrors[index]"
              :error-messages="itemErrors[index]"
              :rows="getTextareaRows()"
              auto-grow
              @update:model-value="updateItem(index, $event)"
              @blur="validateItem(index)"
            />
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>

    <!-- Error flash overlay -->
    <v-snackbar
      v-model="showError"
      color="error"
      timeout="3000"
      location="top"
    >
      {{ errorMessage }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

interface Props {
  modelValue: any[]
  title: string
  itemLabel: string
  disabled?: boolean
  autoSave?: () => Promise<void>
  allowMultiple?: boolean
  sizeMode?: 'fit-content' | 'percentage' | 'fixed'
  percentage?: number
  fixedRows?: number
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  autoSave: undefined,
  allowMultiple: false,
  sizeMode: 'fit-content',
  percentage: 70,
  fixedRows: 4
})

const emit = defineEmits<{
  'update:modelValue': [value: any[]]
}>()

// Local state for text inputs and validation
const itemTexts = ref<string[]>([])
const itemErrors = ref<string[]>([])
const showError = ref(false)
const errorMessage = ref('')
const expandedPanel = ref<number | number[] | null>(props.allowMultiple ? [] : null)
const window = ref<Window>(globalThis.window)

// Calculate textarea rows based on size mode
const getTextareaRows = () => {
  switch (props.sizeMode) {
    case 'percentage':
      return Math.floor(window.value.innerHeight * (props.percentage / 100) / 24)
    case 'fixed':
      return props.fixedRows
    case 'fit-content':
    default:
      return 4 // Default minimum rows
  }
}

// Initialize text inputs from model value
const initializeTexts = () => {
  itemTexts.value = props.modelValue.map(item => JSON.stringify(item, null, 2))
  itemErrors.value = new Array(props.modelValue.length).fill('')
}

// Add new item
const addItem = () => {
  if (props.disabled) return
  
  const newItem = {}
  const newValue = [...props.modelValue, newItem]
  emit('update:modelValue', newValue)
  
  // Add text for new item
  itemTexts.value.push(JSON.stringify(newItem, null, 2))
  itemErrors.value.push('')
  
  // Expand the new item
  if (props.allowMultiple) {
    (expandedPanel.value as number[]).push(newValue.length - 1)
  } else {
    expandedPanel.value = newValue.length - 1
  }
  
  // Auto-save if provided
  if (props.autoSave) {
    props.autoSave().catch(err => {
      showError.value = true
      errorMessage.value = err.message || 'Failed to save'
    })
  }
}

// Remove item
const removeItem = (index: number) => {
  if (props.disabled) return
  
  const newValue = [...props.modelValue]
  newValue.splice(index, 1)
  emit('update:modelValue', newValue)
  
  // Remove text and error for item
  itemTexts.value.splice(index, 1)
  itemErrors.value.splice(index, 1)
  
  // Update expanded panels
  if (props.allowMultiple) {
    const panels = expandedPanel.value as number[]
    expandedPanel.value = panels
      .filter(panel => panel !== index)
      .map(panel => panel > index ? panel - 1 : panel)
  } else {
    const panel = expandedPanel.value as number | null
    if (panel === index) {
      expandedPanel.value = null
    } else if (panel !== null && panel > index) {
      expandedPanel.value = panel - 1
    }
  }
  
  // Auto-save if provided
  if (props.autoSave) {
    props.autoSave().catch(err => {
      showError.value = true
      errorMessage.value = err.message || 'Failed to save'
    })
  }
}

// Update item from text input
const updateItem = (index: number, text: string) => {
  if (props.disabled) return
  
  try {
    const parsed = JSON.parse(text)
    const newValue = [...props.modelValue]
    newValue[index] = parsed
    emit('update:modelValue', newValue)
    
    // Clear error
    itemErrors.value[index] = ''
    
    // Auto-save if provided
    if (props.autoSave) {
      props.autoSave().catch(err => {
        showError.value = true
        errorMessage.value = err.message || 'Failed to save'
      })
    }
  } catch (err) {
    // Don't update model value on parse error, just mark as error
    itemErrors.value[index] = 'Invalid JSON'
  }
}

// Validate item on blur
const validateItem = (index: number) => {
  try {
    JSON.parse(itemTexts.value[index])
    itemErrors.value[index] = ''
  } catch (err) {
    itemErrors.value[index] = 'Invalid JSON'
  }
}

// Watch for model value changes to sync text inputs
watch(() => props.modelValue, () => {
  initializeTexts()
}, { deep: true })

// Initialize on mount
onMounted(() => {
  initializeTexts()
})
</script>

<style scoped>
.json-array-editor {
  width: 100%;
}

.v-expansion-panel-text {
  padding: 16px;
}
</style> 