// Grupy wiekowe wybierane podczas konsultacji i tagi wieku zaleceń w katalogu.

export const AGE_TAGS = [
  { id: 'all', label: 'Wszystkie grupy' },
  { id: 'baby', label: 'Do 2 lat' },
  { id: '1+', label: 'Od 1 roku' },
  { id: '2+', label: 'Od 2 lat' },
  { id: '3+', label: 'Od 3 lat' },
  { id: '2-5', label: '2–5 lat' },
]

export const AGE_GROUPS = [
  { id: '0-1', label: '0–12 miesięcy', tags: ['all', 'baby'] },
  { id: '1-2', label: '1–2 lata', tags: ['all', 'baby', '1+'] },
  { id: '2-3', label: '2–3 lata', tags: ['all', '1+', '2+', '2-5'] },
  { id: '3-6', label: '3–6 lat', tags: ['all', '1+', '2+', '3+', '2-5'] },
  { id: '6-12', label: '6–12 lat', tags: ['all', '1+', '2+', '3+'] },
  { id: 'any', label: 'Wszystkie grupy', tags: null },
]

export const DEFAULT_AGE_GROUP = 'any'

const TAG_IDS = new Set(AGE_TAGS.map((t) => t.id))

export function normalizeTag(tag) {
  return TAG_IDS.has(tag) ? tag : 'all'
}

export function tagLabel(tag) {
  return AGE_TAGS.find((t) => t.id === tag)?.label ?? AGE_TAGS[0].label
}

export function groupLabel(groupId) {
  return AGE_GROUPS.find((g) => g.id === groupId)?.label ?? ''
}

/** Czy zalecenie z danym tagiem pasuje do grupy wiekowej. */
export function matchesGroup(tag, groupId) {
  const group = AGE_GROUPS.find((g) => g.id === groupId)
  if (!group || !group.tags) return true
  return group.tags.includes(normalizeTag(tag))
}
