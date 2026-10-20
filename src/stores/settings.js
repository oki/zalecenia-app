import { defineStore } from 'pinia'
import { persistedRef, readStored } from '../lib/storage.js'

export const DEFAULT_SETTINGS = {
  appName: 'Zalecenia',
  cardTitle: 'KONSULTACJA NEUROLOGOPEDYCZNA',
  cardSubtitle: 'ZALECENIA',
  footer: '',
  showSignature: true,
  signatureLabel: 'Podpis terapeuty',
  logo: '',
  therapist: '',
}

export function sanitizeSettings(input) {
  if (!input || typeof input !== 'object') throw new Error('Ustawienia w pliku mają nieprawidłowy format.')
  const out = { ...DEFAULT_SETTINGS }
  for (const [key, def] of Object.entries(DEFAULT_SETTINGS)) {
    if (typeof input[key] === typeof def) out[key] = input[key]
  }
  if (out.logo && !/^data:image\/(png|jpeg|webp|svg\+xml);base64,/.test(out.logo)) out.logo = ''
  return out
}

export const useSettingsStore = defineStore('settings', () => {
  let initial
  try {
    initial = sanitizeSettings(readStored('settings') ?? {})
  } catch {
    initial = { ...DEFAULT_SETTINGS }
  }
  const settings = persistedRef('settings', initial)

  function replaceAll(data) {
    // terapeuta to ustawienie lokalne – zostaje, jeśli plik go nie zawiera
    const next = sanitizeSettings(data)
    if (!data.therapist) next.therapist = settings.value.therapist
    settings.value = next
  }

  return { settings, replaceAll }
})
