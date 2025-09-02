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
        <h2 class="text-h3 mb-0">Type {{ typeData.file_name.replace('.yaml', '') }}</h2>
        <div class="d-flex gap-2" v-if="!typeData._locked">
          <v-btn
            color="warning"
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
        <div v-else class="d-flex gap-2">
          <v-btn
            color="success"
            variant="elevated"
            @click="unlockType"
            class="font-weight-bold"
          >
            <v-icon start>mdi-lock-open</v-icon>
            Unlock
          </v-btn>
        </div>
      </header>
      
      <!-- Root Property Editor with Card Layout -->
      <BaseCard
        v-if="typeData.root"
        :title="typeData.root.name || 'Root Property'"
        icon="mdi-shape"
        data-test="root-property-card"
      >
        <PropertyEditor
          :property="typeData.root"
          :is-root="true"
          :is-type="true"
          :disabled="typeData._locked"
          @change="handleRootPropertyChange"
        />
      </BaseCard>
    </div>
  </v-container>

  <!-- Delete Confirmation Dialog -->
  <v-dialog v-model="showDeleteDialog" max-width="400">
    <v-card>
      <v-card-title class="text-h5">
        Final Confirmation
      </v-card-title>
      <v-card-text>
        <p class="mb-3">
          <strong>Are you absolutely sure you want to delete "{{ typeData?.file_name.replace('.yaml', '') }}"?</strong>
        </p>
        <p class="mb-4">
          Type "DELETE" below to confirm:
        </p>
        <v-text-field
          v-model="deleteConfirmationText"
          placeholder="Type DELETE to confirm"
          variant="outlined"
          density="compact"
          hide-details
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="cancelDelete">Cancel</v-btn>
        <v-btn 
          color="error" 
          @click="confirmDelete"
          :disabled="deleteConfirmationText !== 'DELETE'"
        >
          Delete
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Unlock Confirmation Dialog -->
  <v-dialog v-model="showUnlockDialog" max-width="400">
    <v-card>
      <v-card-title class="text-h5">
        Final Confirmation
      </v-card-title>
      <v-card-text>
        <p class="mb-3">
          <strong>Are you absolutely sure you want to unlock this type?</strong>
        </p>
        <p class="mb-4">
          Type "UNLOCK" below to confirm:
        </p>
        <v-text-field
          v-model="unlockConfirmationText"
          placeholder="Type UNLOCK to confirm"
          variant="outlined"
          density="compact"
          hide-details
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="cancelUnlock">Cancel</v-btn>
        <v-btn 
          color="warning" 
          @click="confirmUnlock"
          :disabled="unlockConfirmationText !== 'UNLOCK'"
        >
          Unlock
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiService } from '@/utils/api'
import PropertyEditor from '@/components/PropertyEditor.vue'
import BaseCard from '@/components/BaseCard.vue'
import type { TypeProperty, TypeData } from '@/types/types'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const showDeleteDialog = ref(false)
const showUnlockDialog = ref(false)
const deleteConfirmationText = ref('')
const unlockConfirmationText = ref('')
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
    // No need to get after put with the new API
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
    // Update local state
    typeData.value._locked = true
    
    // Save the locked state to the backend
    await autoSave()
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
  deleteConfirmationText.value = ''
}

const confirmUnlock = async () => {
  if (!typeData.value) return
  try {
    // Update local state
    typeData.value._locked = false
    showUnlockDialog.value = false
    unlockConfirmationText.value = ''
    
    // Save the unlocked state to the backend
    await autoSave()
  } catch (err: any) {
    error.value = err.message || 'Failed to unlock type'
    console.error('Failed to unlock type:', err)
  }
}

const cancelUnlock = () => {
  showUnlockDialog.value = false
  unlockConfirmationText.value = ''
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