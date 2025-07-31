<template>
  <div class="array-property-editor">
    <div class="array-header">
      <v-icon icon="mdi-format-list-bulleted" class="mr-2" />
      <span class="text-subtitle-2">Array Items</span>
      <v-spacer />
      <v-btn
        icon="mdi-chevron-down"
        variant="text"
        size="small"
        @click="expanded = !expanded"
      />
    </div>
    
    <div v-if="expanded" class="array-body">
      <div class="array-item-editor">
        <PropertyEditor
          :property="property.items"
          :is-root="false"
          :is-dictionary="isDictionary"
          :is-type="isType"
          @change="handleItemsChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { type ArrayProperty } from '@/types/types'
import PropertyEditor from '../PropertyEditor.vue'

const props = defineProps<{
  property: ArrayProperty
  isDictionary?: boolean
  isType?: boolean
}>()

const emit = defineEmits<{
  change: [property: ArrayProperty]
}>()

const expanded = ref(true)

const handleItemsChange = (updatedItems: any) => {
  const updatedProperty = {
    ...props.property,
    items: updatedItems
  }
  emit('change', updatedProperty)
}
</script>

<style scoped>
.array-property-editor {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.array-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.array-body {
  padding: 16px;
  background-color: #fafafa;
}

.array-item-editor {
  margin-top: 8px;
}
</style> 