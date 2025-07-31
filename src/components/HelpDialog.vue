<template>
  <v-dialog v-model="modelValue" max-width="800" persistent>
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon icon="mdi-help-circle" class="mr-2" />
        {{ title }}
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" @click="$emit('update:modelValue', false)" />
      </v-card-title>
      
      <v-card-text class="help-content">
        <div v-html="content"></div>
      </v-card-text>
      
      <v-card-actions>
        <v-spacer />
        <v-btn @click="$emit('update:modelValue', false)">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
  title: string
  content: string
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<style scoped>
.help-content {
  max-height: 60vh;
  overflow-y: auto;
}

.help-content :deep(h1) {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1976d2;
}

.help-content :deep(h2) {
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
  margin-top: 1.5rem;
  color: #424242;
}

.help-content :deep(h3) {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  margin-top: 1rem;
  color: #616161;
}

.help-content :deep(p) {
  margin-bottom: 0.75rem;
  line-height: 1.6;
}

.help-content :deep(ul), .help-content :deep(ol) {
  margin-bottom: 0.75rem;
  padding-left: 1.5rem;
}

.help-content :deep(li) {
  margin-bottom: 0.25rem;
}

.help-content :deep(code) {
  background-color: #f5f5f5;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
}

.help-content :deep(blockquote) {
  border-left: 4px solid #1976d2;
  padding-left: 1rem;
  margin: 1rem 0;
  font-style: italic;
  color: #616161;
}
</style> 