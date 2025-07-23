<template>
  <DetailPageLayout
    :loading="loading"
    :error="error"
    :data="enumerator"
    :title="enumerator?.title || ($route.params.fileName as string)?.replace('.yaml', '') || 'Enumerator'"
    :file-name="enumerator?.file_name || ($route.params.fileName as string) || ''"
    file-type="Enumerator"
    :locked="enumerator?._locked || false"
    :disabled="enumerator?._locked || false"
    v-model:show-delete-dialog="showDeleteDialog"
    v-model:show-unlock-dialog="showUnlockDialog"
    @retry="loadEnumerator"
    @lock="lockEnumerator"
    @unlock="unlockEnumerator"
    @delete="handleDelete"
    @title-change="handleTitleChange"
    @confirm-delete="confirmDelete"
    @cancel-delete="cancelDelete"
    @confirm-unlock="confirmUnlock"
    @cancel-unlock="cancelUnlock"
  >
    <template #default="{ data: enumerator }">
      <!-- Enumerator Content -->
      <div class="enumerator-content">
        <!-- Version Info -->
        <BaseCard 
          title="Version Information"
          icon="mdi-tag"
          :is-secondary="true"
          compact
        >
          <div class="d-flex align-center">
            <span class="text-body-1 mr-4">Version:</span>
            <span class="text-body-1 font-weight-medium">{{ enumerator.version }}</span>
          </div>
        </BaseCard>

        <!-- Enumerators -->
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
            <v-expansion-panels v-model="expandedPanels">
              <v-expansion-panel
                v-for="(enumValues, enumName) in enumerator.enumerators"
                :key="enumName"
                :value="enumName"
              >
                <v-expansion-panel-title>
                  <div class="d-flex align-center justify-space-between w-100">
                    <div class="d-flex align-center">
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
                    </div>
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
                  </div>
                </v-expansion-panel-title>
                
                <v-expansion-panel-text>
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
                        v-for="(_, key) in enumValues"
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
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
        </BaseCard>
      </div>
    </template>
  </DetailPageLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import DetailPageLayout from '@/components/DetailPageLayout.vue'
import BaseCard from '@/components/BaseCard.vue'
import { useEnumeratorDetail } from '@/composables/useEnumeratorDetail'

const showDeleteDialog = ref(false)
const showUnlockDialog = ref(false)
const expandedPanels = ref<string[]>([])

// Editable state for enum names and values
const editableEnumNames = ref<Record<string, string>>({})
const editableEnumKeys = ref<Record<string, Record<string, string>>>({})
const editableEnumValues = ref<Record<string, Record<string, string>>>({})

// Use the new composable for all enumerator data and state
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

// Methods for UI actions (auto-save, editing, etc.)
const autoSave = async () => {
  if (!enumerator.value) return
  await saveEnumerator()
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
</style> 