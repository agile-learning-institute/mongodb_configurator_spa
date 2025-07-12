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
    <v-dialog v-model="showPicker" max-width="500">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center pa-4">
          <span>Select Type</span>
          <v-btn icon size="small" @click="showPicker = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-card-text class="pa-4">
          <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="mdi-magnify"
            label="Search types..."
            variant="outlined"
            density="compact"
            hide-details
            class="mb-3"
          />
          
          <!-- Primitive Types -->
          <div class="mb-4">
            <div class="text-caption text-medium-emphasis mb-2">Primitive Types</div>
            <div class="d-flex flex-wrap gap-1">
              <v-chip
                v-for="type in filteredPrimitiveTypes"
                :key="type"
                :color="modelValue === type ? 'primary' : undefined"
                variant="outlined"
                size="small"
                class="cursor-pointer"
                @click="selectType(type)"
              >
                <v-icon start size="16">{{ getTypeIcon(type) }}</v-icon>
                {{ type }}
              </v-chip>
            </div>
          </div>

          <!-- Structural Types -->
          <div class="mb-4">
            <div class="text-caption text-medium-emphasis mb-2">Structural Types</div>
            <div class="d-flex flex-wrap gap-1">
              <v-chip
                v-for="type in structuralTypes"
                :key="type"
                :color="modelValue === type ? 'primary' : undefined"
                variant="outlined"
                size="small"
                class="cursor-pointer"
                @click="selectType(type)"
              >
                <v-icon start size="16">{{ getTypeIcon(type) }}</v-icon>
                {{ type }}
              </v-chip>
            </div>
          </div>

          <!-- Custom Types -->
          <div v-if="filteredCustomTypes.length > 0">
            <div class="text-caption text-medium-emphasis mb-2">Custom Types</div>
            <div class="d-flex flex-wrap gap-1">
              <v-chip
                v-for="type in filteredCustomTypes"
                :key="type"
                :color="modelValue === type ? 'primary' : undefined"
                variant="outlined"
                size="small"
                class="cursor-pointer"
                @click="selectType(type)"
              >
                <v-icon start size="16">{{ getTypeIcon(type) }}</v-icon>
                {{ type }}
              </v-chip>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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

// User-friendly primitive types only
const primitiveTypes = [
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
  return 'primary'
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