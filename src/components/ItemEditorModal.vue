<script setup>
import { ref, nextTick } from 'vue'
import { useCatalogStore } from '../stores/catalog.js'
import { AGE_TAGS } from '../data/ageGroups.js'

const catalog = useCatalogStore()
const emit = defineEmits(['saved'])

const dialog = ref(null)
const textarea = ref(null)
const itemId = ref(null)
const form = ref({ text: '', categoryId: '', age: 'all' })
const error = ref('')

async function open({ item = null, categoryId = '' } = {}) {
  itemId.value = item?.id ?? null
  form.value = {
    text: item?.text ?? '',
    categoryId: categoryId || catalog.categories[0]?.id || '',
    age: item?.age ?? 'all',
  }
  error.value = ''
  dialog.value.showModal()
  await nextTick()
  textarea.value?.focus()
}

function save() {
  if (!form.value.text.trim()) return (error.value = 'Wpisz treść zalecenia.')
  if (!catalog.findCategory(form.value.categoryId)) return (error.value = 'Wybierz kategorię.')
  if (itemId.value) catalog.updateItem(itemId.value, form.value)
  else catalog.addItem(form.value.categoryId, form.value)
  dialog.value.close()
  emit('saved', { added: !itemId.value, categoryId: form.value.categoryId })
}

defineExpose({ open })
</script>

<template>
  <dialog ref="dialog" class="modal modal-bottom sm:modal-middle">
    <form class="modal-box space-y-4" novalidate @submit.prevent="save">
      <h3 class="text-lg font-semibold">{{ itemId ? 'Edytuj zalecenie' : 'Nowe zalecenie' }}</h3>

      <label class="block">
        <span class="block text-sm font-medium mb-1.5">Treść</span>
        <textarea ref="textarea" v-model="form.text" class="textarea w-full text-base" rows="4"></textarea>
      </label>

      <label class="block">
        <span class="block text-sm font-medium mb-1.5">Kategoria <span class="text-error">*</span></span>
        <select v-model="form.categoryId" class="select w-full h-12 text-base" required>
          <option v-for="c in catalog.categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </label>

      <label class="block">
        <span class="block text-sm font-medium mb-1.5">Grupa wiekowa <span class="text-base-content/50 font-normal">(opcjonalnie)</span></span>
        <select v-model="form.age" class="select w-full h-12 text-base">
          <option v-for="t in AGE_TAGS" :key="t.id" :value="t.id">{{ t.label }} ({{ t.id }})</option>
        </select>
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
