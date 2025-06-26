<template>
  <v-container>
    <v-row>
      <v-col>
        <div class="d-flex justify-space-between align-center mb-4">
          <h1>Collections</h1>
          <div>
            <v-btn
              color="primary"
              :loading="processing"
              :disabled="processing"
              @click="processAllCollections"
              class="mr-2"
            >
              Process All
            </v-btn>
            <v-btn
              variant="outlined"
              @click="fetchCollections"
              class="mr-2"
            >
              Refresh
            </v-btn>
            <v-btn
              variant="outlined"
              @click="$router.push('/admin')"
            >
              Admin
            </v-btn>
          </div>
        </div>

        <v-card v-if="loading">
          <v-card-text>
            <v-progress-linear indeterminate />
            <p class="mt-2">Loading collections...</p>
          </v-card-text>
        </v-card>

        <v-card v-else-if="error">
          <v-card-text>
            <p class="text-center text-error">Error: {{ error }}</p>
          </v-card-text>
        </v-card>

        <v-list v-else-if="collections.length > 0">
          <v-list-item
            v-for="collection in collections"
            :key="collection.collection_name"
            :to="`/collection/${collection.collection_name}`"
            class="mb-2"
          >
            <v-list-item-title>{{ collection.collection_name }}</v-list-item-title>
            <v-list-item-subtitle>
              Current: {{ collection.version }}
              <span v-if="collection.targeted_version" class="ml-2">
                | Target: {{ collection.targeted_version }}
              </span>
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>

        <v-card v-else>
          <v-card-text>
            <p class="text-center">No collections found.</p>
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

const router = useRouter()
const { collections, loading, error, fetchCollections } = useCollections()
const { setProcessingResults } = useProcessing()
const processing = ref(false)

onMounted(async () => {
  await fetchCollections()
})

const processAllCollections = async () => {
  processing.value = true
  try {
    console.log('Processing all collections...')
    const results = await collectionsApi.processAllCollections()
    console.log('API returned results:', results)
    setProcessingResults(results)
    console.log('About to navigate to operations page')
    router.push('/operations')
  } catch (error) {
    console.error('Error processing collections:', error)
  } finally {
    processing.value = false
  }
}
</script> 