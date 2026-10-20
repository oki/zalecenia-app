<script setup>
import Icon from './Icon.vue'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '../stores/settings.js'

const { settings } = storeToRefs(useSettingsStore())

const links = [
  { to: '/', label: 'Konsultacja', icon: 'consultation' },
  { to: '/katalog', label: 'Katalog', icon: 'catalog' },
  { to: '/ustawienia', label: 'Ustawienia', icon: 'settings' },
]
</script>

<template>
  <header class="sticky top-0 z-30 bg-base-100/90 backdrop-blur border-b border-base-300 pt-safe">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
      <RouterLink to="/" class="flex items-center gap-3 min-w-0 mr-auto" aria-label="Strona główna">
        <img v-if="settings.logo" :src="settings.logo" alt="" class="h-9 w-auto max-w-24 object-contain dark:bg-white dark:rounded-md dark:p-0.5" />
        <span class="font-display font-semibold text-lg truncate">{{ settings.appName || 'Zalecenia' }}</span>
      </RouterLink>
      <nav aria-label="Menu główne">
        <ul class="flex items-center gap-1">
          <li v-for="link in links" :key="link.to">
            <RouterLink
              :to="link.to"
              class="btn btn-ghost min-h-11 h-11 px-3 gap-2 font-medium"
              active-class="!bg-primary/10 !text-primary"
              exact-active-class="!bg-primary/10 !text-primary"
              :aria-label="link.label"
            >
              <Icon :name="link.icon" />
              <span class="hidden md:inline">{{ link.label }}</span>
            </RouterLink>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>
