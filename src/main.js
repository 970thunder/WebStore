import './assets/main.css'

import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from '@/router'
import axios from 'axios';
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-persistedstate-plugin'
import locale from 'element-plus/dist/locale/zh-cn.js'

import App from './App.vue'


const app = createApp(App);
const pinia = createPinia();
const persist = createPersistedState();
app.config.globalProperties.$http = axios; // 将axios添加到全局属性中
pinia.use(persist)
app.use(router);
app.use(ElementPlus, { locale });
app.use(pinia)

app.mount('#app')
