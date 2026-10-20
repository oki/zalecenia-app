const MAX_SIDE = 600
const MAX_SVG_BYTES = 150_000

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Nie udało się odczytać pliku.'))
    reader.readAsDataURL(file)
  })
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Nie udało się wczytać obrazu.'))
    img.src = src
  })
}

/** Zmniejsza logo do maks. 600 px (PNG z przezroczystością). Małe SVG zostają bez zmian. */
export async function prepareLogo(file) {
  if (!/^image\/(png|jpeg|webp|svg\+xml)$/.test(file.type)) {
    throw new Error('Obsługiwane formaty: PNG, JPG, WEBP, SVG.')
  }
  const src = await readAsDataURL(file)
  if (file.type === 'image/svg+xml' && file.size <= MAX_SVG_BYTES) return src

  const img = await loadImage(src)
  const w = img.naturalWidth || MAX_SIDE
  const h = img.naturalHeight || MAX_SIDE
  const ratio = Math.min(1, MAX_SIDE / Math.max(w, h))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(w * ratio)
  canvas.height = Math.round(h * ratio)
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/png')
}
