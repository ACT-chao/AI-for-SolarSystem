import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './sass/main.scss';
import './chat.css';
import ChatManager from './chat';

const app = createApp(App)
app.use(router)
app.mount('#app')

// Initialize chat
new ChatManager();