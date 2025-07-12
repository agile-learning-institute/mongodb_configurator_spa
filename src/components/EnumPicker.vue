<template>
  <div>
    <!-- Display chip that opens the picker -->
    <v-chip
      color="purple"
      variant="outlined"
      class="cursor-pointer"
      :disabled="disabled"
      @click="showPicker = true"
    >
      <v-icon start size="small">mdi-format-list-checks</v-icon>
      {{ modelValue || 'Pick an enum' }}
    </v-chip>

    <!-- Enum Picker Dialog -->
    <v-dialog v-model="showPicker" max-width="800">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center pa-4">
          <span>Pick an Enumerator</span>
          <v-btn icon size="small" @click="showPicker = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-card-text class="pa-4">
          <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="mdi-magnify"
            label="Search enumerators..."
            variant="outlined"
            density="compact"
            hide-details
            class="mb-3"
          />
          
          <!-- Enumerator Files Tabs -->
          <v-tabs v-model="selectedEnumeratorFile" class="mb-4">
            <v-tab
              v-for="enumeratorFile in filteredEnumeratorFiles"
              :key="enumeratorFile.file_name"
              :value="enumeratorFile.file_name"
            >
              {{ enumeratorFile.name || enumeratorFile.file_name.replace('.yaml', '') }}
            </v-tab>
          </v-tabs>

          <!-- Enum Values for Selected Version -->
          <div v-if="selectedEnumeratorData && selectedEnumeratorData.enumerators" class="mb-4">
            <h4 class="mb-3">Select Enumerator:</h4>
            <div class="d-flex flex-wrap gap-2">
              <v-chip
                v-for="(enumeratorDict, enumeratorName) in selectedEnumeratorData.enumerators"
                :key="enumeratorName"
                :color="modelValue === enumeratorName ? 'primary' : undefined"
                variant="outlined"
                size="default"
                class="cursor-pointer pa-2"
                @click="selectEnum(enumeratorName)"
              >
                <v-icon start size="18">mdi-format-list-checks</v-icon>
                {{ enumeratorName }}
              </v-chip>
            </div>
          </div>

          <!-- No enumerators message -->
          <div v-else-if="filteredEnumeratorFiles.length === 0" class="text-center pa-4">
            <v-icon size="48" color="grey">mdi-format-list-checks</v-icon>
            <p class="text-grey mt-2">No enumerators found</p>
          </div>
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
const searchQuery = ref('')
const availableEnumeratorFiles = ref<any[]>([])
const selectedEnumeratorFile = ref<string>('')
const selectedEnumeratorData = ref<any>(null)
const loading = ref(false)

// Load available enumerator files from API
const loadEnumeratorFiles = async () => {
  loading.value = true
  try {
    const enumeratorFiles = await apiService.getEnumerators()
    availableEnumeratorFiles.value = enumeratorFiles
    // Set first enumerator file as selected if available
    if (enumeratorFiles.length > 0 && !selectedEnumeratorFile.value) {
      selectedEnumeratorFile.value = enumeratorFiles[0].file_name
      await loadSelectedEnumeratorData()
    }
  } catch (err) {
    console.error('Failed to load enumerator files:', err)
    availableEnumeratorFiles.value = []
  } finally {
    loading.value = false
  }
}

// Load data for selected enumerator file
const loadSelectedEnumeratorData = async () => {
  if (!selectedEnumeratorFile.value) return
  
  try {
    const data = await apiService.getEnumerator(selectedEnumeratorFile.value)
    selectedEnumeratorData.value = data
  } catch (err) {
    console.error('Failed to load enumerator data:', err)
    selectedEnumeratorData.value = null
  }
}

// Filter enumerator files based on search query
const filteredEnumeratorFiles = computed(() => {
  return availableEnumeratorFiles.value.filter(enumeratorFile => 
    (enumeratorFile.name || enumeratorFile.file_name).toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const selectEnum = (enumeratorName: string) => {
  emit('update:modelValue', enumeratorName)
  showPicker.value = false
  searchQuery.value = ''
}

// Watch for changes in selected enumerator file
watch(selectedEnumeratorFile, async () => {
  await loadSelectedEnumeratorData()
})

// Load enumerator files on mount
onMounted(() => {
  loadEnumeratorFiles()
})
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style> 