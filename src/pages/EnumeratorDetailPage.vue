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
        <v-btn @click="loadEnumerator" class="mt-2">Retry</v-btn>
      </v-alert>
    </div>

    <!-- Enumerator detail -->
    <div v-else-if="enumerator">
      <v-card class="mb-4">
        <v-card-title class="d-flex justify-space-between align-center pa-4" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
          <div class="d-flex align-center">
            <h2 class="text-h5 mb-0">{{ (route.params.fileName as string)?.replace('.yaml', '') || 'Enumerator' }}</h2>
        </div>
        <div class="d-flex align-center">
            <v-btn
            v-if="enumerator._locked"
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
              @click="lockEnumerator"
          >
              <v-icon start>mdi-lock</v-icon>
              Lock
          </v-btn>
          </div>
        </v-card-title>
        
        <v-card-text class="pa-4">
          <!-- Version Info -->
          <div class="mb-4">
            <div class="d-flex align-center mb-3">
              <div class="text-h6 font-weight-bold mr-3">Version:</div>
              <div class="text-body-1">{{ enumerator.version }}</div>
        </div>
      </div>

      <!-- Enumerations -->
          <div class="mb-4">
            <div class="d-flex align-center mb-3">
              <div class="text-h6 font-weight-bold mr-3">Enumerations</div>
          <v-btn
            color="primary"
            variant="outlined"
                size="small"
            @click="addEnumeration"
            :disabled="enumerator._locked"
          >
                <v-icon start size="small">mdi-plus</v-icon>
                Add
          </v-btn>
            </div>
            
            <div v-if="!enumerator.enumerators || Object.keys(enumerator.enumerators).length === 0" class="text-center pa-4">
              <v-icon size="32" color="grey">mdi-format-list-bulleted</v-icon>
              <div class="text-body-2 text-medium-emphasis mt-2">No enumerations defined</div>
          </div>
          
          <div v-else>
              <v-expansion-panels v-model="expandedPanels" multiple>
              <v-expansion-panel
                v-for="(enumeration, enumName) in enumerator.enumerators"
                :key="enumName"
                  class="mb-2"
              >
                <v-expansion-panel-title>
                  <div class="d-flex justify-space-between align-center w-100">
                      <div class="d-flex align-center">
                        <v-text-field
                          v-model="editableEnumNames[enumName]"
                          placeholder="Name me"
                          density="compact"
                          variant="outlined"
                          hide-details
                          :disabled="enumerator._locked"
                          @blur="updateEnumName(enumName, editableEnumNames[enumName])"
                          class="mr-2"
                          style="min-width: 300px; max-width: 500px;"
                        />
                        <span class="text-caption text-medium-emphasis">
                          ({{ Object.keys(enumeration).length }} values)
                        </span>
                      </div>
                    <v-btn
                      icon
                        size="x-small"
                      variant="text"
                      color="error"
                      @click.stop="deleteEnumeration(enumName)"
                      :disabled="enumerator._locked"
                        class="pa-0 ma-0"
                    >
                        <v-icon size="16">mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </v-expansion-panel-title>
                  
                <v-expansion-panel-text>
                    <div class="ml-4">
                      <div
                        v-for="(_, key) in enumeration"
                      :key="key"
                        class="d-flex align-center mb-2"
                    >
                        <v-text-field
                          v-model="editableKeys[`${enumName}_${key}`]"
                          placeholder="Name me"
                          density="compact"
                          variant="outlined"
                          hide-details
                          :disabled="enumerator._locked"
                          @blur="updateKey(enumName, key, editableKeys[`${enumName}_${key}`])"
                          class="mr-2"
                          style="width: 150px;"
                        />
                            <v-text-field
                              v-model="enumeration[key]"
                          placeholder="Value"
                              density="compact"
                          variant="outlined"
                          hide-details
                              :disabled="enumerator._locked"
                              @update:model-value="autoSave"
                          class="flex-grow-1 mr-2"
                          style="max-width: 300px;"
                            />
                          <v-btn
                            icon
                          size="x-small"
                            variant="text"
                            color="error"
                            @click="deleteEnumValue(enumName, key)"
                            :disabled="enumerator._locked"
                          class="pa-0 ma-0"
                          >
                          <v-icon size="16">mdi-delete</v-icon>
                        </v-btn>
                      </div>
                      
                      <v-btn
                        color="primary"
                        variant="outlined"
                        size="x-small"
                        @click="addEnumValue(enumName)"
                        :disabled="enumerator._locked"
                        class="mt-2"
                      >
                        <v-icon start size="small">mdi-plus</v-icon>
                        Add Value
                          </v-btn>
                        </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>
    
    <!-- Unlock Dialog -->
    <v-dialog v-model="showUnlockDialog" max-width="400">
      <v-card>
        <v-card-title>Unlock Enumerator?</v-card-title>
        <v-card-text>
          Unlocking allows editing this enumerator. Are you sure?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showUnlockDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="unlockEnumerator">Unlock</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { apiService } from '@/utils/api'

interface Enumerator {
  version: number
  enumerators: Record<string, Record<string, string>>
  _locked: boolean
}

const route = useRoute()
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const enumerator = ref<Enumerator | null>(null)
const showUnlockDialog = ref(false)
const editableEnumNames = ref<Record<string, string>>({})
const editableKeys = ref<Record<string, string>>({})
const expandedPanels = ref<number[]>([])

// Load enumerator data
const loadEnumerator = async () => {
  loading.value = true
  error.value = null
  
  try {
    const fileName = route.params.fileName as string
    const data = await apiService.getEnumerator(fileName)
    enumerator.value = data
  } catch (err: any) {
    error.value = err.message || 'Failed to load enumerator'
    console.error('Failed to load enumerator:', err)
  } finally {
    loading.value = false
  }
}

// Get next version number for new enumerators
// const getNextVersion = async (): Promise<number> => {
//   try {
//     const enumerators = await apiService.getEnumerators()
//     if (enumerators.length === 0) return 0
//     
//     const maxVersion = Math.max(...enumerators.map((e: any) => e.version || 0))
//     return maxVersion + 1
//   } catch (err) {
//     console.error('Failed to get next version:', err)
//     return 0
//   }
// }

// Auto-save functionality
const autoSave = async () => {
  if (!enumerator.value || enumerator.value._locked) return
  
  saving.value = true
  try {
    const fileName = route.params.fileName as string
    await apiService.saveEnumerator(fileName, enumerator.value)
  } catch (err: any) {
    error.value = err.message || 'Failed to save enumerator'
    console.error('Failed to save enumerator:', err)
  } finally {
    saving.value = false
  }
}

// Manual save
// const saveEnumerator = async () => {
//   if (!enumerator.value) return
//   
//   saving.value = true
//   try {
//     const fileName = route.params.fileName as string
//     await apiService.saveEnumerator(fileName, enumerator.value)
//     // Could add success notification here
//   } catch (err: any) {
//     error.value = err.message || 'Failed to save enumerator'
//     console.error('Failed to save enumerator:', err)
//   } finally {
//     saving.value = false
//   }
// }

// Add new enumeration
const addEnumeration = () => {
  if (!enumerator.value || enumerator.value._locked) return
  
  // Generate unique name
  let counter = 1
  let enumName = `name_me_${counter}`
  while (enumerator.value.enumerators[enumName]) {
    counter++
    enumName = `name_me_${counter}`
  }
  
  enumerator.value.enumerators[enumName] = {}
  editableEnumNames.value[enumName] = enumName
  
  autoSave()
}

// Delete enumeration
const deleteEnumeration = (enumName: string) => {
  if (!enumerator.value || enumerator.value._locked) return
  
  delete enumerator.value.enumerators[enumName]
  autoSave()
}

// Add enum value
const addEnumValue = (enumName: string) => {
  if (!enumerator.value || enumerator.value._locked) return
  
  // Generate unique key
  let counter = 1
  let key = `name_me_${counter}`
  while (enumerator.value.enumerators[enumName][key]) {
    counter++
    key = `name_me_${counter}`
  }
  
  enumerator.value.enumerators[enumName][key] = 'new_value'
  editableKeys.value[`${enumName}_${key}`] = key
  
  autoSave()
}



// Delete enum value
const deleteEnumValue = (enumName: string, key: string) => {
  if (!enumerator.value || enumerator.value._locked) return
  
  delete enumerator.value.enumerators[enumName][key]
  autoSave()
}

// Lock/unlock functionality
const lockEnumerator = () => {
  if (!enumerator.value) return
  enumerator.value._locked = true
  autoSave()
}

const unlockEnumerator = () => {
  if (!enumerator.value) return
  enumerator.value._locked = false
  showUnlockDialog.value = false
  autoSave()
}

// Editable name/key management
const updateEnumName = (oldName: string, newName: string) => {
  if (!enumerator.value || enumerator.value._locked) return
  
  // Validate the new name
  if (!newName || newName.trim() === '') {
    // Reset to original name if empty
    editableEnumNames.value[oldName] = oldName
    return
  }
  
  if (newName && newName !== oldName) {
    // Create new enumeration with new name
    enumerator.value.enumerators[newName] = enumerator.value.enumerators[oldName]
    // Delete old enumeration
    delete enumerator.value.enumerators[oldName]
    // Update editable names
    editableEnumNames.value[newName] = newName
    delete editableEnumNames.value[oldName]
    autoSave()
  }
}

const updateKey = (enumName: string, oldKey: string, newKey: string) => {
  if (!enumerator.value || enumerator.value._locked) return
  
  // Validate the new key
  if (!newKey || newKey.trim() === '') {
    // Reset to original key if empty
    editableKeys.value[`${enumName}_${oldKey}`] = oldKey
    return
  }
  
  if (newKey && newKey !== oldKey) {
    // Create new key-value pair
    enumerator.value.enumerators[enumName][newKey] = enumerator.value.enumerators[enumName][oldKey]
    // Delete old key
    delete enumerator.value.enumerators[enumName][oldKey]
    // Update editable keys
    editableKeys.value[`${enumName}_${newKey}`] = newKey
    delete editableKeys.value[`${enumName}_${oldKey}`]
    autoSave()
  }
}

// Initialize editable names and keys when data loads
const initializeEditableData = () => {
  if (!enumerator.value) return
  
  editableEnumNames.value = {}
  editableKeys.value = {}
  
  Object.keys(enumerator.value.enumerators).forEach(enumName => {
    editableEnumNames.value[enumName] = enumName
    Object.keys(enumerator.value!.enumerators[enumName]).forEach(key => {
      editableKeys.value[`${enumName}_${key}`] = key
    })
  })
}

// Load enumerator on mount
onMounted(() => {
  loadEnumerator()
})

// Watch for enumerator changes to initialize editable data
watch(enumerator, () => {
  initializeEditableData()
})
</script> 