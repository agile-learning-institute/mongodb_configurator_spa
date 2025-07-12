<template>
  <v-container>
    <!-- Loading state -->
    <div v-if="loading" class="d-flex justify-center align-center pa-8">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="pa-4">
      <v-alert type="error">
        {{ error }}
        <v-btn @click="loadConfig" class="mt-2">Retry</v-btn>
      </v-alert>
    </div>

    <!-- Config items -->
    <div v-else-if="configItems">
      <v-card>
        <v-card-title>API Config Items</v-card-title>
        <v-card-text>
          <v-table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Value</th>
                <th>From</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in configItems" :key="item.name">
                <td>{{ item.name }}</td>
                <td>{{ item.value }}</td>
                <td>
                  <v-chip
                    :color="getSourceColor(item.from)"
                    size="small"
                  >
                    {{ item.from }}
                  </v-chip>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { apiService } from '@/utils/api'

interface ConfigItem {
  name: string
  value: string
  from: 'default' | 'file' | 'environment'
}

const loading = ref(false)
const error = ref<string | null>(null)
const configItems = ref<ConfigItem[]>([])

// Load config data
const loadConfig = async () => {
  loading.value = true
  error.value = null
  
  try {
    const data = await apiService.getConfig()
    configItems.value = data.config_items || []
  } catch (err: any) {
    error.value = err.message || 'Failed to load configuration'
    console.error('Failed to load configuration:', err)
  } finally {
    loading.value = false
  }
}

// Get color for source chip
const getSourceColor = (source: string) => {
  switch (source) {
    case 'environment':
      return 'success'
    case 'file':
      return 'info'
    case 'default':
      return 'warning'
    default:
      return 'default'
  }
}

// Load config on mount
onMounted(() => {
  loadConfig()
})
</script> 