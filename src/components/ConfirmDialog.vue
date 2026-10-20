<script setup>
import { ref, watch, nextTick } from 'vue'
import { useUiStore } from '../stores/ui.js'

const ui = useUiStore()
const dialog = ref(null)

watch(
  () => ui.confirmState,
  async (state) => {
    await nextTick()
    if (state && !dialog.value.open) dialog.value.showModal()
    if (!state && dialog.value?.open) dialog.value.close()
  },
)
</script>

<template>
  <dialog ref="dialog" class="modal modal-bottom sm:modal-middle" @close="ui.confirmState && ui.closeConfirm(false)">
    <div v-if="ui.confirmState" class="modal-box">
      <h3 class="text-lg font-semibold">{{ ui.confirmState.title }}</h3>
      <p v-if="ui.confirmState.message" class="py-3 text-base-content/70 whitespace-pre-line">{{ ui.confirmState.message }}</p>
      <div class="modal-action">
        <button type="button" class="btn btn-ghost min-h-11" @click="ui.closeConfirm(false)">Anuluj</button>
        <button
          type="button"
          class="btn min-h-11"
          :class="ui.confirmState.danger ? 'btn-error' : 'btn-primary'"
          @click="ui.closeConfirm(true)"
        >
          {{ ui.confirmState.confirmLabel }}
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop"><button aria-label="Zamknij">zamknij</button></form>
  </dialog>
</template>
