<script setup>
import { computed } from 'vue'
import Icon from '../components/Icon.vue'
import CardPreview from '../components/CardPreview.vue'
import StepPatient from '../components/steps/StepPatient.vue'
import StepRecommendations from '../components/steps/StepRecommendations.vue'
import StepExtra from '../components/steps/StepExtra.vue'
import StepPreview from '../components/steps/StepPreview.vue'
import { useDraftStore } from '../stores/draft.js'
import { useUiStore } from '../stores/ui.js'
import { printCard } from '../lib/print.js'

const store = useDraftStore()
const ui = useUiStore()

const STEPS = [
  { n: 1, label: 'Dane', component: StepPatient },
  { n: 2, label: 'Zalecenia', component: StepRecommendations },
  { n: 3, label: 'Dodatkowe', component: StepExtra },
  { n: 4, label: 'Druk', component: StepPreview },
]

const step = computed({
  get: () => store.draft.step,
  set: (n) => {
    store.draft.step = n
    window.scrollTo({ top: 0 })
  },
})
const current = computed(() => STEPS[step.value - 1])

async function newConsultation() {
  const ok = await ui.confirm({
    title: 'Rozpocząć nową konsultację?',
    message: 'Dane dziecka, zaznaczone i dodatkowe zalecenia zostaną usunięte. Terapeuta zostaje zapamiętany.',
    confirmLabel: 'Nowa konsultacja',
    danger: true,
  })
  if (ok) {
    store.reset()
    window.scrollTo({ top: 0 })
    ui.toast('Rozpoczęto nową konsultację.')
  }
}
</script>

<template>
  <div class="py-4 sm:py-6">
    <div class="flex items-center gap-3 mb-4">
      <h1 class="text-xl sm:text-2xl font-semibold mr-auto">Konsultacja</h1>
      <button type="button" class="btn btn-ghost btn-sm min-h-11 gap-2" @click="newConsultation">
        <Icon name="file-plus" :size="18" />
        <span>Nowa</span>
      </button>
    </div>

    <ol class="steps w-full mb-6 text-xs sm:text-sm">
      <li
        v-for="s in STEPS"
        :key="s.n"
        class="step"
        :class="{ 'step-primary': s.n <= step }"
        :data-content="s.n < step ? '✓' : s.n"
      >
        <button
          type="button"
          class="px-1 py-2 min-h-11 font-medium hover:text-primary"
          :class="s.n === step ? 'text-primary' : 'text-base-content/70'"
          :aria-current="s.n === step ? 'step' : undefined"
          @click="step = s.n"
        >
          {{ s.label }}
        </button>
      </li>
    </ol>

    <div :class="step < 4 ? 'lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8 lg:items-start' : ''">
      <div class="min-w-0">
        <component :is="current.component" @go="(n) => (step = n)" />

        <!-- Pasek nawigacji kreatora -->
        <div class="sticky bottom-0 z-20 -mx-4 sm:mx-0 mt-6 px-4 pt-3 pb-safe bg-base-200/95 backdrop-blur border-t border-base-300 sm:border sm:rounded-box sm:mb-4">
          <div class="flex items-center gap-2">
            <button v-if="step > 1" type="button" class="btn btn-ghost min-h-12 gap-1" @click="step--">
              <Icon name="chevron-left" />
              Wstecz
            </button>
            <span class="text-sm text-base-content/70 mx-auto text-center whitespace-nowrap" aria-live="polite">
              Wybrano: <strong class="text-base-content">{{ store.selectedCount }}</strong>
              <template v-if="store.printExtra.length"> (+{{ store.printExtra.length }})</template>
            </span>
            <button v-if="step < 4" type="button" class="btn btn-primary min-h-12 gap-1" @click="step++">
              {{ step === 3 ? 'Podgląd' : 'Dalej' }}
              <Icon name="chevron-right" />
            </button>
            <button v-else type="button" class="btn btn-primary min-h-12 gap-2" @click="printCard">
              <Icon name="printer" />
              Drukuj / PDF
            </button>
          </div>
        </div>
      </div>

      <aside v-if="step < 4" class="hidden lg:block sticky top-24" aria-label="Podgląd karty">
        <p class="text-sm font-medium text-base-content/70 mb-2 flex items-center gap-2">
          <Icon name="eye" :size="16" /> Podgląd karty A4
        </p>
        <div class="max-h-[calc(100dvh-8rem)] overflow-auto rounded-box">
          <CardPreview />
        </div>
      </aside>
    </div>
  </div>
</template>
