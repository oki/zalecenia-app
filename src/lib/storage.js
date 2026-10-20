import { ref, watch } from 'vue'

const PREFIX = 'zalecenia:v1:'
const listeners = new Set()

/** Zgłaszanie błędów zapisu (np. przepełniony localStorage). */
export function onStorageError(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function readStored(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/** Ref zapisywany automatycznie w localStorage. */
export function persistedRef(key, initial) {
  const state = ref(initial)
  const save = (value) => {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch (err) {
      listeners.forEach((fn) => fn(err))
    }
  }
  // Zapis od razu – np. wygenerowany katalog startowy musi mieć stałe id między uruchomieniami
  save(initial)
  watch(state, save, { deep: true })
  return state
}
