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
      <BaseCard 
        :title="(route.params.fileName as string)?.replace('.yaml', '') || 'Enumerator'"
        icon="mdi-format-list-bulleted"
      >
        <template #header-actions>
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
        </template>

        <!-- Version Info -->
        <div class="mb-4">
          <div class="d-flex align-center mb-3">
            <div class="text-h6 font-weight-bold mr-3">Version:</div>
            <div class="text-body-1">{{ enumerator.version }}</div>
          </div>
        </div>

        <!-- Enumerators -->
        <div>
          <div class="d-flex align-center mb-3">
            <div class="text-h6 font-weight-bold mr-3">Enumerators</div>
            <v-btn
              color="primary"
              variant="outlined"
              size="small"
              @click="addEnumeration"
              :disabled="enumerator._locked"
            >
              <v-icon start size="small">mdi-plus</v-icon>
              Add Enumerator
            </v-btn>
          </div>
          
          <div v-if="!enumerator.enumerators || Object.keys(enumerator.enumerators).length === 0" class="text-center pa-4">
            <v-icon size="32" color="grey">mdi-format-list-bulleted</v-icon>
            <div class="text-body-2 text-medium-emphasis mt-2">No enumerators defined</div>
          </div>
          
          <div v-else>
            <v-expansion-panels v-model="expandedPanels">
              <v-expansion-panel
                v-for="(enumValues, enumName, index) in enumerator.enumerators"
                :key="enumName"
                :value="index"
              >
                <v-expansion-panel-title>
                  <div class="d-flex align-center justify-space-between w-100">
                    <div class="d-flex align-center">
                      <v-text-field
                        v-model="editableEnumNames[enumName]"
                        density="compact"
                        variant="outlined"
                        hide-details
                        :disabled="enumerator._locked"
                        class="mr-3"
                        style="min-width: 200px;"
                        @update:model-value="handleEnumNameChange(enumName, $event)"
                      />
                      <v-chip size="small" color="primary">
                        {{ Object.keys(enumValues).length }} values
                      </v-chip>
                    </div>
                    <v-btn
                      v-if="!enumerator._locked"
                      icon
                      size="small"
                      variant="text"
                      color="error"
                      @click.stop="deleteEnumeration(enumName)"
                    >
                      <v-icon size="16">mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </v-expansion-panel-title>
                
                <v-expansion-panel-text>
                  <div class="mb-3">
                    <div class="d-flex align-center mb-2">
                      <div class="text-subtitle-2 font-weight-bold mr-3">Values:</div>
                    </div>
                    
                    <div v-if="!enumValues || Object.keys(enumValues).length === 0" class="text-center pa-2">
                      <div class="text-body-2 text-medium-emphasis">No values defined</div>
                    </div>
                    
                    <div v-else>
                      <div
                        v-for="(_, key) in enumValues"
                        :key="key"
                        class="d-flex align-center mb-2"
                      >
                        <v-text-field
                          v-model="editableKeys[`${enumName}_${key}`]"
                          density="compact"
                          variant="outlined"
                          hide-details
                          :disabled="enumerator._locked"
                          class="mr-2"
                          style="min-width: 150px;"
                          @update:model-value="handleKeyChange(enumName, key, $event)"
                        />
                        <v-text-field
                          v-model="enumValues[key]"
                          density="compact"
                          variant="outlined"
                          hide-details
                          :disabled="enumerator._locked"
                          class="mr-2"
                          style="min-width: 200px;"
                          @update:model-value="handleValueChange(enumName, key, $event)"
                        />
                        <v-btn
                          v-if="!enumerator._locked"
                          icon
                          size="small"
                          variant="text"
                          color="error"
                          @click="deleteEnumValue(enumName, key)"
                        >
                          <v-icon size="16">mdi-delete</v-icon>
                        </v-btn>
                      </div>
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
      </BaseCard>
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
import BaseCard from '@/components/BaseCard.vue'

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
const handleEnumNameChange = (enumName: string, newName: string) => {
  if (!enumerator.value || enumerator.value._locked) return
  
  // Validate the new name
  if (!newName || newName.trim() === '') {
    // Reset to original name if empty
    editableEnumNames.value[enumName] = enumName
    return
  }
  
  if (newName && newName !== enumName) {
    // Create new enumeration with new name
    enumerator.value.enumerators[newName] = enumerator.value.enumerators[enumName]
    // Delete old enumeration
    delete enumerator.value.enumerators[enumName]
    // Update editable names
    editableEnumNames.value[newName] = newName
    delete editableEnumNames.value[enumName]
    autoSave()
  }
}

const handleKeyChange = (enumName: string, oldKey: string, newKey: string) => {
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

const handleValueChange = (enumName: string, key: string, newValue: string) => {
  if (!enumerator.value || enumerator.value._locked) return
  enumerator.value.enumerators[enumName][key] = newValue
  autoSave()
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