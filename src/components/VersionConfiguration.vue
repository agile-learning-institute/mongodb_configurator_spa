<template>
  <v-card class="mb-4">
    <v-card-title class="d-flex justify-space-between align-center pa-4" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
      <div class="d-flex align-center">
        <h3 class="text-h6 mb-0">Version Information</h3>
      </div>
      <div class="d-flex align-center">
        <span class="text-h6 font-weight-bold">{{ version.version }}</span>
      </div>
    </v-card-title>
    
    <v-card-text class="pa-4">
      <!-- Version Details -->
      <div class="mb-4">
        <div class="d-flex align-center mb-2">
          <span class="text-subtitle-2 font-weight-bold mr-2">Version:</span>
          <span>{{ version.version }}</span>
        </div>
        
        <div v-if="version.test_data" class="d-flex align-center mb-2">
          <span class="text-subtitle-2 font-weight-bold mr-2">Test Data:</span>
          <span>{{ version.test_data }}</span>
        </div>
        
        <div v-if="version.add_indexes && version.add_indexes.length > 0" class="d-flex align-center mb-2">
          <span class="text-subtitle-2 font-weight-bold mr-2">Add Indexes:</span>
          <span>{{ version.add_indexes.length }} index(es)</span>
        </div>
        
        <div v-if="version.drop_indexes && version.drop_indexes.length > 0" class="d-flex align-center mb-2">
          <span class="text-subtitle-2 font-weight-bold mr-2">Drop Indexes:</span>
          <span>{{ version.drop_indexes.length }} index(es)</span>
        </div>
        
        <div v-if="version.migrations && version.migrations.length > 0" class="d-flex align-center mb-2">
          <span class="text-subtitle-2 font-weight-bold mr-2">Migrations:</span>
          <span>{{ version.migrations.length }} migration(s)</span>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
interface VersionConfig {
  version: string
  test_data?: string
  add_indexes?: any[]
  drop_indexes?: string[]
  migrations?: string[]
}

interface Props {
  version: VersionConfig
  collectionName: string
}

defineProps<Props>()
</script> 