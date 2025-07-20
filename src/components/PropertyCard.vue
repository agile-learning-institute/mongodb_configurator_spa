<template>
  <v-card 
    class="property-card mb-2" 
    :class="{ 'cursor-pointer': clickable }"
  >
    <!-- Header section with customizable content -->
    <div class="header-section pa-2 d-flex justify-space-between align-center">
      <div class="d-flex align-center">
        <v-icon v-if="icon" class="mr-3" size="20" color="white">{{ icon }}</v-icon>
        <!-- Custom title template or default title -->
        <slot name="title" :title="title">
          <div class="text-body-1 text-white">{{ title }}</div>
        </slot>
      </div>
      
      <!-- Action buttons on header background -->
      <div class="d-flex align-center">
        <slot name="header-actions" />
      </div>
    </div>

    <!-- Content section -->
    <div class="content-section pa-2">
      <slot />
    </div>
  </v-card>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  icon?: string
  clickable?: boolean
}

withDefaults(defineProps<Props>(), {
  title: '',
  icon: '',
  clickable: false
})
</script>

<style scoped>
.property-card {
  border-radius: 8px !important;
  overflow: hidden;
}

.property-card.cursor-pointer {
  cursor: pointer;
}

.property-card.cursor-pointer:hover {
  background-color: rgba(46, 125, 50, 0.04);
}

.header-section {
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  border-radius: 8px 8px 0 0;
}

.content-section {
  background: linear-gradient(135deg, #F9FBE7 0%, #F1F8E9 100%);
}
</style> 