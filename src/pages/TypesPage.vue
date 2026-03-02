<template>
  <ListCardPageLayout
    title="Types"
    :loading="loading"
    :error="error"
    :items="files"
    page-key="types"
    empty-icon="mdi-code-braces"
    empty-title="No types found"
    empty-message="Create a new type to get started."
    @retry="loadFiles"
  >
    <template #header-actions>
      <v-btn
        v-if="!isReadOnly"
        color="primary"
        variant="elevated"
        prepend-icon="mdi-plus"
        @click="showNewDialog = true"
        data-test="new-type-btn"
      >
        New Type
      </v-btn>
      <v-btn
        v-if="canLockAll && !isReadOnly"
        color="info"
        variant="outlined"
        prepend-icon="mdi-lock"
        @click="handleLockAll"
        :loading="locking"
        data-test="lock-all-btn"
      >
        Lock All
      </v-btn>
    </template>
    <template #empty-action>
      <v-btn
        v-if="!isReadOnly"
        color="primary"
        variant="elevated"
        class="mt-4"
        @click="showNewDialog = true"
        data-test="new-type-empty-btn"
      >
        New Type
      </v-btn>
    </template>
    <template #default>
      <v-col
        v-for="typeFile in files"
        :key="typeFile.name"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <TypeCard
          :type-file="typeFile"
          @open="handleOpen"
        />
      </v-col>
    </template>
  </ListCardPageLayout>

  <!-- New Type Dialog -->
    <v-dialog v-model="showNewDialog" max-width="400" data-test="new-type-dialog">
      <v-card>
        <v-card-title class="text-h5">
          Create New Type
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newTypeName"
            label="Type Name"
            placeholder="Enter type name (e.g., 'user')"
            variant="outlined"
            density="compact"
            hide-details
            @keyup.enter="createNewType"
            data-test="new-type-name-input"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showNewDialog = false">Cancel</v-btn>
          <v-btn 
            color="primary" 
            @click="createNewType"
            :disabled="!newTypeName.trim()"
            data-test="new-type-create-btn"
          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useConfig } from '@/composables/useConfig'
import { useFiles } from '@/composables/useFiles'
import { apiService } from '@/utils/api'
import ListCardPageLayout from '@/components/ListCardPageLayout.vue'
import TypeCard from '@/components/TypeCard.vue'

const router = useRouter()
const { isReadOnly } = useConfig()
const { files, loading, error, loadFiles, canLockAll, lockAllFiles } = useFiles('types')

const locking = ref(false)
const showNewDialog = ref(false)
const newTypeName = ref('')

const handleOpen = (fileName: string) => {
  router.push(`/types/${fileName}`)
}

const handleLockAll = async () => {
  locking.value = true
  try {
    await lockAllFiles()
  } finally {
    locking.value = false
  }
}

const createNewType = async () => {
  const name = newTypeName.value.trim()
  if (!name) return

  try {
    const newTypeData = {
      root: { name }
    }
    const fileName = `${name}.yaml`
    await apiService.saveType(fileName, newTypeData)
    router.push(`/types/${fileName}`)
    showNewDialog.value = false
    newTypeName.value = ''
  } catch (err) {
    console.error('Error creating new type:', err)
  }
}
</script> 