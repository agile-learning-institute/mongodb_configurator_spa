<template>
  <div data-test="ref-picker">
    <!-- Display chip that opens the picker -->
    <v-chip
      :color="getChipColor()"
      :variant="getChipVariant()"
      size="small"
      class="cursor-pointer"
      :disabled="disabled"
      @click="showPicker = true"
      data-test="ref-dictionary-chip"
    >
      <v-icon start size="small" data-test="ref-dictionary-icon">mdi-link</v-icon>
      <span data-test="ref-dictionary-value">{{ modelValue || 'Pick a dictionary' }}</span>
      <v-icon end size="small" v-if="!disabled" data-test="dropdown-icon">mdi-chevron-down</v-icon>
    </v-chip>

    <!-- Ref Picker Dialog -->
    <v-dialog v-model="showPicker" max-width="600" data-test="ref-dictionary-picker-dialog">
      <v-card data-test="ref-dictionary-picker-card">
        <v-card-title class="d-flex justify-space-between align-center pa-4" data-test="ref-dictionary-picker-title">
          <span data-test="ref-dictionary-picker-title-text">Pick a Dictionary</span>
          <v-btn icon size="small" @click="showPicker = false" data-test="ref-dictionary-picker-close-btn">
            <v-icon data-test="ref-dictionary-picker-close-icon">mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-card-text class="pa-4">
          <!-- Dictionary Names -->
          <div v-if="dictionaryNames.length > 0" class="mb-4" data-test="ref-dictionary-picker-values">
            <h4 class="mb-3" data-test="ref-dictionary-picker-values-title">Select Dictionary:</h4>
            <div class="d-flex flex-wrap gap-2">
              <v-chip
                v-for="dictionaryName in dictionaryNames"
                :key="dictionaryName"
                :color="modelValue === dictionaryName ? 'primary' : undefined"
                variant="outlined"
                size="default"
                class="cursor-pointer pa-2"
                @click="selectDictionary(dictionaryName)"
                :data-test="`ref-dictionary-option-${dictionaryName}`"
              >
                <v-icon start size="18" :data-test="`ref-dictionary-option-icon-${dictionaryName}`">mdi-link</v-icon>
                <span :data-test="`ref-dictionary-option-name-${dictionaryName}`">{{ dictionaryName }}</span>
              </v-chip>
            </div>
          </div>

          <!-- No dictionaries message -->
          <div v-else class="text-center pa-4" data-test="ref-picker-no-dictionaries">
            <v-icon size="48" color="grey" data-test="ref-picker-no-dictionaries-icon">mdi-link</v-icon>
            <p class="text-grey mt-2" data-test="ref-picker-no-dictionaries-message">No dictionaries found</p>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { apiService } from '@/utils/api'

// Simple interface for dictionary file info from API
interface DictionaryFile {
  file_name: string
}

interface Props {
  modelValue?: string
  label?: string
  disabled?: boolean
  error?: string
  density?: 'default' | 'compact' | 'comfortable'
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Dictionary',
  disabled: false,
  error: '',
  density: 'default'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const showPicker = ref(false)
const availableDictionaryFiles = ref<DictionaryFile[]>([])
const loading = ref(false)

// Get dictionary names from the file names
const dictionaryNames = computed(() => {
  if (!availableDictionaryFiles.value.length) return []
  return availableDictionaryFiles.value.map((file: DictionaryFile) => {
    // Remove .yaml extension from filename (e.g., "sample.1.0.0.yaml" -> "sample.1.0.0")
    return file.file_name.replace(/\.yaml$/, '')
  })
})

// Load available dictionary files
const loadDictionaries = async () => {
  loading.value = true
  try {
    const dictionaryFiles = await apiService.getDictionaries()
    availableDictionaryFiles.value = dictionaryFiles
  } catch (err) {
    console.error('Failed to load dictionaries:', err)
    availableDictionaryFiles.value = []
  } finally {
    loading.value = false
  }
}

const selectDictionary = (dictionaryName: string) => {
  emit('update:modelValue', dictionaryName)
  showPicker.value = false
}

// Get chip color based on whether a value is selected
const getChipColor = (): string => {
  return props.modelValue ? 'primary' : 'default'
}

// Get chip variant
const getChipVariant = (): "text" | "flat" | "elevated" | "tonal" | "outlined" | "plain" => {
  return 'elevated'
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
