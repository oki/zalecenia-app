<script setup>
import { ref, nextTick } from 'vue'
import { useCatalogStore } from '../stores/catalog.js'

const catalog = useCatalogStore()
const emit = defineEmits(['saved'])
const dialog = ref(null)
const input = ref(null)
const categoryId = ref(null)
const name = ref('')
const error = ref('')

async function open(category = null) {
  categoryId.value = category?.id ?? null
  name.value = category?.name ?? ''
  error.value = ''
  dialog.value.showModal()
  await nextTick()
  input.value?.focus()
}

function save() {
  const value = name.value.trim()
  if (!value) return (error.value = 'Wpisz nazwę kategorii.')
  const duplicate = catalog.categories.some((c) => c.id !== categoryId.value && c.name.toLowerCase() === value.toLowerCase())
  if (duplicate) return (error.value = 'Kategoria o tej nazwie już istnieje.')
  let id = categoryId.value
  if (id) catalog.renameCategory(id, value)
  else id = catalog.addCategory(value).id
  dialog.value.close()
  emit('saved', { id, added: !categoryId.value })
}

defineExpose({ open })
</script>

<template>
  <dialog ref="dialog" class="modal modal-bottom sm:modal-middle">
    <form class="modal-box space-y-4" novalidate @submit.prevent="save">
      <h3 class="text-lg font-semibold">{{ categoryId ? 'Zmień nazwę kategorii' : 'Nowa kategoria' }}</h3>
      <label class="block">
        <span class="block text-sm font-medium mb-1.5">Nazwa</span>
        <input ref="input" v-model="name" type="text" class="input w-full h-12 text-base" />
      </label>
      <p v-if="error" class="text-error text-sm" role="alert">{{ error }}</p>
      <div class="modal-action">
        <button type="button" class="btn btn-ghost min-h-11" @click="dialog.close()">Anuluj</button>
        <button type="submit" class="btn btn-primary min-h-11">Zapisz</button>
      </div>
    </form>
    <form method="dialog" class="modal-backdrop"><button aria-label="Zamknij">zamknij</button></form>
  </dialog>
</template>
