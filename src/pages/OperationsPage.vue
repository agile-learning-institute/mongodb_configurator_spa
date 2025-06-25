<template>
  <v-container>
    <v-row>
      <v-col>
        <h1>Processing Operations</h1>

        <v-card v-if="processingResults.length === 0">
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
          <!-- Summary -->
          <v-card class="mb-4">
            <v-card-title>
              Processed {{ processingResults.length }} Collection{{ processingResults.length > 1 ? 's' : '' }}
            </v-card-title>
          </v-card>

          <!-- Collections Accordion -->
          <v-expansion-panels>
            <v-expansion-panel
              v-for="(collectionResult, collectionIndex) in processingResults"
              :key="collectionIndex"
              class="mb-2"
            >
              <v-expansion-panel-title>
                <div class="d-flex align-center">
                  <span class="mr-4">Collection: {{ collectionResult.collection }}</span>
                  <v-chip
                    :color="getStatusColor(collectionResult.status)"
                    size="small"
                  >
                    {{ collectionResult.status }}
                  </v-chip>
                  <span class="ml-4 text-caption">
                    ({{ collectionResult.operations?.length || 0 }} operations)
                  </span>
                </div>
              </v-expansion-panel-title>
              
              <v-expansion-panel-text>
                <!-- Operations List for this Collection -->
                <div v-if="collectionResult.operations && collectionResult.operations.length > 0">
                  <v-card
                    v-for="(operation, operationIndex) in collectionResult.operations"
                    :key="`${collectionIndex}-${operationIndex}`"
                    class="mb-3"
                    elevation="1"
                  >
                    <v-card-text>
                      <div class="d-flex align-start justify-space-between">
                        <div class="flex-grow-1">
                          <div class="d-flex align-center mb-2">
                            <h5 class="mr-4">{{ operation.operation }}</h5>
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
                            <div v-show="expandedDetails.includes(`${collectionIndex}-${operationIndex}`) && operation.details" class="mt-3">
                              <v-divider class="mb-3"></v-divider>
                              <h6>Details</h6>
                              <pre class="mt-2">{{ JSON.stringify(operation.details, null, 2) }}</pre>
                            </div>
                          </v-expand-transition>
                        </div>
                        
                        <div class="d-flex align-end ml-4">
                          <v-btn
                            v-if="operation.details"
                            icon="mdi-chevron-down"
                            variant="text"
                            size="small"
                            @click="toggleDetails(`${collectionIndex}-${operationIndex}`)"
                          />
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </div>

                <v-card v-else class="mb-3">
                  <v-card-text>
                    <p class="text-center">No operations found for {{ collectionResult.collection }}.</p>
                  </v-card-text>
                </v-card>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

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
import { ref, onMounted, watch } from 'vue'
import { useProcessing } from '../composables/useProcessing'

const { processingResults } = useProcessing()
const expandedDetails = ref<string[]>([])

onMounted(() => {
  console.log('OperationsPage mounted, processing results:', processingResults.value)
})

// Watch for changes to processing results
watch(processingResults, (newValue, oldValue) => {
  console.log('Processing results changed:', { oldValue, newValue })
})

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

const toggleDetails = (key: string) => {
  const currentIndex = expandedDetails.value.indexOf(key)
  if (currentIndex > -1) {
    expandedDetails.value.splice(currentIndex, 1)
  } else {
    expandedDetails.value.push(key)
  }
}
</script> 