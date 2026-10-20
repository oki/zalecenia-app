<script setup>
import { useUiStore } from '../stores/ui.js'
const ui = useUiStore()
const cls = { success: 'alert-success', error: 'alert-error', info: 'alert-info', warning: 'alert-warning' }
</script>

<template>
  <div class="toast toast-top toast-center z-50 pt-safe" aria-live="polite">
    <div v-for="t in ui.toasts" :key="t.id" class="alert shadow-lg max-w-sm" :class="cls[t.type]" role="status">
      <span>{{ t.message }}</span>
    </div>
  </div>
</template>
