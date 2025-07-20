<template>
  <v-card 
    class="base-card mb-3" 
    :class="{ 'cursor-pointer': clickable }"
    @click="handleClick"
  >
    <!-- Header section with customizable content -->
    <div class="header-section pa-2 d-flex justify-space-between align-center">
      <div class="d-flex align-center">
        <v-icon v-if="icon" class="mr-3" size="24" color="white">{{ icon }}</v-icon>
        <!-- Custom title template or default title -->
        <slot name="title" :title="title">
          <div class="text-h6 text-white">{{ title }}</div>
        </slot>
      </div>
      
      <!-- Action buttons on header background -->
      <div class="d-flex align-center">
        <slot name="header-actions" />
      </div>
    </div>

    <!-- Content section -->
    <div class="content-section pa-4">
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

const props = withDefaults(defineProps<Props>(), {
  title: '',
  icon: '',
  clickable: false
})

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}
</script>

<style scoped>
.base-card {
  border-radius: 12px !important;
  overflow: hidden;
}

.base-card.cursor-pointer {
  cursor: pointer;
}

.base-card.cursor-pointer:hover {
  background-color: rgba(46, 125, 50, 0.04);
}

.header-section {
  background: linear-gradient(135deg, #2E7D32 0%, #388E3C 100%);
  border-radius: 12px 12px 0 0;
}

.content-section {
  background: linear-gradient(135deg, #F1F8E9 0%, #E8F5E8 100%);
}
</style> 