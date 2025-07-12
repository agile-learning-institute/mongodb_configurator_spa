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
            <v-icon start>mdi-upload</v-icon>
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
            <v-icon start>mdi-download</v-icon>
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
            <v-icon start>mdi-play</v-icon>
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
            <v-icon start>mdi-delete</v-icon>
            Delete
          </v-btn>
        </v-col>
      </v-row>
      
      <v-row class="mt-4">
        <v-col cols="12" sm="6" md="3">
          <v-btn
            block
            @click="$emit('refresh')"
            :loading="loading"
          >
            <v-icon start>mdi-refresh</v-icon>
            Refresh
          </v-btn>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-btn
            block
            variant="outlined"
            @click="$emit('new')"
            :disabled="disabled"
          >
            <v-icon start>mdi-plus</v-icon>
            New
          </v-btn>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-btn
            block
            variant="outlined"
            @click="$emit('lock-all')"
            :disabled="disabled"
          >
            <v-icon start>mdi-lock</v-icon>
            Lock All
          </v-btn>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-btn
            block
            variant="outlined"
            @click="$emit('unlock-all')"
            :disabled="disabled"
          >
            <v-icon start>mdi-lock-open</v-icon>
            Unlock All
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
interface Props {
  disabled?: boolean
  hasSelection?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  hasSelection: false,
  loading: false
})

const emit = defineEmits<{
  upload: []
  download: []
  process: []
  delete: []
  refresh: []
  new: []
  'lock-all': []
  'unlock-all': []
}>()
</script> 