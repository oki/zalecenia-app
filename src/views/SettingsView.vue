<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import Icon from '../components/Icon.vue'
import { useSettingsStore } from '../stores/settings.js'
import { useCatalogStore } from '../stores/catalog.js'
import { useUiStore } from '../stores/ui.js'
import { prepareLogo } from '../lib/image.js'
import { buildExport, parseImport, downloadJSON } from '../lib/transfer.js'
import { plural, CATEGORY_FORMS, ITEM_FORMS } from '../lib/text.js'

const settingsStore = useSettingsStore()
const { settings } = storeToRefs(settingsStore)
const catalog = useCatalogStore()
const ui = useUiStore()

const logoInput = ref(null)
const importInput = ref(null)
const exportCatalog = ref(true)
const exportSettings = ref(true)

async function onLogo(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  try {
    settings.value.logo = await prepareLogo(file)
    ui.toast('Zapisano logo.')
  } catch (err) {
    ui.toast(err.message, 'error')
  }
}

async function removeLogo() {
  const ok = await ui.confirm({ title: 'Usunąć logo?', confirmLabel: 'Usuń', danger: true })
  if (ok) settings.value.logo = ''
}

function doExport() {
  downloadJSON(
    buildExport({
      catalog: exportCatalog.value ? catalog.categories : null,
      settings: exportSettings.value ? settings.value : null,
    }),
  )
  ui.toast('Wyeksportowano plik.')
}

async function onImport(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  let data
  try {
    data = parseImport(await file.text())
  } catch (err) {
    return ui.toast(err.message, 'error', 6000)
  }
  const parts = []
  if (data.catalog) {
    const items = data.catalog.reduce((n, c) => n + c.items.length, 0)
    parts.push(`• katalog: ${plural(data.catalog.length, CATEGORY_FORMS)}, ${plural(items, ITEM_FORMS)}`)
  }
  if (data.settings) parts.push(`• ustawienia${data.settings.logo ? ' (z logo)' : ''}`)
  const ok = await ui.confirm({
    title: 'Zastąpić dane z pliku?',
    message: `Plik „${file.name}” zawiera:\n${parts.join('\n')}\n\nObecne dane w tych sekcjach zostaną zastąpione.`,
    confirmLabel: 'Zastąp',
    danger: true,
  })
  if (!ok) return
  if (data.catalog) catalog.replaceAll(data.catalog)
  if (data.settings) settingsStore.replaceAll(data.settings)
  ui.toast('Zaimportowano dane.')
}
</script>

<template>
  <div class="py-4 sm:py-6 space-y-4 max-w-3xl">
    <h1 class="text-xl sm:text-2xl font-semibold">Ustawienia</h1>

    <!-- Logo -->
    <section class="bg-base-100 rounded-box border border-base-300 p-4 sm:p-6 space-y-4">
      <div>
        <h2 class="text-lg font-semibold">Logo</h2>
        <p class="text-sm text-base-content/60">Wyświetlane w nagłówku aplikacji i na karcie A4.</p>
      </div>
      <div class="flex flex-wrap items-center gap-4">
        <div class="w-32 h-20 rounded-field border border-dashed border-base-300 grid place-items-center bg-white overflow-hidden">
          <img v-if="settings.logo" :src="settings.logo" alt="Podgląd logo" class="max-w-full max-h-full object-contain p-1" />
          <Icon v-else name="image" :size="28" class="text-gray-400" />
        </div>
        <div class="flex flex-wrap gap-2">
          <button type="button" class="btn btn-outline min-h-11 gap-2" @click="logoInput.click()">
            <Icon name="upload" :size="18" /> {{ settings.logo ? 'Zmień logo' : 'Wybierz plik' }}
          </button>
          <button v-if="settings.logo" type="button" class="btn btn-ghost min-h-11 text-error gap-2" @click="removeLogo">
            <Icon name="trash" :size="18" /> Usuń
          </button>
        </div>
        <input ref="logoInput" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" class="hidden" @change="onLogo" />
      </div>
    </section>

    <!-- Teksty -->
    <section class="bg-base-100 rounded-box border border-base-300 p-4 sm:p-6 space-y-4">
      <h2 class="text-lg font-semibold">Aplikacja i karta</h2>
      <label class="block">
        <span class="block text-sm font-medium mb-1.5">Nazwa aplikacji</span>
        <input v-model="settings.appName" type="text" class="input w-full h-12 text-base" placeholder="Zalecenia" />
      </label>
      <label class="block">
        <span class="block text-sm font-medium mb-1.5">Tytuł karty</span>
        <input v-model="settings.cardTitle" type="text" class="input w-full h-12 text-base" />
      </label>
      <label class="block">
        <span class="block text-sm font-medium mb-1.5">Podtytuł karty</span>
        <input v-model="settings.cardSubtitle" type="text" class="input w-full h-12 text-base" />
      </label>
      <label class="block">
        <span class="block text-sm font-medium mb-1.5">Stopka karty</span>
        <textarea
          v-model="settings.footer"
          class="textarea w-full text-base"
          rows="2"
          placeholder="np. Centrum Rozwoju Dziecka · Miasto, ul. Przykładowa 1 · tel. 123 456 789"
        ></textarea>
      </label>
      <label class="block">
        <span class="block text-sm font-medium mb-1.5">Terapeuta (domyślnie na karcie)</span>
        <input v-model="settings.therapist" type="text" class="input w-full h-12 text-base" />
      </label>
      <div class="space-y-3">
        <label class="flex items-center gap-3 min-h-11 cursor-pointer">
          <input v-model="settings.showSignature" type="checkbox" class="toggle toggle-primary" />
          <span class="font-medium">Miejsce na podpis / pieczątkę</span>
        </label>
        <label v-if="settings.showSignature" class="block">
          <span class="block text-sm font-medium mb-1.5">Podpis pod linią</span>
          <input v-model="settings.signatureLabel" type="text" class="input w-full h-12 text-base" />
        </label>
      </div>
    </section>

    <!-- Eksport / import -->
    <section class="bg-base-100 rounded-box border border-base-300 p-4 sm:p-6 space-y-4">
      <div>
        <h2 class="text-lg font-semibold">Eksport i import</h2>
        <p class="text-sm text-base-content/60">
          Dane są zapisane tylko na tym urządzeniu. Eksport pozwala zrobić kopię zapasową lub przenieść je na inne urządzenie.
        </p>
      </div>

      <fieldset class="space-y-2">
        <legend class="text-sm font-medium mb-1">Co wyeksportować?</legend>
        <label class="flex items-center gap-3 min-h-11 cursor-pointer">
          <input v-model="exportCatalog" type="checkbox" class="checkbox checkbox-primary" />
          Katalog zaleceń <span class="text-base-content/60 text-sm">({{ catalog.itemCount }})</span>
        </label>
        <label class="flex items-center gap-3 min-h-11 cursor-pointer">
          <input v-model="exportSettings" type="checkbox" class="checkbox checkbox-primary" />
          Ustawienia <span class="text-base-content/60 text-sm">(logo, teksty karty, terapeuta)</span>
        </label>
      </fieldset>

      <div class="flex flex-wrap gap-2">
        <button type="button" class="btn btn-primary min-h-11 gap-2" :disabled="!exportCatalog && !exportSettings" @click="doExport">
          <Icon name="download" :size="18" /> Eksportuj
        </button>
        <button type="button" class="btn btn-outline min-h-11 gap-2" @click="importInput.click()">
          <Icon name="upload" :size="18" /> Importuj z pliku
        </button>
        <input ref="importInput" type="file" accept="application/json,.json" class="hidden" @change="onImport" />
      </div>
      <p class="text-xs text-base-content/60">Import zastępuje sekcje zawarte w pliku (katalog i/lub ustawienia).</p>
    </section>
  </div>
</template>
