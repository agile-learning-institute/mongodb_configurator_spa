<template>
  <BaseCard 
    :title="file.name"
    :icon="fileIcon"
    :clickable="showEdit && !file._locked"
    @click="handleCardClick"
  >
    <template #header-actions>
      <v-chip
        v-if="file._locked"
        color="warning"
        size="small"
        class="mr-2"
      >
        Locked
      </v-chip>
      
      <v-btn
        v-if="showLock"
        icon
        size="small"
        variant="text"
        color="white"
        @click.stop="$emit('toggle-lock')"
        :title="file._locked ? 'Unlock' : 'Lock'"
      >
        <v-icon size="18">{{ file._locked ? 'mdi-lock' : 'mdi-lock-open' }}</v-icon>
      </v-btn>
      
      <v-btn
        v-if="showDelete"
        icon
        size="small"
        variant="text"
        color="white"
        @click.stop="$emit('delete')"
        title="Delete"
      >
        <v-icon size="18">mdi-delete</v-icon>
      </v-btn>
      
      <v-btn
        v-if="showProcess"
        icon
        size="small"
        variant="text"
        color="white"
        @click.stop="$emit('process')"
        title="Process"
      >
        <v-icon size="18">mdi-cog</v-icon>
      </v-btn>

      <!-- Expand/collapse button for section cards -->
      <v-btn
        v-if="isSectionCard && showExpand"
        icon
        size="small"
        variant="text"
        color="white"
        @click.stop="$emit('toggle-expand')"
        :title="expanded ? 'Collapse' : 'Expand'"
      >
        <v-icon size="18">{{ expanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
      </v-btn>

      <!-- Custom action buttons slot -->
      <slot name="actions" />
    </template>

    <div v-if="!isSectionCard" class="d-flex align-center text-caption text-medium-emphasis">
      <span class="mr-4">Created: {{ formatDate(file.created_at) }}</span>
      <span class="mr-4">Updated: {{ formatDate(file.updated_at) }}</span>
      <span>Size: {{ formatFileSize(file.size) }}</span>
    </div>
    
    <!-- Section card content -->
    <div v-else-if="expanded">
      <slot />
    </div>
    <!-- Collapsed content for section cards -->
    <div v-else-if="isSectionCard && !expanded" class="text-medium-emphasis">
      <slot name="collapsed" />
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseCard from './BaseCard.vue'

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
  isSectionCard?: boolean
  showExpand?: boolean
  expanded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showEdit: true,
  showDelete: true,
  showLock: true,
  showActions: true,
  showProcess: false,
  isSectionCard: false,
  showExpand: false,
  expanded: false
})

const emit = defineEmits<{
  edit: []
  delete: []
  'toggle-lock': []
  open: []
  process: []
  'toggle-expand': []
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

const handleCardClick = () => {
  if (props.showEdit && !props.file._locked) {
    emit('edit')
  }
}

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

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  background-color: rgba(46, 125, 50, 0.04);
}

.file-card {
  border-radius: 12px !important;
  overflow: hidden;
}

.header-section {
  background: linear-gradient(135deg, #2E7D32 0%, #388E3C 100%);
  border-radius: 12px 12px 0 0;
}

.content-section {
  background: linear-gradient(135deg, #F1F8E9 0%, #E8F5E8 100%);
}
</style> 