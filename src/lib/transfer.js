import { sanitizeCatalog } from './catalogData.js'
import { sanitizeSettings } from '../stores/settings.js'
import { todayISO } from './text.js'

export const APP_ID = 'zalecenia'
export const FILE_VERSION = 1

export function buildExport({ catalog, settings }) {
  const data = { app: APP_ID, version: FILE_VERSION, exportedAt: new Date().toISOString() }
  if (catalog) data.catalog = catalog
  if (settings) data.settings = settings
  return data
}

/** Parsuje i waliduje plik importu. Zwraca { catalog?, settings? } albo rzuca Error. */
export function parseImport(text) {
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('Plik nie jest prawidłowym plikiem JSON.')
  }
  if (!data || data.app !== APP_ID) throw new Error('To nie jest plik eksportu aplikacji Zalecenia.')
  if (typeof data.version !== 'number' || data.version > FILE_VERSION) {
    throw new Error('Plik pochodzi z nowszej wersji aplikacji.')
  }
  const out = {}
  if ('catalog' in data) out.catalog = sanitizeCatalog(data.catalog)
  if ('settings' in data) out.settings = sanitizeSettings(data.settings)
  if (!out.catalog && !out.settings) throw new Error('Plik nie zawiera katalogu ani ustawień.')
  return out
}

export function downloadJSON(data, name = `zalecenia-${todayISO()}.json`) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
