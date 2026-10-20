import { createRouter, createWebHistory } from 'vue-router'
import ConsultationView from './views/ConsultationView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'consultation', component: ConsultationView, meta: { title: 'Konsultacja' } },
    {
      path: '/katalog',
      name: 'catalog',
      component: () => import('./views/CatalogView.vue'),
      meta: { title: 'Katalog zaleceń' },
    },
    {
      path: '/ustawienia',
      name: 'settings',
      component: () => import('./views/SettingsView.vue'),
      meta: { title: 'Ustawienia' },
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
