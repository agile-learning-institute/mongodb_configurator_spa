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
        <v-btn @click="loadMigration" class="mt-2">Retry</v-btn>
      </v-alert>
    </div>

    <!-- Migration detail -->
    <div v-else-if="migration">
      <BaseCard 
        :title="fileName"
        icon="mdi-swap-horizontal"
      >
        <template #header-actions>
          <v-btn
            v-if="!isReadOnly"
            color="error"
            variant="elevated"
            @click="showDeleteDialog = true"
            class="font-weight-bold"
            data-test="delete-file-btn"
          >
            <v-icon start>mdi-delete</v-icon>
            Delete
          </v-btn>
        </template>

        <JsonArrayEditor
          v-model="migration"
          title="Migrations"
          item-label="Migration"
          :disabled="isReadOnly"
          :auto-save="autoSave"
          :allow-multiple="true"
          size-mode="fit-content"
        />
      </BaseCard>
    </div>
    
    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5">
          Delete Migration File?
        </v-card-title>
        <v-card-text>
          <p>Are you sure you want to delete "{{ fileName }}"?</p>
          <p class="text-caption text-medium-emphasis">
            This action cannot be undone in the WebUI. If you think you may want to undo this action you should commit changes in git first.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showDeleteDialog = false" data-test="cancel-delete-btn">Cancel</v-btn>
          <v-btn color="error" @click="confirmDelete" data-test="confirm-delete-btn">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { apiService } from '@/utils/api'
import { useConfig } from '@/composables/useConfig'
import JsonArrayEditor from '@/components/JsonArrayEditor.vue'
import BaseCard from '@/components/BaseCard.vue'

const route = useRoute()
const { isReadOnly } = useConfig()
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const migration = ref<any[] | null>(null)
const showDeleteDialog = ref(false)

const fileName = computed(() => route.params.fileName as string)

// Load migration
const loadMigration = async () => {
  loading.value = true
  error.value = null
  
  try {
    const data = await apiService.getMigration(fileName.value)
    migration.value = data
  } catch (err: any) {
    error.value = err.message || 'Failed to load migration'
    console.error('Failed to load migration:', err)
  } finally {
    loading.value = false
  }
}

// Auto-save functionality
const autoSave = async () => {
  if (!migration.value || isReadOnly.value) return
  
  saving.value = true
  try {
    await apiService.saveMigration(fileName.value, migration.value)
  } catch (err: any) {
    error.value = err.message || 'Failed to save migration'
    console.error('Failed to save migration:', err)
  } finally {
    saving.value = false
  }
}

// Confirm delete functionality
const confirmDelete = async () => {
  try {
    await apiService.deleteMigration(fileName.value)
    // Navigate back to migrations list
    window.location.href = '/migrations'
  } catch (err: any) {
    error.value = err.message || 'Failed to delete migration'
    console.error('Failed to delete migration:', err)
  } finally {
    showDeleteDialog.value = false
  }
}

// Load migration on mount
onMounted(() => {
  loadMigration()
})
</script> 