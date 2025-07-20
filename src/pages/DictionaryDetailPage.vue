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
        <v-btn @click="loadDictionary" class="mt-2">Retry</v-btn>
      </v-alert>
    </div>

    <!-- Dictionary detail -->
    <div v-else-if="dictionary">
      <BaseCard 
        title="Dictionary"
        icon="mdi-book-open-variant"
      >
        <template #header-actions>
          <v-btn
            v-if="dictionary._locked"
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
            @click="lockDictionary"
          >
            <v-icon start>mdi-lock</v-icon>
            Lock
          </v-btn>
        </template>

        <DictionaryProperty
          property-name="root"
          :property="dictionary.root"
          :disabled="dictionary._locked"
          :exclude-type="dictionary.file_name"
          :top-level="true"
          :top-level-name="dictionary.file_name.replace('.yaml', '')"
          @change="handleTopLevelPropertyChange"
        />
      </BaseCard>
    </div>

    <!-- Unlock Dialog -->
    <v-dialog v-model="showUnlockDialog" max-width="400">
      <v-card>
        <v-card-title>Unlock Dictionary?</v-card-title>
        <v-card-text>
          Unlocking allows editing this dictionary. Are you sure?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showUnlockDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="unlockDictionary">Unlock</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { apiService } from '@/utils/api'
import DictionaryProperty from '@/components/DictionaryProperty.vue'
import BaseCard from '@/components/BaseCard.vue'

interface DictionaryProperty {
  description: string
  type: string
  required: boolean
  enums?: string
  ref?: string
  properties?: Record<string, DictionaryProperty>
  items?: DictionaryProperty
  additionalProperties?: boolean
}

interface Dictionary {
  file_name: string
  _locked: boolean
  root: DictionaryProperty
}

const route = useRoute()
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const dictionary = ref<Dictionary | null>(null)

// const propertyTypes = [
//   'string',
//   'number',
//   'boolean',
//   'object',
//   'array',
//   'identity',
//   'word',
//   'sentence',
//   'email',
//   'url',
//   'ip_address',
//   'us_phone',
//   'date_time',
//   'markdown',
//   'enum',
//   'ref'
// ]

// Load dictionary data
const loadDictionary = async () => {
  loading.value = true
  error.value = null
  
  try {
    const fileName = route.params.fileName as string
    const data = await apiService.getDictionary(fileName)
    dictionary.value = data
  } catch (err: any) {
    error.value = err.message || 'Failed to load dictionary'
    console.error('Failed to load dictionary:', err)
  } finally {
    loading.value = false
  }
}

// Auto-save functionality
const autoSave = async () => {
  if (!dictionary.value || dictionary.value._locked) return
  
  saving.value = true
  try {
    await apiService.saveDictionary(dictionary.value.file_name, dictionary.value)
  } catch (err: any) {
    error.value = err.message || 'Failed to save dictionary'
    console.error('Failed to save dictionary:', err)
  } finally {
    saving.value = false
  }
}

// Manual save
// const saveDictionary = async () => {
//   if (!dictionary.value) return
//   
//   saving.value = true
//   try {
//     await apiService.saveDictionary(dictionary.value.file_name, dictionary.value)
//     // Could add success notification here
//   } catch (err: any) {
//     error.value = err.message || 'Failed to save dictionary'
//     console.error('Failed to save dictionary:', err)
//   } finally {
//     saving.value = false
//   }
// }

// Add new property
// const addProperty = () => {
//   if (!dictionary.value || dictionary.value._locked) return
//   
//   const propertyName = `new_property_${Object.keys(dictionary.value.properties).length + 1}`
//   dictionary.value.properties[propertyName] = {
//     description: '',
//     type: 'string',
//     required: false
//   }
//   
//   autoSave()
// }

// Delete property
// const deleteProperty = (propertyName: string) => {
//   if (!dictionary.value || dictionary.value._locked) return
//   
//   delete dictionary.value.properties[propertyName]
//   autoSave()
// }

// Load dictionary on mount
onMounted(() => {
  loadDictionary()
})

// Lock/unlock functionality
const showUnlockDialog = ref(false)

const unlockDictionary = () => {
  if (!dictionary.value) return
  dictionary.value._locked = false
  showUnlockDialog.value = false
  autoSave()
}

const lockDictionary = () => {
  if (!dictionary.value) return
  dictionary.value._locked = true
  autoSave()
}

const handleTopLevelPropertyChange = (updated: any) => {
  if (!dictionary.value) return
  // Update the root property with the changes
  dictionary.value.root = updated
  autoSave()
}
</script> 