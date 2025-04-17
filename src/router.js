import { createRouter, createWebHistory } from 'vue-router'
import Scene from './components/Scene.vue'
import DashBoard from './components/DashBoard.vue'

const routes = [
    {
        path: '/',
        name: 'Scene',
        component: Scene
    },
    {
        path: '/dashboard',
        name: 'DashBoard',
        component: DashBoard
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
