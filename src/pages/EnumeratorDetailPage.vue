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
    <div v-else-if="enumerator && enumerationIndex === -1" class="text-center pa-8">
      <v-icon size="64" color="grey">mdi-alert-circle</v-icon>
      <h3 class="text-h5 mt-4">Enumeration not found</h3>
      <p class="text-body-1 text-medium-emphasis mt-2">"{{ enumerationName }}" was not found in this enumerator file.</p>
      <v-btn color="primary" class="mt-4" :to="cardsRoute">Back to Enumerators</v-btn>
    </div>
    <!-- Content: single enumeration -->
    <div v-else-if="enumerator && currentEnumeration">
      <!-- Page Header: back link + editable enumeration name -->
      <header class="d-flex align-center mb-6">
        <v-btn
          variant="text"
          size="small"
          :to="cardsRoute"
          class="mr-4"
          data-test="back-to-enumerators-btn"
        >
          <v-icon start>mdi-arrow-left</v-icon>
          Back
        </v-btn>
        <v-text-field
          v-model="editableName"
          variant="plain"
          density="compact"
          hide-details
          :readonly="isDisabled"
          class="enumeration-header-name flex-grow-1 text-truncate"
          data-test="enumeration-name-input"
          @blur="finishNameEdit"
          @keyup.enter="finishNameEdit"
        />
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
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
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

const enumerationName = computed(() => decodeURIComponent((route.params.enumerationName as string) || ''))
const cardsRoute = computed(() => `/enumerators/${route.params.fileName}`)

const enumerationIndex = computed(() => {
  if (!enumerator.value?.enumerators) return -1
  const idx = enumerator.value.enumerators.findIndex((e) => e.name === enumerationName.value)
  return idx
})

const currentEnumeration = computed(() => {
  if (!enumerator.value?.enumerators || enumerationIndex.value < 0) return null
  return enumerator.value.enumerators[enumerationIndex.value]
})

const isDisabled = computed(() => isReadOnly.value || (enumerator.value?._locked || false))

const editableName = ref('')
const editableValues = ref<string[]>([])
const editableDescriptions = ref<string[]>([])

function syncEditableFromEnum() {
  if (!currentEnumeration.value) return
  editableName.value = currentEnumeration.value.name
  editableValues.value = currentEnumeration.value.values.map((v) => v.value)
  editableDescriptions.value = currentEnumeration.value.values.map((v) => v.description)
}

const finishNameEdit = () => {
  if (!currentEnumeration.value || isDisabled.value) return
  const newName = editableName.value?.trim()
  if (!newName || currentEnumeration.value.name === newName) return
  if (enumerator.value!.enumerators.some((e) => e !== currentEnumeration.value && e.name === newName)) return
  currentEnumeration.value.name = newName
  debouncedSave()
  router.replace(`/enumerators/${route.params.fileName}/${encodeURIComponent(newName)}`)
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

watch(
  () => [route.params.fileName, route.params.enumerationName],
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
