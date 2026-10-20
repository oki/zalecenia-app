<script setup>
import { watchEffect, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import ToastHost from './components/ToastHost.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
import UpdatePrompt from './components/UpdatePrompt.vue'
import PrintRoot from './components/PrintRoot.vue'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from './stores/settings.js'
import { useUiStore } from './stores/ui.js'
import { onStorageError } from './lib/storage.js'

const route = useRoute()
const { settings } = storeToRefs(useSettingsStore())
const ui = useUiStore()

watchEffect(() => {
  const name = settings.value.appName || 'Zalecenia'
  document.title = route.meta.title ? `${route.meta.title} · ${name}` : name
})

let off
onMounted(() => {
  off = onStorageError(() => ui.toast('Nie udało się zapisać danych – brak miejsca w pamięci przeglądarki.', 'error', 6000))
})
onUnmounted(() => off?.())
</script>

<template>
  <div class="min-h-dvh flex flex-col">
    <AppHeader />
    <main class="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6">
      <RouterView />
    </main>
  </div>
  <ToastHost />
  <ConfirmDialog />
  <UpdatePrompt />
  <PrintRoot />
</template>
