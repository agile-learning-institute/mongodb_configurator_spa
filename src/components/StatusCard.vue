<template>
  <BaseCard 
    :title="title"
    :icon="statusIcon"
    class="mb-4"
    :data-test="`status-card-${status}`"
  >
    <template #header-actions>
      <v-chip
        :color="statusColor"
        small
        data-test="status-chip"
      >
        {{ status }}
      </v-chip>
    </template>

    <div v-if="message" class="mb-3" data-test="status-message">
      <p data-test="status-message-text">{{ message }}</p>
    </div>
    
    <div v-if="progress !== null" class="mb-3" data-test="status-progress">
      <v-progress-linear
        :value="progress"
        :color="progressColor"
        height="8"
        rounded
        data-test="progress-bar"
      />
      <p class="text-caption mt-1" data-test="progress-text">{{ progress }}% complete</p>
    </div>
    
    <div v-if="details" class="mt-3" data-test="status-details">
      <v-expansion-panels data-test="details-expansion-panels">
        <v-expansion-panel data-test="details-expansion-panel">
          <v-expansion-panel-title data-test="details-expansion-panel-title">
            Details
          </v-expansion-panel-title>
          <v-expansion-panel-text data-test="details-expansion-panel-text">
            <pre class="text-caption" data-test="details-content">{{ details }}</pre>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
    
    <v-card-actions v-if="showActions" class="status-actions" data-test="status-actions">
      <v-btn
        v-if="status === 'error'"
        color="primary"
        @click="$emit('retry')"
        data-test="retry-btn"
      >
        Retry
      </v-btn>
      <v-btn
        v-if="status === 'completed'"
        color="secondary"
        @click="$emit('view')"
        data-test="view-results-btn"
      >
        View Results
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn
        text
        @click="$emit('dismiss')"
        data-test="dismiss-btn"
      >
        Dismiss
      </v-btn>
    </v-card-actions>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseCard from './BaseCard.vue'

interface Props {
  title: string
  status: 'pending' | 'processing' | 'completed' | 'error' | 'cancelled'
  message?: string
  progress?: number | null
  details?: string
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true
})

defineEmits<{
  retry: []
  view: []
  dismiss: []
}>()

const statusIcon = computed(() => {
  switch (props.status) {
    case 'pending':
      return 'mdi-clock-outline'
    case 'processing':
      return 'mdi-sync'
    case 'completed':
      return 'mdi-check-circle'
    case 'error':
      return 'mdi-alert-circle'
    case 'cancelled':
      return 'mdi-cancel'
    default:
      return 'mdi-information'
  }
})

const statusColor = computed(() => {
  switch (props.status) {
    case 'pending':
      return 'warning'
    case 'processing':
      return 'info'
    case 'completed':
      return 'success'
    case 'error':
      return 'error'
    case 'cancelled':
      return 'grey'
    default:
      return 'primary'
  }
})

const progressColor = computed(() => {
  if (props.progress === null || props.progress === undefined) return 'primary'
  if (props.progress < 50) return 'warning'
  if (props.progress < 100) return 'info'
  return 'success'
})
</script>

<style scoped>
.status-actions {
  background: linear-gradient(135deg, #F1F8E9 0%, #E8F5E8 100%);
  border-top: 1px solid rgba(46, 125, 50, 0.1);
}
</style> 