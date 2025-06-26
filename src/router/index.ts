import { createRouter, createWebHistory } from 'vue-router'
import CollectionsPage from '../pages/CollectionsPage.vue'
import CollectionPage from '../pages/CollectionPage.vue'
import AdminPage from '../pages/AdminPage.vue'
import OperationsPage from '../pages/OperationsPage.vue'
import ErrorsPage from '../pages/ErrorsPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/collections'
    },
    {
      path: '/collections',
      name: 'collections',
      component: CollectionsPage
    },
    {
      path: '/collection/:name',
      name: 'collection',
      component: CollectionPage,
      props: true
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminPage
    },
    {
      path: '/operations',
      name: 'operations',
      component: OperationsPage
    },
    {
      path: '/errors',
      name: 'errors',
      component: ErrorsPage
    }
  ]
})

export default router 