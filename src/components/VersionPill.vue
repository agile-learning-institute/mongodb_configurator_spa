<template>
  <div class="version-pill d-flex align-center" :data-test="dataTest">
    <!-- Previous: always in DOM for constant width, visibility toggled -->
    <div class="version-pill-btn-slot">
      <v-tooltip v-if="hasPrevious" text="Previous version" location="bottom">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            icon="mdi-chevron-left"
            variant="text"
            size="small"
            class="version-pill-btn"
            @click="$emit('previous')"
            :data-test="`${dataTest}-prev-btn`"
          />
        </template>
      </v-tooltip>
      <v-btn
        v-else
        icon="mdi-chevron-left"
        variant="text"
        size="small"
        class="version-pill-btn version-pill-btn-placeholder"
        disabled
        aria-hidden="true"
      />
    </div>

    <!-- Version display: link or plain text -->
    <div class="version-pill-value flex-grow-1 text-center">
      <router-link
        v-if="linkTo"
        :to="linkTo"
        class="version-pill-link text-caption font-weight-medium"
        :data-test="`${dataTest}-value`"
      >
        v{{ displayVersion }}
      </router-link>
      <span
        v-else
        class="text-caption font-weight-medium"
        :data-test="`${dataTest}-value`"
      >
        v{{ displayVersion }}
      </span>
    </div>

    <!-- Next or New: always in DOM for constant width -->
    <div class="version-pill-btn-slot">
      <v-tooltip v-if="showNewButton" text="Create new version" location="bottom">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            icon="mdi-plus"
            variant="text"
            size="small"
            color="primary"
            class="version-pill-btn"
            @click="$emit('newVersion')"
            :data-test="`${dataTest}-new-btn`"
          />
        </template>
      </v-tooltip>
      <v-tooltip v-else-if="hasNext" text="Next version" location="bottom">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            icon="mdi-chevron-right"
            variant="text"
            size="small"
            class="version-pill-btn"
            @click="$emit('next')"
            :data-test="`${dataTest}-next-btn`"
          />
        </template>
      </v-tooltip>
      <v-btn
        v-else
        icon="mdi-chevron-right"
        variant="text"
        size="small"
        class="version-pill-btn version-pill-btn-placeholder"
        disabled
        aria-hidden="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    version: string | number
    hasPrevious?: boolean
    hasNext?: boolean
    showNewButton?: boolean
    linkTo?: string
    dataTest?: string
  }>(),
  {
    hasPrevious: false,
    hasNext: false,
    showNewButton: false,
    linkTo: undefined,
    dataTest: 'version-pill'
  }
)

defineEmits<{
  previous: []
  next: []
  newVersion: []
}>()

const displayVersion = computed(() =>
  typeof props.version === 'number' ? String(props.version) : props.version
)
</script>

<style scoped>
.version-pill {
  min-width: 140px;
  background: rgba(var(--v-theme-surface-variant), 0.5);
  border-radius: 16px;
  padding: 2px 4px;
}

.version-pill-btn-slot {
  width: 32px;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
}

.version-pill-btn-placeholder {
  visibility: hidden;
  pointer-events: none;
}

.version-pill-value {
  min-width: 48px;
}

.version-pill-link {
  color: inherit;
  text-decoration: none;
}

.version-pill-link:hover {
  text-decoration: underline;
}
</style>
