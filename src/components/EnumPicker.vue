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
          
          <!-- Enumerator Versions Tabs -->
          <v-tabs v-model="selectedVersion" class="mb-4">
            <v-tab
              v-for="(enumerator, index) in filteredEnumerators"
              :key="enumerator.file_name"
              :value="index"
            >
              {{ enumerator.name || enumerator.file_name.replace('.yaml', '') }}
            </v-tab>
          </v-tabs>

          <!-- Enum Values for Selected Version -->
          <div v-if="selectedEnumerator && selectedEnumerator.enumerators" class="mb-4">
            <h4 class="mb-3">Enum Values:</h4>
            <div class="d-flex flex-wrap gap-2">
              <v-chip
                v-for="(enumName, enumKey) in selectedEnumerator.enumerators"
                :key="enumKey"
                :color="modelValue === enumKey ? 'primary' : undefined"
                variant="outlined"
                size="default"
                class="cursor-pointer pa-2"
                @click="selectEnum(enumKey)"
              >
                <v-icon start size="18">mdi-checkbox-blank-circle</v-icon>
                {{ enumKey }}
              </v-chip>
            </div>
          </div>

          <!-- No enumerators message -->
          <div v-else-if="filteredEnumerators.length === 0" class="text-center pa-4">
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
const availableEnumerators = ref<any[]>([])
const selectedVersion = ref<number>(0)
const loading = ref(false)

// Load available enumerators from API
const loadEnumerators = async () => {
  loading.value = true
  try {
    const enumerators = await apiService.getEnumerators()
    availableEnumerators.value = enumerators
    // Set first enumerator as selected if available
    if (enumerators.length > 0 && selectedVersion.value === 0) {
      selectedVersion.value = 0
    }
  } catch (err) {
    console.error('Failed to load enumerators:', err)
    availableEnumerators.value = []
  } finally {
    loading.value = false
  }
}

// Filter enumerators based on search query
const filteredEnumerators = computed(() => {
  return availableEnumerators.value.filter(enumerator => 
    (enumerator.name || enumerator.file_name).toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Get selected enumerator data
const selectedEnumerator = computed(() => {
  return filteredEnumerators.value[selectedVersion.value]
})

const selectEnum = (enumKey: string) => {
  emit('update:modelValue', enumKey)
  showPicker.value = false
  searchQuery.value = ''
}

// Watch for changes in filtered enumerators to update selected version
watch(filteredEnumerators, (newEnumerators) => {
  if (newEnumerators.length > 0 && selectedVersion.value >= newEnumerators.length) {
    selectedVersion.value = 0
  }
})

// Load enumerators on mount
onMounted(() => {
  loadEnumerators()
})
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style> 