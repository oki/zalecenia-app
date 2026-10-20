<script setup>
import PrintCard from './PrintCard.vue'
</script>

<template>
  <!-- Widoczne tylko w trybie druku (patrz main.css) -->
  <Teleport to="body">
    <div id="print-root">
      <PrintCard />
    </div>
  </Teleport>
</template>
