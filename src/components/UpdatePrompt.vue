<script setup>
import { useRegisterSW } from 'virtual:pwa-register/vue'

const { needRefresh, offlineReady, updateServiceWorker } = useRegisterSW({ immediate: true })

function close() {
  needRefresh.value = false
  offlineReady.value = false
}
</script>

<template>
  <div v-if="needRefresh || offlineReady" class="toast toast-end toast-bottom z-50 pb-safe" role="alert">
    <div class="alert bg-base-100 border-base-300 shadow-lg flex-wrap max-w-sm">
      <span v-if="needRefresh">Dostępna jest nowa wersja aplikacji.</span>
      <span v-else>Aplikacja jest gotowa do pracy offline.</span>
      <div class="flex gap-2">
        <button v-if="needRefresh" type="button" class="btn btn-primary btn-sm min-h-11" @click="updateServiceWorker(true)">
          Odśwież
        </button>
        <button type="button" class="btn btn-ghost btn-sm min-h-11" @click="close">Zamknij</button>
      </div>
    </div>
  </div>
</template>
