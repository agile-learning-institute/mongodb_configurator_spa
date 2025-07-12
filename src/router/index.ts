import { createRouter, createWebHistory } from 'vue-router'
import { useConfig } from '@/composables/useConfig'

// Lazy-loaded page components
const WelcomePage = () => import('@/pages/WelcomePage.vue')
const AdminPage = () => import('@/pages/AdminPage.vue')
const ConfigurationsPage = () => import('@/pages/ConfigurationsPage.vue')
const ConfigurationDetailPage = () => import('@/pages/ConfigurationDetailPage.vue')
const DictionariesPage = () => import('@/pages/DictionariesPage.vue')
const DictionaryDetailPage = () => import('@/pages/DictionaryDetailPage.vue')
const TypesPage = () => import('@/pages/TypesPage.vue')
const TypeDetailPage = () => import('@/pages/TypeDetailPage.vue')
const EnumeratorsPage = () => import('@/pages/EnumeratorsPage.vue')
const EnumeratorDetailPage = () => import('@/pages/EnumeratorDetailPage.vue')
const TestDataPage = () => import('@/pages/TestDataPage.vue')
const TestDataDetailPage = () => import('@/pages/TestDataDetailPage.vue')
const MigrationsPage = () => import('@/pages/MigrationsPage.vue')
const MigrationsDetailPage = () => import('@/pages/MigrationsDetailPage.vue')
const EventsPage = () => import('@/pages/EventsPage.vue')

const routes = [
  {
    path: '/',
    name: 'Welcome',
    component: WelcomePage,
    meta: { title: 'Welcome' }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminPage,
    meta: { title: 'Admin' }
  },
  {
    path: '/configurations',
    name: 'Configurations',
    component: ConfigurationsPage,
    meta: { title: 'Configurations' }
  },
  {
    path: '/configurations/:fileName',
    name: 'ConfigurationDetail',
    component: ConfigurationDetailPage,
    meta: { title: 'Configuration Detail' }
  },
  {
    path: '/dictionaries',
    name: 'Dictionaries',
    component: DictionariesPage,
    meta: { title: 'Dictionaries' }
  },
  {
    path: '/dictionaries/:fileName',
    name: 'DictionaryDetail',
    component: DictionaryDetailPage,
    meta: { title: 'Dictionary Detail' }
  },
  {
    path: '/types',
    name: 'Types',
    component: TypesPage,
    meta: { title: 'Types' }
  },
  {
    path: '/types/:fileName',
    name: 'TypeDetail',
    component: TypeDetailPage,
    meta: { title: 'Type Detail' }
  },
  {
    path: '/enumerators',
    name: 'Enumerators',
    component: EnumeratorsPage,
    meta: { title: 'Enumerators' }
  },
  {
    path: '/enumerators/:fileName',
    name: 'EnumeratorDetail',
    component: EnumeratorDetailPage,
    meta: { title: 'Enumerator Detail' }
  },
  {
    path: '/test_data',
    name: 'TestData',
    component: TestDataPage,
    meta: { title: 'Test Data' }
  },
  {
    path: '/test_data/:fileName',
    name: 'TestDataDetail',
    component: TestDataDetailPage,
    meta: { title: 'Test Data Detail' }
  },
  {
    path: '/migrations',
    name: 'Migrations',
    component: MigrationsPage,
    meta: { title: 'Migrations' }
  },
  {
    path: '/migrations/:fileName',
    name: 'MigrationsDetail',
    component: MigrationsDetailPage,
    meta: { title: 'Migration Detail' }
  },
  {
    path: '/events',
    name: 'Events',
    component: EventsPage,
    meta: { title: 'Events' }
  },
  // Catch all route
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Global route guard for read-only mode
router.beforeEach((to, _from, next) => {
  const { isReadOnly } = useConfig()
  
  // If in read-only mode, prevent access to edit pages
  if (isReadOnly.value && to.meta.requiresEdit) {
    next({ name: 'Welcome' })
    return
  }
  
  next()
})

export default router 