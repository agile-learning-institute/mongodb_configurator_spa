<template>
  <v-container>
    <v-row>
      <v-col>
        <h1>Processing Operations</h1>

        <v-card v-if="!processingResults || !processingResults.collection">
          <v-card-text>
            <p class="text-center">No processing results available.</p>
            <p class="text-center text-caption">
              Processing results will appear here after you process a collection.
            </p>
            <div class="text-center mt-4">
              <v-btn @click="$router.push('/collections')">
                Back to Collections
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

        <div v-else>
          <!-- Collection Summary -->
          <v-card class="mb-4">
            <v-card-title>
              Collection: {{ processingResults.collection }}
              <v-chip
                :color="getStatusColor(processingResults.status)"
                size="small"
                class="ml-2"
              >
                {{ processingResults.status }}
              </v-chip>
            </v-card-title>
          </v-card>

          <!-- Operations List -->
          <div v-if="processingResults.operations && processingResults.operations.length > 0">
            <v-card
              v-for="(operation, index) in processingResults.operations"
              :key="index"
              class="mb-4"
              elevation="2"
            >
              <v-card-text>
                <div class="d-flex align-start justify-space-between">
                  <div class="flex-grow-1">
                    <div class="d-flex align-center mb-2">
                      <h4 class="mr-4">{{ operation.operation }}</h4>
                      <v-chip
                        :color="getStatusColor(operation.status)"
                        size="small"
                      >
                        {{ operation.status }}
                      </v-chip>
                    </div>
                    
                    <div class="d-flex flex-wrap">
                      <div v-if="operation.collection" class="mr-4">
                        <strong>Collection:</strong> {{ operation.collection }}
                      </div>
                      <div v-if="operation.message" class="mr-4">
                        <strong>Message:</strong> {{ operation.message }}
                      </div>
                      <div v-if="operation.details_type" class="mr-4">
                        <strong>Type:</strong> {{ operation.details_type }}
                      </div>
                    </div>

                    <!-- Expandable Details -->
                    <v-expand-transition>
                      <div v-show="expandedDetails.includes(index) && operation.details" class="mt-3">
                        <v-divider class="mb-3"></v-divider>
                        <h5>Details</h5>
                        <pre class="mt-2">{{ JSON.stringify(operation.details, null, 2) }}</pre>
                      </div>
                    </v-expand-transition>
                  </div>
                  
                  <div class="d-flex align-end ml-4">
                    <v-btn
                      v-if="operation.details"
                      icon="mdi-chevron-down"
                      variant="text"
                      @click="toggleDetails(index)"
                    />
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </div>

          <v-card v-else class="mb-4">
            <v-card-text>
              <p class="text-center">No operations found.</p>
            </v-card-text>
          </v-card>

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
import { useProcessing } from '../composables/useProcessing'

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