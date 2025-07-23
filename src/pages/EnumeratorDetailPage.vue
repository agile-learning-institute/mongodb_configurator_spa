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
              @update:model-value="autoSave"
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
        <div v-if="!enumerator.enumerators || Object.keys(enumerator.enumerators).length === 0" class="text-center pa-4">
          <v-icon size="32" color="grey">mdi-format-list-bulleted</v-icon>
          <div class="text-body-2 text-medium-emphasis mt-2">No enumerators defined</div>
        </div>
        <div v-else class="enumerators-list">
          <div
            v-for="(enumValues, enumName) in enumerator.enumerators"
            :key="enumName"
            class="enumerator-item mb-4"
          >
            <div class="d-flex align-center enumerator-header mb-2">
              <v-text-field
                v-model="editableEnumNames[enumName]"
                density="compact"
                variant="outlined"
                hide-details
                :disabled="enumerator._locked"
                class="mr-3"
                style="min-width: 200px;"
                @update:model-value="handleEnumNameChange(String(enumName), $event)"
              />
              <v-chip size="small" color="primary">
                {{ Object.keys(enumValues).length }} values
              </v-chip>
              <v-btn
                v-if="!enumerator._locked"
                icon
                size="small"
                variant="text"
                color="error"
                @click.stop="deleteEnumeration(String(enumName))"
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
                  @click="addEnumValue(String(enumName))"
                  :disabled="enumerator._locked"
                >
                  <v-icon start size="small">mdi-plus</v-icon>
                  Add Value
                </v-btn>
              </div>
              <div v-if="!enumValues || Object.keys(enumValues).length === 0" class="text-center pa-4">
                <v-icon size="24" color="grey">mdi-format-list-numbered</v-icon>
                <div class="text-body-2 text-medium-emphasis mt-2">No values defined</div>
              </div>
              <div v-else class="enum-values-list">
                <div
                  v-for="[key, value] in Object.entries(enumValues || {})"
                  :key="key"
                  class="enum-value-item d-flex align-center mb-2"
                >
                  <v-text-field
                    v-model="editableEnumKeys[enumName][key]"
                    density="compact"
                    variant="outlined"
                    hide-details
                    :disabled="enumerator._locked"
                    class="mr-2"
                    style="min-width: 150px;"
                    @update:model-value="handleEnumKeyChange(String(enumName), String(key), $event)"
                  />
                  <v-text-field
                    v-model="editableEnumValues[enumName][key]"
                    density="compact"
                    variant="outlined"
                    hide-details
                    :disabled="enumerator._locked"
                    class="mr-2"
                    style="min-width: 200px;"
                    @update:model-value="handleEnumValueChange(String(enumName), String(key), $event)"
                  />
                  <v-btn
                    v-if="!enumerator._locked"
                    icon
                    size="small"
                    variant="text"
                    color="error"
                    @click="deleteEnumValue(String(enumName), String(key))"
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
import type { Ref } from 'vue'

const showDeleteDialog = ref(false)
const showUnlockDialog = ref(false)
const editingTitle = ref(false)
const titleInput = ref<HTMLInputElement | null>(null)

// Editable state for enum names and values
const editableEnumNames = ref<Record<string, string>>({})
const editableEnumKeys = ref<Record<string, Record<string, string>>>({})
const editableEnumValues = ref<Record<string, Record<string, string>>>({})

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
  if (val && val.enumerators) {
    for (const enumName of Object.keys(val.enumerators)) {
      if (!editableEnumNames.value[enumName]) {
        editableEnumNames.value[enumName] = enumName
      }
      if (!editableEnumKeys.value[enumName]) {
        editableEnumKeys.value[enumName] = {}
      }
      if (!editableEnumValues.value[enumName]) {
        editableEnumValues.value[enumName] = {}
      }
      for (const key of Object.keys(val.enumerators[enumName])) {
        if (!editableEnumKeys.value[enumName][key]) {
          editableEnumKeys.value[enumName][key] = key
        }
        if (!editableEnumValues.value[enumName][key]) {
          editableEnumValues.value[enumName][key] = val.enumerators[enumName][key]
        }
      }
    }
  }
}, { immediate: true })

const autoSave = async () => {
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
    await autoSave()
  }
}

const lockEnumerator = async () => {
  if (!enumerator.value) return
  enumerator.value._locked = true
  await autoSave()
}

const unlockEnumerator = async () => {
  if (!enumerator.value) return
  enumerator.value._locked = false
  showUnlockDialog.value = false
  await autoSave()
}

const addEnumeration = () => {
  if (!enumerator.value) return
  if (!enumerator.value.enumerators) {
    enumerator.value.enumerators = {}
  }
  const newEnumName = `enum_${Object.keys(enumerator.value.enumerators).length + 1}`
  enumerator.value.enumerators[newEnumName] = {}
  editableEnumNames.value[newEnumName] = newEnumName
  editableEnumKeys.value[newEnumName] = {}
  editableEnumValues.value[newEnumName] = {}
  autoSave()
}

const deleteEnumeration = (enumName: string) => {
  if (!enumerator.value?.enumerators) return
  delete enumerator.value.enumerators[enumName]
  delete editableEnumNames.value[enumName]
  delete editableEnumKeys.value[enumName]
  delete editableEnumValues.value[enumName]
  autoSave()
}

const handleEnumNameChange = (oldName: string, newName: string) => {
  if (!enumerator.value?.enumerators || oldName === newName) return
  const enumValues = enumerator.value.enumerators[oldName]
  delete enumerator.value.enumerators[oldName]
  enumerator.value.enumerators[newName] = enumValues
  editableEnumNames.value[newName] = newName
  delete editableEnumNames.value[oldName]
  autoSave()
}

const addEnumValue = (enumName: string) => {
  if (!enumerator.value?.enumerators?.[enumName]) return
  const newKey = `value_${Object.keys(enumerator.value.enumerators[enumName]).length + 1}`
  enumerator.value.enumerators[enumName][newKey] = ''
  editableEnumKeys.value[enumName][newKey] = newKey
  editableEnumValues.value[enumName][newKey] = ''
  autoSave()
}

const deleteEnumValue = (enumName: string, key: string) => {
  if (!enumerator.value?.enumerators?.[enumName]) return
  delete enumerator.value.enumerators[enumName][key]
  delete editableEnumKeys.value[enumName][key]
  delete editableEnumValues.value[enumName][key]
  autoSave()
}

const handleEnumKeyChange = (enumName: string, oldKey: string, newKey: string) => {
  if (!enumerator.value?.enumerators?.[enumName] || oldKey === newKey) return
  const value = enumerator.value.enumerators[enumName][oldKey]
  delete enumerator.value.enumerators[enumName][oldKey]
  enumerator.value.enumerators[enumName][newKey] = value
  editableEnumKeys.value[enumName][newKey] = newKey
  delete editableEnumKeys.value[enumName][oldKey]
  autoSave()
}

const handleEnumValueChange = (enumName: string, key: string, value: string) => {
  if (!enumerator.value?.enumerators?.[enumName]) return
  enumerator.value.enumerators[enumName][key] = value
  editableEnumValues.value[enumName][key] = value
  autoSave()
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