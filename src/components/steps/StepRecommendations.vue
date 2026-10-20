<script setup>
import { ref, computed } from 'vue'
import Icon from '../Icon.vue'
import RecommendationItem from '../RecommendationItem.vue'
import { useCatalogStore } from '../../stores/catalog.js'
import { useDraftStore } from '../../stores/draft.js'
import { groupLabel, matchesGroup } from '../../data/ageGroups.js'
import { matchesQuery } from '../../lib/text.js'

const emit = defineEmits(['go'])
const catalog = useCatalogStore()
const store = useDraftStore()

const query = ref('')
const open = ref(new Set())
const searching = computed(() => query.value.trim().length > 0)

const sections = computed(() =>
  catalog.categories
    .map((cat) => {
      const inGroup = cat.items.filter((it) => matchesGroup(it.age, store.draft.ageGroup))
      return {
        ...cat,
        items: inGroup.filter((it) => matchesQuery(store.textFor(it), query.value)),
        selected: inGroup.filter((it) => store.isSelected(it.id)).length,
        total: inGroup.length,
      }
    })
    .filter((s) => (searching.value ? s.items.length : s.total)),
)

const allOpen = computed(() => sections.value.every((s) => open.value.has(s.id)))

function isOpen(id) {
  return searching.value || open.value.has(id)
}
function toggleSection(id) {
  const next = new Set(open.value)
  next.has(id) ? next.delete(id) : next.add(id)
  open.value = next
}
function toggleAll() {
  open.value = allOpen.value ? new Set() : new Set(sections.value.map((s) => s.id))
}
</script>

<template>
  <section class="space-y-3">
    <div class="flex flex-wrap items-center gap-2">
      <button type="button" class="badge badge-lg badge-outline gap-1 min-h-9 cursor-pointer" @click="emit('go', 1)">
        Grupa: <strong>{{ groupLabel(store.draft.ageGroup) }}</strong>
        <Icon name="pencil" :size="14" />
        <span class="sr-only">Zmień grupę wiekową</span>
      </button>
      <button v-if="!searching && sections.length" type="button" class="btn btn-ghost btn-sm min-h-11 ml-auto" @click="toggleAll">
        {{ allOpen ? 'Zwiń wszystkie' : 'Rozwiń wszystkie' }}
      </button>
    </div>

    <label class="input w-full h-12 text-base sticky top-[4.5rem] z-10 shadow-sm">
      <Icon name="search" :size="18" class="opacity-60" />
      <input v-model="query" type="search" class="grow" placeholder="Szukaj zalecenia…" aria-label="Szukaj zalecenia" />
      <button v-if="query" type="button" class="btn btn-ghost btn-xs btn-circle" aria-label="Wyczyść" @click="query = ''">
        <Icon name="x" :size="16" />
      </button>
    </label>

    <p v-if="!sections.length" class="text-center text-base-content/60 py-10">
      {{ searching ? 'Brak zaleceń pasujących do wyszukiwania w tej grupie wiekowej.' : 'Brak zaleceń dla tej grupy wiekowej.' }}
    </p>

    <div v-for="section in sections" :key="section.id" class="bg-base-100 rounded-box border border-base-300 overflow-hidden">
      <button
        type="button"
        class="w-full flex items-center gap-3 px-4 min-h-14 text-left hover:bg-base-200/60"
        :aria-expanded="isOpen(section.id)"
        :disabled="searching"
        @click="toggleSection(section.id)"
      >
        <span class="font-display font-medium mr-auto">{{ section.name }}</span>
        <span
          class="badge badge-sm tabular-nums"
          :class="section.selected ? 'badge-primary' : 'badge-ghost'"
          :title="`Zaznaczono ${section.selected} z ${section.total}`"
        >
          {{ section.selected }}/{{ section.total }}
        </span>
        <Icon v-if="!searching" :name="isOpen(section.id) ? 'chevron-up' : 'chevron-down'" :size="18" class="opacity-60" />
      </button>
      <ul v-if="isOpen(section.id)" class="border-t border-base-300 divide-y divide-base-300">
        <li v-for="item in section.items" :key="item.id">
          <RecommendationItem :item="item" />
        </li>
      </ul>
    </div>
  </section>
</template>
