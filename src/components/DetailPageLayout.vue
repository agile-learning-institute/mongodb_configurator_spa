<template>
  <v-container>
    <!-- Loading state -->
    <div v-if="loading" class="d-flex justify-center align-center pa-8">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="pa-4">
      <v-alert type="error">
        {{ error }}
        <v-btn @click="onRetry" class="mt-2">Retry</v-btn>
      </v-alert>
    </div>

    <!-- Content -->
    <div v-else-if="data">
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
      >
        <template #actions>
          <slot name="header-actions" />
        </template>
      </FileHeader>

      <!-- Main Content -->
      <div class="detail-content">
        <slot :data="data" />
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <v-dialog :model-value="showDeleteDialog" @update:model-value="(value) => emit('update:showDeleteDialog', value)" max-width="500">
      <v-card>
        <v-card-title class="text-h5">
          Delete {{ fileType }}?
        </v-card-title>
        <v-card-text>
          <p>Are you sure you want to delete "{{ title }}"?</p>
          <p class="text-caption text-medium-emphasis">
            This action cannot be undone.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="cancelDelete">Cancel</v-btn>
          <v-btn color="error" @click="confirmDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Unlock Confirmation Dialog -->
    <v-dialog :model-value="showUnlockDialog" @update:model-value="(value) => emit('update:showUnlockDialog', value)" max-width="500">
      <v-card>
        <v-card-title class="text-h5">
          Unlock {{ fileType }}?
        </v-card-title>
        <v-card-text>
          <p>Unlocking allows editing this {{ fileType }}. Are you sure?</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="cancelUnlock">Cancel</v-btn>
          <v-btn color="warning" @click="confirmUnlock">Unlock</v-btn>
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