<template>
  <div>
    <!-- Display chip that opens the picker -->
    <v-chip
      :color="getTypeColor(modelValue || '')"
      variant="outlined"
      class="cursor-pointer"
      :disabled="disabled"
      @click="showPicker = true"
    >
      <v-icon start size="small">{{ getTypeIcon(modelValue || '') }}</v-icon>
      {{ modelValue || 'Select Type' }}
    </v-chip>

    <!-- Type Picker Dialog -->
    <v-dialog v-model="showPicker" max-width="600">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Select Type</span>
          <v-btn icon @click="showPicker = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-card-text>
          <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="mdi-magnify"
            label="Search types..."
            variant="outlined"
            density="compact"
            hide-details
            class="mb-4"
          />
          
          <v-list>
            <!-- Built-in Primitive Types -->
            <v-list-subheader>Primitive Types</v-list-subheader>
            <v-list-item
              v-for="type in filteredPrimitiveTypes"
              :key="type"
              @click="selectType(type)"
              :active="modelValue === type"
            >
              <template v-slot:prepend>
                <v-icon :color="getTypeColor(type)">
                  {{ getTypeIcon(type) }}
                </v-icon>
              </template>
              <v-list-item-title>{{ type }}</v-list-item-title>
              <v-list-item-subtitle>{{ getTypeDescription(type) }}</v-list-item-subtitle>
            </v-list-item>

            <!-- Structural Types -->
            <v-list-subheader class="mt-4">Structural Types</v-list-subheader>
            <v-list-item
              v-for="type in structuralTypes"
              :key="type"
              @click="selectType(type)"
              :active="modelValue === type"
            >
              <template v-slot:prepend>
                <v-icon :color="getTypeColor(type)">
                  {{ getTypeIcon(type) }}
                </v-icon>
              </template>
              <v-list-item-title>{{ type }}</v-list-item-title>
              <v-list-item-subtitle>{{ getTypeDescription(type) }}</v-list-item-subtitle>
            </v-list-item>

            <!-- Custom Types -->
            <v-list-subheader v-if="filteredCustomTypes.length > 0" class="mt-4">Custom Types</v-list-subheader>
            <v-list-item
              v-for="type in filteredCustomTypes"
              :key="type"
              @click="selectType(type)"
              :active="modelValue === type"
            >
              <template v-slot:prepend>
                <v-icon :color="getTypeColor(type)">
                  {{ getTypeIcon(type) }}
                </v-icon>
              </template>
              <v-list-item-title>{{ type }}</v-list-item-title>
              <v-list-item-subtitle>Custom type</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { apiService } from '@/utils/api'

interface Props {
  modelValue?: string
  label?: string
  disabled?: boolean
  error?: string
  density?: 'default' | 'compact' | 'comfortable'
  excludeType?: string // Current type file name to exclude
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Type',
  disabled: false,
  error: '',
  density: 'default',
  excludeType: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const showPicker = ref(false)
const searchQuery = ref('')
const availableTypes = ref<string[]>([])
const loading = ref(false)

// Built-in primitive types
const primitiveTypes = [
  'string', 'number', 'boolean', 'integer', 'null',
  'identity', 'word', 'sentence', 'email', 'url', 
  'ip_address', 'us_phone', 'date_time', 'markdown',
  'street_address', 'state_code', 'count', 'identifier',
  'breadcrumb', 'appointment'
]

// Structural types
const structuralTypes = ['object', 'array']

// Load available types from API
const loadTypes = async () => {
  loading.value = true
  try {
    const types = await apiService.getTypes()
    // Extract type names and remove .yaml extension
    const typeNames = types.map((type: any) => type.file_name.replace('.yaml', ''))
    availableTypes.value = typeNames
  } catch (err) {
    console.error('Failed to load types:', err)
    availableTypes.value = []
  } finally {
    loading.value = false
  }
}

// Filter types based on search query and exclude current type
const filteredPrimitiveTypes = computed(() => {
  return primitiveTypes.filter(type => 
    type.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const filteredCustomTypes = computed(() => {
  const excludeName = props.excludeType.replace('.yaml', '')
  return availableTypes.value.filter(type => 
    type !== excludeName && 
    type.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const selectType = (type: string) => {
  emit('update:modelValue', type)
  showPicker.value = false
  searchQuery.value = ''
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

// Load types on mount
onMounted(() => {
  loadTypes()
})
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style> 