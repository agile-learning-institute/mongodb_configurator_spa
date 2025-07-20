<template>
  <v-card class="mb-4">
    <v-card-title>
      Actions
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" sm="6" md="3">
          <v-btn
            block
            color="primary"
            @click="$emit('upload')"
            :disabled="disabled"
          >
            <v-icon left>mdi-upload</v-icon>
            Upload
          </v-btn>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-btn
            block
            color="secondary"
            @click="$emit('download')"
            :disabled="disabled || !hasSelection"
          >
            <v-icon left>mdi-download</v-icon>
            Download
          </v-btn>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-btn
            block
            color="success"
            @click="$emit('process')"
            :disabled="disabled || !hasSelection"
          >
            <v-icon left>mdi-play</v-icon>
            Process
          </v-btn>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-btn
            block
            color="error"
            @click="$emit('delete')"
            :disabled="disabled || !hasSelection"
          >
            <v-icon left>mdi-delete</v-icon>
            Delete
          </v-btn>
        </v-col>
      </v-row>
      
      <v-row v-if="showFilters" class="mt-4">
        <v-col cols="12" sm="6" md="3">
          <v-text-field
            v-model="searchQuery"
            label="Search"
            prepend-icon="mdi-magnify"
            clearable
            @input="$emit('search', searchQuery)"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="sortBy"
            :items="sortOptions"
            label="Sort by"
            @change="$emit('sort', sortBy)"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="filterBy"
            :items="filterOptions"
            label="Filter by"
            @change="$emit('filter', filterBy)"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-btn
            block
            @click="$emit('refresh')"
            :loading="loading"
          >
            <v-icon left>mdi-refresh</v-icon>
            Refresh
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  disabled?: boolean
  hasSelection?: boolean
  showFilters?: boolean
  loading?: boolean
  sortOptions?: Array<{ text: string; value: string }>
  filterOptions?: Array<{ text: string; value: string }>
}

withDefaults(defineProps<Props>(), {
  disabled: false,
  hasSelection: false,
  showFilters: true,
  loading: false,
  sortOptions: () => [
    { text: 'Name', value: 'name' },
    { text: 'Date Created', value: 'created_at' },
    { text: 'Date Updated', value: 'updated_at' },
    { text: 'Size', value: 'size' }
  ],
  filterOptions: () => [
    { text: 'All', value: 'all' },
    { text: 'Locked', value: 'locked' },
    { text: 'Unlocked', value: 'unlocked' }
  ]
})

defineEmits<{
  upload: []
  download: []
  process: []
  delete: []
  search: [query: string]
  sort: [sortBy: string]
  filter: [filterBy: string]
  refresh: []
}>()

const searchQuery = ref('')
const sortBy = ref('name')
const filterBy = ref('all')
</script> 