import './assets/main.css'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createApp } from 'vue'
import App from './App.vue'

import { createPinia } from 'pinia'

const pinia = createPinia()
createApp(App).use(pinia).use(ElementPlus).mount('#app')
