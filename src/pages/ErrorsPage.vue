<template>
  <v-container>
    <v-row>
      <v-col>
        <div class="d-flex justify-space-between align-center mb-4">
          <h1>Validation Errors</h1>
          <div>
            <v-btn
              variant="outlined"
              @click="$router.push('/collections')"
              class="mr-2"
            >
              Back to Collections
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
            <p class="mt-2">Loading errors...</p>
          </v-card-text>
        </v-card>

        <v-card v-else-if="!validationErrors || validationErrors.length === 0">
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

          <v-list>
            <v-list-item
              v-for="(error, index) in validationErrors"
              :key="index"
              class="mb-2"
            >
              <v-card class="w-100">
                <v-card-text>
                  <div class="d-flex align-start justify-space-between">
                    <div class="flex-grow-1">
                      <div class="d-flex align-center mb-2">
                        <h5 class="mr-4">{{ getErrorTitle(error) }}</h5>
                        <v-chip
                          :color="getErrorColor(error.error_id)"
                          size="small"
                        >
                          {{ error.error_id }}
                        </v-chip>
                        <v-btn
                          v-if="getErrorDetails(error)"
                          icon="mdi-chevron-down"
                          variant="text"
                          size="small"
                          class="ml-2"
                          @click="toggleErrorDetails(index)"
                        >
                          <v-icon>
                            {{ expandedErrors[index] ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                          </v-icon>
                        </v-btn>
                      </div>
                      
                      <p class="text-body-2 mb-2">{{ error.message }}</p>
                      
                      <div v-if="expandedErrors[index] && getErrorDetails(error)" class="mt-3">
                        <v-divider class="mb-3" />
                        <div class="text-caption">
                          <div v-if="error.file" class="mb-1">
                            <strong>File:</strong> {{ error.file }}
                          </div>
                          <div v-if="error.field" class="mb-1">
                            <strong>Field:</strong> {{ error.field }}
                          </div>
                          <div v-if="error.type" class="mb-1">
                            <strong>Type:</strong> {{ error.type }}
                          </div>
                          <div v-if="error.version" class="mb-1">
                            <strong>Version:</strong> {{ error.version }}
                          </div>
                          <div v-if="error.enumerator" class="mb-1">
                            <strong>Enumerator:</strong> {{ error.enumerator }}
                          </div>
                          <div v-if="error.enum" class="mb-1">
                            <strong>Enum:</strong> {{ error.enum }}
                          </div>
                          <div v-if="error.schema_name" class="mb-1">
                            <strong>Schema:</strong> {{ error.schema_name }}
                          </div>
                          <div v-if="error.value" class="mb-1">
                            <strong>Value:</strong> {{ error.value }}
                          </div>
                          <div v-if="error.path" class="mb-1">
                            <strong>Path:</strong> {{ error.path }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-list-item>
          </v-list>
        </div>
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