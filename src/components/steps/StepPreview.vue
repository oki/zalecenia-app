<script setup>
import Icon from '../Icon.vue'
import CardPreview from '../CardPreview.vue'
import { printCard } from '../../lib/print.js'

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
</script>

<template>
  <section class="space-y-4">
    <div class="flex flex-wrap items-center gap-3">
      <h2 class="text-lg font-semibold mr-auto">Podgląd karty A4</h2>
      <button type="button" class="btn btn-primary min-h-12 gap-2 hidden sm:inline-flex" @click="printCard">
        <Icon name="printer" /> Drukuj / zapisz PDF
      </button>
    </div>

    <div class="max-w-[794px] mx-auto">
      <CardPreview />
    </div>

    <div class="alert bg-base-100 border-base-300 text-sm max-w-[794px] mx-auto">
      <Icon name="info" class="text-info" />
      <span v-if="isIOS">
        Na iPhonie/iPadzie: „Drukuj / PDF” → w podglądzie wydruku dotknij <strong>Udostępnij</strong>
        (lub rozsuń podgląd dwoma palcami) → <strong>Zapisz w Plikach</strong>.
      </span>
      <span v-else>
        W oknie drukowania wybierz drukarkę lub <strong>„Zapisz jako PDF”</strong>. Dłuższa karta zostanie
        automatycznie podzielona na strony.
      </span>
    </div>
  </section>
</template>
