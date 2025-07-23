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
      <div class="d-flex align-center justify-space-between mb-6">
        <div class="flex-grow-1">
          <div class="d-flex align-center mb-2">
            <h2 class="text-h5 text-medium-emphasis mr-4 mb-0">{{ enumerator.file_name }}</h2>
            <div v-if="!editingTitle" @click="startEditTitle" class="title-display">
              <h1 class="title-text mb-0 cursor-pointer">{{ enumerator.title || 'Enter enumerator title...' }}</h1>
            </div>
            <v-text-field
              v-else
              v-model="enumerator.title"
              variant="plain"
              density="compact"
              class="title-edit-field h1-style"
              hide-details
              @update:model-value="autoSaveLocal"
              @blur="finishEditTitle"
              @keyup.enter="finishEditTitle"
              ref="titleInput"
              :disabled="enumerator._locked"
            />
          </div>
        </div>
        <div class="d-flex gap-2">
          <v-btn
            v-if="enumerator._locked"
            color="warning"
            variant="elevated"
            @click="unlockEnumerator"
            class="font-weight-bold"
          >
            <v-icon start>mdi-lock-open</v-icon>
            Unlock
          </v-btn>
          <v-btn
            v-else
            color="info"
            variant="elevated"
            @click="lockEnumerator"
            class="font-weight-bold"
          >
            <v-icon start>mdi-lock</v-icon>
            Lock
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            @click="handleDelete"
            class="font-weight-bold"
          >
            <v-icon start>mdi-delete</v-icon>
            Delete
          </v-btn>
        </div>
      </div>
      <!-- Info Card -->
      <BaseCard 
        title="Enumerator File Info"
        icon="mdi-file-document-outline"
        :is-secondary="true"
        class="mb-6"
      >
        <div class="d-flex flex-wrap align-center gap-6">
          <div class="info-item">
            <span class="text-caption text-medium-emphasis">File Name</span>
            <div class="text-body-1 font-weight-medium">{{ enumerator.file_name }}</div>
          </div>
          <div class="info-item">
            <span class="text-caption text-medium-emphasis">Version</span>
            <div class="text-body-1 font-weight-medium">{{ enumerator.version }}</div>
          </div>
          <div class="info-item d-flex align-center">
            <span class="text-caption text-medium-emphasis mr-2">Locked</span>
            <v-icon :color="enumerator._locked ? 'warning' : 'success'">
              {{ enumerator._locked ? 'mdi-lock' : 'mdi-lock-open' }}
            </v-icon>
          </div>
          <div class="flex-grow-1"></div>
          <v-btn
            color="primary"
            variant="elevated"
            size="small"
            @click="addEnumeration"
            :disabled="enumerator._locked"
            class="ml-auto"
          >
            <v-icon start size="small">mdi-plus</v-icon>
            Add Enumeration
          </v-btn>
        </div>
      </BaseCard>
      <!-- Enumerators Card -->
      <BaseCard 
        title="Enumerators"
        icon="mdi-format-list-bulleted"
        :is-secondary="false"
      >
        <div class="enumerators-header">
          <v-btn
            color="primary"
            variant="outlined"
            size="small"
            @click="addEnumeration"
            :disabled="enumerator._locked"
          >
            <v-icon start size="small">mdi-plus</v-icon>
            Add Enumerator
          </v-btn>
        </div>
        <div v-if="!enumerator.enumerators || enumerator.enumerators.length === 0" class="text-center pa-4">
          <v-icon size="32" color="grey">mdi-format-list-bulleted</v-icon>
          <div class="text-body-2 text-medium-emphasis mt-2">No enumerators defined</div>
        </div>
        <div v-else class="enumerators-list">
          <div
            v-for="(enumItem, enumIdx) in enumerator.enumerators"
            :key="enumIdx"
            class="enumerator-item mb-4"
          >
            <div class="d-flex align-center enumerator-header mb-2">
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
                v-if="!enumerator._locked"
                icon
                size="small"
                variant="text"
                color="error"
                @click.stop="deleteEnumeration(enumIdx)"
              >
                <v-icon size="16">mdi-delete</v-icon>
              </v-btn>
              <v-spacer />
            </div>
            <div class="enum-values">
              <div class="d-flex align-center mb-3">
                <span class="text-subtitle-2 mr-3">Values:</span>
                <v-btn
                  color="success"
                  variant="text"
                  size="small"
                  @click="addEnumValue(enumIdx)"
                  :disabled="enumerator._locked"
                >
                  <v-icon start size="small">mdi-plus</v-icon>
                  Add Value
                </v-btn>
              </div>
              <div v-if="!enumItem.values || enumItem.values.length === 0" class="text-center pa-4">
                <v-icon size="24" color="grey">mdi-format-list-numbered</v-icon>
                <div class="text-body-2 text-medium-emphasis mt-2">No values defined</div>
              </div>
              <div v-else class="enum-values-list">
                <div
                  v-for="(valueItem, valIdx) in enumItem.values"
                  :key="valIdx"
                  class="enum-value-item d-flex align-center mb-2"
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
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import BaseCard from '@/components/BaseCard.vue'
import { useEnumeratorDetail } from '@/composables/useEnumeratorDetail'
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
  fileName,
  isLocked,
  loadEnumerator,
  saveEnumerator,
  deleteEnumerator,
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

const handleTitleChange = async (newTitle: string) => {
  if (enumerator.value) {
    enumerator.value.title = newTitle
    await autoSaveLocal()
  }
}

const lockEnumerator = async () => {
  if (!enumerator.value) return
  enumerator.value._locked = true
  await autoSaveLocal()
}

const unlockEnumerator = async () => {
  if (!enumerator.value) return
  enumerator.value._locked = false
  showUnlockDialog.value = false
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

const confirmDelete = async () => {
  if (!enumerator.value) return
  await deleteEnumerator()
  window.location.href = '/enumerators'
}

const cancelDelete = () => {
  showDeleteDialog.value = false
}

const confirmUnlock = () => {
  unlockEnumerator()
}

const cancelUnlock = () => {
  showUnlockDialog.value = false
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