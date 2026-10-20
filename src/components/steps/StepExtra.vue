<script setup>
import { nextTick } from 'vue'
import Icon from '../Icon.vue'
import { useDraftStore } from '../../stores/draft.js'

const store = useDraftStore()

async function add() {
  const entry = store.addExtra()
  await nextTick()
  document.getElementById(`extra-${entry.id}`)?.focus()
}
</script>

<template>
  <section class="bg-base-100 rounded-box border border-base-300 p-4 sm:p-6 space-y-4">
    <div>
      <h2 class="text-lg font-semibold">Dodatkowe zalecenia</h2>
      <p class="text-sm text-base-content/60 mt-1">
        Punkty tylko na ten wydruk – nie trafiają do katalogu.
      </p>
    </div>

    <ol v-if="store.draft.extra.length" class="space-y-3">
      <li v-for="(entry, i) in store.draft.extra" :key="entry.id" class="flex items-start gap-2">
        <span class="mt-3 w-6 text-right text-sm text-base-content/50 tabular-nums">{{ i + 1 }}.</span>
        <textarea
          :id="`extra-${entry.id}`"
          v-model="entry.text"
          class="textarea flex-1 text-base"
          rows="2"
          :aria-label="`Dodatkowe zalecenie ${i + 1}`"
          placeholder="Treść zalecenia…"
        ></textarea>
        <button
          type="button"
          class="btn btn-ghost btn-square min-h-11 min-w-11 text-error"
          :aria-label="`Usuń zalecenie ${i + 1}`"
          @click="store.removeExtra(entry.id)"
        >
          <Icon name="trash" :size="18" />
        </button>
      </li>
    </ol>
    <p v-else class="text-base-content/60 text-sm py-2">Brak dodatkowych zaleceń.</p>

    <button type="button" class="btn btn-outline btn-primary min-h-12 w-full sm:w-auto gap-2" @click="add">
      <Icon name="plus" :size="18" /> Dodaj zalecenie
    </button>
  </section>
</template>
