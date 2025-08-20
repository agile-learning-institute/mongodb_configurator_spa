<template>
  <v-container>
    <div class="d-flex justify-space-between align-center mb-6">
      <h3>Migrations</h3>
      <div class="d-flex align-center">
        <v-btn
          color="primary"
          variant="elevated"
          prepend-icon="mdi-plus"
          @click="showNewDialog = true"
        >
          New
        </v-btn>
      </div>
    </div>
    <FileList 
      ref="fileListRef"
      file-type="migrations"
      @edit="handleEdit"
      @open="handleOpen"
    />

    <!-- New Migration Dialog -->
    <v-dialog v-model="showNewDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h5">
          Create New Migration
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newMigrationName"
            label="Migration Name"
            placeholder="Enter migration name (e.g., 'add_user_fields')"
            variant="outlined"
            density="compact"
            hide-details
            @keyup.enter="createNewMigration"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showNewDialog = false">Cancel</v-btn>
          <v-btn 
            color="primary" 
            @click="createNewMigration"
            :disabled="!newMigrationName.trim()"
          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import FileList from '@/components/FileList.vue'

const router = useRouter()
const fileListRef = ref()

// New migration functionality
const showNewDialog = ref(false)
const newMigrationName = ref('')

const handleEdit = (fileName: string) => {
  router.push(`/migrations/${fileName}`)
}

const handleOpen = (fileName: string) => {
  router.push(`/migrations/${fileName}`)
}

const createNewMigration = async () => {
  const name = newMigrationName.value.trim()
  if (!name) return
  
  try {
    // Navigate to the new migration (it will be created when saved)
    const fileName = `${name}.yaml`
    router.push(`/migrations/${fileName}`)
    showNewDialog.value = false
    newMigrationName.value = ''
  } catch (error) {
    console.error('Error creating new migration:', error)
  }
}
</script> 