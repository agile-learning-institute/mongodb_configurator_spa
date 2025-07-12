<template>
  <v-card class="mb-4">
    <v-card-title class="d-flex justify-space-between align-center">
      <div>
        <v-icon class="mr-2">{{ fileIcon }}</v-icon>
        {{ file.name }}
      </div>
      <div>
        <v-btn
          v-if="showEdit && !file._locked"
          icon
          small
          @click="$emit('edit')"
          title="Edit"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn
          v-if="showLock"
          icon
          small
          @click="$emit('toggle-lock')"
          :title="file._locked ? 'Unlock' : 'Lock'"
        >
          <v-icon>{{ file._locked ? 'mdi-lock' : 'mdi-lock-open' }}</v-icon>
        </v-btn>
        <v-btn
          v-if="showDelete"
          icon
          small
          color="error"
          @click="$emit('delete')"
          title="Delete"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </div>
    </v-card-title>
    
    <v-card-text>
      <div class="d-flex justify-space-between align-center">
        <div>
          <p class="text-caption mb-1">
            Created: {{ formatDate(file.created_at) }}
          </p>
          <p class="text-caption mb-1">
            Updated: {{ formatDate(file.updated_at) }}
          </p>
          <p class="text-caption">
            Size: {{ formatFileSize(file.size) }}
          </p>
        </div>
        <v-chip
          v-if="file._locked"
          color="warning"
          small
        >
          Locked
        </v-chip>
      </div>
    </v-card-text>
    
    <v-card-actions v-if="showActions">
      <v-btn
        text
        @click="$emit('open')"
      >
        Open
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn
        v-if="showProcess"
        text
        @click="$emit('process')"
      >
        Process
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface FileInfo {
  name: string
  created_at: string
  updated_at: string
  size: number
  _locked?: boolean
}

interface Props {
  file: FileInfo
  fileType?: 'configuration' | 'dictionary' | 'type' | 'enumerator' | 'test-data' | 'migration'
  showEdit?: boolean
  showDelete?: boolean
  showLock?: boolean
  showActions?: boolean
  showProcess?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showEdit: true,
  showDelete: true,
  showLock: true,
  showActions: true,
  showProcess: false
})

const emit = defineEmits<{
  edit: []
  delete: []
  'toggle-lock': []
  open: []
  process: []
}>()

const fileIcon = computed(() => {
  switch (props.fileType) {
    case 'configuration':
      return 'mdi-database'
    case 'dictionary':
      return 'mdi-book-open-variant'
    case 'type':
      return 'mdi-shape'
    case 'enumerator':
      return 'mdi-format-list-bulleted'
    case 'test-data':
      return 'mdi-file-document'
    case 'migration':
      return 'mdi-swap-horizontal'
    default:
      return 'mdi-file'
  }
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script> 