<template>
  <ListCardPageLayout
    title="Dictionaries"
    :loading="loading"
    :error="error"
    :items="collections"
    page-key="dictionaries"
    empty-icon="mdi-book-open-variant"
    empty-title="No dictionaries found"
    empty-message="Create a new dictionary to get started."
    @retry="loadCollections"
  >
    <template #header-actions>
      <template v-if="!isReadOnly">
        <v-tooltip text="Lock all dictionaries" location="bottom">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              icon="mdi-lock"
              variant="text"
              size="small"
              :loading="lockAllLoading"
              @click="handleLockAll"
              data-test="lock-all-btn"
            />
          </template>
        </v-tooltip>
        <v-tooltip text="New dictionary" location="bottom">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              icon="mdi-plus"
              variant="text"
              size="small"
              @click="showNewCollectionDialog = true"
              data-test="new-collection-btn"
            />
          </template>
        </v-tooltip>
      </template>
    </template>
    <template #empty-action>
      <v-btn
        v-if="!isReadOnly"
        color="primary"
        variant="elevated"
        class="mt-4"
        @click="showNewCollectionDialog = true"
        data-test="new-collection-empty-btn"
      >
        New Dictionary
      </v-btn>
    </template>
    <template #default>
      <v-col
        v-for="collection in collections"
        :key="collection.collection_name"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <CollectionCard
          :collection="collection"
          @open-dictionary="handleOpenDictionary"
          @open-configuration="handleOpenConfiguration"
        />
      </v-col>
    </template>
  </ListCardPageLayout>

  <NewCollectionDialog
    v-model="showNewCollectionDialog"
    @created="handleCollectionCreated"
    data-test="new-collection-dialog"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiService } from '@/utils/api'
import { useConfig } from '@/composables/useConfig'
import { useCollections } from '@/composables/useCollections'
import ListCardPageLayout from '@/components/ListCardPageLayout.vue'
import CollectionCard from '@/components/CollectionCard.vue'
import NewCollectionDialog from '@/components/NewCollectionDialog.vue'

const router = useRouter()
const { isReadOnly } = useConfig()
const { collections, loading, error, loadCollections } = useCollections()

const showNewCollectionDialog = ref(false)
const lockAllLoading = ref(false)

const handleLockAll = async () => {
  lockAllLoading.value = true
  error.value = null
  try {
    await apiService.lockAllDictionaries()
    await loadCollections()
  } catch (err: any) {
    error.value = err.message || 'Failed to lock all dictionaries'
  } finally {
    lockAllLoading.value = false
  }
}

const handleOpenDictionary = (fileName: string) => {
  router.push(`/dictionaries/${fileName}`)
}

const handleOpenConfiguration = (fileName: string) => {
  router.push(`/configurations/${fileName}`)
}

const handleCollectionCreated = (dictionaryFileName: string) => {
  loadCollections()
  router.push(`/dictionaries/${dictionaryFileName}`)
}
</script>
