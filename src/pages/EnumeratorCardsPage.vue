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
      <!-- Page Header: enumerator name + version pill + actions -->
      <header class="enumerator-header-bar d-flex align-center mb-6">
        <h2 class="text-h5 font-weight-medium enumerator-name flex-grow-1 text-truncate mr-4" data-test="enumerator-header-name">
          {{ displayName }}
        </h2>
        <div class="d-flex align-center flex-shrink-0 gap-1">
          <!-- Delete and Add (left of version pill) -->
          <v-tooltip v-if="!isDisabled && currentVersion !== 0" text="Delete Version" location="bottom">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon="mdi-delete"
                variant="text"
                size="small"
                color="error"
                @click="handleDelete"
                data-test="delete-enumerator-btn"
              />
            </template>
          </v-tooltip>
          <v-tooltip v-if="!isDisabled" text="Add enumeration" location="bottom">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon="mdi-plus"
                variant="text"
                size="small"
                @click="addEnumeration"
                :loading="saving"
                data-test="add-enumeration-btn"
              />
            </template>
          </v-tooltip>
          <!-- Version pill: constant width, tooltips, v prefix -->
          <VersionPill
            :version="enumerator.version"
            :has-previous="hasPreviousVersion"
            :has-next="hasNextVersion"
            :show-new-button="!hasNextVersion && !isReadOnly"
            data-test="enumerator-version-pill"
            @previous="navigateToPreviousVersion"
            @next="navigateToNextVersion"
            @new-version="showNewVersionDialog = true"
          />
          <!-- Lock/Unlock (right of version pill) -->
          <v-tooltip v-if="!isReadOnly && enumerator._locked" text="Unlock Enumerator" location="bottom">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon="mdi-lock-open"
                variant="text"
                size="small"
                color="warning"
                @click="showUnlockDialog = true"
                data-test="unlock-btn"
              />
            </template>
          </v-tooltip>
          <v-tooltip v-else-if="!isReadOnly" text="Lock Enumerator" location="bottom">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon="mdi-lock"
                variant="text"
                size="small"
                @click="lockEnumerator"
                :loading="saving"
                data-test="lock-btn"
              />
            </template>
          </v-tooltip>
        </div>
      </header>

      <!-- Enumeration Cards Grid -->
      <div v-if="!enumerator.enumerators || enumerator.enumerators.length === 0" class="text-center pa-8">
        <v-icon size="64" color="grey" data-test="empty-enumerations-icon">mdi-format-list-bulleted</v-icon>
        <h3 class="text-h5 mt-4" data-test="empty-enumerations-title">No enumerations defined</h3>
        <p class="text-body-1 text-medium-emphasis mt-2">Add an enumeration to get started.</p>
        <v-btn
          v-if="!isDisabled"
          color="primary"
          variant="elevated"
          class="mt-4"
          @click="addEnumeration"
          :loading="saving"
          data-test="add-enumeration-empty-btn"
        >
          Add Enumeration
        </v-btn>
      </div>
      <v-row v-else data-test="enumerations-grid">
        <v-col
          v-for="(enumItem, i) in enumerator.enumerators"
          :key="enumItem.name"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <EnumerationCard
            :enumeration="enumItem"
            :index="i"
            @open="handleOpenEnumeration"
          />
        </v-col>
      </v-row>
    </div>
  </v-container>

  <!-- Delete and Unlock dialogs (same as before) -->
  <v-dialog v-model="showDeleteDialog" max-width="600" data-test="delete-warning-dialog">
    <v-card>
      <v-card-title class="text-h5" data-test="delete-warning-title">⚠️ Warning: Delete Enumerator</v-card-title>
      <v-card-text data-test="delete-warning-content">
        <p class="mb-3"><strong>Deleting enumerators that have already been deployed can have severe impacts on configuration validity.</strong></p>
        <p class="mb-4">Removing deployed enumerators may break existing configurations that depend on them.</p>
        <v-alert type="error" variant="tonal" class="mb-4" data-test="delete-warning-alert">
          <strong>Warning:</strong> This is a destructive action that will permanently delete the file.
        </v-alert>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="cancelDelete" data-test="delete-dialog-cancel-btn">Cancel</v-btn>
        <v-btn color="error" @click="confirmDelete" data-test="delete-dialog-delete-btn">Delete Enumerator</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="showNewVersionDialog" max-width="500" data-test="new-version-dialog">
    <v-card>
      <v-card-title class="text-h5 d-flex align-center" data-test="new-version-dialog-title">
        <v-icon color="primary" class="mr-3">mdi-plus-circle</v-icon>
        Create New Enumerator Version
      </v-card-title>
      <v-card-text data-test="new-version-dialog-content">
        <p class="mb-0">
          This will create a new version (v{{ nextVersionNumber }}) based on the current one. The current version will be locked.
        </p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="showNewVersionDialog = false" data-test="new-version-dialog-cancel-btn">Cancel</v-btn>
        <v-btn color="primary" @click="confirmNewVersion" :loading="creating" data-test="new-version-dialog-confirm-btn">Create</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="showUnlockDialog" max-width="600" data-test="unlock-warning-dialog">
    <v-card>
      <v-card-title class="text-h5" data-test="unlock-warning-title">⚠️ Warning: Editing Deployed Enumerator</v-card-title>
      <v-card-text data-test="unlock-warning-content">
        <p class="mb-3"><strong>Editing enumerators that have already been deployed can have severe impacts on configuration validity.</strong></p>
        <p class="mb-4">Changes to deployed enumerators may break existing configurations that depend on them.</p>
        <v-alert type="warning" variant="tonal" class="mb-4" data-test="unlock-warning-alert">
          <strong>Recommended:</strong> Create a new version instead of editing the current one.
        </v-alert>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="cancelUnlock" data-test="unlock-dialog-cancel-btn">Cancel</v-btn>
        <v-btn color="primary" @click="createNewVersion" data-test="unlock-dialog-create-version-btn">Create New Version</v-btn>
        <v-btn v-if="showUnlockOption" color="warning" @click="unlockEnumerator" data-test="unlock-dialog-unlock-btn">Unlock Current Version</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiService } from '@/utils/api'
import { useEnumeratorDetail } from '@/composables/useEnumeratorDetail'
import { useNewVersion } from '@/composables/useNewVersion'
import { useConfig } from '@/composables/useConfig'
import EnumerationCard from '@/components/EnumerationCard.vue'
import VersionPill from '@/components/VersionPill.vue'
import type { Enumerator } from '@/types/types'

const route = useRoute()
const router = useRouter()
const { isReadOnly } = useConfig()
const { loading, saving, error, enumerator, loadEnumerator, saveEnumerator } = useEnumeratorDetail()
const { creating, createNewVersionAndNavigate } = useNewVersion()

const showDeleteDialog = ref(false)
const showUnlockDialog = ref(false)
const showNewVersionDialog = ref(false)
const enumeratorFiles = ref<any[]>([])

const isDisabled = computed(() => isReadOnly.value || (enumerator.value?._locked || false))
const showUnlockOption = computed(() => !hasNextVersion.value)

const displayName = computed(() => {
  if (!enumerator.value?.file_name) return ''
  const match = enumerator.value.file_name.match(/^(.+)\.\d+\.yaml$/)
  return match ? match[1] : enumerator.value.file_name.replace(/\.yaml$/, '')
})

const extractVersionFromFileName = (fileName: string): number => {
  const match = fileName.match(/\.(\d+)\.yaml$/)
  return match ? parseInt(match[1], 10) : 0
}

const currentVersion = computed(() => {
  if (!enumerator.value) return 0
  return extractVersionFromFileName(enumerator.value.file_name)
})

const hasPreviousVersion = computed(() => {
  if (!enumerator.value) return false
  const currentVer = currentVersion.value
  return enumeratorFiles.value.some((file: any) => extractVersionFromFileName(file.file_name) === currentVer - 1)
})

const hasNextVersion = computed(() => {
  if (!enumerator.value) return false
  const currentVer = currentVersion.value
  return enumeratorFiles.value.some((file: any) => extractVersionFromFileName(file.file_name) === currentVer + 1)
})

const nextVersionNumber = computed(() => (currentVersion.value ?? 0) + 1)

const loadEnumeratorFiles = async () => {
  try {
    const files = await apiService.getEnumerators()
    enumeratorFiles.value = files
  } catch (err) {
    console.error('Failed to load enumerator files:', err)
  }
}

const navigateToPreviousVersion = () => {
  if (!enumerator.value || !hasPreviousVersion.value) return
  const currentVer = currentVersion.value
  const previousFile = enumeratorFiles.value.find((file: any) => extractVersionFromFileName(file.file_name) === currentVer - 1)
  if (previousFile) router.push(`/enumerators/${previousFile.file_name}`)
}

const navigateToNextVersion = () => {
  if (!enumerator.value || !hasNextVersion.value) return
  const currentVer = currentVersion.value
  const nextFile = enumeratorFiles.value.find((file: any) => extractVersionFromFileName(file.file_name) === currentVer + 1)
  if (nextFile) router.push(`/enumerators/${nextFile.file_name}`)
}

const lockEnumerator = async () => {
  if (!enumerator.value) return
  enumerator.value._locked = true
  await saveEnumerator()
}

const unlockEnumerator = async () => {
  if (!enumerator.value) return
  enumerator.value._locked = false
  showUnlockDialog.value = false
  await saveEnumerator()
}

const createNewVersion = async () => {
  showUnlockDialog.value = false
  await createNewVersionAndNavigate()
}

const confirmNewVersion = async () => {
  showNewVersionDialog.value = false
  await createNewVersionAndNavigate()
}

const addEnumeration = async () => {
  if (!enumerator.value) return
  if (!enumerator.value.enumerators) enumerator.value.enumerators = []
  const newEnum: Enumerator = { name: `_new_${Date.now()}`, values: [] }
  enumerator.value.enumerators.push(newEnum)
  await saveEnumerator()
  const newIndex = enumerator.value.enumerators.length - 1
  router.push(`/enumerators/${enumerator.value.file_name}/${newIndex}`)
}

const handleOpenEnumeration = (index: number) => {
  router.push(`/enumerators/${enumerator.value!.file_name}/${index}`)
}

const handleDelete = () => showDeleteDialog.value = true
const cancelDelete = () => showDeleteDialog.value = false
const cancelUnlock = () => showUnlockDialog.value = false

const confirmDelete = async () => {
  if (!enumerator.value) return
  try {
    await apiService.deleteEnumerator(enumerator.value.file_name)
    showDeleteDialog.value = false
    const files = await apiService.getEnumerators()
    enumeratorFiles.value = files
    const newest = files.length > 0
      ? files.reduce((a: { file_name: string }, b: { file_name: string }) => {
          const aVer = parseInt(a.file_name.match(/enumerations\.(\d+)\.yaml/)?.[1] || '0')
          const bVer = parseInt(b.file_name.match(/enumerations\.(\d+)\.yaml/)?.[1] || '0')
          return bVer > aVer ? b : a
        })
      : null
    router.push(newest ? `/enumerators/${newest.file_name}` : '/enumerators')
  } catch (err: any) {
    error.value = err.message || 'Failed to delete enumerator'
  }
}

watch(() => route.params.fileName, () => loadEnumerator(), { immediate: false })
onMounted(() => {
  loadEnumeratorFiles()
})
</script>

<style scoped>
.enumerator-header-bar {
  min-width: 0;
}

.enumerator-name {
  min-width: 0;
}

</style>
