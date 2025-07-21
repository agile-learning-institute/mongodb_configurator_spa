<template>
  <div class="json-document-editor">
    <!-- Header -->
    <div class="d-flex align-center mb-3">
      <div class="text-h6 font-weight-bold mr-3">{{ title }}</div>
      <v-spacer />
      <div class="d-flex gap-2">
        <v-btn
          v-if="showFormatButton"
          color="secondary"
          variant="outlined"
          size="small"
          @click="formatJson"
          :disabled="disabled"
        >
          <v-icon start size="small">mdi-format-indent-increase</v-icon>
          Format
        </v-btn>
        <v-btn
          v-if="onDelete"
          color="error"
          variant="outlined"
          size="small"
          @click="onDelete"
          :disabled="disabled"
        >
          <v-icon start size="small">mdi-delete</v-icon>
          Delete
        </v-btn>
      </div>
    </div>

    <!-- Editor -->
    <v-textarea
      v-model="jsonText"
      :placeholder="placeholder"
      variant="outlined"
      density="compact"
      :disabled="disabled"
      :error="!!jsonError"
      :error-messages="jsonError"
      :rows="rows"
      auto-grow
      @update:model-value="handleJsonChange"
      @blur="validateJson"
    />

    <!-- Error Display -->
    <v-alert
      v-if="jsonError"
      type="error"
      variant="tonal"
      class="mt-3"
    >
      {{ jsonError }}
    </v-alert>

    <!-- Info Display -->
    <v-alert
      v-if="showInfo && !jsonError"
      type="info"
      variant="tonal"
      class="mt-3"
    >
      {{ infoMessage }}
    </v-alert>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

interface Props {
  modelValue: any
  title: string
  placeholder?: string
  disabled?: boolean
  rows?: number
  showFormatButton?: boolean
  showInfo?: boolean
  infoMessage?: string
  autoSave?: () => Promise<void>
  onDelete?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Enter JSON content...',
  disabled: false,
  rows: 20,
  showFormatButton: true,
  showInfo: false,
  infoMessage: 'Valid JSON format',
  autoSave: undefined
})

const emit = defineEmits<{
  'update:modelValue': [value: any]
}>()

// Reactive state
const jsonText = ref('')
const jsonError = ref('')
const isUpdating = ref(false)

// Computed properties
const hasValidJson = computed(() => !jsonError.value && jsonText.value.trim() !== '')

// Methods
const validateJson = () => {
  if (!jsonText.value.trim()) {
    jsonError.value = ''
    return
  }

  try {
    JSON.parse(jsonText.value)
    jsonError.value = ''
  } catch (error) {
    jsonError.value = `Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
  }
}

const formatJson = () => {
  if (!hasValidJson.value) return

  try {
    const parsed = JSON.parse(jsonText.value)
    jsonText.value = JSON.stringify(parsed, null, 2)
    validateJson()
  } catch (error) {
    // Error already handled by validateJson
  }
}

const handleJsonChange = (value: string) => {
  jsonText.value = value
  validateJson()
  
  if (!jsonError.value && value.trim()) {
    try {
      const parsed = JSON.parse(value)
      emit('update:modelValue', parsed)
      
      // Auto-save if provided
      if (props.autoSave && !isUpdating.value) {
        isUpdating.value = true
        props.autoSave().finally(() => {
          isUpdating.value = false
        })
      }
    } catch (error) {
      // Invalid JSON, don't emit update
    }
  }
}

// Watch for external value changes
watch(() => props.modelValue, (newValue) => {
  if (newValue && !isUpdating.value) {
    try {
      jsonText.value = JSON.stringify(newValue, null, 2)
      validateJson()
    } catch (error) {
      console.error('Error stringifying model value:', error)
    }
  }
}, { immediate: true, deep: true })

// Initialize with model value
if (props.modelValue) {
  try {
    jsonText.value = JSON.stringify(props.modelValue, null, 2)
  } catch (error) {
    console.error('Error initializing JSON editor:', error)
  }
}
</script>

<style scoped>
.json-document-editor {
  width: 100%;
}

.json-document-editor .v-textarea {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
}
</style> 