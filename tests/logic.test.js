import { describe, it, expect } from 'vitest'
import { AGE_GROUPS, matchesGroup, normalizeTag } from '../src/data/ageGroups.js'
import { normalize, matchesQuery, plural, CATEGORY_FORMS, ITEM_FORMS } from '../src/lib/text.js'
import { buildSeedCatalog, sanitizeCatalog } from '../src/lib/catalogData.js'
import { parseImport, buildExport } from '../src/lib/transfer.js'
import { sanitizeSettings, DEFAULT_SETTINGS } from '../src/stores/settings.js'

describe('grupy wiekowe', () => {
  const visible = (group) =>
    ['all', 'baby', '1+', '2+', '3+', '2-5'].filter((tag) => matchesGroup(tag, group))

  it('mapuje tagi zgodnie z ustaleniami', () => {
    expect(visible('0-1')).toEqual(['all', 'baby'])
    expect(visible('1-2')).toEqual(['all', 'baby', '1+'])
    expect(visible('2-3')).toEqual(['all', '1+', '2+', '2-5'])
    expect(visible('3-6')).toEqual(['all', '1+', '2+', '3+', '2-5'])
    expect(visible('6-12')).toEqual(['all', '1+', '2+', '3+'])
    expect(visible('any')).toHaveLength(6)
  })

  it('nieznany tag traktuje jak „wszystkie grupy”', () => {
    expect(normalizeTag('xxx')).toBe('all')
    expect(normalizeTag(undefined)).toBe('all')
  })

  it('ma 6 grup', () => expect(AGE_GROUPS).toHaveLength(6))
})

describe('tekst', () => {
  it('wyszukuje bez polskich znaków i wielkości liter', () => {
    expect(normalize('Łyżka ŻÓŁW')).toBe('lyzka zolw')
    expect(matchesQuery('Zgłoś lekarzowi chrapanie', 'zglos CHRAP')).toBe(true)
    expect(matchesQuery('Zgłoś lekarzowi chrapanie', 'zglos zeby')).toBe(false)
    expect(matchesQuery('cokolwiek', '   ')).toBe(true)
  })

  it('odmienia liczebniki', () => {
    expect(plural(1, CATEGORY_FORMS)).toBe('1 kategoria')
    expect(plural(3, CATEGORY_FORMS)).toBe('3 kategorie')
    expect(plural(9, CATEGORY_FORMS)).toBe('9 kategorii')
    expect(plural(12, ITEM_FORMS)).toBe('12 zaleceń')
    expect(plural(22, ITEM_FORMS)).toBe('22 zalecenia')
    expect(plural(57, ITEM_FORMS)).toBe('57 zaleceń')
  })
})

describe('katalog', () => {
  it('buduje katalog startowy z danych', () => {
    const cat = buildSeedCatalog()
    expect(cat).toHaveLength(9)
    expect(cat.flatMap((c) => c.items)).toHaveLength(57)
    expect(cat[0].name).toBe('Higiena jamy ustnej')
    expect(new Set(cat.flatMap((c) => c.items.map((i) => i.id))).size).toBe(57)
  })

  it('czyści importowany katalog', () => {
    const out = sanitizeCatalog([
      { id: 'a', name: ' Kat ', items: [{ id: 'x', text: ' T1 ', age: '2+' }, { text: '', age: 'all' }, { id: 'x', text: 'T2', age: 'zly' }] },
    ])
    expect(out[0].name).toBe('Kat')
    expect(out[0].items).toHaveLength(2)
    expect(out[0].items[0]).toEqual({ id: 'x', text: 'T1', age: '2+' })
    expect(out[0].items[1].id).not.toBe('x') // duplikat id dostaje nowe
    expect(out[0].items[1].age).toBe('all')
  })

  it('odrzuca kategorię bez nazwy', () => {
    expect(() => sanitizeCatalog([{ name: '', items: [] }])).toThrow(/nie ma nazwy/)
  })
})

describe('eksport / import', () => {
  it('przenosi dane w obie strony', () => {
    const catalog = buildSeedCatalog()
    const settings = { ...DEFAULT_SETTINGS, footer: 'Stopka', therapist: 'Anna' }
    const file = JSON.stringify(buildExport({ catalog, settings }))
    const parsed = parseImport(file)
    expect(parsed.catalog).toEqual(catalog)
    expect(parsed.settings).toEqual(settings)
  })

  it('eksportuje tylko wybrane sekcje', () => {
    const parsed = parseImport(JSON.stringify(buildExport({ catalog: null, settings: DEFAULT_SETTINGS })))
    expect(parsed.catalog).toBeUndefined()
    expect(parsed.settings).toBeDefined()
  })

  it('odrzuca nieprawidłowe pliki', () => {
    expect(() => parseImport('nie json')).toThrow(/JSON/)
    expect(() => parseImport('{"app":"inna"}')).toThrow(/eksportu/)
    expect(() => parseImport('{"app":"zalecenia","version":99,"catalog":[]}')).toThrow(/nowszej/)
    expect(() => parseImport('{"app":"zalecenia","version":1}')).toThrow(/nie zawiera/)
  })

  it('ignoruje nieznane pola i niebezpieczne logo w ustawieniach', () => {
    const s = sanitizeSettings({ appName: 'X', logo: 'javascript:alert(1)', hack: 1 })
    expect(s.appName).toBe('X')
    expect(s.logo).toBe('')
    expect(s).not.toHaveProperty('hack')
  })
})
