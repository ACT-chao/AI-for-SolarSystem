<template>
    <nav class="nav-bar">
        <router-link to="/" class="nav-link">星系图</router-link>
        <router-link to="/dashboard" class="nav-link">数据分析</router-link>
    </nav>
    <router-view v-slot="{ Component }">
        <component :is="Component" @onSceneLoad="onSceneLoad" />
    </router-view>
    <div ref="loading" class="loading-screen">
        <div class="planet">
            <div class="cloud"></div>
            <div class="cloud"></div>
            <div class="cloud"></div>
        </div>
        <p>加载中...</p>
    </div>
</template>

<script>
import { RouterView, RouterLink } from 'vue-router';

export default {
    components: {
        RouterView,
        RouterLink
    },
    methods: {
        onSceneLoad() {
            this.$refs.loading.style.display = "none";
        }
    }
}
</script>

<style scoped lang="scss">
    .nav-bar {
        position: fixed;
        bottom: 20px;
        left: 0;
        right: 0;
        z-index: 100;
        display: flex;
        justify-content: center;
        gap: 16px;
        padding: 16px;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(10px);
    }
    .nav-link {
        padding: 8px 16px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.1);
        color: white;
        text-decoration: none;
        transition: background-color 0.3s;

        &:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        &.router-link-active {
            background: rgba(255, 255, 255, 0.3);
        }
    }
    .loading-screen {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 200;
        width: 100%;
        height: 100%;
        background-color: var(--dark);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 16px;
        font-weight: bold;
        .planet {
            width: 80px;
            height: 80px;
            overflow: hidden;
            border-radius: 50%;
            background-color: #3009e0;
            position: relative;
            box-shadow: inset -20px 0px 12px 0px #05014d;
            .cloud {
                border-radius: var(--radius);
                background-color: rgb(208, 208, 208);
                width: 30px;
                height: 10px;
                position: absolute;
                transform: translateY(-100px);
            }
            .cloud:nth-child(1) {
                top: 3px;
                animation: cloud 1500ms linear 100ms infinite;
            }
            .cloud:nth-child(2) {
                top: 28px;
                animation: cloud 1700ms linear 50ms infinite;
            }
            .cloud:nth-child(3) {
                top: 58px;
                animation: cloud 1800ms linear 200ms infinite;
            }
        }
    }
    @keyframes cloud {
        0% {
            transform: translateX(-50px);
        }
        100% {
            transform: translateX(90px);
        }
    }
</style>
