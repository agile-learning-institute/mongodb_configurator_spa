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
    <!-- Not found -->
    <div v-else-if="enumerator && !currentEnumeration" class="text-center pa-8">
      <v-icon size="64" color="grey">mdi-alert-circle</v-icon>
      <h3 class="text-h5 mt-4">Enumeration not found</h3>
      <p class="text-body-1 text-medium-emphasis mt-2">Index {{ route.params.enumerationIndex }} is out of range.</p>
    </div>
    <!-- Content: single enumeration -->
    <div v-else-if="enumerator && currentEnumeration">
      <!-- Page Header: editable enumeration name + delete -->
      <header class="d-flex align-center mb-6">
        <v-text-field
          ref="nameInputRef"
          v-model="editableName"
          variant="plain"
          density="compact"
          hide-details
          :readonly="isDisabled"
          :placeholder="isNewEnumeration ? 'Name' : undefined"
          class="enumeration-header-name flex-grow-1 text-truncate mr-2"
          data-test="enumeration-name-input"
          @blur="finishNameEdit"
          @keyup.enter="finishNameEdit"
        />
        <v-tooltip v-if="!isDisabled" text="Delete enumeration" location="bottom">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              icon="mdi-delete"
              variant="text"
              size="small"
              color="error"
              @click="showDeleteDialog = true"
              data-test="delete-enumeration-btn"
            />
          </template>
        </v-tooltip>
      </header>

      <!-- Enumeration values -->
      <BaseCard :title="`Values (${currentEnumeration.values.length})`" icon="mdi-format-list-checks">
        <template #header-actions>
          <v-chip
            v-if="!isDisabled"
            variant="outlined"
            size="small"
            color="default"
            class="cursor-pointer"
            :disabled="saving"
            @click="addEnumValue"
            data-test="add-enum-value-btn"
          >
            Add
          </v-chip>
        </template>
        <div v-if="!currentEnumeration.values || currentEnumeration.values.length === 0" class="text-center pa-4">
          <v-icon size="32" color="grey">mdi-format-list-numbered</v-icon>
          <div class="text-body-2 text-medium-emphasis mt-2">No values defined</div>
          <v-chip
            v-if="!isDisabled"
            variant="outlined"
            size="small"
            color="default"
            class="cursor-pointer mt-2"
            :disabled="saving"
            @click="addEnumValue"
            data-test="add-enum-value-empty-btn"
          >
            Add
          </v-chip>
        </div>
        <div v-else class="enum-values-list">
          <div
            v-for="(_, valIdx) in currentEnumeration.values"
            :key="valIdx"
            class="enum-value-item d-flex align-center py-2"
          >
            <v-text-field
              v-model="editableValues[valIdx]"
              density="compact"
              variant="outlined"
              hide-details
              :readonly="isDisabled"
              class="mr-2"
              style="max-width: 200px;"
              :data-test="`enum-value-input-${valIdx}`"
              @blur="finishValueEdit(valIdx)"
              @keyup.enter="finishValueEdit(valIdx)"
            />
            <v-text-field
              v-model="editableDescriptions[valIdx]"
              density="compact"
              variant="outlined"
              hide-details
              placeholder="Description"
              :readonly="isDisabled"
              class="mr-2 flex-grow-1"
              :data-test="`enum-description-input-${valIdx}`"
              @blur="finishDescriptionEdit(valIdx)"
              @keyup.enter="finishDescriptionEdit(valIdx)"
            />
            <v-btn
              v-if="!isDisabled"
              icon
              size="small"
              variant="text"
              color="error"
              @click="deleteEnumValue(valIdx)"
              :data-test="`delete-enum-value-btn-${valIdx}`"
            >
              <v-icon size="16">mdi-delete</v-icon>
            </v-btn>
          </div>
        </div>
      </BaseCard>
    </div>
  </v-container>

  <v-dialog v-model="showDeleteDialog" max-width="500" data-test="delete-enumeration-dialog">
    <v-card>
      <v-card-title class="text-h5 d-flex align-center" data-test="delete-enumeration-dialog-title">
        <v-icon color="error" class="mr-3">mdi-alert-circle</v-icon>
        Delete Enumeration
      </v-card-title>
      <v-card-text data-test="delete-enumeration-dialog-content">
        <p class="mb-0">
          Are you sure you want to delete "{{ currentEnumeration?.name.startsWith('_new') ? 'New enumeration' : currentEnumeration?.name }}"?
          This will remove the enumeration and all its values.
        </p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="showDeleteDialog = false" data-test="delete-enumeration-dialog-cancel-btn">Cancel</v-btn>
        <v-btn color="error" @click="confirmDeleteEnumeration" data-test="delete-enumeration-dialog-confirm-btn">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEnumeratorDetail } from '@/composables/useEnumeratorDetail'
import { useConfig } from '@/composables/useConfig'
import { apiService } from '@/utils/api'
import BaseCard from '@/components/BaseCard.vue'
import type { EnumeratorValue } from '@/types/types'

function debounceWithFlush<T extends (...args: any[]) => any>(func: T, wait: number): T & { flush: () => void } {
  let timeout: ReturnType<typeof setTimeout> | null = null
  const debounced = ((...args: any[]) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      timeout = null
      func(...args)
    }, wait)
  }) as T & { flush: () => void }
  debounced.flush = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
      func()
    }
  }
  return debounced
}

const route = useRoute()
const router = useRouter()
const { isReadOnly } = useConfig()
const { loading, saving, error, enumerator, loadEnumerator, saveEnumerator } = useEnumeratorDetail()

const routeParam = computed(() => (route.params.enumerationIndex as string) || '')

const enumerationIndex = computed(() => {
  const idx = parseInt(routeParam.value, 10)
  return Number.isNaN(idx) || idx < 0 ? -1 : idx
})

const currentEnumeration = computed(() => {
  if (!enumerator.value?.enumerators || enumerationIndex.value < 0) return null
  if (enumerationIndex.value >= enumerator.value.enumerators.length) return null
  return enumerator.value.enumerators[enumerationIndex.value]
})

// Redirect legacy name-based URLs to index-based (e.g. /default_status -> /0)
watch(
  [() => enumerator.value, () => routeParam.value],
  ([enumData, param]) => {
    if (!enumData?.enumerators || !param) return
    const idx = parseInt(param, 10)
    if (!Number.isNaN(idx) && idx >= 0) return
    const found = enumData.enumerators.findIndex((e) => e.name === decodeURIComponent(param))
    if (found >= 0) router.replace(`/enumerators/${route.params.fileName}/${found}`)
  },
  { immediate: true }
)

const isDisabled = computed(() => isReadOnly.value || (enumerator.value?._locked || false))

const isNewEnumeration = computed(() =>
  !!currentEnumeration.value?.name?.startsWith('_new')
)

const showDeleteDialog = ref(false)
const nameInputRef = ref<{ $el?: HTMLElement; focus?: () => void } | null>(null)
const editableName = ref('')
const editableValues = ref<string[]>([])
const editableDescriptions = ref<string[]>([])

function syncEditableFromEnum() {
  if (!currentEnumeration.value) return
  editableName.value = isNewEnumeration.value ? '' : currentEnumeration.value.name
  editableValues.value = currentEnumeration.value.values.map((v) => v.value)
  editableDescriptions.value = currentEnumeration.value.values.map((v) => v.description)
  if (isNewEnumeration.value) {
    nextTick(() => {
      setTimeout(() => {
        const el = nameInputRef.value
        if (typeof el?.focus === 'function') {
          el.focus()
        } else {
          const input = (el as { $el?: HTMLElement })?.$el?.querySelector('input')
          if (input) (input as HTMLInputElement).focus()
        }
      }, 0)
    })
  }
}

const finishNameEdit = () => {
  if (!currentEnumeration.value || isDisabled.value) return
  const newName = editableName.value?.trim()
  if (!newName) {
    if (isNewEnumeration.value) return
    return
  }
  if (currentEnumeration.value.name === newName) return
  if (enumerator.value!.enumerators.some((e) => e !== currentEnumeration.value && e.name === newName)) return
  currentEnumeration.value.name = newName
  debouncedSave()
}

watch(
  () => currentEnumeration.value,
  (val) => {
    if (val) syncEditableFromEnum()
  },
  { immediate: true }
)

const autoSave = async () => {
  if (!enumerator.value || isReadOnly.value) return
  await saveEnumerator()
}

const debouncedSave = debounceWithFlush(autoSave, 300)

const finishValueEdit = (valIdx: number) => {
  if (!currentEnumeration.value || isDisabled.value) return
  const newVal = editableValues.value[valIdx]?.trim()
  if (!newVal || currentEnumeration.value.values[valIdx].value === newVal) return
  if (currentEnumeration.value.values.some((v, i) => i !== valIdx && v.value === newVal)) return
  currentEnumeration.value.values[valIdx].value = newVal
  debouncedSave()
}

const finishDescriptionEdit = (valIdx: number) => {
  if (!currentEnumeration.value || isDisabled.value) return
  const newDesc = editableDescriptions.value[valIdx] ?? ''
  if (currentEnumeration.value.values[valIdx].description === newDesc) return
  currentEnumeration.value.values[valIdx].description = newDesc
  debouncedSave()
}

const addEnumValue = () => {
  if (!currentEnumeration.value || isDisabled.value) return
  const newVal: EnumeratorValue = { value: 'name', description: '' }
  currentEnumeration.value.values.push(newVal)
  editableValues.value.push(newVal.value)
  editableDescriptions.value.push(newVal.description)
  autoSave()
}

const deleteEnumValue = (valIdx: number) => {
  if (!currentEnumeration.value || isDisabled.value) return
  currentEnumeration.value.values.splice(valIdx, 1)
  editableValues.value.splice(valIdx, 1)
  editableDescriptions.value.splice(valIdx, 1)
  autoSave()
}

const confirmDeleteEnumeration = async () => {
  if (!enumerator.value || !currentEnumeration.value || isDisabled.value) return
  const idx = enumerationIndex.value
  if (idx < 0) return
  showDeleteDialog.value = false
  enumerator.value.enumerators.splice(idx, 1)
  await saveEnumerator()
  router.push(`/enumerators/${route.params.fileName}`)
}

watch(
  () => route.params.fileName,
  () => loadEnumerator(),
  { immediate: false }
)

// Handle page unload / visibility change - blur active inputs, sync all editable state, then save with keepalive
const handleUnloadOrHide = () => {
  const activeElement = document.activeElement
  if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
    ;(activeElement as HTMLElement).blur()
  }
  // Sync all editable values/descriptions to model (blur only fires for focused element)
  if (currentEnumeration.value && !isDisabled.value) {
    for (let i = 0; i < editableValues.value.length; i++) {
      finishValueEdit(i)
      finishDescriptionEdit(i)
    }
  }
  // Use keepalive fetch so save survives page unload (normal flush would be aborted)
  if (enumerator.value && !isReadOnly.value) {
    apiService.saveEnumeratorKeepalive(route.params.fileName as string, enumerator.value)
  }
}

const handleVisibilityChange = () => {
  if (document.hidden) handleUnloadOrHide()
}

onMounted(() => {
  window.addEventListener('beforeunload', handleUnloadOrHide)
  window.addEventListener('pagehide', handleUnloadOrHide)
  // visibilitychange fires when tab is hidden (e.g. reload) - more reliable than beforeunload in some environments
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleUnloadOrHide)
  window.removeEventListener('pagehide', handleUnloadOrHide)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<style scoped>
.enum-value-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.enum-value-item:last-child {
  border-bottom: none;
}

.cursor-pointer {
  cursor: pointer;
}

/* Header typography for editable enumeration name - matches h2.text-h5 on other detail pages */
.enumeration-header-name :deep(.v-field__input) {
  font-size: 1.5rem !important;
  font-weight: 500 !important;
  line-height: 1.4 !important;
}

.enumeration-header-name :deep(.v-field) {
  padding: 0 !important;
  min-height: auto !important;
}

.enumeration-header-name :deep(.v-field__outline) {
  display: none !important;
}
</style>
