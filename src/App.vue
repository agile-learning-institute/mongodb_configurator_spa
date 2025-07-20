<template>
  <AppLayout>
    <template #default>
      <router-view />
    </template>
  </AppLayout>
  
  <!-- Global Event Dialog -->
  <EventDialog
    v-model="showEventDialog"
    :event="currentEvent"
    :message="eventMessage"
    :title="eventTitle"
    :subtitle="eventSubtitle"
  />
</template>

<script setup lang="ts">
import AppLayout from '@/components/AppLayout.vue'
import EventDialog from '@/components/EventDialog.vue'
import { useEvents } from '@/composables/useEvents'

const {
  showEventDialog,
  currentEvent,
  eventMessage,
  eventTitle,
  eventSubtitle
} = useEvents()
</script>

<style>
/* Global styles */
</style> 