<template>
  <BaseCard 
    :title="title"
    :icon="statusIcon"
    class="mb-4"
  >
    <template #header-actions>
      <v-chip
        :color="statusColor"
        small
      >
        {{ status }}
      </v-chip>
    </template>

    <div v-if="message" class="mb-3">
      <p>{{ message }}</p>
    </div>
    
    <div v-if="progress !== null" class="mb-3">
      <v-progress-linear
        :value="progress"
        :color="progressColor"
        height="8"
        rounded
      />
      <p class="text-caption mt-1">{{ progress }}% complete</p>
    </div>
    
    <div v-if="details" class="mt-3">
      <v-expansion-panels>
        <v-expansion-panel>
          <v-expansion-panel-title>
            Details
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <pre class="text-caption">{{ details }}</pre>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
    
    <v-card-actions v-if="showActions" class="status-actions">
      <v-btn
        v-if="status === 'error'"
        color="primary"
        @click="$emit('retry')"
      >
        Retry
      </v-btn>
      <v-btn
        v-if="status === 'completed'"
        color="secondary"
        @click="$emit('view')"
      >
        View Results
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn
        text
        @click="$emit('dismiss')"
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