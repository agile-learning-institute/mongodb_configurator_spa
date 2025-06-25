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
          <v-list v-if="processingResults.operations && processingResults.operations.length > 0">
            <div
              v-for="(operation, index) in processingResults.operations"
              :key="index"
              class="mb-2"
            >
              <v-list-item>
                <v-list-item-title>
                  {{ operation.operation }}
                  <v-chip
                    :color="getStatusColor(operation.status)"
                    size="small"
                    class="ml-2"
                  >
                    {{ operation.status }}
                  </v-chip>
                </v-list-item-title>
                
                <v-list-item-subtitle v-if="operation.collection">
                  Collection: {{ operation.collection }}
                </v-list-item-subtitle>
                
                <v-list-item-subtitle v-if="operation.message">
                  {{ operation.message }}
                </v-list-item-subtitle>

                <template v-slot:append>
                  <v-btn
                    v-if="operation.details"
                    icon="mdi-chevron-down"
                    variant="text"
                    @click="toggleDetails(index)"
                  />
                </template>
              </v-list-item>

              <v-expand-transition>
                <div v-show="expandedDetails.includes(index) && operation.details">
                  <v-card class="ma-2">
                    <v-card-text>
                      <h4>Details ({{ operation.details_type }})</h4>
                      <pre>{{ JSON.stringify(operation.details, null, 2) }}</pre>
                    </v-card-text>
                  </v-card>
                </div>
              </v-expand-transition>
            </div>
          </v-list>

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
import { ref, onMounted } from 'vue'
import { useProcessing } from '../composables/useProcessing'

const { processingResults } = useProcessing()
const expandedDetails = ref<number[]>([])

onMounted(() => {
  console.log('OperationsPage mounted, processing results:', processingResults.value)
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

const toggleDetails = (index: number) => {
  const currentIndex = expandedDetails.value.indexOf(index)
  if (currentIndex > -1) {
    expandedDetails.value.splice(currentIndex, 1)
  } else {
    expandedDetails.value.push(index)
  }
}
</script> 