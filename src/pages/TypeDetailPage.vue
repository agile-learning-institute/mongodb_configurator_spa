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
        <v-btn @click="loadType" class="mt-2">Retry</v-btn>
      </v-alert>
    </div>

    <!-- Content -->
    <div v-else-if="typeData">
      <!-- Page Header -->
      <header class="d-flex align-center justify-space-between mb-6">
        <h2 class="text-h4 mb-0">{{ typeData.file_name }}</h2>
        <div class="d-flex gap-2">
          <v-btn
            v-if="typeData._locked"
            color="warning"
            variant="elevated"
            @click="unlockType"
            class="font-weight-bold"
          >
            <v-icon start>mdi-lock-open</v-icon>
            Unlock
          </v-btn>
          <v-btn
            v-else
            color="info"
            variant="elevated"
            @click="lockType"
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
      </header>
      <!-- TypePropertyEditorFactory for root property -->
      <TypePropertyEditorFactory
        :property="typeData.root"
        :is-root="true"
        @change="handleRootPropertyChange"
      />
    </div>
  </v-container>

  <!-- Delete Confirmation Dialog -->
  <v-dialog v-model="showDeleteDialog" max-width="500">
    <v-card>
      <v-card-title class="text-h5">
        Delete Type?
      </v-card-title>
      <v-card-text>
        <p>Are you sure you want to delete "{{ typeData?.file_name }}"?</p>
        <p class="text-caption text-medium-emphasis">
          This action cannot be undone.
        </p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="cancelDelete">Cancel</v-btn>
        <v-btn color="error" @click="confirmDelete">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Unlock Confirmation Dialog -->
  <v-dialog v-model="showUnlockDialog" max-width="500">
    <v-card>
      <v-card-title class="text-h5">
        Unlock Type?
      </v-card-title>
      <v-card-text>
        <p>Unlocking allows editing this type. Are you sure?</p>
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiService } from '@/utils/api'
import TypePropertyEditorFactory from '@/components/TypePropertyEditorFactory.vue'
import type { TypeProperty, TypeData } from '@/types/types'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const showDeleteDialog = ref(false)
const showUnlockDialog = ref(false)
const typeData = ref<TypeData | null>(null)

// Methods
const loadType = async () => {
  loading.value = true
  error.value = null
  try {
    const fileName = route.params.fileName as string
    typeData.value = await apiService.getType(fileName)
  } catch (err: any) {
    error.value = err.message || 'Failed to load type'
    console.error('Failed to load type:', err)
  } finally {
    loading.value = false
  }
}

const autoSave = async () => {
  if (!typeData.value) return
  saving.value = true
  error.value = null
  try {
    await apiService.saveType(typeData.value.file_name, typeData.value)
    const freshData = await apiService.getType(typeData.value.file_name)
    typeData.value = freshData
  } catch (err: any) {
    error.value = err.message || 'Failed to save type'
    console.error('Failed to save type:', err)
  } finally {
    saving.value = false
  }
}

const handleRootPropertyChange = (updatedProperty: TypeProperty) => {
  if (typeData.value) {
    typeData.value.root = updatedProperty
    autoSave()
  }
}

const lockType = async () => {
  if (!typeData.value) return
  try {
    await apiService.lockAllTypes()
    typeData.value._locked = true
  } catch (err: any) {
    error.value = err.message || 'Failed to lock type'
    console.error('Failed to lock type:', err)
  }
}

const unlockType = async () => {
  if (!typeData.value) return
  showUnlockDialog.value = true
}

const handleDelete = () => {
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!typeData.value) return
  try {
    await apiService.deleteType(typeData.value.file_name)
    router.push('/types')
  } catch (err: any) {
    error.value = err.message || 'Failed to delete type'
    console.error('Failed to delete type:', err)
  }
}

const cancelDelete = () => {
  showDeleteDialog.value = false
}

const confirmUnlock = async () => {
  if (!typeData.value) return
  try {
    // Note: The API doesn't have an unlock endpoint, so we'll just update the local state
    // In a real implementation, you might need to call a specific unlock endpoint
    typeData.value._locked = false
    showUnlockDialog.value = false
  } catch (err: any) {
    error.value = err.message || 'Failed to unlock type'
    console.error('Failed to unlock type:', err)
  }
}

const cancelUnlock = () => {
  showUnlockDialog.value = false
}

// Load type on mount
onMounted(() => {
  loadType()
})
</script>

<style scoped>
/* Type content styling */
.type-content {
  margin-top: 24px;
}
</style> 