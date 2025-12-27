<template>
  <div data-test="enum-picker">
    <!-- Display chip that opens the picker -->
    <v-chip
      :color="getChipColor()"
      :variant="getChipVariant()"
      size="small"
      class="cursor-pointer"
      :disabled="disabled"
      @click="showPicker = true"
      data-test="enum-type-chip"
    >
      <v-icon start size="small" data-test="enum-type-icon">mdi-format-list-checks</v-icon>
      <span data-test="enum-type-value">{{ modelValue || 'Pick an enum' }}</span>
      <v-icon end size="small" v-if="!disabled" data-test="dropdown-icon">mdi-chevron-down</v-icon>
    </v-chip>

    <!-- Enum Picker Dialog -->
    <v-dialog v-model="showPicker" max-width="600" data-test="enum-type-picker-dialog">
      <v-card data-test="enum-type-picker-card">
        <v-card-title class="d-flex justify-space-between align-center pa-4" data-test="enum-type-picker-title">
          <span data-test="enum-type-picker-title-text">Pick an Enumerator</span>
          <v-btn icon size="small" @click="showPicker = false" data-test="enum-type-picker-close-btn">
            <v-icon data-test="enum-type-picker-close-icon">mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-card-text class="pa-4">
          <!-- Enum Values from Most Recent Version -->
          <div v-if="enumeratorNames.length > 0" class="mb-4" data-test="enum-type-picker-values">
            <h4 class="mb-3" data-test="enum-type-picker-values-title">Select Enumerator:</h4>
            <div class="d-flex flex-wrap gap-2">
              <v-chip
                v-for="enumeratorName in enumeratorNames"
                :key="enumeratorName"
                :color="modelValue === enumeratorName ? 'primary' : undefined"
                variant="outlined"
                size="default"
                class="cursor-pointer pa-2"
                @click="selectEnum(enumeratorName)"
                :data-test="`enum-type-option-${enumeratorName}`"
              >
                <v-icon start size="18" :data-test="`enum-type-option-icon-${enumeratorName}`">mdi-format-list-checks</v-icon>
                <span :data-test="`enum-type-option-name-${enumeratorName}`">{{ enumeratorName }}</span>
              </v-chip>
            </div>
          </div>

          <!-- No enumerators message -->
          <div v-else class="text-center pa-4" data-test="enum-picker-no-enumerators">
            <v-icon size="48" color="grey" data-test="enum-picker-no-enumerators-icon">mdi-format-list-checks</v-icon>
            <p class="text-grey mt-2" data-test="enum-picker-no-enumerators-message">No enumerators found</p>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { apiService } from '@/utils/api'
import type { EnumeratorFile, Enumerator } from '@/types/types'

interface Props {
  modelValue?: string
  label?: string
  disabled?: boolean
  error?: string
  density?: 'default' | 'compact' | 'comfortable'
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Enum',
  disabled: false,
  error: '',
  density: 'default'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const showPicker = ref(false)
const availableEnumeratorFiles = ref<EnumeratorFile[]>([])
const mostRecentEnumeratorData = ref<EnumeratorFile | null>(null)
const loading = ref(false)

// Get enumerator names from the most recent version
const enumeratorNames = computed(() => {
  if (!mostRecentEnumeratorData.value?.enumerators) return []
  return mostRecentEnumeratorData.value.enumerators.map((enumerator: Enumerator) => enumerator.name)
})

// Load available enumerator files and get the most recent one
const loadEnumerators = async () => {
  loading.value = true
  try {
    const enumeratorFiles = await apiService.getEnumerators()
    availableEnumeratorFiles.value = enumeratorFiles
    
      // Get the most recent enumerator file (highest version number from filename)
      if (enumeratorFiles.length > 0) {
        const mostRecentFile = enumeratorFiles.reduce((latest: EnumeratorFile, current: EnumeratorFile) => {
          // Extract version number from filename (e.g., "enumerations.2.yaml" -> 2)
          const latestVersion = parseInt(latest.file_name.match(/enumerations\.(\d+)\.yaml/)?.[1] || '0')
          const currentVersion = parseInt(current.file_name.match(/enumerations\.(\d+)\.yaml/)?.[1] || '0')
          return currentVersion > latestVersion ? current : latest
        })
      const data = await apiService.getEnumerator(mostRecentFile.file_name)
      mostRecentEnumeratorData.value = data
    }
  } catch (err) {
    console.error('Failed to load enumerators:', err)
    availableEnumeratorFiles.value = []
    mostRecentEnumeratorData.value = null
  } finally {
    loading.value = false
  }
}

const selectEnum = (enumeratorName: string) => {
  emit('update:modelValue', enumeratorName)
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

// Load enumerators on mount
onMounted(() => {
  loadEnumerators()
})
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

/* Ensure chip maintains full opacity even when disabled */
.v-chip.v-chip--disabled {
  opacity: 1 !important;
}

.v-chip.v-chip--disabled .v-chip__content {
  opacity: 1 !important;
}

.v-chip.v-chip--disabled .v-icon {
  opacity: 1 !important;
}
</style> 