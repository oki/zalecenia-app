import { createApp } from 'vue'
import { createPinia } from 'pinia'
// Tylko podzbiory latin + latin-ext (polskie znaki) – mniejszy cache offline
import '@fontsource/roboto/latin-400.css'
import '@fontsource/roboto/latin-ext-400.css'
import '@fontsource/roboto/latin-500.css'
import '@fontsource/roboto/latin-ext-500.css'
import '@fontsource/roboto/latin-700.css'
import '@fontsource/roboto/latin-ext-700.css'
import '@fontsource/poppins/latin-500.css'
import '@fontsource/poppins/latin-ext-500.css'
import '@fontsource/poppins/latin-600.css'
import '@fontsource/poppins/latin-ext-600.css'
import './styles/main.css'
import App from './App.vue'
import { router } from './router.js'

createApp(App).use(createPinia()).use(router).mount('#app')
