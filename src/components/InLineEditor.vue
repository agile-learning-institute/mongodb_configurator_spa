<template>
  <span>
    <v-text-field
      v-if="editing"
      v-model="internalValue"
      density="compact"
      variant="plain"
      hide-details
      class="inline-editor-input"
      @blur="finishEdit"
      @keyup.enter="finishEdit"
      ref="inputRef"
      :placeholder="placeholder"
      style="min-width: 60px; max-width: 200px; display: inline-block;"
      autofocus
    />
    <span
      v-else
      class="inline-editor-text"
      @click="startEdit"
      :style="{ cursor: 'pointer', minWidth: '60px', display: 'inline-block' }"
    >
      {{ modelValue || placeholder }}
    </span>
  </span>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editing = ref(false)
const internalValue = ref(props.modelValue)
const inputRef = ref<HTMLInputElement | null>(null)

watch(() => props.modelValue, (val) => {
  internalValue.value = val
})

function startEdit() {
  editing.value = true
  nextTick(() => {
    if (inputRef.value) {
      (inputRef.value as any).focus()
    }
  })
}

function finishEdit() {
  editing.value = false
  emit('update:modelValue', internalValue.value)
}
</script>

<style scoped>
.inline-editor-input {
  min-width: 60px;
  max-width: 200px;
  display: inline-block;
}
.inline-editor-text {
  min-width: 60px;
  display: inline-block;
  border-bottom: 1px dashed #bdbdbd;
  color: #333;
  transition: border-color 0.2s;
}
.inline-editor-text:hover {
  border-bottom: 1px solid #1976d2;
  color: #1976d2;
}
</style> 