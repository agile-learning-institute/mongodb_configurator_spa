<template>
  <v-card 
    class="property-type-card mb-2" 
    :class="{ 'sub-card': isSubCard }"
  >
    <!-- Header section with customizable content -->
    <div class="header-section pa-2 d-flex justify-space-between align-center">
      <div class="d-flex align-center">
        <v-icon v-if="icon" class="mr-3" :size="isSubCard ? 16 : 20" :color="isSubCard ? 'dark' : 'white'">{{ icon }}</v-icon>
        <!-- Custom title template or default title -->
        <slot name="title" :title="title">
          <div :class="isSubCard ? 'text-body-2 text-dark' : 'text-body-1 text-white'">{{ title }}</div>
        </slot>
        
        <!-- Custom title actions (for type pickers, etc.) -->
        <slot name="header-actions" />
      </div>
      
      <!-- Action buttons on header background -->
      <div class="d-flex align-center">
        <slot name="header-actions" />
      </div>
    </div>

    <!-- Content section -->
    <div v-if="$slots.default" class="content-section pa-2">
      <slot />
    </div>
  </v-card>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  icon?: string
  isSubCard?: boolean
}

withDefaults(defineProps<Props>(), {
  title: '',
  icon: '',
  isSubCard: false
})
</script>

<style scoped>
.property-type-card {
  border-radius: 8px !important;
  overflow: hidden;
}

.property-type-card.sub-card {
  border-radius: 6px !important;
}

.header-section {
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  border-radius: 8px 8px 0 0;
}

.property-type-card.sub-card .header-section {
  background: linear-gradient(135deg, #E8F5E8 0%, #F1F8E9 100%);
  color: #2E7D32;
}

.content-section {
  background: linear-gradient(135deg, #F9FBE7 0%, #F1F8E9 100%);
}

.property-type-card.sub-card .content-section {
  background: linear-gradient(135deg, #FFFFFF 0%, #F9FBE7 100%);
}
</style> 