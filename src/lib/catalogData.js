import { SEED } from '../data/seedCatalog.js'
import { normalizeTag } from '../data/ageGroups.js'
import { uid } from './ids.js'

/** Katalog: [{ id, name, items: [{ id, text, age }] }] – kolejność = kolejność tablic. */
export function buildSeedCatalog() {
  const categories = []
  const byName = new Map()
  for (const [name, text, age] of SEED) {
    let cat = byName.get(name)
    if (!cat) {
      cat = { id: uid(), name, items: [] }
      byName.set(name, cat)
      categories.push(cat)
    }
    cat.items.push({ id: uid(), text, age: normalizeTag(age) })
  }
  return categories
}

/** Walidacja i oczyszczenie katalogu z importu. Rzuca Error z opisem po polsku. */
export function sanitizeCatalog(input) {
  if (!Array.isArray(input)) throw new Error('Katalog w pliku ma nieprawidłowy format.')
  const seen = new Set()
  const freshId = (id) => {
    const ok = typeof id === 'string' && id && !seen.has(id)
    const out = ok ? id : uid()
    seen.add(out)
    return out
  }
  return input.map((cat, i) => {
    if (!cat || typeof cat.name !== 'string' || !cat.name.trim()) {
      throw new Error(`Kategoria nr ${i + 1} nie ma nazwy.`)
    }
    if (!Array.isArray(cat.items)) throw new Error(`Kategoria „${cat.name}” nie ma listy zaleceń.`)
    return {
      id: freshId(cat.id),
      name: cat.name.trim(),
      items: cat.items
        .filter((it) => it && typeof it.text === 'string' && it.text.trim())
        .map((it) => ({ id: freshId(it.id), text: it.text.trim(), age: normalizeTag(it.age) })),
    }
  })
}
