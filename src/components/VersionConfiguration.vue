<template>
  <div>
    <v-row>
      <v-col cols="12" md="6">
        <h3>Version Information</h3>
        <v-list>
          <v-list-item>
            <v-list-item-title>Version</v-list-item-title>
            <v-list-item-subtitle>{{ version.version }}</v-list-item-subtitle>
          </v-list-item>
          <v-list-item v-if="version.test_data">
            <v-list-item-title>Test Data</v-list-item-title>
            <v-list-item-subtitle>{{ version.test_data }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-col>
      
      <v-col cols="12" md="6">
        <h3>Render Options</h3>
        <div class="d-flex flex-column gap-2">
          <v-btn
            variant="outlined"
            @click="downloadSchema('json')"
            :loading="downloading.json"
          >
            Render JSON Schema
          </v-btn>
          <v-btn
            variant="outlined"
            @click="downloadSchema('bson')"
            :loading="downloading.bson"
          >
            Render BSON Schema
          </v-btn>
          <v-btn
            variant="outlined"
            @click="downloadSchema('openapi')"
            :loading="downloading.openapi"
          >
            Render OpenAPI Spec
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-row v-if="version.add_indexes && version.add_indexes.length > 0">
      <v-col cols="12">
        <h3>Add Indexes</h3>
        <v-card>
          <v-card-text>
            <pre>{{ JSON.stringify(version.add_indexes, null, 2) }}</pre>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="version.drop_indexes && version.drop_indexes.length > 0">
      <v-col cols="12">
        <h3>Drop Indexes</h3>
        <v-card>
          <v-card-text>
            <pre>{{ JSON.stringify(version.drop_indexes, null, 2) }}</pre>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="version.aggregations && version.aggregations.length > 0">
      <v-col cols="12">
        <h3>Aggregations</h3>
        <v-card>
          <v-card-text>
            <pre>{{ JSON.stringify(version.aggregations, null, 2) }}</pre>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { renderApi } from '../utils/api'
import type { VersionConfig } from '../types'

interface Props {
  version: VersionConfig
  collectionName: string
}

const props = defineProps<Props>()

const downloading = ref({
  json: false,
  bson: false,
  openapi: false
})

const downloadSchema = async (type: 'json' | 'bson' | 'openapi') => {
  const schemaName = `${props.collectionName}.${props.version.version}`
  
  downloading.value[type] = true
  
  try {
    let data: any
    let filename: string
    let contentType: string
    
    switch (type) {
      case 'json':
        data = await renderApi.renderJsonSchema(schemaName)
        filename = `${schemaName}.json`
        contentType = 'application/json'
        break
      case 'bson':
        data = await renderApi.renderBsonSchema(schemaName)
        filename = `${schemaName}.bson.json`
        contentType = 'application/json'
        break
      case 'openapi':
        data = await renderApi.renderOpenApi(schemaName)
        filename = `${schemaName}.openapi.yaml`
        contentType = 'text/yaml'
        break
    }
    
    // Create and download file
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: contentType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
  } catch (error) {
    console.error(`Error downloading ${type} schema:`, error)
  } finally {
    downloading.value[type] = false
  }
}
</script> 