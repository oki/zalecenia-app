# Zalecenia – plan projektu (client-side)

Aplikacja PWA do generowania kart zaleceń po konsultacji neurologopedycznej.
Działa w całości w przeglądarce (bez backendu), offline, priorytet: telefon + desktop.

## 1. Ustalenia (z sesji Q&A)

| Obszar | Decyzja |
|---|---|
| Stack | Vue 3 (`<script setup>`, JS), Vite, Tailwind CSS 4 + daisyUI 5, vite-plugin-pwa, deploy Vercel |
| Wygląd | styl „clean” (typeui.sh) jako własny motyw daisyUI, **jasny + ciemny** (wg systemu); wydruk zawsze jasny |
| Układ konsultacji | **kreator krokowy**: 1. Dane → 2. Zalecenia → 3. Dodatkowe → 4. Podgląd i druk |
| Dane dziecka | imię i nazwisko, data (domyślnie dziś), grupa wiekowa (domyślnie „Wszystkie grupy”), terapeuta. **Żadne pole nie jest wymagane** – puste drukują się jako „……” |
| Terapeuta | jedno pole, zapamiętuje ostatnią wartość |
| Filtr wieku | pokazuje **tylko pasujące** zalecenia, wszystkie odznaczone |
| Wyszukiwarka | filtruje **w obrębie wybranej grupy wiekowej** (bez polskich znaków, bez wielkości liter) |
| Edycja na wydruk | zaznaczone zalecenie można edytować w miejscu – zmiana tylko dla bieżącej karty |
| Dodatkowe zalecenia | lista punktów (dodaj/usuń), tylko na ten wydruk, bez grupy wiekowej |
| Historia | **brak historii**; tylko jeden szkic bieżącej konsultacji (przetrwa odświeżenie), kasowany przyciskiem „Nowa konsultacja” |
| Katalog | **jeden katalog**, wbudowane dane to tylko seed – pełna kontrola: dodawanie, edycja, usuwanie zaleceń i kategorii, zmiana kolejności kategorii i zaleceń. „Przywróć domyślny katalog” |
| Zalecenie w katalogu | kategoria **wymagana**; tag wieku **opcjonalny**, wybierany z: `all / baby / 1+ / 2+ / 3+ / 2-5` (brak = `all`) |
| PDF | drukowanie przeglądarki (`window.print()` + CSS `@media print`, A4) → „Zapisz jako PDF” |
| Ustawienia | logo, nazwa aplikacji, tytuł karty, stopka (placówka + adres), miejsce na podpis (włącz/wyłącz) |
| Logo | w nagłówku aplikacji obok nazwy + na karcie A4 po prawej |
| Eksport | JSON, **do wyboru**: katalog i/lub ustawienia |
| Import | **zawsze zastępuje** sekcje obecne w pliku (z potwierdzeniem w UI) |

### Mapowanie tagów na grupy wiekowe

| Grupa | Widoczne tagi |
|---|---|
| 0–12 miesięcy | `all`, `baby` |
| 1–2 lata | `all`, `baby`, `1+` |
| 2–3 lata | `all`, `1+`, `2+`, `2-5` |
| 3–6 lat | `all`, `1+`, `2+`, `3+`, `2-5` |
| 6–12 lat | `all`, `1+`, `2+`, `3+` |
| Wszystkie grupy | wszystkie |

## 2. Model danych (localStorage, wersjonowany)

```js
// zalecenia:v1:catalog  (kolejność = kolejność tablic)
[{ id, name, items: [{ id, text, age: 'all'|'baby'|'1+'|'2+'|'3+'|'2-5' }] }]

// zalecenia:v1:settings
{ appName, cardTitle, cardSubtitle, footer, showSignature, signatureLabel,
  logo: 'data:image/png;base64,…',   // zmniejszone do maks. 600 px
  therapist }

// zalecenia:v1:draft  (jedyny zapis danych pacjenta)
{ step, childName, date, ageGroup, selected: { [itemId]: overrideText|null }, extra: [{ id, text }] }
```

- Seed: tablica `catalog` z `prompt.txt` → konwersja na kategorie/zalecenia przy pierwszym uruchomieniu.
- Usunięcie zalecenia z katalogu czyści je też ze szkicu.
- Plik eksportu: `{ app: 'zalecenia', version: 1, exportedAt, catalog?, settings? }` + walidacja przy imporcie.

## 3. Struktura projektu

```
src/
  main.js, App.vue, router.js         # vue-router (hash/history), 3 widoki
  data/seedCatalog.js, ageGroups.js
  stores/                             # Pinia + persystencja do localStorage
    catalog.js, settings.js, draft.js
  composables/useSearch.js, useImportExport.js, useImageResize.js
  views/
    ConsultationView.vue              # kreator 4 kroki
    CatalogView.vue                   # „Katalog zaleceń”
    SettingsView.vue                  # ustawienia + eksport/import
  components/
    AppHeader.vue, BottomNav.vue (mobile) / boczne menu (desktop)
    StepPatient.vue, StepRecommendations.vue, StepExtra.vue, StepPreview.vue
    RecommendationItem.vue, CategoryEditor.vue, ItemEditorModal.vue
    PrintCard.vue                     # karta A4 – używana w podglądzie i do druku
  styles/main.css                     # Tailwind + daisyUI + motyw clean + @media print
public/ icons PWA (192, 512, maskable), favicon
```

## Status (2026-10-20)

Etapy 1–9 zrealizowane i zweryfikowane w Chrome (desktop, telefon 390 px, tryb ciemny, PDF z druku, offline).
Pozostało: etap 10 – deploy na Vercel (wymaga repozytorium i konta).

## 4. Etapy pracy

1. **Szkielet** – Vite + Vue 3, Tailwind 4 + daisyUI 5, Pinia, vue-router, ESLint/Prettier, `vercel.json` (SPA rewrite).
2. **Motyw** – motyw daisyUI „clean” (light/dark) wg typeui.sh/design-skills/clean:
   - kolory: primary `#3B82F6`, secondary `#8B5CF6`, success `#16A34A`, warning `#D97706`, error `#DC2626`, surface `#FFFFFF`, text `#111827`; reszta neutralna (kolor = informacja, nie dekoracja);
   - fonty: Roboto (tekst), Poppins (nagłówki), Inconsolata (mono) – self-hosted przez `@fontsource` (offline);
   - skala: 12/14/16/20/24/32px; siatka 8pt; separacja przez whitespace zamiast ramek;
   - WCAG 2.2 AA, widoczny focus, `prefers-reduced-motion`, cele dotykowe ≥44px.
3. **Dane i store’y** – seed, mapowanie wieku, persystencja, migracje wersji.
4. **Kreator konsultacji**
   - krok 1: formularz (date input, select grupy, terapeuta zapamiętany);
   - krok 2: wyszukiwarka + zwijane kategorie z checkboxami, licznik zaznaczonych per kategoria, edycja treści (ikona ołówka → textarea, „przywróć oryginał”);
   - krok 3: lista dodatkowych punktów;
   - krok 4: podgląd A4 + „Drukuj / Zapisz PDF” + „Nowa konsultacja” (z potwierdzeniem).
   - Mobile: stepper u góry, przyklejony dolny pasek „Wstecz / Dalej · wybrano N”; duże pola dotykowe (≥44px). Desktop: szerszy layout, na kroku 2 podgląd karty obok.
5. **Karta A4 i druk** – `PrintCard.vue` wg `podglad-karty.png`: tytuł + logo, dane, kategorie z punktami (tylko niepuste), „Dodatkowe zalecenia”, opcjonalna linia podpisu, stopka. `@page { size: A4; margin: 15mm }`, `break-inside: avoid` dla punktów, nagłówki kategorii nie zostają same na dole strony, w trybie druku ukryte całe UI.
6. **Katalog zaleceń** – lista kategorii i zaleceń, CRUD (modal), zmiana kolejności (drag & drop przez `vuedraggable`/SortableJS + strzałki na mobile), filtr/wyszukiwarka w katalogu, „Przywróć domyślny”.
7. **Ustawienia** – upload logo (resize przez canvas, podgląd, usuń), teksty karty, stopka, podpis; eksport (checkboxy → pobranie pliku `.json`) i import (wybór pliku → podsumowanie → „Zastąp”).
8. **PWA** – `vite-plugin-pwa` (`registerType: 'autoUpdate'`, precache całego builda), manifest (nazwa, ikony, `display: standalone`, kolor motywu), komunikat „Dostępna nowa wersja”, test offline.
9. **Testy i dopracowanie** – Vitest dla logiki (mapowanie wieku, wyszukiwanie, import/eksport, migracje), ręczne testy: iOS Safari, Android Chrome, desktop Chrome/Firefox/Safari, druk wielostronicowy, dostępność (etykiety, focus, kontrast).
10. **Deploy** – repo Git → Vercel (framework preset Vite), nagłówki cache dla `sw.js`.

**Weryfikacja po każdym etapie** – Claude in Chrome na `npm run dev` / `npm run preview`: zrzuty ekranu w szerokości telefonu (~390px) i desktopu, przeklikanie scenariusza, odczyt błędów z konsoli, podgląd wydruku, test offline (preview + service worker).

## 5. Ryzyka / uwagi

- **iOS Safari**: drukowanie z PWA w trybie standalone działa, ale „Zapisz PDF” odbywa się przez Udostępnij → Drukuj → gest powiększenia. Opiszę to w podpowiedzi pod podglądem.
- **localStorage** ~5 MB – logo trzeba zmniejszać; dane są tylko na tym urządzeniu → eksport służy też jako kopia zapasowa.
- **RODO**: dane dziecka są tylko w szkicu na urządzeniu, nigdzie nie wysyłane; „Nowa konsultacja” je usuwa.
