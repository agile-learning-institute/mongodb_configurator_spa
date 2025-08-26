<template>
  <v-container>
    <!-- Loading state -->
    <div v-if="loading" class="d-flex justify-center align-center pa-8" data-test="detail-page-loading">
      <v-progress-circular indeterminate size="64" data-test="loading-spinner"></v-progress-circular>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="pa-4" data-test="detail-page-error">
      <v-alert type="error" data-test="error-alert">
        {{ error }}
        <v-btn @click="onRetry" class="mt-2" data-test="retry-btn">Retry</v-btn>
      </v-alert>
    </div>

    <!-- Content -->
    <div v-else-if="data" data-test="detail-page-content">
      <!-- Debug info -->
      <div v-if="false" class="pa-2 bg-grey-lighten-4">
        <pre>{{ JSON.stringify(data, null, 2) }}</pre>
      </div>
      <!-- File Header -->
      <FileHeader
        :title="title"
        :file-name="fileName"
        :locked="locked"
        :disabled="disabled"
        :allow-edit="allowEdit"
        @lock="onLock"
        @unlock="onUnlock"
        @delete="onDelete"
        @title-change="onTitleChange"
        data-test="detail-page-file-header"
      >
        <template #actions>
          <slot name="header-actions" />
        </template>
      </FileHeader>

      <!-- Main Content -->
      <div class="detail-content" data-test="detail-page-main-content">
        <slot :data="data" />
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <v-dialog :model-value="showDeleteDialog" @update:model-value="(value) => emit('update:showDeleteDialog', value)" max-width="500" data-test="delete-confirmation-dialog">
      <v-card>
        <v-card-title class="text-h5" data-test="delete-dialog-title">
          Delete {{ fileType }}?
        </v-card-title>
        <v-card-text>
          <p data-test="delete-dialog-message">Are you sure you want to delete "{{ title }}"?</p>
          <p class="text-caption text-medium-emphasis" data-test="delete-dialog-warning">
            This action cannot be undone.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="cancelDelete" data-test="delete-dialog-cancel-btn">Cancel</v-btn>
          <v-btn color="error" @click="confirmDelete" data-test="delete-dialog-confirm-btn">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Unlock Confirmation Dialog -->
    <v-dialog :model-value="showUnlockDialog" @update:model-value="(value) => emit('update:showUnlockDialog', value)" max-width="500" data-test="unlock-confirmation-dialog">
      <v-card>
        <v-card-title class="text-h5" data-test="unlock-dialog-title">
          Unlock {{ fileType }}?
        </v-card-title>
        <v-card-text>
          <p data-test="unlock-dialog-message">Unlocking allows editing this {{ fileType }}. Are you sure?</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="cancelUnlock" data-test="unlock-dialog-cancel-btn">Cancel</v-btn>
          <v-btn color="warning" @click="confirmUnlock" data-test="unlock-dialog-confirm-btn">Unlock</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import FileHeader from './FileHeader.vue'

interface Props {
  loading: boolean
  error?: string | null
  data: any
  title: string
  fileName: string
  fileType: string
  locked?: boolean
  disabled?: boolean
  allowEdit?: boolean
  showDeleteDialog: boolean
  showUnlockDialog: boolean
}

const props = withDefaults(defineProps<Props>(), {
  error: null,
  locked: false,
  disabled: false,
  allowEdit: true
})

// Access props to avoid unused variable warning
const { loading, error, data, title, fileName, fileType, locked, disabled, allowEdit, showDeleteDialog, showUnlockDialog } = props

const emit = defineEmits<{
  retry: []
  lock: []
  unlock: []
  delete: []
  'title-change': [title: string]
  'confirm-delete': []
  'cancel-delete': []
  'confirm-unlock': []
  'cancel-unlock': []
  'update:showDeleteDialog': [value: boolean]
  'update:showUnlockDialog': [value: boolean]
}>()

// Methods
const onRetry = () => {
  emit('retry')
}

const onLock = () => {
  emit('lock')
}

const onUnlock = () => {
  emit('unlock')
}

const onDelete = () => {
  emit('delete')
}

const onTitleChange = (title: string) => {
  emit('title-change', title)
}

const confirmDelete = () => {
  emit('confirm-delete')
}

const cancelDelete = () => {
  emit('cancel-delete')
}

const confirmUnlock = () => {
  emit('confirm-unlock')
}

const cancelUnlock = () => {
  emit('cancel-unlock')
}
</script>

<style scoped>
.detail-content {
  margin-top: 24px;
}
</style> 