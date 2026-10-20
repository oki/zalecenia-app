<script setup>
import { ref, computed } from 'vue'
import draggable from 'vuedraggable'
import Icon from '../components/Icon.vue'
import ItemEditorModal from '../components/ItemEditorModal.vue'
import CategoryModal from '../components/CategoryModal.vue'
import { useCatalogStore } from '../stores/catalog.js'
import { useUiStore } from '../stores/ui.js'
import { tagLabel } from '../data/ageGroups.js'
import { matchesQuery, plural, CATEGORY_FORMS, ITEM_FORMS } from '../lib/text.js'

const catalog = useCatalogStore()
const ui = useUiStore()

const itemModal = ref(null)
const categoryModal = ref(null)
const query = ref('')
const open = ref(new Set())
const searching = computed(() => query.value.trim().length > 0)

const filtered = computed(() =>
  catalog.categories
    .map((cat) => ({
      cat,
      items: cat.items.filter((it) => matchesQuery(it.text, query.value) || matchesQuery(cat.name, query.value)),
    }))
    .filter((r) => r.items.length),
)

function isOpen(id) {
  return open.value.has(id)
}
function toggle(id, force) {
  const next = new Set(open.value)
  const on = force ?? !next.has(id)
  on ? next.add(id) : next.delete(id)
  open.value = next
}

function onItemSaved({ added, categoryId }) {
  toggle(categoryId, true)
  ui.toast(added ? 'Dodano zalecenie.' : 'Zapisano zmiany.')
}
function onCategorySaved({ id, added }) {
  if (added) toggle(id, true)
  ui.toast(added ? 'Dodano kategorię.' : 'Zmieniono nazwę kategorii.')
}

async function removeItem(item) {
  const ok = await ui.confirm({
    title: 'Usunąć zalecenie?',
    message: `„${item.text}”`,
    confirmLabel: 'Usuń',
    danger: true,
  })
  if (ok) {
    catalog.removeItem(item.id)
    ui.toast('Usunięto zalecenie.')
  }
}

async function removeCategory(cat) {
  const ok = await ui.confirm({
    title: `Usunąć kategorię „${cat.name}”?`,
    message: cat.items.length ? `Razem z nią zostaną usunięte zalecenia: ${cat.items.length}.` : '',
    confirmLabel: 'Usuń kategorię',
    danger: true,
  })
  if (ok) {
    catalog.removeCategory(cat.id)
    ui.toast('Usunięto kategorię.')
  }
}

async function resetCatalog() {
  const ok = await ui.confirm({
    title: 'Przywrócić domyślny katalog?',
    message: 'Wszystkie zmiany w katalogu (dodane, edytowane i usunięte zalecenia oraz kategorie) zostaną utracone.',
    confirmLabel: 'Przywróć',
    danger: true,
  })
  if (ok) {
    catalog.resetToDefault()
    open.value = new Set()
    ui.toast('Przywrócono domyślny katalog.')
  }
}
</script>

<template>
  <div class="py-4 sm:py-6 space-y-4">
    <div class="flex flex-wrap items-center gap-2">
      <div class="mr-auto">
        <h1 class="text-xl sm:text-2xl font-semibold">Katalog zaleceń</h1>
        <p class="text-sm text-base-content/60">
          {{ plural(catalog.categories.length, CATEGORY_FORMS) }} · {{ plural(catalog.itemCount, ITEM_FORMS) }}
        </p>
      </div>
      <button type="button" class="btn btn-ghost min-h-11 gap-2" @click="resetCatalog">
        <Icon name="reset" :size="18" /> <span class="hidden sm:inline">Przywróć domyślny</span>
        <span class="sr-only sm:hidden">Przywróć domyślny katalog</span>
      </button>
      <button type="button" class="btn btn-outline min-h-11 gap-2" @click="categoryModal.open()">
        <Icon name="plus" :size="18" /> Kategoria
      </button>
      <button
        type="button"
        class="btn btn-primary min-h-11 gap-2"
        :disabled="!catalog.categories.length"
        @click="itemModal.open()"
      >
        <Icon name="plus" :size="18" /> Zalecenie
      </button>
    </div>

    <label class="input w-full h-12 text-base">
      <Icon name="search" :size="18" class="opacity-60" />
      <input v-model="query" type="search" class="grow" placeholder="Szukaj w katalogu…" aria-label="Szukaj w katalogu" />
      <button v-if="query" type="button" class="btn btn-ghost btn-xs btn-circle" aria-label="Wyczyść" @click="query = ''">
        <Icon name="x" :size="16" />
      </button>
    </label>

    <!-- Wyniki wyszukiwania (bez przeciągania) -->
    <template v-if="searching">
      <p v-if="!filtered.length" class="text-center text-base-content/60 py-10">Brak wyników.</p>
      <div v-for="r in filtered" :key="r.cat.id" class="bg-base-100 rounded-box border border-base-300">
        <h2 class="px-4 py-3 font-medium border-b border-base-300">{{ r.cat.name }}</h2>
        <ul class="divide-y divide-base-300">
          <li v-for="item in r.items" :key="item.id" class="flex items-start gap-2 px-4 py-2">
            <div class="flex-1 py-2">
              <p class="leading-relaxed">{{ item.text }}</p>
              <span class="badge badge-ghost badge-sm mt-1">{{ tagLabel(item.age) }}</span>
            </div>
            <button type="button" class="btn btn-ghost btn-square min-h-11 min-w-11" aria-label="Edytuj" @click="itemModal.open({ item, categoryId: r.cat.id })">
              <Icon name="pencil" :size="18" />
            </button>
            <button type="button" class="btn btn-ghost btn-square min-h-11 min-w-11 text-error" aria-label="Usuń" @click="removeItem(item)">
              <Icon name="trash" :size="18" />
            </button>
          </li>
        </ul>
      </div>
    </template>

    <!-- Pełny katalog z przeciąganiem -->
    <template v-else>
      <p v-if="!catalog.categories.length" class="text-center text-base-content/60 py-10">
        Katalog jest pusty. Dodaj kategorię albo przywróć domyślny katalog.
      </p>
      <draggable
        v-model="catalog.categories"
        item-key="id"
        handle=".cat-handle"
        :animation="150"
        ghost-class="opacity-40"
        class="space-y-3"
      >
        <template #item="{ element: cat, index }">
          <div class="bg-base-100 rounded-box border border-base-300 overflow-hidden">
            <div class="flex items-center gap-1 pl-1 pr-2 min-h-14">
              <span class="cat-handle btn btn-ghost btn-square min-h-11 min-w-11 cursor-grab touch-none" aria-hidden="true" title="Przeciągnij, aby zmienić kolejność">
                <Icon name="grip" :size="18" class="opacity-50" />
              </span>
              <button type="button" class="flex-1 flex items-center gap-2 text-left min-h-11" :aria-expanded="isOpen(cat.id)" @click="toggle(cat.id)">
                <span class="font-display font-medium">{{ cat.name }}</span>
                <span class="badge badge-ghost badge-sm tabular-nums">{{ cat.items.length }}</span>
                <Icon :name="isOpen(cat.id) ? 'chevron-up' : 'chevron-down'" :size="18" class="opacity-60 ml-auto" />
              </button>
              <div class="flex items-center">
                <button type="button" class="btn btn-ghost btn-square btn-sm min-h-11 min-w-9" :disabled="index === 0" aria-label="Przesuń wyżej" @click="catalog.moveCategory(cat.id, -1)">
                  <Icon name="arrow-up" :size="16" />
                </button>
                <button type="button" class="btn btn-ghost btn-square btn-sm min-h-11 min-w-9" :disabled="index === catalog.categories.length - 1" aria-label="Przesuń niżej" @click="catalog.moveCategory(cat.id, 1)">
                  <Icon name="arrow-down" :size="16" />
                </button>
                <button type="button" class="btn btn-ghost btn-square btn-sm min-h-11 min-w-9" aria-label="Zmień nazwę kategorii" @click="categoryModal.open(cat)">
                  <Icon name="pencil" :size="18" />
                </button>
                <button type="button" class="btn btn-ghost btn-square btn-sm min-h-11 min-w-9 text-error" aria-label="Usuń kategorię" @click="removeCategory(cat)">
                  <Icon name="trash" :size="18" />
                </button>
              </div>
            </div>

            <div v-if="isOpen(cat.id)" class="border-t border-base-300">
              <draggable
                v-model="cat.items"
                item-key="id"
                group="items"
                handle=".item-handle"
                :animation="150"
                ghost-class="opacity-40"
                tag="ul"
                class="divide-y divide-base-300 min-h-4"
              >
                <template #item="{ element: item }">
                  <li class="flex items-start gap-1 pl-1 pr-2 py-1">
                    <span class="item-handle btn btn-ghost btn-square min-h-11 min-w-11 cursor-grab touch-none" aria-hidden="true">
                      <Icon name="grip" :size="16" class="opacity-40" />
                    </span>
                    <div class="flex-1 py-2.5 min-w-0">
                      <p class="leading-relaxed">{{ item.text }}</p>
                      <span class="badge badge-ghost badge-sm mt-1">{{ tagLabel(item.age) }}</span>
                    </div>
                    <button type="button" class="btn btn-ghost btn-square min-h-11 min-w-11" aria-label="Edytuj zalecenie" @click="itemModal.open({ item, categoryId: cat.id })">
                      <Icon name="pencil" :size="18" />
                    </button>
                    <button type="button" class="btn btn-ghost btn-square min-h-11 min-w-11 text-error" aria-label="Usuń zalecenie" @click="removeItem(item)">
                      <Icon name="trash" :size="18" />
                    </button>
                  </li>
                </template>
              </draggable>
              <div class="p-2 border-t border-base-300">
                <button type="button" class="btn btn-ghost btn-sm min-h-11 text-primary gap-2" @click="itemModal.open({ categoryId: cat.id })">
                  <Icon name="plus" :size="16" /> Dodaj zalecenie do kategorii
                </button>
              </div>
            </div>
          </div>
        </template>
      </draggable>
    </template>

    <ItemEditorModal ref="itemModal" @saved="onItemSaved" />
    <CategoryModal ref="categoryModal" @saved="onCategorySaved" />
  </div>
</template>
