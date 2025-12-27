<template>
  <div class="json-array-editor" data-test="json-array-editor">
    <!-- Header with title and add button -->
    <div class="d-flex align-center mb-3" data-test="array-editor-header">
      <div class="text-h6 font-weight-bold mr-3" data-test="array-editor-title">{{ title }}</div>
      <v-btn
        color="primary"
        variant="outlined"
        size="small"
        @click="addItem"
        :disabled="disabled"
        data-test="add-item-btn"
      >
        <v-icon start size="small" data-test="add-item-icon">mdi-plus</v-icon>
        Add {{ itemLabel }}
      </v-btn>
    </div>

    <!-- Empty state -->
    <div v-if="!modelValue || modelValue.length === 0" class="text-center pa-4" data-test="array-editor-empty">
      <v-icon size="32" color="grey" data-test="empty-icon">mdi-format-list-bulleted</v-icon>
      <div class="text-body-2 text-medium-emphasis mt-2" data-test="empty-message">No {{ itemLabel }}s defined</div>
    </div>

    <!-- List of JSON objects with configurable accordion behavior -->
    <div v-else data-test="array-editor-content">
      <v-expansion-panels v-model="expandedPanel" :multiple="allowMultiple" data-test="array-expansion-panels">
        <template v-for="(_, index) in modelValue" :key="index">
          <!-- Drop zone before each panel -->
          <div 
            class="array-drop-zone"
            :class="{ 'drag-over': dragOverIndex === index }"
            :data-test="`array-drop-zone-${index}`"
            @dragover.prevent="handleDragOver(index)"
            @dragenter.prevent="handleDragEnter(index)"
            @dragleave="handleDragLeave(index)"
            @drop.prevent="(event) => handleDrop(event, index)"
          >
            <div class="drop-indicator" v-if="dragOverIndex === index"></div>
          </div>
          
          <v-expansion-panel
            class="mb-2 array-panel"
            :class="{ 'dragging': draggedIndex === index, 'drag-over': dragOverIndex === index }"
            :data-test="`array-panel-${index}`"
            :draggable="!disabled"
            @dragstart="(event: DragEvent) => handleDragStart(event, index)"
            @dragend="handleDragEnd"
            @dragover.prevent="(event: DragEvent) => handlePanelDragOver(event, index)"
            @dragenter.prevent="handleDragEnter(index)"
            @drop.prevent="(event: DragEvent) => handlePanelDrop(event, index)"
          >
            <v-expansion-panel-title :data-test="`array-panel-title-${index}`">
              <div class="d-flex justify-space-between align-center w-100">
                <div class="d-flex align-center">
                  <div 
                    v-if="!disabled"
                    class="array-drag-handle"
                    :data-test="`array-drag-handle-${index}`"
                  >
                    <v-icon size="16">mdi-drag</v-icon>
                  </div>
                  <span class="text-caption text-medium-emphasis mr-2" data-test="array-item-label">
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
                  :data-test="`remove-item-btn-${index}`"
                >
                  <v-icon size="16" :data-test="`remove-item-icon-${index}`">mdi-delete</v-icon>
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
                :rows="getItemRows(index)"
                auto-grow
                @update:model-value="updateItem(index, $event)"
                @blur="validateItem(index)"
                :data-test="`array-item-textarea-${index}`"
              />
            </v-expansion-panel-text>
          </v-expansion-panel>
        </template>
        
        <!-- Drop zone after last panel -->
        <div 
          class="array-drop-zone"
          :class="{ 'drag-over': dragOverIndex === modelValue.length }"
          :data-test="`array-drop-zone-${modelValue.length}`"
          @dragover.prevent="handleDragOver(modelValue.length)"
          @dragenter.prevent="handleDragEnter(modelValue.length)"
          @dragleave="handleDragLeave(modelValue.length)"
          @drop.prevent="(event) => handleDrop(event, modelValue.length)"
        >
          <div class="drop-indicator" v-if="dragOverIndex === modelValue.length"></div>
        </div>
      </v-expansion-panels>
    </div>

    <!-- Error flash overlay -->
    <v-snackbar
      v-model="showError"
      color="error"
      timeout="3000"
      location="top"
      data-test="array-editor-error-snackbar"
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

// Drag and drop state
const draggedIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

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

// Calculate rows needed for specific content
const getContentRows = (text: string) => {
  if (!text) return 4 // Minimum rows
  
  const lines = text.split('\n').length
  const estimatedRows = Math.max(4, lines + 1) // Add 1 for padding, minimum 4
  return Math.min(estimatedRows, 20) // Cap at 20 rows to prevent excessive height
}

// Get rows for a specific item by index
const getItemRows = (index: number) => {
  if (props.sizeMode !== 'fit-content') {
    return getTextareaRows()
  }
  
  const text = itemTexts.value[index] || ''
  return getContentRows(text)
}

// Watch for changes in itemTexts to recalculate rows
watch(itemTexts, () => {
  // Force re-render of textareas to update their row counts
  // This is handled automatically by Vue's reactivity system
}, { deep: true })

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

// Drag and drop handlers
const handleDragStart = (event: DragEvent, index: number) => {
  if (props.disabled) return
  
  draggedIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', index.toString())
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.dropEffect = 'move'
  }
  
  // Add visual feedback
  const panelElement = (event.target as HTMLElement).closest('.array-panel')
  if (panelElement) {
    (panelElement as HTMLElement).style.opacity = '0.5'
  }
}

const handleDragEnd = (event: DragEvent) => {
  // Remove visual feedback
  const panelElement = (event.target as HTMLElement).closest('.array-panel')
  if (panelElement) {
    (panelElement as HTMLElement).style.opacity = '1'
  }
  
  draggedIndex.value = null
  dragOverIndex.value = null
}

const handleDragOver = (index: number) => {
  if (props.disabled || draggedIndex.value === null) return
  dragOverIndex.value = index
}

const handleDragEnter = (index: number) => {
  if (props.disabled || draggedIndex.value === null) return
  dragOverIndex.value = index
}

const handleDragLeave = (index: number) => {
  if (dragOverIndex.value === index) {
    dragOverIndex.value = null
  }
}

const handlePanelDragOver = (event: DragEvent, index: number) => {
  if (props.disabled || draggedIndex.value === null) return
  
  // Determine if we should drop before or after this panel based on mouse position
  const panelElement = event.currentTarget as HTMLElement
  const rect = panelElement.getBoundingClientRect()
  const mouseY = event.clientY
  const panelCenter = rect.top + rect.height / 2
  
  // If mouse is in upper half, drop before (index), otherwise drop after (index + 1)
  const dropIndex = mouseY < panelCenter ? index : index + 1
  dragOverIndex.value = dropIndex
}

const handlePanelDrop = (event: DragEvent, index: number) => {
  if (props.disabled || draggedIndex.value === null) return
  
  // Determine drop position based on mouse position
  const panelElement = event.currentTarget as HTMLElement
  const rect = panelElement.getBoundingClientRect()
  const mouseY = event.clientY
  const panelCenter = rect.top + rect.height / 2
  
  // If mouse is in upper half, drop before (index), otherwise drop after (index + 1)
  const dropIndex = mouseY < panelCenter ? index : index + 1
  handleDrop(event, dropIndex)
}

const handleDrop = (event: DragEvent, dropIndex: number) => {
  event.preventDefault()
  dragOverIndex.value = null
  
  if (props.disabled || draggedIndex.value === null) return
  
  if (!event.dataTransfer) return
  
  const draggedIndexValue = draggedIndex.value
  draggedIndex.value = null
  
  // Don't do anything if dropping on itself
  if (draggedIndexValue === dropIndex) return
  
  // Create new array with reordered items
  const newValue = [...props.modelValue]
  const [draggedItem] = newValue.splice(draggedIndexValue, 1)
  
  // Adjust drop index if dragging from before the drop position
  const adjustedDropIndex = draggedIndexValue < dropIndex ? dropIndex - 1 : dropIndex
  newValue.splice(adjustedDropIndex, 0, draggedItem)
  
  // Update text arrays to match new order
  const newItemTexts = [...itemTexts.value]
  const [draggedText] = newItemTexts.splice(draggedIndexValue, 1)
  newItemTexts.splice(adjustedDropIndex, 0, draggedText)
  
  const newItemErrors = [...itemErrors.value]
  const [draggedError] = newItemErrors.splice(draggedIndexValue, 1)
  newItemErrors.splice(adjustedDropIndex, 0, draggedError)
  
  // Update expanded panels
  if (props.allowMultiple) {
    const panels = expandedPanel.value as number[]
    expandedPanel.value = panels.map(panel => {
      if (panel === draggedIndexValue) {
        return adjustedDropIndex
      } else if (draggedIndexValue < dropIndex) {
        // Dragging down
        if (panel > draggedIndexValue && panel <= adjustedDropIndex) {
          return panel - 1
        }
      } else {
        // Dragging up
        if (panel >= adjustedDropIndex && panel < draggedIndexValue) {
          return panel + 1
        }
      }
      return panel
    })
  } else {
    const panel = expandedPanel.value as number | null
    if (panel === draggedIndexValue) {
      expandedPanel.value = adjustedDropIndex
    } else if (draggedIndexValue < dropIndex) {
      // Dragging down
      if (panel !== null && panel > draggedIndexValue && panel <= adjustedDropIndex) {
        expandedPanel.value = panel - 1
      }
    } else {
      // Dragging up
      if (panel !== null && panel >= adjustedDropIndex && panel < draggedIndexValue) {
        expandedPanel.value = panel + 1
      }
    }
  }
  
  // Update model value
  itemTexts.value = newItemTexts
  itemErrors.value = newItemErrors
  emit('update:modelValue', newValue)
  
  // Auto-save if provided
  if (props.autoSave) {
    props.autoSave().catch(err => {
      showError.value = true
      errorMessage.value = err.message || 'Failed to save'
    })
  }
}

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

.array-drag-handle {
  cursor: grab;
  padding: 2px;
  margin-right: 8px;
  display: flex;
  align-items: center;
  color: rgba(0, 0, 0, 0.54);
}

.array-drag-handle:active {
  cursor: grabbing;
}

.array-panel.dragging {
  opacity: 0.5;
}

.array-drop-zone {
  min-height: 8px;
  position: relative;
  margin: 4px 0;
  z-index: 10;
}

.array-drop-zone.drag-over {
  min-height: 12px;
  background-color: rgba(25, 118, 210, 0.1);
}

.drop-indicator {
  height: 3px;
  background-color: #1976d2;
  border-radius: 2px;
  margin: 4px 0;
  width: 100%;
}

.array-panel.drag-over {
  border: 2px dashed #1976d2;
  border-radius: 4px;
}
</style> 