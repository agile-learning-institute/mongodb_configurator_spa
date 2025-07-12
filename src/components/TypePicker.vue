<template>
  <v-select
    v-model="selectedType"
    :label="label"
    :items="availableTypes"
    :disabled="disabled"
    @update:model-value="handleTypeChange"
    :error="!!error"
    :error-messages="error"
  >
    <template v-slot:item="{ props, item }">
      <v-list-item v-bind="props">
        <template v-slot:prepend>
          <v-icon :color="getTypeColor(item.raw)">
            {{ getTypeIcon(item.raw) }}
          </v-icon>
        </template>
        <v-list-item-title>{{ item.raw }}</v-list-item-title>
        <v-list-item-subtitle v-if="getTypeDescription(item.raw)">
          {{ getTypeDescription(item.raw) }}
        </v-list-item-subtitle>
      </v-list-item>
    </template>
  </v-select>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { apiService } from '@/utils/api'

interface Props {
  modelValue?: string
  label?: string
  disabled?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Type',
  disabled: false,
  error: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const selectedType = ref(props.modelValue || '')
const availableTypes = ref<string[]>([])
const loading = ref(false)

// Load available types from API
const loadTypes = async () => {
  loading.value = true
  try {
    const types = await apiService.getTypes()
    // Extract type names and add built-in types
    const typeNames = types.map((type: any) => type.file_name)
    availableTypes.value = [
      // Built-in primitive types
      'string',
      'number', 
      'boolean',
      'integer',
      'null',
      // Complex primitive types
      'identity',
      'word',
      'sentence',
      'email',
      'url',
      'ip_address',
      'us_phone',
      'date_time',
      'markdown',
      'street_address',
      'state_code',
      'count',
      'identifier',
      'breadcrumb',
      'appointment',
      // Structural types
      'object',
      'array',
      // Custom types
      ...typeNames
    ]
  } catch (err) {
    console.error('Failed to load types:', err)
    // Fallback to basic types
    availableTypes.value = [
      'string', 'number', 'boolean', 'integer', 'null',
      'object', 'array'
    ]
  } finally {
    loading.value = false
  }
}

const handleTypeChange = (value: string) => {
  selectedType.value = value
  emit('update:modelValue', value)
}

const getTypeIcon = (type: string): string => {
  if (type === 'object') return 'mdi-cube-outline'
  if (type === 'array') return 'mdi-format-list-bulleted'
  if (type === 'string') return 'mdi-text'
  if (type === 'number' || type === 'integer') return 'mdi-numeric'
  if (type === 'boolean') return 'mdi-checkbox-marked-outline'
  if (type === 'null') return 'mdi-null'
  if (type === 'email') return 'mdi-email'
  if (type === 'url') return 'mdi-link'
  if (type === 'ip_address') return 'mdi-web'
  if (type === 'us_phone') return 'mdi-phone'
  if (type === 'date_time') return 'mdi-calendar-clock'
  if (type === 'markdown') return 'mdi-markdown'
  if (type === 'identity') return 'mdi-account'
  if (type === 'word') return 'mdi-format-letter-case'
  if (type === 'sentence') return 'mdi-format-text'
  if (type === 'street_address') return 'mdi-map-marker'
  if (type === 'state_code') return 'mdi-flag'
  if (type === 'count') return 'mdi-counter'
  if (type === 'identifier') return 'mdi-identifier'
  if (type === 'breadcrumb') return 'mdi-bread-slice'
  if (type === 'appointment') return 'mdi-calendar-check'
  return 'mdi-shape' // Default for custom types
}

const getTypeColor = (type: string): string => {
  if (type === 'object') return 'blue'
  if (type === 'array') return 'green'
  if (type === 'string') return 'orange'
  if (type === 'number' || type === 'integer') return 'purple'
  if (type === 'boolean') return 'red'
  if (type === 'null') return 'grey'
  return 'primary'
}

const getTypeDescription = (type: string): string => {
  if (type === 'object') return 'Complex object with properties'
  if (type === 'array') return 'List of items'
  if (type === 'string') return 'Text value'
  if (type === 'number') return 'Numeric value'
  if (type === 'integer') return 'Whole number'
  if (type === 'boolean') return 'True/false value'
  if (type === 'null') return 'Null value'
  if (type === 'email') return 'Email address'
  if (type === 'url') return 'Web URL'
  if (type === 'ip_address') return 'IP address'
  if (type === 'us_phone') return 'US phone number'
  if (type === 'date_time') return 'Date and time'
  if (type === 'markdown') return 'Markdown text'
  if (type === 'identity') return 'User identity'
  if (type === 'word') return 'Single word'
  if (type === 'sentence') return 'Text sentence'
  if (type === 'street_address') return 'Street address'
  if (type === 'state_code') return 'US state code'
  if (type === 'count') return 'Numeric count'
  if (type === 'identifier') return 'Unique identifier'
  if (type === 'breadcrumb') return 'Navigation breadcrumb'
  if (type === 'appointment') return 'Calendar appointment'
  return 'Custom type'
}

// Watch for modelValue changes
const updateSelectedType = () => {
  selectedType.value = props.modelValue || ''
}

// Load types on mount
onMounted(() => {
  loadTypes()
  updateSelectedType()
})

// Watch for prop changes
watch(() => props.modelValue, updateSelectedType)
</script> 