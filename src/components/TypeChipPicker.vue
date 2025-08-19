<template>
  <div class="type-chip-picker">
    <v-menu
      v-model="menuOpen"
      :close-on-content-click="false"
      location="bottom"
    >
      <template v-slot:activator="{ props }">
        <v-chip
          :color="getChipColor()"
          :variant="getChipVariant()"
          size="small"
          v-bind="props"
          @click="menuOpen = true"
          :disabled="disabled"
        >
          <v-icon start size="small">{{ getTypeIcon() }}</v-icon>
          {{ getDisplayName() }}
          <v-icon end size="small">mdi-chevron-down</v-icon>
        </v-chip>
      </template>
      
      <v-card min-width="300" class="type-picker-menu">
        <v-card-title class="text-subtitle-2 pa-4 pb-2">
          Select Property Type
        </v-card-title>
        
        <v-card-text class="pa-4 pt-0">
          <div class="type-categories">
            <!-- Built-in Types -->
            <div class="type-category mb-4">
              <div class="text-caption text-medium-emphasis mb-2">Built-in Types</div>
              <div class="d-flex flex-wrap gap-2">
                <v-chip
                  v-for="type in availableBuiltInTypes"
                  :key="type.value"
                  :color="type.value === modelValue ? 'primary' : 'default'"
                  variant="outlined"
                  size="small"
                  @click="selectType(type.value)"
                >
                  <v-icon start size="small">{{ type.icon }}</v-icon>
                  {{ type.title }}
                </v-chip>
              </div>
            </div>
            
            <!-- Custom Types (only for non-root properties) -->
            <div v-if="!isRoot && customTypes.length > 0" class="type-category">
              <div class="text-caption text-medium-emphasis mb-2">Custom Types</div>
              <div class="d-flex flex-wrap gap-2">
                <v-chip
                  v-for="type in customTypes"
                  :key="type.file_name"
                  :color="isCustomTypeSelected(type) ? 'primary' : 'default'"
                  variant="outlined"
                  size="small"
                  @click="selectCustomType(type)"
                >
                  <v-icon start size="small">mdi-file-document</v-icon>
                  {{ type.name }}
                </v-chip>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { apiService } from '@/utils/api'

interface CustomType {
  name: string
  file_name: string
}

interface BuiltInType {
  title: string
  value: string
  icon: string
}

const props = defineProps<{
  modelValue: string
  isRoot?: boolean
  isDictionary?: boolean
  isType?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const menuOpen = ref(false)
const customTypes = ref<CustomType[]>([])
const loading = ref(false)

// Built-in types with icons
const builtInTypes: BuiltInType[] = [
  { title: 'Array', value: 'array', icon: 'mdi-format-list-bulleted' },
  { title: 'Object', value: 'object', icon: 'mdi-shape' },
  { title: 'Simple', value: 'simple', icon: 'mdi-code-json' },
  { title: 'Complex', value: 'complex', icon: 'mdi-code-braces' }
]

// Load custom types from API
const loadCustomTypes = async () => {
  if (loading.value) return
  
  try {
    loading.value = true
    const typesData = await apiService.getTypes()
    customTypes.value = (typesData || []).map((type: any) => ({
      name: type.file_name.replace('.yaml', ''),
      file_name: type.file_name
    })).sort((a, b) => a.name.localeCompare(b.name))
  } catch (error) {
    console.error('Failed to load custom types:', error)
    customTypes.value = []
  } finally {
    loading.value = false
  }
}

// Check if a type is allowed in current context
const isTypeAllowed = (typeValue: string): boolean => {
  if (props.isRoot) {
    // Root properties: only Array, Object, Simple, Complex
    return ['array', 'object', 'simple', 'complex'].includes(typeValue)
  }
  
  // Non-root properties: only Array, Object (Simple and Complex are hidden)
  return ['array', 'object'].includes(typeValue)
}

// Get available built-in types for current context
const availableBuiltInTypes = computed(() => {
  if (props.isRoot) {
    // Root properties: show all built-in types
    return builtInTypes
  }
  
  // Non-root properties: only show Array and Object
  return builtInTypes.filter(type => ['array', 'object'].includes(type.value))
})

// Get available types for current context (legacy - can be removed if not used elsewhere)
const availableTypes = computed(() => {
  return builtInTypes.filter(type => isTypeAllowed(type.value))
})

// Get chip color based on type
const getChipColor = (): string => {
  if (props.disabled) return 'grey'
  
  const type = builtInTypes.find(t => t.value === props.modelValue)
  if (type) {
    return 'primary'
  }
  
  // Custom type
  return 'secondary'
}

// Get chip variant
const getChipVariant = (): string => {
  return 'elevated'
}

// Get type icon
const getTypeIcon = (): string => {
  const type = builtInTypes.find(t => t.value === props.modelValue)
  if (type) {
    return type.icon
  }
  
  // Custom type
  return 'mdi-file-document'
}

// Get display name
const getDisplayName = (): string => {
  const type = builtInTypes.find(t => t.value === props.modelValue)
  if (type) {
    return type.title
  }
  
  // Custom type - check if it's a custom type by looking for it in customTypes
  const customType = customTypes.value.find(t => t.name === props.modelValue)
  if (customType) {
    return customType.name
  }
  
  return props.modelValue
}

// Check if a custom type is selected
const isCustomTypeSelected = (customType: CustomType): boolean => {
  return props.modelValue === customType.name
}

// Select a built-in type
const selectType = (typeValue: string) => {
  emit('update:modelValue', typeValue)
  menuOpen.value = false
}

// Select a custom type
const selectCustomType = (customType: CustomType) => {
  emit('update:modelValue', customType.name)
  menuOpen.value = false
}

// Load custom types on mount
onMounted(() => {
  loadCustomTypes()
})
</script>

<style scoped>
.type-chip-picker {
  display: inline-block;
}

.type-picker-menu {
  max-height: 400px;
  overflow-y: auto;
}

.type-category {
  margin-bottom: 16px;
}

.type-category:last-child {
  margin-bottom: 0;
}
</style>
