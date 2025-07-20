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
            v-if="locked"
            color="white"
            variant="text"
            @click="showUnlockDialog = true"
          >
            <v-icon start>mdi-lock</v-icon>
            Locked
          </v-btn>
          <v-btn
            v-else
            color="white"
            variant="text"
            @click="lockMigration"
          >
            <v-icon start>mdi-lock</v-icon>
            Lock
          </v-btn>
        </template>

        <JsonArrayEditor
          v-model="migration"
          title="Migrations"
          item-label="Migration"
          :disabled="locked"
          :auto-save="autoSave"
          :allow-multiple="true"
          size-mode="fit-content"
        />
      </BaseCard>
    </div>
    
    <!-- Unlock Dialog -->
    <v-dialog v-model="showUnlockDialog" max-width="400">
      <v-card>
        <v-card-title>Unlock Migration?</v-card-title>
        <v-card-text>
          Unlocking allows editing this migration. Are you sure?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showUnlockDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="unlockMigration">Unlock</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { apiService } from '@/utils/api'
import JsonArrayEditor from '@/components/JsonArrayEditor.vue'
import BaseCard from '@/components/BaseCard.vue'

const route = useRoute()
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const migration = ref<any[] | null>(null)
const locked = ref(false)
const showUnlockDialog = ref(false)

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
  if (!migration.value || locked.value) return
  
  saving.value = true
  try {
    await apiService.saveMigration(fileName.value, migration.value)
  } catch (err: any) {
    error.value = err.message || 'Failed to save migration'
    console.error('Failed to save migration:', err)
    throw err
  } finally {
    saving.value = false
  }
}

// Lock/unlock functionality
const lockMigration = () => {
  if (!migration.value) return
  locked.value = true
  autoSave()
}

const unlockMigration = () => {
  if (!migration.value) return
  locked.value = false
  showUnlockDialog.value = false
  autoSave()
}

// Load migration on mount
onMounted(() => {
  loadMigration()
})
</script> 