<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" location="left" width="260">
      <v-list density="compact" nav>
        <v-list-item>
          <v-list-item-title class="text-h6">Navigation</v-list-item-title>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item v-for="item in navItems" :key="item.title" :to="item.to" link>
          <template v-slot:prepend>
            <v-icon>{{ item.icon }}</v-icon>
          </template>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar color="primary" theme="dark">
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-toolbar-title>MongoDB Configurator</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon to="/admin" title="Admin">
        <v-icon>mdi-cog</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const drawer = ref(true)

const navItems = [
  { title: 'Configurations', icon: 'mdi-database', to: '/configurations' },
  { title: 'Dictionaries', icon: 'mdi-book-open-variant', to: '/dictionaries' },
  { title: 'Types', icon: 'mdi-shape', to: '/types' },
  { title: 'Enumerators', icon: 'mdi-format-list-bulleted', to: '/enumerators' },
  { title: 'Test Data', icon: 'mdi-file-document', to: '/test_data' },
  { title: 'Migrations', icon: 'mdi-swap-horizontal', to: '/migrations' },
  { title: 'Events', icon: 'mdi-calendar-clock', to: '/events' },
  { title: 'Admin', icon: 'mdi-cog', to: '/admin' },
]
</script> 