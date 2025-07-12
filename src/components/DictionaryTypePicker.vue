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
  excludeType?: string // Current dictionary file name to exclude
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
const availableDictionaries = ref<string[]>([])
const loading = ref(false)

// Dictionary-specific types (no primitives)
const structuralTypes = ['object', 'array']
const referenceTypes = ['ref']
const enumTypes = ['enum', 'enum_array']

// Load available dictionaries from API
const loadDictionaries = async () => {
  loading.value = true
  try {
    const dictionaries = await apiService.getDictionaries()
    // Extract dictionary names and remove .yaml extension
    const dictionaryNames = dictionaries.map((dict: any) => dict.file_name.replace('.yaml', ''))
    availableDictionaries.value = dictionaryNames
  } catch (err) {
    console.error('Failed to load dictionaries:', err)
    availableDictionaries.value = []
  } finally {
    loading.value = false
  }
}

// Combine all types and filter based on search query
const allTypes = computed(() => [
  ...structuralTypes, // Object and array first
  ...enumTypes,       // Enum types
  ...referenceTypes,  // Ref type
  ...availableDictionaries.value
])

const filteredTypes = computed(() => {
  const excludeName = props.excludeType.replace('.yaml', '')
  return allTypes.value.filter(type => 
    type !== excludeName && 
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
  return type === 'object' || type === 'array' || type === 'enum' || type === 'enum_array'
}

const getTypeIcon = (type: string): string => {
  if (type === 'object') return 'mdi-cube-outline'
  if (type === 'array') return 'mdi-format-list-bulleted'
  if (type === 'enum') return 'mdi-format-list-checks'
  if (type === 'enum_array') return 'mdi-format-list-numbered'
  return 'mdi-shape' // Should never be called due to hasIcon check
}

const getTypeColor = (type: string): string => {
  if (type === 'object') return 'blue'
  if (type === 'array') return 'green'
  if (type === 'enum') return 'purple'
  if (type === 'enum_array') return 'deep-purple'
  if (type === 'ref') return 'orange'
  return 'primary'
}

// Load dictionaries on mount
onMounted(() => {
  loadDictionaries()
})
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style> 