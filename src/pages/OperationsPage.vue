<template>
  <v-container>
    <v-row>
      <v-col>
        <h1>Processing Operations</h1>

        <v-card v-if="!processingResults || processingResults.length === 0">
          <v-card-text>
            <p class="text-center">No processing results available.</p>
            <div class="text-center mt-4">
              <v-btn @click="$router.push('/collections')">
                Back to Collections
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

        <div v-else>
          <v-list>
            <v-list-item
              v-for="(result, index) in processingResults"
              :key="index"
              class="mb-2"
            >
              <v-list-item-title>
                {{ result.operation }}
                <v-chip
                  :color="getStatusColor(result.status)"
                  size="small"
                  class="ml-2"
                >
                  {{ result.status }}
                </v-chip>
              </v-list-item-title>
              
              <v-list-item-subtitle v-if="result.collection">
                Collection: {{ result.collection }}
              </v-list-item-subtitle>
              
              <v-list-item-subtitle v-if="result.message">
                {{ result.message }}
              </v-list-item-subtitle>

              <template v-slot:append>
                <v-btn
                  v-if="result.details"
                  icon="mdi-chevron-down"
                  variant="text"
                  @click="toggleDetails(index)"
                />
              </template>
            </v-list-item>

            <v-expand-transition>
              <v-list-item
                v-for="(result, index) in processingResults"
                :key="`details-${index}`"
                v-show="expandedDetails.includes(index) && result.details"
              >
                <v-card class="w-100">
                  <v-card-text>
                    <h4>Details ({{ result.details_type }})</h4>
                    <pre>{{ JSON.stringify(result.details, null, 2) }}</pre>
                  </v-card-text>
                </v-card>
              </v-list-item>
            </v-expand-transition>
          </v-list>

          <div class="text-center mt-4">
            <v-btn @click="$router.push('/collections')">
              Back to Collections
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useProcessing } from '@/composables/useProcessing'
import type { ProcessingResult } from '@/types'

const { processingResults } = useProcessing()
const expandedDetails = ref<number[]>([])

const getStatusColor = (status: string) => {
  switch (status) {
    case 'success':
      return 'success'
    case 'error':
      return 'error'
    case 'skipped':
      return 'warning'
    default:
      return 'default'
  }
}

const toggleDetails = (index: number) => {
  const currentIndex = expandedDetails.value.indexOf(index)
  if (currentIndex > -1) {
    expandedDetails.value.splice(currentIndex, 1)
  } else {
    expandedDetails.value.push(index)
  }
}
</script> 