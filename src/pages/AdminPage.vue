<template>
  <v-container fluid class="pa-0 admin-bg min-h-screen">
    <v-row justify="center" class="ma-0 pa-0">
      <v-col cols="12" md="8" lg="6" class="py-8">
        <v-card class="mb-6 elevation-6" color="primary" variant="tonal">
          <v-card-title class="d-flex justify-space-between align-center spa-title-card">
            <span class="text-h6">Admin</span>
            <v-btn
              color="primary"
              variant="outlined"
              size="small"
              class="ml-2"
              @click="$router.push('/')"
            >
              Back to Collections
            </v-btn>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text class="d-flex align-center justify-center">
            <span class="text-h6 mr-4">SPA Built At:</span>
            <span class="text-h6 font-weight-bold">{{ spaBuiltAt }}</span>
          </v-card-text>
        </v-card>

        <v-card class="mb-6 elevation-3">
          <v-card-title class="text-h6 font-weight-bold">Token Information</v-card-title>
          <v-divider></v-divider>
          <v-list>
            <v-list-item class="py-2">
              <v-list-item-title>User ID</v-list-item-title>
              <v-list-item-subtitle>{{ config?.token?.user_id }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item v-if="config?.token?.from_ip" class="py-2">
              <v-list-item-title>IP Address</v-list-item-title>
              <v-list-item-subtitle>{{ config.token.from_ip }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item class="py-2">
              <v-list-item-title>Roles</v-list-item-title>
              <v-list-item-subtitle>
                <v-chip
                  v-for="role in config?.token?.roles"
                  :key="role"
                  class="mr-1"
                  size="small"
                >
                  {{ role }}
                </v-chip>
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>

        <v-card class="mb-6 elevation-3">
          <v-card-title class="text-h6 font-weight-bold">Configuration Items</v-card-title>
          <v-divider></v-divider>
          <v-list>
            <v-list-item
              v-for="item in config?.config_items"
              :key="item.name"
              class="py-2"
            >
              <v-list-item-title>{{ item.name }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ item.value }} ({{ item.from }})
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>

        <v-card class="mb-6 elevation-3">
          <v-card-title class="text-h6 font-weight-bold">Enumerators</v-card-title>
          <v-divider></v-divider>
          <v-list>
            <v-list-item
              v-for="(value, key) in config?.enumerators"
              :key="key"
              class="py-2"
            >
              <v-list-item-title>{{ key }}</v-list-item-title>
              <v-list-item-subtitle>{{ value }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>

        <v-card class="mb-6 elevation-3">
          <v-card-title class="text-h6 font-weight-bold">Versions</v-card-title>
          <v-divider></v-divider>
          <v-list>
            <v-list-item
              v-for="(version, idx) in config?.versions"
              :key="idx"
              class="py-2"
            >
              <v-list-item-title>{{ version }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useConfig } from '../composables/useConfig'
import { getSpaBuiltAt } from '../utils/buildInfo'

const { config, fetchConfig } = useConfig()
const spaBuiltAt = getSpaBuiltAt()

onMounted(async () => {
  await fetchConfig()
})
</script>

<style scoped>
.admin-bg {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}
.v-card {
  border-radius: 18px;
}
.v-card-title {
  background: #f0f4fa;
}
.spa-title-card {
  min-height: 56px;
}
</style> 