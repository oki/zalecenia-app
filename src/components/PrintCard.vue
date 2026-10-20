<script setup>
import { computed } from 'vue'
import { useDraftStore } from '../stores/draft.js'
import { useSettingsStore } from '../stores/settings.js'

// sheet = true: wygląd kartki A4 na ekranie (podgląd); false: sama treść do druku
defineProps({ sheet: { type: Boolean, default: false } })

const draftStore = useDraftStore()
const settingsStore = useSettingsStore()

const d = computed(() => draftStore.draft)
const s = computed(() => settingsStore.settings)
const DOTS = '……………………………………………………'
</script>

<template>
  <article class="card-a4" :class="{ 'is-sheet': sheet }">
    <header class="head" :class="{ 'has-logo': s.logo }">
      <div class="titles">
        <h1>{{ s.cardTitle }}</h1>
        <p v-if="s.cardSubtitle" class="subtitle">{{ s.cardSubtitle }}</p>
      </div>
      <img v-if="s.logo" :src="s.logo" alt="Logo" class="logo" />
    </header>

    <dl class="meta">
      <div><dt>Imię i nazwisko dziecka:</dt> <dd>{{ d.childName.trim() || DOTS }}</dd></div>
      <div><dt>Data:</dt> <dd>{{ d.date || DOTS }}</dd></div>
      <div><dt>Terapeuta:</dt> <dd>{{ s.therapist.trim() || DOTS }}</dd></div>
    </dl>

    <section v-for="section in draftStore.printSections" :key="section.id" class="section">
      <h2>{{ section.name }}</h2>
      <ul>
        <li v-for="item in section.items" :key="item.id">{{ item.text }}</li>
      </ul>
    </section>

    <section v-if="draftStore.printExtra.length" class="section">
      <h2>Dodatkowe zalecenia</h2>
      <ul>
        <li v-for="(text, i) in draftStore.printExtra" :key="i">{{ text }}</li>
      </ul>
    </section>

    <p v-if="!draftStore.printSections.length && !draftStore.printExtra.length" class="empty">
      Nie wybrano jeszcze żadnych zaleceń.
    </p>

    <div v-if="s.showSignature" class="signature">
      <div class="line"></div>
      <span>{{ s.signatureLabel }}</span>
    </div>

    <footer v-if="s.footer.trim()" class="foot">{{ s.footer }}</footer>
  </article>
</template>

<style scoped>
.card-a4 {
  color: #111;
  background: #fff;
  font-family: 'Roboto', Arial, Helvetica, sans-serif;
  font-size: 11.5pt;
  line-height: 1.55;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.card-a4.is-sheet {
  width: 210mm;
  min-height: 297mm;
  padding: 16mm 18mm;
  box-sizing: border-box;
}
.head {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8mm;
  margin-bottom: 10mm;
  text-align: center;
}
.head.has-logo {
  justify-content: space-between;
}
.titles {
  flex: 1;
}
h1 {
  margin: 0;
  font-family: 'Roboto', Arial, Helvetica, sans-serif;
  font-size: 18pt;
  font-weight: 700;
  line-height: 1.2;
  color: #1e2b4f;
  text-transform: uppercase;
}
.subtitle {
  margin: 2mm 0 0;
  font-size: 15pt;
  font-weight: 700;
  color: #1e2b4f;
  text-transform: uppercase;
}
.logo {
  max-height: 32mm;
  max-width: 50mm;
  object-fit: contain;
}
.meta {
  margin: 0 0 8mm;
}
.meta > div {
  margin-bottom: 2mm;
}
.meta dt {
  display: inline;
  font-weight: 700;
}
.meta dd {
  display: inline;
  margin: 0;
}
.section {
  margin-bottom: 6mm;
}
h2 {
  margin: 0 0 2mm;
  font-family: 'Roboto', Arial, Helvetica, sans-serif;
  font-size: 13pt;
  font-weight: 700;
  color: #1e2b4f;
  break-after: avoid;
  page-break-after: avoid;
}
ul {
  margin: 0;
  padding-left: 6mm;
  list-style: disc;
}
li {
  margin-bottom: 1.5mm;
  padding-left: 1mm;
  break-inside: avoid;
  page-break-inside: avoid;
}
.empty {
  color: #6b7280;
  font-style: italic;
}
.signature {
  margin: 14mm 0 0 auto;
  width: 65mm;
  text-align: center;
  font-size: 9.5pt;
  color: #4b5563;
  break-inside: avoid;
}
.signature .line {
  border-bottom: 1px dotted #6b7280;
  height: 12mm;
  margin-bottom: 1.5mm;
}
.foot {
  margin-top: 10mm;
  padding-top: 3mm;
  border-top: 1px solid #b8bcc4;
  font-size: 10pt;
  break-inside: avoid;
}
</style>
