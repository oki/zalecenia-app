/** Otwiera systemowe okno drukowania (karta jest w #print-root). */
export function printCard() {
  // Zdjęcie fokusu zapobiega pokazaniu klawiatury na mobile po powrocie z druku
  document.activeElement?.blur?.()
  window.print()
}
