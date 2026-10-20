/** Małe litery, bez polskich znaków – do wyszukiwania. */
export function normalize(str) {
  return String(str ?? '')
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}

/** Każde słowo zapytania musi wystąpić w tekście. */
export function matchesQuery(text, query) {
  const words = normalize(query).split(/\s+/).filter(Boolean)
  if (!words.length) return true
  const hay = normalize(text)
  return words.every((w) => hay.includes(w))
}

export function todayISO() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Polska odmiana: plural(5, ['kategoria', 'kategorie', 'kategorii']) → "5 kategorii" */
export function plural(n, [one, few, many]) {
  const mod10 = n % 10
  const mod100 = n % 100
  const word = n === 1 ? one : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? few : many
  return `${n} ${word}`
}

export const CATEGORY_FORMS = ['kategoria', 'kategorie', 'kategorii']
export const ITEM_FORMS = ['zalecenie', 'zalecenia', 'zaleceń']
