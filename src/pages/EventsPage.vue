<template>
  <v-container>
    <!-- Loading state -->
    <div v-if="loading" class="d-flex justify-center align-center pa-8">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </div>

    <!-- Events display -->
    <div v-else>
      <!-- Header -->
      <div class="d-flex justify-space-between align-center mb-6">
        <div>
          <h1 class="text-h4">Events</h1>
          <p class="text-body-1 text-medium-emphasis">Processing and validation events</p>
        </div>
        <div class="d-flex align-center">
          <v-btn
            color="secondary"
            @click="clearEvents"
            :disabled="!events.length"
          >
            <v-icon start>mdi-delete-sweep</v-icon>
            Clear All
          </v-btn>
        </div>
      </div>

      <!-- Events list -->
      <div v-if="events.length > 0">
        <div class="d-flex align-center mb-4">
          <v-chip
            color="primary"
            variant="tonal"
            class="mr-2"
          >
            {{ events.length }} Event{{ events.length === 1 ? '' : 's' }}
          </v-chip>
          <v-chip
            v-if="pendingCount > 0"
            color="warning"
            variant="tonal"
            class="mr-2"
          >
            {{ pendingCount }} Pending
          </v-chip>
          <v-chip
            v-if="successCount > 0"
            color="success"
            variant="tonal"
            class="mr-2"
          >
            {{ successCount }} Success
          </v-chip>
          <v-chip
            v-if="failureCount > 0"
            color="error"
            variant="tonal"
          >
            {{ failureCount }} Failed
          </v-chip>
        </div>

        <div>
          <EventCard
            v-for="event in events"
            :key="event.id"
            :event="event"
            @remove="removeEvent"
          />
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center pa-8">
        <v-icon size="64" color="grey">mdi-calendar-clock</v-icon>
        <div class="text-h6 mt-4">No Events</div>
        <div class="text-body-2 text-medium-emphasis mt-2">
          Events will appear here when processing operations are performed
        </div>
        
        <v-card class="mt-6">
          <v-card-title>
            <v-icon class="mr-2">mdi-information</v-icon>
            How to Trigger Events
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <v-list-item-title>Process All Configurations</v-list-item-title>
                <v-list-item-subtitle>
                  Go to Configurations page and click "Process All"
                </v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item>
                <v-list-item-title>Drop Database</v-list-item-title>
                <v-list-item-subtitle>
                  Go to Admin page and click "Drop Database" (with confirmation)
                </v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item>
                <v-list-item-title>Process Individual Configuration</v-list-item-title>
                <v-list-item-subtitle>
                  Go to any Configuration detail page and click "Process"
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </div>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useEvents } from '@/composables/useEvents'
import EventCard from '@/components/EventCard.vue'

const { storedEvents, clearEvents, removeEvent } = useEvents()

// Use stored events
const events = computed(() => storedEvents.value)

// Computed properties for event counts
const pendingCount = computed(() => 
  events.value.filter(e => e.status === 'PENDING').length
)

const successCount = computed(() => 
  events.value.filter(e => e.status === 'SUCCESS').length
)

const failureCount = computed(() => 
  events.value.filter(e => e.status === 'FAILURE').length
)

// Loading state (always false since events are stored in memory)
const loading = computed(() => false)
</script> 