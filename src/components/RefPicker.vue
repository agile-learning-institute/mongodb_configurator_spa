<template>
  <div class="ref-picker" data-test="ref-picker">
    <!-- Display chip that opens the picker -->
    <v-chip
      :color="getChipColor()"
      :variant="PICKER_STYLES.chipVariant"
      :size="PICKER_STYLES.chipSize"
      class="cursor-pointer picker-pill-chip"
      :disabled="disabled"
      @click="showPicker = true"
      data-test="ref-dictionary-chip"
    >
      <v-icon start size="small" data-test="ref-dictionary-icon">mdi-link</v-icon>
      <span data-test="ref-dictionary-value">{{ modelValue || 'Pick a dictionary' }}</span>
      <v-icon
        v-if="modelValue && referencedDictionaryFiles.length && !disabled"
        end
        size="16"
        class="ml-1"
        @click.stop="openDictionaryForName(modelValue)"
        data-test="ref-dictionary-open-selected"
      >
        mdi-open-in-new
      </v-icon>
      <v-icon end size="small" v-if="!disabled" data-test="dropdown-icon">mdi-chevron-down</v-icon>
    </v-chip>

    <!-- Ref Picker Dialog -->
    <v-dialog v-model="showPicker" max-width="720" data-test="ref-dictionary-picker-dialog">
      <v-card class="ref-picker-card" data-test="ref-dictionary-picker-card">
        <v-card-title class="d-flex justify-space-between align-center pa-4" data-test="ref-dictionary-picker-title">
          <span data-test="ref-dictionary-picker-title-text">Pick a Dictionary</span>
          <v-btn
            icon
            size="small"
            variant="text"
            color="white"
            @click="showPicker = false"
            data-test="ref-dictionary-picker-close-btn"
          >
            <v-icon data-test="ref-dictionary-picker-close-icon">mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-card-text class="pa-4">
          <!-- Dictionary Names -->
          <div v-if="dictionaryNames.length > 0" class="mb-4" data-test="ref-dictionary-picker-values">
            <h4 class="mb-3" data-test="ref-dictionary-picker-values-title">Select Dictionary:</h4>
            <div class="d-flex flex-wrap gap-3">
              <v-chip
                v-for="file in referencedDictionaryFiles"
                :key="file.file_name"
                :color="modelValue === getDictionaryDisplayName(file) ? PICKER_STYLES.optionColorSelected : PICKER_STYLES.optionColorUnselected"
                :variant="PICKER_STYLES.optionVariant"
                :size="PICKER_STYLES.optionSize"
                class="cursor-pointer picker-pill-chip ref-chip-option"
                @click="selectDictionary(getDictionaryDisplayName(file))"
                :data-test="`ref-dictionary-option-${getDictionaryDisplayName(file)}`"
              >
                <v-icon start size="18" :data-test="`ref-dictionary-option-icon-${getDictionaryDisplayName(file)}`">mdi-link</v-icon>
                <span :data-test="`ref-dictionary-option-name-${getDictionaryDisplayName(file)}`">{{ getDictionaryDisplayName(file) }}</span>
                <v-tooltip text="Open dictionary" location="top">
                  <template #activator="{ props }">
                    <v-icon
                      v-bind="props"
                      end
                      size="small"
                      class="ml-1"
                      @click.stop="openDictionary(file.file_name)"
                      :data-test="`ref-dictionary-open-${getDictionaryDisplayName(file)}`"
                    >
                      mdi-open-in-new
                    </v-icon>
                  </template>
                </v-tooltip>
              </v-chip>
            </div>
          </div>

          <!-- No dictionaries message -->
          <div v-else class="text-center pa-4" data-test="ref-picker-no-dictionaries">
            <v-icon size="48" color="grey" data-test="ref-picker-no-dictionaries-icon">mdi-link</v-icon>
            <p class="text-grey mt-2" data-test="ref-picker-no-dictionaries-message">No dictionaries found</p>
          </div>

          <div class="mt-4 d-flex justify-end" v-if="!disabled">
            <v-btn
              color="primary"
              variant="text"
              prepend-icon="mdi-plus"
              @click="openCreateDialog"
              data-test="ref-dictionary-create-btn"
            >
              Create new dictionary
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Create Referenced Dictionary Dialog -->
    <v-dialog v-model="showCreateDialog" max-width="480" data-test="ref-dictionary-create-dialog">
      <v-card>
        <v-card-title class="text-h6">
          Create Referenced Dictionary
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newDictionaryName"
            label="Dictionary name"
            placeholder="e.g. persona"
            variant="outlined"
            density="comfortable"
            :error="!!createError"
            :error-messages="createError || ''"
            data-test="ref-dictionary-create-name-input"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="closeCreateDialog"
            data-test="ref-dictionary-create-cancel-btn"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            :loading="creatingDictionary"
            @click="createReferencedDictionary"
            data-test="ref-dictionary-create-confirm-btn"
          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiService } from '@/utils/api'
import { PICKER_STYLES } from '@/config/pickerStyles'

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

const router = useRouter()
const showPicker = ref(false)
const availableDictionaryFiles = ref<DictionaryFile[]>([])
const loading = ref(false)
const showCreateDialog = ref(false)
const newDictionaryName = ref('')
const creatingDictionary = ref(false)
const createError = ref<string | null>(null)

const VERSIONED_DICTIONARY_REGEX = /\.\d+\.\d+\.\d+\.yaml$/

const referencedDictionaryFiles = computed(() => {
  if (!availableDictionaryFiles.value.length) return []
  return availableDictionaryFiles.value.filter(
    (file: DictionaryFile) => !VERSIONED_DICTIONARY_REGEX.test(file.file_name)
  )
})

const dictionaryNames = computed(() => {
  if (!referencedDictionaryFiles.value.length) return []
  return referencedDictionaryFiles.value.map((file: DictionaryFile) =>
    file.file_name.replace(/\.yaml$/, '')
  )
})

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

const getDictionaryDisplayName = (file: DictionaryFile): string => {
  return file.file_name.replace(/\.yaml$/, '')
}

const openDictionary = (fileName: string) => {
  showPicker.value = false
  router.push(`/dictionaries/${fileName}`)
}

const openDictionaryForName = (dictionaryName: string) => {
  const file = referencedDictionaryFiles.value.find(
    (f) => getDictionaryDisplayName(f) === dictionaryName
  )
  if (!file) return
  openDictionary(file.file_name)
}

const getChipColor = (): string => {
  return props.modelValue ? PICKER_STYLES.chipColorSelected : PICKER_STYLES.chipColorUnselected
}

const openCreateDialog = () => {
  newDictionaryName.value = ''
  createError.value = null
  showCreateDialog.value = true
}

const closeCreateDialog = () => {
  showCreateDialog.value = false
}

const sanitizeDictionaryName = (rawName: string): string => {
  let name = rawName.trim()
  if (!name) return ''
  name = name.replace(/\.yaml$/i, '')
  name = name.replace(/\s+/g, '_')
  return name
}

const isValidReferencedDictionaryName = (name: string): boolean => {
  if (!name) return false
  if (/\.\d+\.\d+\.\d+$/.test(name)) return false
  return /^[a-zA-Z0-9_\-]+$/.test(name)
}

const createReferencedDictionary = async () => {
  createError.value = null
  const sanitized = sanitizeDictionaryName(newDictionaryName.value)

  if (!isValidReferencedDictionaryName(sanitized)) {
    createError.value =
      'Enter a name using letters, numbers, dashes, or underscores (no version numbers).'
    return
  }

  const fileName = `${sanitized}.yaml`
  const exists = availableDictionaryFiles.value.some(
    (file) => file.file_name === fileName
  )

  if (exists) {
    createError.value = 'A dictionary with that name already exists.'
    return
  }

  creatingDictionary.value = true
  try {
    const payload = {
      file_name: fileName,
      _locked: false,
      root: {
        name: 'root',
        description: '',
        type: 'object',
        required: true,
        properties: [] as any[],
      },
    }

    await apiService.saveDictionary(fileName, payload)
    await loadDictionaries()

    emit('update:modelValue', sanitized)
    showCreateDialog.value = false
  } catch (err) {
    console.error('Failed to create dictionary:', err)
    createError.value = 'Failed to create dictionary. Please try again.'
  } finally {
    creatingDictionary.value = false
  }
}

onMounted(() => {
  loadDictionaries()
})
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

/* Picker card styling to match type picker */
.ref-picker-card {
  max-height: 400px;
  max-width: 720px;
  overflow-y: auto;
  background: #0d47a1 !important;
  color: #ffffff !important;
}

.ref-picker-card * {
  color: #ffffff !important;
}

.ref-chip-option {
  min-height: 30px;
  padding-inline: 12px;
  margin: 3px 5px;
}
</style>
