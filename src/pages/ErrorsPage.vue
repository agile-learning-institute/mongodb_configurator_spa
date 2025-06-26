<template>
  <v-container fluid class="pa-0 admin-bg min-h-screen">
    <v-row justify="center" class="ma-0 pa-0">
      <v-col cols="12" md="8" lg="6" class="py-8">
        <v-card class="mb-6 elevation-6">
          <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-h6">Validation Errors</span>
            <div>
              <v-btn
                variant="outlined"
                @click="$router.push('/collections')"
                class="mr-2"
                size="small"
              >
                Back to Collections
              </v-btn>
              <v-btn
                variant="outlined"
                @click="$router.push('/admin')"
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
                <p class="mt-2">Loading errors...</p>
              </v-card-text>
            </v-card>

            <v-card v-else-if="!validationErrors || validationErrors.length === 0" class="mb-4">
              <v-card-text>
                <p class="text-center">No validation errors found.</p>
              </v-card-text>
            </v-card>

            <div v-else>
              <v-alert
                type="error"
                variant="tonal"
                class="mb-4"
              >
                <strong>{{ validationErrors.length }} validation errors found</strong>
                <p class="mb-0 mt-1">Please fix these errors before proceeding with collection processing.</p>
              </v-alert>

              <v-card
                v-for="(error, index) in validationErrors"
                :key="index"
                class="mb-4 elevation-3 error-card"
              >
                <v-card-text class="pa-4">
                  <div class="d-flex align-start justify-space-between">
                    <div class="flex-grow-1">
                      <div class="d-flex align-center mb-3">
                        <v-icon 
                          :color="getErrorColor(error.error_id)" 
                          class="mr-3"
                          size="large"
                        >
                          mdi-alert-circle
                        </v-icon>
                        <div class="flex-grow-1">
                          <h4 class="text-h6 mb-1">{{ getErrorTitle(error) }}</h4>
                          <p class="text-body-2 text-medium-emphasis mb-0">{{ error.message }}</p>
                        </div>
                        <v-chip
                          :color="getErrorColor(error.error_id)"
                          size="small"
                          class="ml-3"
                        >
                          {{ error.error_id }}
                        </v-chip>
                        <v-btn
                          v-if="getErrorDetails(error)"
                          icon="mdi-chevron-down"
                          variant="text"
                          size="small"
                          class="ml-2"
                          :class="{ 'rotate-180': expandedErrors[index] }"
                          @click="toggleErrorDetails(index)"
                        />
                      </div>
                      
                      <div v-if="expandedErrors[index] && getErrorDetails(error)" class="mt-4">
                        <v-divider class="mb-3" />
                        <h6 class="text-subtitle-2 mb-3">Error Details</h6>
                        <v-row>
                          <v-col v-if="error.file" cols="12" sm="6" md="4">
                            <div class="text-caption text-medium-emphasis">File</div>
                            <div class="text-body-2 font-weight-medium">{{ error.file }}</div>
                          </v-col>
                          <v-col v-if="error.field" cols="12" sm="6" md="4">
                            <div class="text-caption text-medium-emphasis">Field</div>
                            <div class="text-body-2 font-weight-medium">{{ error.field }}</div>
                          </v-col>
                          <v-col v-if="error.type" cols="12" sm="6" md="4">
                            <div class="text-caption text-medium-emphasis">Type</div>
                            <div class="text-body-2 font-weight-medium">{{ error.type }}</div>
                          </v-col>
                          <v-col v-if="error.version" cols="12" sm="6" md="4">
                            <div class="text-caption text-medium-emphasis">Version</div>
                            <div class="text-body-2 font-weight-medium">{{ error.version }}</div>
                          </v-col>
                          <v-col v-if="error.enumerator" cols="12" sm="6" md="4">
                            <div class="text-caption text-medium-emphasis">Enumerator</div>
                            <div class="text-body-2 font-weight-medium">{{ error.enumerator }}</div>
                          </v-col>
                          <v-col v-if="error.enum" cols="12" sm="6" md="4">
                            <div class="text-caption text-medium-emphasis">Enum</div>
                            <div class="text-body-2 font-weight-medium">{{ error.enum }}</div>
                          </v-col>
                          <v-col v-if="error.schema_name" cols="12" sm="6" md="4">
                            <div class="text-caption text-medium-emphasis">Schema</div>
                            <div class="text-body-2 font-weight-medium">{{ error.schema_name }}</div>
                          </v-col>
                          <v-col v-if="error.value" cols="12" sm="6" md="4">
                            <div class="text-caption text-medium-emphasis">Value</div>
                            <div class="text-body-2 font-weight-medium">{{ error.value }}</div>
                          </v-col>
                          <v-col v-if="error.path" cols="12" sm="6" md="4">
                            <div class="text-caption text-medium-emphasis">Path</div>
                            <div class="text-body-2 font-weight-medium">{{ error.path }}</div>
                          </v-col>
                        </v-row>
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useValidationErrors } from '../composables/useValidationErrors'
import type { ValidationError } from '../types'

const { validationErrors, loading } = useValidationErrors()

const expandedErrors = ref<Record<number, boolean>>({})

const toggleErrorDetails = (index: number) => {
  expandedErrors.value[index] = !expandedErrors.value[index]
}

const getErrorTitle = (error: ValidationError): string => {
  const errorMap: Record<string, string> = {
    'CFG-001': 'Directory Not Found',
    'CFG-101': 'Invalid Config Format',
    'CFG-201': 'Missing Required Field',
    'CFG-202': 'Missing Versions Field',
    'CFG-501': 'Invalid Version Format',
    'CFG-601': 'Missing Version Number',
    'CFG-701': 'Invalid Version Format',
    'VLD-001': 'Invalid Versions',
    'VLD-002': 'Invalid Version Config',
    'VLD-003': 'Missing Version Field',
    'VLD-004': 'Schema Not Found',
    'VLD-005': 'Invalid Version Format',
    'VLD-101': 'Missing Required Field',
    'VLD-102': 'Invalid Version Format',
    'VLD-103': 'Missing Required Field',
    'VLD-104': 'Invalid Enumerators Format',
    'VLD-106': 'Invalid Enumerations',
    'VLD-108': 'Invalid Enumerator Description',
    'VLD-201': 'Invalid Primitive Type',
    'VLD-202': 'Invalid Primitive Type',
    'VLD-203': 'Invalid Primitive Type',
    'VLD-204': 'Invalid Primitive Type',
    'VLD-301': 'Invalid Type',
    'VLD-401': 'Missing Required Field',
    'VLD-601': 'Unknown Type',
    'VLD-701': 'Missing Required Field',
    'VLD-801': 'Invalid Array Items',
    'VLD-901': 'Invalid Enum Reference',
    'VLD-902': 'Invalid Enum Reference',
    'VLD-1001': 'Invalid OneOf Format',
    'VLD-1002': 'Invalid OneOf Type Property',
    'VLD-1003': 'Invalid OneOf Schemas'
  }
  
  return errorMap[error.error_id] || 'Validation Error'
}

const getErrorColor = (errorId: string): string => {
  if (errorId.startsWith('CFG-')) return 'orange'
  if (errorId.startsWith('VLD-')) return 'red'
  return 'grey'
}

const getErrorDetails = (error: ValidationError): boolean => {
  return !!(error.file || error.field || error.type || error.version || 
           error.enumerator || error.enum || error.schema_name || 
           error.value || error.path)
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
.error-card {
  transition: all 0.2s ease-in-out;
  border-left: 4px solid;
}
.error-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}
.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.2s ease-in-out;
}
</style> 