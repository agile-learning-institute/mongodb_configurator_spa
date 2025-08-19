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

/* Ensure tooltip text is always visible with good contrast */
.v-tooltip .v-tooltip__content,
.v-overlay__content {
  color: white !important;
  background-color: #2E7D32 !important; /* primary color */
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Remove top padding from all Vuetify input fields */
:root {
  --v-field-input-padding-top: 0 !important;
}

.v-field__input,
.v-input__control,
.v-field,
.v-input {
  --v-field-input-padding-top: 0 !important;
  padding-top: 0 !important;
}

input {
  padding-top: 0 !important;
  margin-top: 0 !important;
}
</style> 