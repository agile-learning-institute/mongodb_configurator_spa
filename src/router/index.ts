import { createRouter, createWebHistory } from 'vue-router'
import { useConfig } from '@/composables/useConfig'

// Lazy-loaded page components
const WelcomePage = () => import('@/pages/WelcomePage.vue')
const AdminPage = () => import('@/pages/AdminPage.vue')
const ConfigurationDetailPage = () => import('@/pages/ConfigurationDetailPage.vue')
const DictionariesPage = () => import('@/pages/DictionariesPage.vue')
const DictionaryDetailPage = () => import('@/pages/DictionaryDetailPage.vue')
const TypesPage = () => import('@/pages/TypesPage.vue')
const TypeDetailPage = () => import('@/pages/TypeDetailPage.vue')
const EnumeratorsRedirectPage = () => import('@/pages/EnumeratorsRedirectPage.vue')
const EnumeratorCardsPage = () => import('@/pages/EnumeratorCardsPage.vue')
const EnumeratorDetailPage = () => import('@/pages/EnumeratorDetailPage.vue')
const TestDataDetailPage = () => import('@/pages/TestDataDetailPage.vue')
const MigrationsDetailPage = () => import('@/pages/MigrationsDetailPage.vue')
const EventViewerPage = () => import('@/pages/EventViewerPage.vue')

const routes = [
  {
    path: '/',
    redirect: '/dictionaries'
  },
  {
    path: '/help',
    name: 'Help',
    component: WelcomePage,
    meta: { title: 'Help' }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminPage,
    meta: { title: 'Admin' }
  },
  {
    path: '/configurations',
    redirect: '/dictionaries'
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
    name: 'EnumeratorsRedirect',
    component: EnumeratorsRedirectPage,
    meta: { title: 'Enumerators' }
  },
  {
    path: '/enumerators/:fileName',
    name: 'EnumeratorCards',
    component: EnumeratorCardsPage,
    meta: { title: 'Enumerators' }
  },
  {
    path: '/enumerators/:fileName/:enumerationIndex',
    name: 'EnumeratorDetail',
    component: EnumeratorDetailPage,
    meta: { title: 'Enumerator Detail' }
  },
  {
    path: '/test_data',
    redirect: '/dictionaries'
  },
  {
    path: '/test_data/:fileName',
    name: 'TestDataDetail',
    component: TestDataDetailPage,
    meta: { title: 'Test Data Detail' }
  },
  {
    path: '/migrations',
    redirect: '/dictionaries'
  },
  {
    path: '/migrations/:fileName',
    name: 'MigrationsDetail',
    component: MigrationsDetailPage,
    meta: { title: 'Migration Detail' }
  },
  {
    path: '/event-viewer',
    name: 'EventViewer',
    component: EventViewerPage,
    meta: { title: 'Event Viewer' }
  },
  // Catch all route
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dictionaries'
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
    next({ path: '/dictionaries' })
    return
  }
  
  next()
})

export default router 