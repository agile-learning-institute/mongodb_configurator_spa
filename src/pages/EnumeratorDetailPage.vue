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
          <div v-if="!editingTitle" class="d-flex align-center">
            <h1 class="text-h4 mr-4">{{ enumerator.file_name }}</h1>
            <span v-if="enumerator.title" class="text-h6 text-medium-emphasis mr-4">{{ enumerator.title }}</span>
            <span class="text-body-1 text-medium-emphasis">Version: {{ enumerator.version }}</span>
            <v-btn
              icon="mdi-pencil"
              variant="text"
              size="small"
              class="ml-2"
              @click="startEditTitle"
              :disabled="enumerator._locked"
            />
          </div>
          <div v-else class="d-flex align-center">
            <v-text-field
              ref="titleInput"
              v-model="enumerator.title"
              density="compact"
              variant="outlined"
              placeholder="Enter title..."
              class="mr-2"
              style="min-width: 200px;"
              @blur="finishEditTitle"
              @keyup.enter="finishEditTitle"
            />
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
            prepend-icon="mdi-delete"
            variant="outlined"
            color="error"
            @click="handleDelete"
            :disabled="enumerator._locked"
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
            prepend-icon="mdi-plus"
            variant="elevated"
            color="white"
            size="small"
            @click="addEnumeration"
            :disabled="enumerator._locked"
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
                variant="outlined"
                hide-details
                :disabled="enumerator._locked"
                class="mr-3"
                style="min-width: 200px;"
                @blur="finishEnumNameEdit(enumIdx)"
                @keyup.enter="finishEnumNameEdit(enumIdx)"
              />
              <v-chip size="small" color="primary">
                {{ enumItem.values.length }} values
              </v-chip>
              <v-btn
                prepend-icon="mdi-plus"
                variant="elevated"
                size="small"
                color="white"
                @click="addEnumValue(enumIdx)"
                :disabled="enumerator._locked"
                class="ml-2"
              >
                <span class="text-primary">Add Value</span>
              </v-btn>
              <v-btn
                icon="mdi-delete"
                variant="text"
                color="error"
                @click.stop="deleteEnumeration(enumIdx)"
              >
                <v-icon size="16">mdi-delete</v-icon>
              </v-btn>
              <v-spacer />
            </div>
            <div class="enum-values">
              <div v-if="!enumItem.values || enumItem.values.length === 0" class="text-center pa-1">
                <v-icon size="16" color="grey">mdi-format-list-numbered</v-icon>
                <div class="text-body-2 text-medium-emphasis mt-1">No values defined</div>
              </div>
              <div v-else class="enum-values-list">
                <div
                  v-for="(_, valIdx) in enumItem.values"
                  :key="valIdx"
                  class="enum-value-item d-flex align-center mb-1"
                >
                  <v-text-field
                    v-model="editableEnumValues[enumIdx][valIdx]"
                    density="compact"
                    variant="outlined"
                    hide-details
                    :disabled="enumerator._locked"
                    class="mr-2"
                    style="min-width: 150px;"
                    @blur="finishEnumValueEdit(enumIdx, valIdx)"
                    @keyup.enter="finishEnumValueEdit(enumIdx, valIdx)"
                  />
                  <v-text-field
                    v-model="editableEnumDescriptions[enumIdx][valIdx]"
                    density="compact"
                    variant="outlined"
                    hide-details
                    :disabled="enumerator._locked"
                    class="mr-2"
                    style="min-width: 200px;"
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
import { ref, watch } from 'vue'
import BaseCard from '@/components/BaseCard.vue'
import { useEnumeratorDetail } from '@/composables/useEnumeratorDetail'
import { apiService } from '@/utils/api'
import type { Enumerator, EnumeratorValue } from '@/types/types'

const showDeleteDialog = ref(false)
const showUnlockDialog = ref(false)
const editingTitle = ref(false)
const titleInput = ref<HTMLInputElement | null>(null)

// Editable state for enum names and values (by index)
const editableEnumNames = ref<string[]>([])
const editableEnumValues = ref<Record<number, string[]>>({})
const editableEnumDescriptions = ref<Record<number, string[]>>({})

function initEditableStateFromEnumerator(val: any) {
  if (val && val.enumerators) {
    editableEnumNames.value = val.enumerators.map((e: Enumerator) => e.name)
    editableEnumValues.value = {}
    editableEnumDescriptions.value = {}
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

const startEditTitle = () => {
  editingTitle.value = true
  setTimeout(() => {
    titleInput.value?.focus()
  }, 0)
}

const finishEditTitle = () => {
  editingTitle.value = false
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
  const newEnum: Enumerator = { name: `enum_${enumerator.value.enumerators.length + 1}`, values: [] }
  enumerator.value.enumerators.push(newEnum)
  editableEnumNames.value.push(newEnum.name)
  editableEnumValues.value[enumerator.value.enumerators.length - 1] = []
  editableEnumDescriptions.value[enumerator.value.enumerators.length - 1] = []
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
  const newValue: EnumeratorValue = { value: `value_${enumerator.value.enumerators[enumIdx].values.length + 1}`, description: '' }
  enumerator.value.enumerators[enumIdx].values.push(newValue)
  if (!editableEnumValues.value[enumIdx]) editableEnumValues.value[enumIdx] = []
  if (!editableEnumDescriptions.value[enumIdx]) editableEnumDescriptions.value[enumIdx] = []
  editableEnumValues.value[enumIdx].push(newValue.value)
  editableEnumDescriptions.value[enumIdx].push(newValue.description)
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

.enumerators-list {
  margin-top: 16px;
}

.enum-values {
  padding: 16px 0;
}

.enum-values-list {
  margin-top: 16px;
}

.enum-value-item {
  padding: 8px 0;
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
</style> 