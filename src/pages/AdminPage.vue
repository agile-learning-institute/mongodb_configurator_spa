<template>
  <v-container>
    <v-row>
      <v-col>
        <div class="d-flex justify-space-between align-center mb-4">
          <h1>Admin Configuration</h1>
          <v-btn
            variant="outlined"
            @click="$router.push('/')"
          >
            Back to Collections
          </v-btn>
        </div>

        <v-card v-if="loading">
          <v-card-text>
            <v-progress-linear indeterminate />
          </v-card-text>
        </v-card>

        <div v-else-if="config">
          <v-row>
            <v-col cols="12" md="6">
              <h2>Configuration Items</h2>
              <v-list>
                <v-list-item
                  v-for="item in config.config_items"
                  :key="item.name"
                >
                  <v-list-item-title>{{ item.name }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ item.value }} ({{ item.from }})
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>

            <v-col cols="12" md="6">
              <h2>Token Information</h2>
              <v-list>
                <v-list-item>
                  <v-list-item-title>User ID</v-list-item-title>
                  <v-list-item-subtitle>{{ config.token.user_id }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item v-if="config.token.from_ip">
                  <v-list-item-title>IP Address</v-list-item-title>
                  <v-list-item-subtitle>{{ config.token.from_ip }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>Roles</v-list-item-title>
                  <v-list-item-subtitle>
                    <v-chip
                      v-for="role in config.token.roles"
                      :key="role"
                      class="mr-1"
                    >
                      {{ role }}
                    </v-chip>
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </div>

        <v-card v-else>
          <v-card-text>
            <p class="text-center">Configuration not available.</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useConfig } from '@/composables/useConfig'

const { config, loading, fetchConfig } = useConfig()

onMounted(async () => {
  await fetchConfig()
})
</script> 