<script setup>
import { ref, computed, nextTick } from 'vue'
import Icon from './Icon.vue'
import { useDraftStore } from '../stores/draft.js'

const props = defineProps({ item: { type: Object, required: true } })
const store = useDraftStore()

const selected = computed({
  get: () => store.isSelected(props.item.id),
  set: (on) => store.toggle(props.item.id, on),
})
const overridden = computed(() => selected.value && store.draft.selected[props.item.id] != null)

const editing = ref(false)
const text = ref('')
const textarea = ref(null)

async function startEdit() {
  text.value = store.textFor(props.item)
  editing.value = true
  await nextTick()
  textarea.value?.focus()
}
function save() {
  store.setOverride(props.item, text.value)
  editing.value = false
}
function restore() {
  store.setOverride(props.item, props.item.text)
  editing.value = false
}
</script>

<template>
  <div class="px-4 py-3" :class="{ 'bg-primary/5': selected }">
    <div class="flex items-start gap-3">
      <label class="flex items-start gap-3 flex-1 cursor-pointer min-h-11 py-1">
        <input v-model="selected" type="checkbox" class="checkbox checkbox-primary mt-0.5" />
        <span class="leading-relaxed">
          {{ store.textFor(item) }}
          <span v-if="overridden" class="badge badge-secondary badge-sm align-middle ml-1">zmienione</span>
        </span>
      </label>
      <button
        v-if="selected && !editing"
        type="button"
        class="btn btn-ghost btn-square min-h-11 min-w-11 -mr-2"
        aria-label="Zmień treść na tym wydruku"
        title="Zmień treść na tym wydruku"
        @click="startEdit"
      >
        <Icon name="pencil" :size="18" />
      </button>
    </div>

    <div v-if="editing" class="mt-2 pl-9 space-y-2">
      <textarea
        ref="textarea"
        v-model="text"
        class="textarea w-full text-base"
        rows="3"
        aria-label="Treść zalecenia na tym wydruku"
        @keydown.esc="editing = false"
      ></textarea>
      <p class="text-xs text-base-content/60">Zmiana dotyczy tylko bieżącej karty – katalog pozostaje bez zmian.</p>
      <div class="flex flex-wrap gap-2">
        <button type="button" class="btn btn-primary btn-sm min-h-11" @click="save">
          <Icon name="check" :size="16" /> Zapisz
        </button>
        <button type="button" class="btn btn-ghost btn-sm min-h-11" @click="editing = false">Anuluj</button>
        <button v-if="overridden" type="button" class="btn btn-ghost btn-sm min-h-11 ml-auto" @click="restore">
          <Icon name="undo" :size="16" /> Przywróć oryginał
        </button>
      </div>
    </div>
  </div>
</template>
