<template>
  <v-container>
    <v-row>
      <v-col>
        <div class="d-flex justify-space-between align-center mb-4">
          <h1>Configuration: {{ collectionName }}</h1>
          <div>
            <v-btn
              color="primary"
              :loading="processing"
              :disabled="processing"
              @click="processCollection"
              class="mr-2"
            >
              Process
            </v-btn>
            <v-btn
              variant="outlined"
              @click="$router.push('/')"
            >
              Back to Collections
            </v-btn>
          </div>
        </div>

        <v-card v-if="loading">
          <v-card-text>
            <v-progress-linear indeterminate />
          </v-card-text>
        </v-card>

        <div v-else-if="collectionConfig">
          <v-expansion-panels>
            <v-expansion-panel
              v-for="version in collectionConfig.versions"
              :key="version.version"
            >
              <v-expansion-panel-title>
                Version: {{ version.version }}
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <VersionConfiguration :version="version" :collection-name="collectionName" />
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </div>

        <v-card v-else>
          <v-card-text>
            <p class="text-center">Collection not found.</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { collectionsApi } from '../utils/api'
import { useProcessing } from '../composables/useProcessing'
import VersionConfiguration from '../components/VersionConfiguration.vue'
import type { CollectionConfig } from '../types'

const route = useRoute()
const router = useRouter()

const collectionName = computed(() => route.params.name as string)
const collectionConfig = ref<CollectionConfig | null>(null)
const loading = ref(false)
const processing = ref(false)
const { setProcessingResults } = useProcessing()

onMounted(async () => {
  await fetchCollection()
})

const fetchCollection = async () => {
  loading.value = true
  try {
    collectionConfig.value = await collectionsApi.getCollection(collectionName.value)
  } catch (error) {
    console.error('Error fetching collection:', error)
  } finally {
    loading.value = false
  }
}

const processCollection = async () => {
  processing.value = true
  try {
    const results = await collectionsApi.processCollection(collectionName.value)
    setProcessingResults(results)
    router.push('/operations')
  } catch (error) {
    console.error('Error processing collection:', error)
  } finally {
    processing.value = false
  }
}
</script> 