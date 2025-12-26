<template>
  <div class="file-header d-flex justify-space-between align-center mb-6" data-test="file-header">
    <div class="flex-grow-1">
      <!-- Editable Title -->
      <div class="mb-2">
        <v-text-field
          v-model="editableTitle"
          variant="outlined"
          density="compact"
          class="text-h4"
          :disabled="disabled"
          :readonly="!allowEdit"
          @blur="handleTitleChange"
          @keyup.enter="handleTitleChange"
          hide-details
          data-test="file-title-input"
        />
      </div>
    </div>
    
    <div class="d-flex align-center" data-test="file-header-actions">
      <!-- Status Chip -->
      <v-chip
        v-if="locked"
        color="warning"
        class="mr-2"
        data-test="locked-chip"
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
        data-test="unlock-btn"
      >
        <v-icon start data-test="unlock-icon">mdi-lock-open</v-icon>
        Unlock
      </v-btn>
      <v-btn
        v-else
        color="info"
        variant="elevated"
        @click="$emit('lock')"
        class="mr-2 font-weight-bold"
        data-test="lock-btn"
      >
        <v-icon start data-test="lock-icon">mdi-lock</v-icon>
        Lock
      </v-btn>
      
      <!-- Delete Button -->
      <v-btn
        color="error"
        variant="elevated"
        @click="$emit('delete')"
        class="mr-2 font-weight-bold"
        data-test="delete-btn"
      >
        <v-icon start data-test="delete-icon">mdi-delete</v-icon>
        Delete
      </v-btn>
      
      <!-- Custom Actions -->
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

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
const editableTitle = ref(props.title)

// Watch for title changes from parent
watch(() => props.title, (newTitle) => {
  editableTitle.value = newTitle
})

// Methods
const handleTitleChange = () => {
  if (editableTitle.value !== props.title) {
    emit('title-change', editableTitle.value)
  }
}
</script>

<style scoped>
.file-header {
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 16px;
}
</style> 