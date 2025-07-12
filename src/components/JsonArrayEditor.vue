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

    <!-- List of JSON objects -->
    <div v-else>
      <div
        v-for="(item, index) in modelValue"
        :key="index"
        class="mb-3"
      >
        <v-card variant="outlined" class="pa-3">
          <div class="d-flex align-center mb-2">
            <div class="text-caption text-medium-emphasis mr-2">
              {{ itemLabel }} {{ index + 1 }}
            </div>
            <v-spacer />
            <v-btn
              icon
              size="x-small"
              variant="text"
              color="error"
              @click="removeItem(index)"
              :disabled="disabled"
              class="pa-0 ma-0"
            >
              <v-icon size="16">mdi-delete</v-icon>
            </v-btn>
          </div>
          
          <v-textarea
            v-model="itemTexts[index]"
            :placeholder="`Enter ${itemLabel} as JSON`"
            variant="outlined"
            density="compact"
            hide-details
            :disabled="disabled"
            :error="!!itemErrors[index]"
            :error-messages="itemErrors[index]"
            rows="4"
            @update:model-value="updateItem(index, $event)"
            @blur="validateItem(index)"
          />
        </v-card>
      </div>
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
import { ref, watch, computed } from 'vue'

interface Props {
  modelValue: any[]
  title: string
  itemLabel: string
  disabled?: boolean
  autoSave?: () => Promise<void>
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  autoSave: undefined
})

const emit = defineEmits<{
  'update:modelValue': [value: any[]]
}>()

// Local state for text inputs and validation
const itemTexts = ref<string[]>([])
const itemErrors = ref<string[]>([])
const showError = ref(false)
const errorMessage = ref('')

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
initializeTexts()
</script>

<style scoped>
.json-array-editor {
  width: 100%;
}
</style> 