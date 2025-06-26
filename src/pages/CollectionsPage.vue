<template>
  <v-container fluid class="pa-0 admin-bg min-h-screen">
    <v-row justify="center" class="ma-0 pa-0">
      <v-col cols="12" md="8" lg="6" class="py-8">
        <v-card class="mb-6 elevation-6">
          <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-h6">Collections</span>
            <div>
              <v-btn
                color="primary"
                :loading="processing"
                :disabled="processing"
                @click="processAllCollections"
                class="mr-2"
                size="small"
              >
                Process All
              </v-btn>
              <v-btn
                variant="outlined"
                @click="fetchCollections"
                class="mr-2"
                size="small"
              >
                Refresh
              </v-btn>
              <v-btn
                variant="outlined"
                @click="router.push('/admin')"
                size="small"
              >
                Admin
              </v-btn>
            </div>
          </v-card-title>
          <v-divider></v-divider>

          <v-card-text>
            <v-card v-if="loading" class="mb-4">
              <v-card-text>
                <v-progress-linear indeterminate />
                <p class="mt-2">Loading collections...</p>
              </v-card-text>
            </v-card>

            <v-card v-else-if="error" class="mb-4">
              <v-card-text>
                <div class="text-center">
                  <p class="text-error mb-3">{{ error }}</p>
                  <div v-if="validationErrors && validationErrors.length > 0">
                    <v-alert
                      type="error"
                      variant="tonal"
                      class="mb-3"
                    >
                      <strong>{{ validationErrors.length }} validation errors found</strong>
                      <p class="mb-0 mt-1">Please review and fix these errors before proceeding.</p>
                    </v-alert>
                    <div class="d-flex justify-center">
                      <v-btn
                        color="error"
                        variant="outlined"
                        @click="router.push('/errors')"
                        class="mr-4"
                        size="small"
                      >
                        View Errors ({{ validationErrors.length }})
                      </v-btn>
                      <v-btn
                        variant="outlined"
                        @click="fetchCollections"
                        size="small"
                      >
                        Retry
                      </v-btn>
                    </div>
                  </div>
                  <div v-else>
                    <v-btn
                      variant="outlined"
                      @click="fetchCollections"
                      size="small"
                    >
                      Retry
                    </v-btn>
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <div v-else-if="collections.length > 0">
              <v-card
                v-for="collection in collections"
                :key="collection.collection_name"
                class="mb-3 elevation-2 collection-card"
                @click="router.push(`/collection/${collection.collection_name}`)"
              >
                <v-card-text class="pa-4">
                  <div class="d-flex justify-space-between align-center">
                    <div>
                      <h3 class="text-h6 mb-1">{{ collection.collection_name }}</h3>
                      <p class="text-body-2 text-medium-emphasis mb-0">
                        Current: {{ collection.version }}
                        <span v-if="collection.targeted_version" class="ml-2">
                          | Target: {{ collection.targeted_version }}
                        </span>
                      </p>
                    </div>
                    <v-icon>mdi-chevron-right</v-icon>
                  </div>
                </v-card-text>
              </v-card>
            </div>

            <v-card v-else>
              <v-card-text>
                <p class="text-center">No collections found.</p>
              </v-card-text>
            </v-card>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { collectionsApi } from '../utils/api'
import { useCollections } from '../composables/useCollections'
import { useProcessing } from '../composables/useProcessing'
import { useValidationErrors } from '../composables/useValidationErrors'

const router = useRouter()
const { collections, loading, error, fetchCollections } = useCollections()
const { setProcessingResults } = useProcessing()
const { validationErrors } = useValidationErrors()
const processing = ref(false)

onMounted(async () => {
  await fetchCollections()
})

const processAllCollections = async () => {
  processing.value = true
  try {
    const results = await collectionsApi.processAllCollections()
    setProcessingResults(results)
    router.push('/operations')
  } catch (error) {
    console.error('Error processing collections:', error)
  } finally {
    processing.value = false
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
.collection-card {
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}
.collection-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}
</style> 