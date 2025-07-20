<template>
  <div class="file-header d-flex justify-space-between align-center mb-6">
    <div class="flex-grow-1">
      <!-- Editable Title -->
      <div class="mb-2">
        <!-- View Mode -->
        <h1 
          v-if="!editingTitle" 
          class="text-h4 clickable-title"
          @click="startEditTitle"
        >
          {{ displayTitle }}
        </h1>
        <!-- Edit Mode -->
        <v-text-field
          v-else
          v-model="editableTitle"
          variant="outlined"
          density="compact"
          class="text-h4"
          :disabled="disabled"
          @update:model-value="handleTitleChange"
          @blur="stopEditTitle"
          @keyup.enter="stopEditTitle"
          @keyup.esc="cancelEditTitle"
          ref="titleField"
          hide-details
          autofocus
        />
      </div>
    </div>
    
    <div class="d-flex align-center">
      <!-- Status Chip -->
      <v-chip
        v-if="locked"
        color="warning"
        class="mr-2"
      >
        Locked
      </v-chip>
      
      <!-- Lock/Unlock Button -->
      <v-btn
        v-if="locked"
        color="warning"
        variant="elevated"
        @click="$emit('unlock')"
        class="mr-2 font-weight-bold"
      >
        <v-icon start>mdi-lock-open</v-icon>
        Unlock
      </v-btn>
      <v-btn
        v-else
        color="info"
        variant="elevated"
        @click="$emit('lock')"
        class="mr-2 font-weight-bold"
      >
        <v-icon start>mdi-lock</v-icon>
        Lock
      </v-btn>
      
      <!-- Delete Button -->
      <v-btn
        color="error"
        variant="elevated"
        @click="$emit('delete')"
        class="mr-2 font-weight-bold"
      >
        <v-icon start>mdi-delete</v-icon>
        Delete
      </v-btn>
      
      <!-- Custom Actions -->
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'

interface Props {
  title: string
  fileName?: string
  locked?: boolean
  disabled?: boolean
  allowEdit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  fileName: '',
  locked: false,
  disabled: false,
  allowEdit: true
})

const emit = defineEmits<{
  lock: []
  unlock: []
  delete: []
  'title-change': [title: string]
}>()

// Reactive state
const editingTitle = ref(false)
const editableTitle = ref(props.title)
const titleField = ref<HTMLElement>()

// Computed properties
const displayTitle = computed(() => {
  if (props.title) return props.title
  if (props.fileName) return props.fileName.replace('.yaml', '')
  return 'Untitled'
})

// Methods
const startEditTitle = () => {
  if (!props.allowEdit || props.disabled) return
  
  editingTitle.value = true
  editableTitle.value = props.title || displayTitle.value
  
  nextTick(() => {
    titleField.value?.focus()
  })
}

const stopEditTitle = () => {
  if (editingTitle.value) {
    editingTitle.value = false
    emit('title-change', editableTitle.value)
  }
}

const cancelEditTitle = () => {
  editingTitle.value = false
  editableTitle.value = props.title || displayTitle.value
}

const handleTitleChange = (value: string) => {
  editableTitle.value = value
}
</script>

<style scoped>
.clickable-title {
  cursor: pointer;
  transition: color 0.2s ease-in-out;
}

.clickable-title:hover {
  color: #2E7D32;
}

.file-header {
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 16px;
}
</style> 