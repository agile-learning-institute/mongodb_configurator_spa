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
      <v-icon v-if="hasIcon(modelValue || '')" start size="small">{{ getTypeIcon(modelValue || '') }}</v-icon>
      {{ modelValue || 'Pick a type' }}
    </v-chip>

    <!-- Type Picker Dialog -->
    <v-dialog v-model="showPicker" max-width="600">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center pa-4">
          <span>Pick a Type</span>
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
          
          <!-- All Types -->
                      <div class="d-flex flex-wrap gap-2">
              <v-chip
                v-for="type in filteredTypes"
                :key="type"
                :color="modelValue === type ? 'primary' : undefined"
                variant="outlined"
                size="default"
                class="cursor-pointer pa-2"
                @click="selectType(type)"
              >
                <v-icon v-if="hasIcon(type)" start size="18">{{ getTypeIcon(type) }}</v-icon>
                {{ type }}
              </v-chip>
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
  excludeTypeList?: string[] // Additional types to exclude
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Type',
  disabled: false,
  error: '',
  density: 'default',
  excludeType: '',
  excludeTypeList: () => []
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const showPicker = ref(false)
const searchQuery = ref('')
const availableTypes = ref<string[]>([])
const loading = ref(false)

// All available types (primitive + structural + custom)
const primitiveTypes = [
  'identity', 'word', 'sentence', 'email', 'url', 
  'ip_address', 'us_phone', 'date_time', 'markdown',
  'street_address', 'state_code', 'count', 'identifier',
  'breadcrumb', 'appointment'
]

// Add enum and enum_array to the list of structural types
const structuralTypes = ['object', 'array', 'enum', 'enum_array']

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

// Combine all types and filter based on search query
const allTypes = computed(() => [
  ...structuralTypes, // Object and array first
  ...primitiveTypes,
  ...availableTypes.value
])

const filteredTypes = computed(() => {
  const excludeName = props.excludeType.replace('.yaml', '')
  const excludeList = props.excludeTypeList || []
  return allTypes.value.filter(type => 
    type !== excludeName &&
    !excludeList.includes(type) &&
    type !== 'pick a type' &&
    type.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const selectType = (type: string) => {
  emit('update:modelValue', type)
  showPicker.value = false
  searchQuery.value = ''
}

const hasIcon = (type: string): boolean => {
  return type === 'object' || type === 'array'
}

const getTypeIcon = (type: string): string => {
  if (type === 'object') return 'mdi-cube-outline'
  if (type === 'array') return 'mdi-format-list-bulleted'
  return 'mdi-shape' // Should never be called due to hasIcon check
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