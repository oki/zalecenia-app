import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const toasts = ref([])
  const confirmState = ref(null)

  function toast(message, type = 'success', timeout = 3500) {
    const id = Math.random().toString(36).slice(2)
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id)
    }, timeout)
  }

  /** Własne okno potwierdzenia (bez window.confirm). Zwraca Promise<boolean>. */
  function confirm({ title, message = '', confirmLabel = 'Potwierdź', danger = false }) {
    return new Promise((resolve) => {
      confirmState.value = { title, message, confirmLabel, danger, resolve }
    })
  }

  function closeConfirm(result) {
    confirmState.value?.resolve(result)
    confirmState.value = null
  }

  return { toasts, toast, confirmState, confirm, closeConfirm }
})
