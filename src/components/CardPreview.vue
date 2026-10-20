<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import PrintCard from './PrintCard.vue'

// Kartka A4 (794 px przy 96 dpi) przeskalowana do szerokości kontenera.
const SHEET_PX = 794
const container = ref(null)
const sheet = ref(null)
const scale = ref(1)
const height = ref(0)

let ro
function measure() {
  if (!container.value || !sheet.value) return
  scale.value = Math.min(1, container.value.clientWidth / SHEET_PX)
  height.value = sheet.value.offsetHeight * scale.value
}

onMounted(() => {
  ro = new ResizeObserver(measure)
  ro.observe(container.value)
  ro.observe(sheet.value)
  measure()
})
onUnmounted(() => ro?.disconnect())
</script>

<template>
  <div ref="container" class="w-full" :style="{ height: height + 'px' }">
    <div
      ref="sheet"
      class="origin-top-left rounded-sm shadow-sm ring-1 ring-black/5 overflow-hidden"
      :style="{ width: SHEET_PX + 'px', transform: `scale(${scale})` }"
    >
      <PrintCard sheet />
    </div>
  </div>
</template>
