<template>
  <v-dialog v-model="showDialog" max-width="500px" data-test="new-collection-dialog">
    <v-card>
      <v-card-title class="text-h5 pa-6 pb-4" data-test="new-collection-dialog-title">
        <v-icon start color="primary" class="mr-2">mdi-plus-circle</v-icon>
        Create New Dictionary
      </v-card-title>
      <v-card-text class="pa-6 pt-0">
        <div class="d-flex flex-column gap-4">
          <v-text-field
            v-model="newCollectionName"
            label="Collection Name"
            :error="!!nameError"
            :error-messages="nameError || undefined"
            placeholder="my_collection"
            :disabled="creating"
            @keyup.enter="createCollection"
            variant="outlined"
            density="compact"
            data-test="new-collection-name-input"
          />
          <p class="text-caption text-medium-emphasis mt-n2" data-test="new-collection-help-text">
            Collection names must start with a letter and contain only letters, numbers, and underscores.
          </p>
          <v-text-field
            v-model="newCollectionDescription"
            label="Description"
            placeholder="Describe the purpose of this collection"
            :disabled="creating"
            variant="outlined"
            density="compact"
            data-test="new-collection-description-input"
          />
        </div>
      </v-card-text>
      <v-card-actions class="pa-6 pt-0">
        <v-spacer />
        <v-btn
          @click="closeDialog"
          :disabled="creating"
          data-test="new-collection-cancel-btn"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          @click="createCollection"
          :loading="creating"
          :disabled="!newCollectionName.trim()"
          data-test="new-collection-create-btn"
        >
          Create
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { apiService } from '@/utils/api'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'created', fileName: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const newCollectionName = ref('')
const newCollectionDescription = ref('')
const nameError = ref<string | null>(null)
const creating = ref(false)

const showDialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    newCollectionName.value = ''
    newCollectionDescription.value = ''
    nameError.value = null
  }
})

const closeDialog = () => {
  emit('update:modelValue', false)
}

const validateCollectionName = (name: string): boolean => {
  const pattern = /^[a-zA-Z][a-zA-Z0-9_]*$/
  if (!pattern.test(name)) {
    nameError.value = 'Collection name must start with a letter and contain only letters, numbers, and underscores'
    return false
  }
  nameError.value = null
  return true
}

const createCollection = async () => {
  const name = newCollectionName.value.trim()

  if (!name) {
    nameError.value = 'Collection name is required'
    return
  }

  if (!validateCollectionName(name)) {
    return
  }

  creating.value = true
  try {
    const result = await apiService.createNewCollection(name, newCollectionDescription.value.trim())
    closeDialog()
    emit('created', result.dictionary_file)
  } catch (err: any) {
    nameError.value = err.message || err.response?.data?.message || 'Failed to create collection'
  } finally {
    creating.value = false
  }
}
</script>
