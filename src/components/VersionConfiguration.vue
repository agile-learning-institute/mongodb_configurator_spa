<template>
  <v-card class="mb-4" data-test="version-configuration-card">
    <v-card-title class="d-flex justify-space-between align-center pa-4" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;" data-test="version-card-title">
      <div class="d-flex align-center">
        <h3 class="text-h6 mb-0" data-test="version-information-title">Version Information</h3>
      </div>
      <div class="d-flex align-center">
        <span class="text-h6 font-weight-bold" data-test="version-number">{{ version.version }}</span>
      </div>
    </v-card-title>
    
    <v-card-text class="pa-4" data-test="version-card-content">
      <!-- Version Details -->
      <div class="mb-4" data-test="version-details">
        <div class="d-flex align-center mb-2" data-test="version-version-row">
          <span class="text-subtitle-2 font-weight-bold mr-2" data-test="version-version-label">Version:</span>
          <span data-test="version-version-value">{{ version.version }}</span>
        </div>
        
        <div v-if="version.test_data" class="d-flex align-center mb-2" data-test="version-test-data-row">
          <span class="text-subtitle-2 font-weight-bold mr-2" data-test="version-test-data-label">Test Data:</span>
          <span data-test="version-test-data-value">{{ version.test_data }}</span>
        </div>
        
        <div v-if="version.add_indexes && version.add_indexes.length > 0" class="d-flex align-center mb-2" data-test="version-add-indexes-row">
          <span class="text-subtitle-2 font-weight-bold mr-2" data-test="version-add-indexes-label">Add Indexes:</span>
          <span data-test="version-add-indexes-value">{{ version.add_indexes.length }} index(es)</span>
        </div>
        
        <div v-if="version.drop_indexes && version.drop_indexes.length > 0" class="d-flex align-center mb-2" data-test="version-drop-indexes-row">
          <span class="text-subtitle-2 font-weight-bold mr-2" data-test="version-drop-indexes-label">Drop Indexes:</span>
          <span data-test="version-drop-indexes-value">{{ version.drop_indexes.length }} index(es)</span>
        </div>
        
        <div v-if="version.migrations && version.migrations.length > 0" class="d-flex align-center mb-2" data-test="version-migrations-row">
          <span class="text-subtitle-2 font-weight-bold mr-2" data-test="version-migrations-label">Migrations:</span>
          <span data-test="version-migrations-value">{{ version.migrations.length }} migration(s)</span>
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