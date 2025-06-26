<template>
  <v-container fluid class="pa-0 admin-bg min-h-screen">
    <v-row justify="center" class="ma-0 pa-0">
      <v-col cols="12" md="8" lg="6" class="py-8">
        <v-card class="mb-6 elevation-6">
          <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-h6">Processing Operations</span>
            <v-btn
              variant="outlined"
              @click="() => $router.push('/collections')"
              size="small"
            >
              Back to Collections
            </v-btn>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <v-card v-if="processingResults.length === 0" class="mb-4">
              <v-card-text>
                <p class="text-center">No processing results available.</p>
                <p class="text-center text-caption">
                  Processing results will appear here after you process a collection.
                </p>
              </v-card-text>
            </v-card>

            <div v-else>
              <v-card class="mb-4">
                <v-card-title>
                  Processed {{ processingResults.length }} Collection{{ processingResults.length > 1 ? 's' : '' }}
                </v-card-title>
              </v-card>

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
                                <v-btn
                                  v-if="operation.details"
                                  icon="mdi-chevron-down"
                                  variant="text"
                                  size="small"
                                  class="ml-2"
                                  :class="{ 'rotate-180': expandedDetails.includes(`${collectionIndex}-${operationIndex}`) }"
                                  @click="toggleDetails(`${collectionIndex}-${operationIndex}`)"
                                />
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
                              <v-expand-transition>
                                <div v-show="expandedDetails.includes(`${collectionIndex}-${operationIndex}`) && operation.details" class="mt-3">
                                  <v-divider class="mb-3"></v-divider>
                                  <h6>Details</h6>
                                  <pre class="mt-2">{{ JSON.stringify(operation.details, null, 2) }}</pre>
                                </div>
                              </v-expand-transition>
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
            </div>
          </v-card-text>
        </v-card>
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
  // Component mounted
})

watch(processingResults, () => {
  // Processing results changed
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

<style scoped>
.admin-bg {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}
.v-card {
  border-radius: 18px;
}
.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.2s ease-in-out;
}
</style> 