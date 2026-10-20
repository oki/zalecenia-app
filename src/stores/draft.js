import { defineStore } from 'pinia'
import { computed, watch } from 'vue'
import { persistedRef, readStored } from '../lib/storage.js'
import { todayISO } from '../lib/text.js'
import { uid } from '../lib/ids.js'
import { AGE_GROUPS, DEFAULT_AGE_GROUP, matchesGroup } from '../data/ageGroups.js'
import { useCatalogStore } from './catalog.js'

function emptyDraft() {
  return {
    step: 1,
    childName: '',
    date: todayISO(),
    ageGroup: DEFAULT_AGE_GROUP,
    // id zalecenia -> treść zmieniona na ten wydruk (null = oryginał)
    selected: {},
    extra: [],
  }
}

function loadDraft() {
  const stored = readStored('draft')
  const base = emptyDraft()
  if (!stored || typeof stored !== 'object') return base
  return {
    step: [1, 2, 3, 4].includes(stored.step) ? stored.step : 1,
    childName: typeof stored.childName === 'string' ? stored.childName : '',
    date: typeof stored.date === 'string' ? stored.date : base.date,
    ageGroup: AGE_GROUPS.some((g) => g.id === stored.ageGroup) ? stored.ageGroup : DEFAULT_AGE_GROUP,
    selected: stored.selected && typeof stored.selected === 'object' ? stored.selected : {},
    extra: Array.isArray(stored.extra)
      ? stored.extra.filter((e) => e && typeof e.text === 'string').map((e) => ({ id: e.id || uid(), text: e.text }))
      : [],
  }
}

export const useDraftStore = defineStore('draft', () => {
  const catalog = useCatalogStore()
  const draft = persistedRef('draft', loadDraft())

  // Usuń zaznaczenia zaleceń, które zniknęły z katalogu lub nie pasują do grupy wiekowej.
  function prune() {
    const sel = draft.value.selected
    for (const id of Object.keys(sel)) {
      const entry = catalog.itemIndex.get(id)
      if (!entry || !matchesGroup(entry.item.age, draft.value.ageGroup)) delete sel[id]
    }
  }
  watch(() => [catalog.itemIndex, draft.value.ageGroup], prune, { immediate: true })

  const selectedCount = computed(() => Object.keys(draft.value.selected).length)

  function isSelected(id) {
    return id in draft.value.selected
  }

  function toggle(id, on = !isSelected(id)) {
    if (on) draft.value.selected[id] = draft.value.selected[id] ?? null
    else delete draft.value.selected[id]
  }

  function textFor(item) {
    return draft.value.selected[item.id] ?? item.text
  }

  function setOverride(item, text) {
    const value = text.trim()
    draft.value.selected[item.id] = !value || value === item.text ? null : value
  }

  function addExtra(text = '') {
    const entry = { id: uid(), text }
    draft.value.extra.push(entry)
    return entry
  }

  function removeExtra(id) {
    draft.value.extra = draft.value.extra.filter((e) => e.id !== id)
  }

  /** Dane gotowe do wydruku: kategorie w kolejności katalogu, tylko z zaznaczonymi pozycjami. */
  const printSections = computed(() =>
    catalog.categories
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        items: cat.items.filter((it) => isSelected(it.id)).map((it) => ({ id: it.id, text: textFor(it) })),
      }))
      .filter((s) => s.items.length),
  )

  const printExtra = computed(() => draft.value.extra.map((e) => e.text.trim()).filter(Boolean))

  function reset() {
    draft.value = emptyDraft()
  }

  return {
    draft,
    selectedCount,
    isSelected,
    toggle,
    textFor,
    setOverride,
    addExtra,
    removeExtra,
    printSections,
    printExtra,
    reset,
  }
})
