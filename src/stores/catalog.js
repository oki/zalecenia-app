import { defineStore } from 'pinia'
import { computed } from 'vue'
import { persistedRef, readStored } from '../lib/storage.js'
import { buildSeedCatalog, sanitizeCatalog } from '../lib/catalogData.js'
import { normalizeTag } from '../data/ageGroups.js'
import { uid } from '../lib/ids.js'

export const useCatalogStore = defineStore('catalog', () => {
  let initial
  try {
    initial = sanitizeCatalog(readStored('catalog'))
  } catch {
    initial = buildSeedCatalog()
  }
  const categories = persistedRef('catalog', initial)

  /** id zalecenia -> { item, category } */
  const itemIndex = computed(() => {
    const map = new Map()
    for (const category of categories.value) {
      for (const item of category.items) map.set(item.id, { item, category })
    }
    return map
  })

  const itemCount = computed(() => itemIndex.value.size)

  function findCategory(id) {
    return categories.value.find((c) => c.id === id)
  }

  function addCategory(name) {
    const category = { id: uid(), name: name.trim(), items: [] }
    categories.value.push(category)
    return category
  }

  function renameCategory(id, name) {
    const cat = findCategory(id)
    if (cat) cat.name = name.trim()
  }

  function removeCategory(id) {
    categories.value = categories.value.filter((c) => c.id !== id)
  }

  function moveCategory(id, delta) {
    const list = categories.value
    const from = list.findIndex((c) => c.id === id)
    const to = from + delta
    if (from < 0 || to < 0 || to >= list.length) return
    const [cat] = list.splice(from, 1)
    list.splice(to, 0, cat)
  }

  function addItem(categoryId, { text, age }) {
    const cat = findCategory(categoryId)
    if (!cat) return null
    const item = { id: uid(), text: text.trim(), age: normalizeTag(age) }
    cat.items.push(item)
    return item
  }

  /** Aktualizacja treści / wieku, opcjonalnie przeniesienie do innej kategorii (na koniec). */
  function updateItem(itemId, { text, age, categoryId }) {
    const entry = itemIndex.value.get(itemId)
    if (!entry) return
    const { item, category } = entry
    item.text = text.trim()
    item.age = normalizeTag(age)
    if (categoryId && categoryId !== category.id) {
      const target = findCategory(categoryId)
      if (!target) return
      category.items.splice(category.items.indexOf(item), 1)
      target.items.push(item)
    }
  }

  function removeItem(itemId) {
    const entry = itemIndex.value.get(itemId)
    if (!entry) return
    entry.category.items.splice(entry.category.items.indexOf(entry.item), 1)
  }

  function moveItem(itemId, delta) {
    const entry = itemIndex.value.get(itemId)
    if (!entry) return
    const list = entry.category.items
    const from = list.indexOf(entry.item)
    const to = from + delta
    if (to < 0 || to >= list.length) return
    list.splice(from, 1)
    list.splice(to, 0, entry.item)
  }

  function resetToDefault() {
    categories.value = buildSeedCatalog()
  }

  function replaceAll(data) {
    categories.value = sanitizeCatalog(data)
  }

  return {
    categories,
    itemIndex,
    itemCount,
    findCategory,
    addCategory,
    renameCategory,
    removeCategory,
    moveCategory,
    addItem,
    updateItem,
    removeItem,
    moveItem,
    resetToDefault,
    replaceAll,
  }
})
