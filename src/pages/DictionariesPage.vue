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
      <v-btn
        v-if="!isReadOnly"
        color="primary"
        variant="elevated"
        prepend-icon="mdi-plus"
        @click="showNewCollectionDialog = true"
        data-test="new-collection-btn"
      >
        New Dictionary
      </v-btn>
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
import { useConfig } from '@/composables/useConfig'
import { useCollections } from '@/composables/useCollections'
import ListCardPageLayout from '@/components/ListCardPageLayout.vue'
import CollectionCard from '@/components/CollectionCard.vue'
import NewCollectionDialog from '@/components/NewCollectionDialog.vue'

const router = useRouter()
const { isReadOnly } = useConfig()
const { collections, loading, error, loadCollections } = useCollections()

const showNewCollectionDialog = ref(false)

const handleOpenDictionary = (fileName: string) => {
  router.push(`/dictionaries/${fileName}`)
}

const handleOpenConfiguration = (fileName: string) => {
  router.push(`/configurations/${fileName}`)
}

const handleCollectionCreated = (configFileName: string) => {
  loadCollections()
  router.push(`/configurations/${configFileName}`)
}
</script>
