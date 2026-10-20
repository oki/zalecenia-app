<script setup>
import { storeToRefs } from 'pinia'
import { useDraftStore } from '../../stores/draft.js'
import { useSettingsStore } from '../../stores/settings.js'
import { AGE_GROUPS } from '../../data/ageGroups.js'

const store = useDraftStore()
const { settings } = storeToRefs(useSettingsStore())
</script>

<template>
  <section class="bg-base-100 rounded-box border border-base-300 p-4 sm:p-6 space-y-5">
    <h2 class="text-lg font-semibold">Dane konsultacji</h2>

    <label class="block">
      <span class="block text-sm font-medium mb-1.5">Imię i nazwisko dziecka</span>
      <input
        v-model="store.draft.childName"
        type="text"
        class="input w-full h-12 text-base"
        autocomplete="off"
        autocapitalize="words"
        placeholder="np. Jan Kowalski"
      />
    </label>

    <label class="block">
      <span class="block text-sm font-medium mb-1.5">Data konsultacji</span>
      <input v-model="store.draft.date" type="date" class="input w-full h-12 text-base" />
    </label>

    <label class="block">
      <span class="block text-sm font-medium mb-1.5">Terapeuta</span>
      <input
        v-model="settings.therapist"
        type="text"
        class="input w-full h-12 text-base"
        autocomplete="name"
        autocapitalize="words"
        placeholder="Imię i nazwisko terapeuty"
      />
      <span class="block text-xs text-base-content/60 mt-1">Zapamiętywane na tym urządzeniu.</span>
    </label>

    <fieldset>
      <legend class="text-sm font-medium mb-1.5">Grupa wiekowa</legend>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <label
          v-for="g in AGE_GROUPS"
          :key="g.id"
          class="flex items-center gap-2 min-h-12 px-3 rounded-field border cursor-pointer transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary"
          :class="
            store.draft.ageGroup === g.id
              ? 'border-primary bg-primary/10 text-primary font-medium'
              : 'border-base-300 hover:border-base-content/30'
          "
        >
          <input v-model="store.draft.ageGroup" type="radio" name="age-group" :value="g.id" class="sr-only" />
          {{ g.label }}
        </label>
      </div>
      <p class="text-xs text-base-content/60 mt-2">
        Lista zaleceń w następnym kroku pokaże tylko pozycje dla wybranej grupy.
      </p>
    </fieldset>
  </section>
</template>
