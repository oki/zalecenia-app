# Zalecenia

PWA do tworzenia kart zaleceń po konsultacji neurologopedycznej. Działa w całości w przeglądarce
(bez backendu), także offline. Dane są zapisane tylko w `localStorage` urządzenia.

## Uruchomienie

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # testy logiki (Vitest)
npm run build      # build produkcyjny do dist/
npm run preview    # podgląd builda z service workerem (test offline)
```

Podgląd w rozmiarze telefonu podczas developmentu: `http://localhost:5173/tools/devices.html`
(parametry: `?path=/katalog`, `&dark=1`).

## Deploy (Vercel)

Import repozytorium w Vercel → preset **Vite** (build `npm run build`, output `dist`).
`vercel.json` zawiera rewrite SPA oraz nagłówki cache dla `sw.js` i `assets/`.

## Struktura

| Ścieżka | Opis |
|---|---|
| `src/data/seedCatalog.js` | domyślny katalog zaleceń (seed) |
| `src/data/ageGroups.js` | grupy wiekowe i mapowanie tagów (`all`, `baby`, `1+`, `2+`, `3+`, `2-5`) |
| `src/stores/` | Pinia: `catalog`, `settings`, `draft` (szkic bieżącej konsultacji), `ui` |
| `src/views/` | Konsultacja (kreator 4 kroki), Katalog, Ustawienia |
| `src/components/PrintCard.vue` | karta A4 – ten sam komponent w podglądzie i w druku |
| `src/lib/transfer.js` | eksport / import JSON |
| `src/styles/main.css` | motyw daisyUI „clean” (jasny/ciemny) + style druku |

## Format pliku eksportu

```json
{ "app": "zalecenia", "version": 1, "exportedAt": "…",
  "catalog": [{ "id": "…", "name": "Kategoria", "items": [{ "id": "…", "text": "…", "age": "all" }] }],
  "settings": { "appName": "…", "cardTitle": "…", "cardSubtitle": "…", "footer": "…",
                "showSignature": true, "signatureLabel": "…", "logo": "data:image/png;base64,…", "therapist": "…" } }
```

Sekcje `catalog` i `settings` są opcjonalne. Import zastępuje sekcje obecne w pliku.
