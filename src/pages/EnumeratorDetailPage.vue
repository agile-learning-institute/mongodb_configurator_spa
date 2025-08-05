<template>
  <v-container>
    <!-- Loading state -->
    <div v-if="loading" class="d-flex justify-center align-center pa-8">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </div>
    <!-- Error state -->
    <div v-else-if="error" class="pa-4">
      <v-alert type="error">
        {{ error }}
        <v-btn @click="loadEnumerator" class="mt-2">Retry</v-btn>
      </v-alert>
    </div>
    <!-- Content -->
    <div v-else-if="enumerator">
      <!-- Title Area -->
      <div class="d-flex align-center justify-space-between mb-2">
        <div class="d-flex align-center">
          <div class="d-flex align-center">
            <span v-if="enumerator.title" class="text-h6 text-medium-emphasis mr-4">{{ enumerator.title }}</span>
            <h1 class="text-h4 d-flex align-center">
              <v-btn
                icon="mdi-chevron-left"
                variant="text"
                size="small"
                :disabled="!hasPreviousVersion"
                @click="navigateToPreviousVersion"
                class="mr-1"
              />
              Version: {{ enumerator.version }}
              <v-btn
                icon="mdi-chevron-right"
                variant="text"
                size="small"
                :disabled="!hasNextVersion"
                @click="navigateToNextVersion"
                class="ml-1"
              />
            </h1>
          </div>

        </div>
        <div class="d-flex align-center">
          <v-btn
            v-if="!enumerator._locked"
            prepend-icon="mdi-lock"
            variant="outlined"
            color="warning"
            @click="lockEnumerator"
            :loading="saving"
          >
            Lock
          </v-btn>
          <v-btn
            v-else
            prepend-icon="mdi-lock-open"
            variant="outlined"
            color="success"
            @click="showUnlockDialog = true"
            :loading="saving"
          >
            Unlock
          </v-btn>
          <v-btn
            v-if="!enumerator._locked"
            prepend-icon="mdi-delete"
            variant="outlined"
            color="error"
            @click="handleDelete"
            class="ml-2"
          >
            Delete
          </v-btn>
        </div>
      </div>

      <!-- Enumerators List -->
      <BaseCard title="Enumerators">
        <template #header-actions>
          <v-btn
            v-if="!enumerator._locked"
            prepend-icon="mdi-plus"
            variant="elevated"
            color="white"
            size="small"
            @click="addEnumeration"
            :loading="saving"
          >
            <span class="text-primary">Add Enumeration</span>
          </v-btn>
        </template>
        <div v-if="!enumerator.enumerators || enumerator.enumerators.length === 0" class="text-center pa-1">
          <v-icon size="20" color="grey">mdi-format-list-bulleted</v-icon>
          <div class="text-body-2 text-medium-emphasis mt-1">No enumerators defined</div>
        </div>
        <div v-else class="enumerators-list">
          <div
            v-for="(enumItem, enumIdx) in enumerator.enumerators"
            :key="enumIdx"
            class="enumerator-item mb-2"
          >
            <div class="d-flex align-center enumerator-header mb-1">
              <v-text-field
                v-model="editableEnumNames[enumIdx]"
                density="compact"
                variant="plain"
                hide-details
                :readonly="enumerator._locked"
                class="mr-3"
                style="width: 20%; max-width: 150px;"
                :ref="(el) => { if (el && '$el' in el) enumNameInputRefs[enumIdx] = (el as any).$el.querySelector('input') }"
                @blur="finishEnumNameEdit(enumIdx)"
                @keyup.enter="finishEnumNameEdit(enumIdx)"
              />
              <v-spacer />
              <v-chip size="small" color="primary" class="mr-2">
                {{ enumItem.values.length }} values
              </v-chip>
              <v-btn
                v-if="!enumerator._locked"
                prepend-icon="mdi-plus"
                variant="elevated"
                size="small"
                color="white"
                @click="addEnumValue(enumIdx)"
                class="mr-2"
              >
                <span class="text-primary">Add Value</span>
              </v-btn>
              <v-btn
                v-if="!enumerator._locked"
                icon="mdi-delete"
                variant="text"
                color="error"
                @click.stop="deleteEnumeration(enumIdx)"
                class="mr-2"
              >
                <v-icon size="16">mdi-delete</v-icon>
              </v-btn>
              <v-btn
                icon="mdi-chevron-down"
                variant="text"
                size="small"
                @click="toggleEnumeratorCollapse(enumIdx)"
                :class="{ 'rotate-icon': !isEnumeratorCollapsed(enumIdx) }"
              >
                <v-icon size="16">mdi-chevron-down</v-icon>
              </v-btn>
            </div>
            <div v-show="!isEnumeratorCollapsed(enumIdx)" class="enum-values">
              <div v-if="!enumItem.values || enumItem.values.length === 0" class="text-center pa-1">
                <v-icon size="16" color="grey">mdi-format-list-numbered</v-icon>
                <div class="text-body-2 text-medium-emphasis mt-1">No values defined</div>
              </div>
              <div v-else class="enum-values-list">
                <div
                  v-for="(_, valIdx) in enumItem.values"
                  :key="valIdx"
                  class="enum-value-item d-flex align-center"
                >
                  <v-text-field
                    v-model="editableEnumValues[enumIdx][valIdx]"
                    density="compact"
                    variant="plain"
                    hide-details
                    :readonly="enumerator._locked"
                    class="mr-2"
                    style="max-width: 180px;"
                    :ref="(el) => { if (el && '$el' in el) valueInputRefs[`${enumIdx}-${valIdx}`] = (el as any).$el.querySelector('input') }"
                    @blur="finishEnumValueEdit(enumIdx, valIdx)"
                    @keyup.enter="finishEnumValueEdit(enumIdx, valIdx)"
                  />
                  <v-text-field
                    v-model="editableEnumDescriptions[enumIdx][valIdx]"
                    density="compact"
                    variant="plain"
                    hide-details
                    :readonly="enumerator._locked"
                    class="mr-2"
                    style="min-width: 200px;"
                    placeholder="Description"
                    @blur="finishEnumDescriptionEdit(enumIdx, valIdx)"
                    @keyup.enter="finishEnumDescriptionEdit(enumIdx, valIdx)"
                  />
                  <v-btn
                    v-if="!enumerator._locked"
                    icon
                    size="small"
                    variant="text"
                    color="error"
                    @click="deleteEnumValue(enumIdx, valIdx)"
                  >
                    <v-icon size="16">mdi-delete</v-icon>
                  </v-btn>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
  </v-container>

  <!-- Delete Confirmation Dialog -->
  <v-dialog v-model="showDeleteDialog" max-width="500">
    <v-card>
      <v-card-title class="text-h5">
        Delete Enumerator?
      </v-card-title>
      <v-card-text>
        <p>Are you sure you want to delete "{{ enumerator?.file_name }}"?</p>
        <p class="text-caption text-medium-emphasis">
          This action cannot be undone.
        </p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="showDeleteDialog = false">Cancel</v-btn>
        <v-btn color="error" @click="confirmDelete">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Unlock Confirmation Dialog -->
  <v-dialog v-model="showUnlockDialog" max-width="500">
    <v-card>
      <v-card-title class="text-h5">
        Unlock Enumerator?
      </v-card-title>
      <v-card-text>
        <p>Unlocking allows editing this enumerator. Are you sure?</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="cancelUnlock">Cancel</v-btn>
        <v-btn color="warning" @click="confirmUnlock">Unlock</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, nextTick } from 'vue'
import BaseCard from '@/components/BaseCard.vue'
import { useEnumeratorDetail } from '@/composables/useEnumeratorDetail'
import { apiService } from '@/utils/api'
import type { Enumerator, EnumeratorValue } from '@/types/types'

const showDeleteDialog = ref(false)
const showUnlockDialog = ref(false)
const enumeratorFiles = ref<any[]>([])
const loadingFiles = ref(false)
const collapsedEnumerators = ref<Set<number>>(new Set())
const valueInputRefs = ref<Record<string, HTMLInputElement>>({})
const enumNameInputRefs = ref<Record<number, HTMLInputElement>>({})

// Editable state for enum names and values (by index)
const editableEnumNames = ref<string[]>([])
const editableEnumValues = ref<Record<number, string[]>>({})
const editableEnumDescriptions = ref<Record<number, string[]>>({})

function initEditableStateFromEnumerator(val: any) {
  if (val && val.enumerators) {
    editableEnumNames.value = val.enumerators.map((e: Enumerator) => e.name)
    editableEnumValues.value = {}
    editableEnumDescriptions.value = {}
    // Initialize all enumerators as collapsed
    collapsedEnumerators.value = new Set(val.enumerators.map((_: any, i: number) => i))
    val.enumerators.forEach((e: Enumerator, i: number) => {
      editableEnumValues.value[i] = e.values.map((v: EnumeratorValue) => v.value)
      editableEnumDescriptions.value[i] = e.values.map((v: EnumeratorValue) => v.description)
    })
  }
}

const {
  loading,
  saving,
  error,
  enumerator,
  loadEnumerator,
  saveEnumerator,
} = useEnumeratorDetail()

watch(enumerator, (val) => {
  initEditableStateFromEnumerator(val)
}, { immediate: true })

const autoSaveLocal = async () => {
  if (!enumerator.value) return
  await saveEnumerator()
}



const lockEnumerator = async () => {
  if (!enumerator.value) return
  enumerator.value._locked = true
  await autoSaveLocal()
}

const addEnumeration = () => {
  if (!enumerator.value) return
  if (!enumerator.value.enumerators) {
    enumerator.value.enumerators = []
  }
  const newEnum: Enumerator = { name: 'Enumerator Name', values: [] }
  enumerator.value.enumerators.push(newEnum)
  editableEnumNames.value.push(newEnum.name)
  editableEnumValues.value[enumerator.value.enumerators.length - 1] = []
  editableEnumDescriptions.value[enumerator.value.enumerators.length - 1] = []
  
  // Focus on the new enumerator name after the DOM updates
  const newEnumIdx = enumerator.value.enumerators.length - 1
  nextTick(() => {
    const inputRef = enumNameInputRefs.value[newEnumIdx]
    if (inputRef) {
      inputRef.focus()
      inputRef.select()
    }
  })
  
  autoSaveLocal()
}

const deleteEnumeration = (idx: number) => {
  if (!enumerator.value?.enumerators) return
  enumerator.value.enumerators.splice(idx, 1)
  editableEnumNames.value.splice(idx, 1)
  delete editableEnumValues.value[idx]
  delete editableEnumDescriptions.value[idx]
  autoSaveLocal()
}

const handleEnumNameChange = (idx: number, newName: string) => {
  if (!enumerator.value?.enumerators) return
  if (!newName || newName.trim() === '' || enumerator.value.enumerators.some((e, i) => i !== idx && e.name === newName)) return
  enumerator.value.enumerators[idx].name = newName
  editableEnumNames.value[idx] = newName
  autoSaveLocal()
}

const finishEnumNameEdit = (idx: number) => {
  if (enumerator.value && editableEnumNames.value[idx] !== enumerator.value.enumerators[idx].name) {
    handleEnumNameChange(idx, editableEnumNames.value[idx])
  }
}

const addEnumValue = (enumIdx: number) => {
  if (!enumerator.value?.enumerators?.[enumIdx]) return
  const newValue: EnumeratorValue = { value: 'name', description: '' }
  enumerator.value.enumerators[enumIdx].values.push(newValue)
  if (!editableEnumValues.value[enumIdx]) editableEnumValues.value[enumIdx] = []
  if (!editableEnumDescriptions.value[enumIdx]) editableEnumDescriptions.value[enumIdx] = []
  editableEnumValues.value[enumIdx].push(newValue.value)
  editableEnumDescriptions.value[enumIdx].push(newValue.description)
  
  // Expand the section if it's collapsed
  if (isEnumeratorCollapsed(enumIdx)) {
    collapsedEnumerators.value.delete(enumIdx)
  }
  
  // Focus on the new value name after the DOM updates
  const newValueIdx = enumerator.value.enumerators[enumIdx].values.length - 1
  nextTick(() => {
    const refKey = `${enumIdx}-${newValueIdx}`
    const inputRef = valueInputRefs.value[refKey]
    if (inputRef) {
      inputRef.focus()
      inputRef.select()
    }
  })
  
  autoSaveLocal()
}

const deleteEnumValue = (enumIdx: number, valIdx: number) => {
  if (!enumerator.value?.enumerators?.[enumIdx]) return
  enumerator.value.enumerators[enumIdx].values.splice(valIdx, 1)
  editableEnumValues.value[enumIdx].splice(valIdx, 1)
  editableEnumDescriptions.value[enumIdx].splice(valIdx, 1)
  autoSaveLocal()
}

const handleEnumValueChange = (enumIdx: number, valIdx: number, newValue: string) => {
  if (!enumerator.value?.enumerators?.[enumIdx]) return
  if (!newValue || newValue.trim() === '' || enumerator.value.enumerators[enumIdx].values.some((v, i) => i !== valIdx && v.value === newValue)) return
  enumerator.value.enumerators[enumIdx].values[valIdx].value = newValue
  editableEnumValues.value[enumIdx][valIdx] = newValue
  autoSaveLocal()
}

const handleEnumDescriptionChange = (enumIdx: number, valIdx: number, newDesc: string) => {
  if (!enumerator.value?.enumerators?.[enumIdx]) return
  enumerator.value.enumerators[enumIdx].values[valIdx].description = newDesc
  editableEnumDescriptions.value[enumIdx][valIdx] = newDesc
  autoSaveLocal()
}

const finishEnumValueEdit = (enumIdx: number, valIdx: number) => {
  if (enumerator.value && editableEnumValues.value[enumIdx][valIdx] !== enumerator.value.enumerators[enumIdx].values[valIdx].value) {
    handleEnumValueChange(enumIdx, valIdx, editableEnumValues.value[enumIdx][valIdx])
  }
}

const finishEnumDescriptionEdit = (enumIdx: number, valIdx: number) => {
  if (enumerator.value && editableEnumDescriptions.value[enumIdx][valIdx] !== enumerator.value.enumerators[enumIdx].values[valIdx].description) {
    handleEnumDescriptionChange(enumIdx, valIdx, editableEnumDescriptions.value[enumIdx][valIdx])
  }
}

const handleDelete = () => {
  showDeleteDialog.value = true
}

const unlockEnumerator = async () => {
  if (!enumerator.value) return
  enumerator.value._locked = false
  showUnlockDialog.value = false
  await autoSaveLocal()
}

const confirmUnlock = () => {
  unlockEnumerator()
}

const cancelUnlock = () => {
  showUnlockDialog.value = false
}

const confirmDelete = async () => {
  if (!enumerator.value) return
  
  try {
    await apiService.deleteEnumerator(enumerator.value.file_name)
    // Navigate back to enumerators list
    window.location.href = '/enumerators'
  } catch (err: any) {
    error.value = err.message || 'Failed to delete enumerator'
    console.error('Failed to delete enumerator:', err)
  }
}



// Load enumerator files for navigation
const loadEnumeratorFiles = async () => {
  loadingFiles.value = true
  try {
    const files = await apiService.getEnumerators()
    enumeratorFiles.value = files
  } catch (err: any) {
    console.error('Failed to load enumerator files:', err)
  } finally {
    loadingFiles.value = false
  }
}

// Extract version number from file name (e.g., "enumerations.5.yaml" -> 5)
const extractVersionFromFileName = (fileName: string): number => {
  const match = fileName.match(/enumerations\.(\d+)\.yaml/)
  return match ? parseInt(match[1], 10) : 0
}

// Get current file's version
const currentVersion = computed(() => {
  if (!enumerator.value) return 0
  return extractVersionFromFileName(enumerator.value.file_name)
})

// Check if previous version exists
const hasPreviousVersion = computed(() => {
  if (!enumerator.value) return false
  const currentVer = currentVersion.value
  return enumeratorFiles.value.some(file => {
    const fileVersion = extractVersionFromFileName(file.file_name)
    return fileVersion === currentVer - 1
  })
})

// Check if next version exists
const hasNextVersion = computed(() => {
  if (!enumerator.value) return false
  const currentVer = currentVersion.value
  return enumeratorFiles.value.some(file => {
    const fileVersion = extractVersionFromFileName(file.file_name)
    return fileVersion === currentVer + 1
  })
})

// Navigate to previous version
const navigateToPreviousVersion = async () => {
  if (!enumerator.value || !hasPreviousVersion.value) return
  
  const currentVer = currentVersion.value
  const previousFile = enumeratorFiles.value.find(file => {
    const fileVersion = extractVersionFromFileName(file.file_name)
    return fileVersion === currentVer - 1
  })
  
  if (previousFile) {
    // Navigate to the previous file
    window.location.href = `/enumerators/${previousFile.file_name}`
  }
}

// Navigate to next version
const navigateToNextVersion = async () => {
  if (!enumerator.value || !hasNextVersion.value) return
  
  const currentVer = currentVersion.value
  const nextFile = enumeratorFiles.value.find(file => {
    const fileVersion = extractVersionFromFileName(file.file_name)
    return fileVersion === currentVer + 1
  })
  
  if (nextFile) {
    // Navigate to the next file
    window.location.href = `/enumerators/${nextFile.file_name}`
  }
}

// Toggle enumerator collapse state
const toggleEnumeratorCollapse = (enumIdx: number) => {
  if (collapsedEnumerators.value.has(enumIdx)) {
    collapsedEnumerators.value.delete(enumIdx)
  } else {
    collapsedEnumerators.value.add(enumIdx)
  }
}

// Check if enumerator is collapsed
const isEnumeratorCollapsed = (enumIdx: number) => {
  return collapsedEnumerators.value.has(enumIdx)
}

// Load files when component mounts
onMounted(() => {
  loadEnumeratorFiles()
})
</script>

<style scoped>
.enumerator-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.enumerators-header {
  margin-bottom: 16px;
}







.enum-value-item {
  border-bottom: 1px solid #e0e0e0;
}

.enum-value-item:last-child {
  border-bottom: none;
}
.title-edit-field {
  font-size: 1.5rem;
  font-weight: 500;
}
.h1-style {
  font-size: 2.125rem !important;
  font-weight: 300 !important;
  line-height: 1.2 !important;
  color: rgba(0, 0, 0, 0.87) !important;
}
.title-display {
  cursor: pointer;
}
.title-text {
  font-size: 2.125rem;
  font-weight: 300;
  line-height: 1.2;
  color: rgba(0, 0, 0, 0.87);
  margin: 0;
  transition: color 0.2s ease;
}
.title-text:hover {
  color: rgba(0, 0, 0, 0.6);
}

.rotate-icon {
  transform: rotate(180deg);
  transition: transform 0.2s ease;
}
</style> 