<template>
    <div class="planet-card">
        <img class="planet-img" :src="`./assets/cards/${planetInfo.name}.png`" :alt="planetInfo.displayName">
        <div class="title">
            <h2>{{ planetInfo.displayName }}</h2>
        </div>
        <button class="close" @click="this.$emit('closeCard')">×</button>
        <div class="temperature">
            <p v-if="planetInfo.meanTemp" title="表面温度">平均温度: 
                <span class="value" :style="{ color: temperatureColor(planetInfo.meanTemp) }"> 
                    <svg xmlns="http://www.w3.org/2000/svg" :stroke="temperatureColor(planetInfo.meanTemp)" class="icon icon-tabler icon-tabler-temperature" width="22" height="22" viewBox="0 0 24 24" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 13.5a4 4 0 1 0 4 0v-8.5a2 2 0 0 0 -4 0v8.5" /><line x1="10" y1="9" x2="14" y2="9" /></svg>
                    {{ planetInfo.meanTemp }} °C
                </span>
            </p>
            <p v-if="planetInfo.minTemp" title="表面温度">最低温度: 
                <span class="value" :style="{ color: temperatureColor(planetInfo.minTemp)}">
                    <svg xmlns="http://www.w3.org/2000/svg" :stroke="temperatureColor(planetInfo.minTemp)" class="icon icon-tabler icon-tabler-temperature" width="22" height="22" viewBox="0 0 24 24" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 13.5a4 4 0 1 0 4 0v-8.5a2 2 0 0 0 -4 0v8.5" /><line x1="10" y1="9" x2="14" y2="9" /></svg>
                    {{ planetInfo.minTemp }} °C
                </span>
            </p>
            <p v-if="planetInfo.maxTemp" title="表面温度">最高温度: 
                <span class="value" :style="{ color: temperatureColor(planetInfo.maxTemp)}">
                    <svg xmlns="http://www.w3.org/2000/svg" :stroke="temperatureColor(planetInfo.maxTemp)" class="icon icon-tabler icon-tabler-temperature" width="22" height="22" viewBox="0 0 24 24" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 13.5a4 4 0 1 0 4 0v-8.5a2 2 0 0 0 -4 0v8.5" /><line x1="10" y1="9" x2="14" y2="9" /></svg>
                    {{ planetInfo.maxTemp }} °C
                </span>
            </p>
        </div>
        <div class="info">
            <h5>{{ planetInfo.caption }}</h5>
            <p v-if="planetInfo.radius">半径: {{ planetInfo.radius }} 千米</p>
            <p v-if="planetInfo.timesLarger && planetInfo.timesLarger !== -1">
                <span v-if="planetInfo.timesLarger >= 1">比地球大 {{ planetInfo.timesLarger }} 倍</span>
                <span v-else>比地球小 {{ (1 / planetInfo.timesLarger).toFixed(2) }} 倍</span>
            </p>
            <p v-if="planetInfo.distanceFromSun && planetInfo.distanceFromSun !== -1">距太阳距离: {{ planetInfo.distanceFromSun }} AU</p>
            <p v-if="planetInfo.distance">距{{ planetInfo.orbitObject.charAt(0).toUpperCase() + planetInfo.orbitObject.slice(1) }}距离: {{ planetInfo.distance }} 千米</p>
            <p v-if="planetInfo.year">公转时长: {{ planetInfo.year }}</p>
            <p v-if="planetInfo.day">自转时长: {{ planetInfo.day }}</p>
            <p v-if="planetInfo.moons != null">卫星数量: {{ planetInfo.moons }}</p>
            <button class="ask-ai-btn" @click="askAI">询问AI关于{{ planetInfo.displayName }}的信息</button>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        planetInfo: {
            type: Object,
            required: true
        }
    },
    emits: ["closeCard"],
    methods: {
        temperatureColor(temp) {
            if(!temp) return "#F3F3F3";
            
            // Convert to number if string
            temp = Number(temp);
            
            if(temp < -150) return "#00ffff";
            if(temp < -50) return "#00ccff";
            if(temp < 0) return "#0099ff";
            if(temp < 50) return "#ff9900";
            if(temp < 150) return "#ff6600";
            return "#ff0000";
        },
        askAI() {
            // 创建一个包含行星信息的提示词
            const prompt = `请解释一下关于${this.planetInfo.displayName}的以下信息：
温度：${this.planetInfo.meanTemp ? '平均温度 ' + this.planetInfo.meanTemp + '°C' : ''}
${this.planetInfo.caption}
半径：${this.planetInfo.radius || '未知'}
与地球大小比较：${this.planetInfo.timesLarger ? this.planetInfo.timesLarger + '倍于地球' : '未知'}
距太阳距离：${this.planetInfo.distanceFromSun || '未知'}
年长：${this.planetInfo.year || '未知'}
日长：${this.planetInfo.day || '未知'}
卫星数量：${this.planetInfo.moons || '未知'}

请详细解释这些数据对这个行星的特点有什么影响，以及这个行星有什么独特之处？`;

            // 触发全局事件，让 ChatManager 处理
            window.dispatchEvent(new CustomEvent('askAI', { detail: prompt }));
        }
    }
}
</script>

<style scoped lang="scss">
    .planet-card {
        position: absolute;
        left: 15px;
        top: 50%;
        transform: translateY(-50%);
        width: 280px;
        border-radius: var(--radius);
        box-shadow: -8px -9px 14px rgb(255 255 255 / 8%);
        overflow: hidden;
        font-size: 14px;
        .planet-img{
            width: 100%;
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            z-index: -1;
            background-color: var(--secondary);
        }
        .info {
            margin-top: 150px;
            min-height: 250px;
            width: 100%;
            border-radius: var(--radius);
            background: linear-gradient(131.76deg, var(--primary) -34.78%, var(--dark) 93.37%);
            padding: 6px 12px;
            h5 {
                text-align: center;
                font-size: 18px;
                color: var(--tertiary);
                font-weight: 100;
            }
            ul {
                margin: 10px 0;
                text-align: left;
                list-style: none;
                padding-left: 0;
                li {
                    margin: 4px 0;
                    color: #d5d5d5;
                    .value {
                        font-weight: bold;
                        color: #fff;
                    }
                }
            }
        }
        .title{
            position: absolute;
            text-align: center;
            top: 2px;
            width: 100%;
            h2 {
                text-transform: uppercase;
                font-weight: 400;
                font-size: 20px;
            }
        }
        .temperature {
            position: absolute;
            top: 50px;
            right: 10px;
            font-weight: 600;
            text-shadow: -4px 1px 11px #000;
            font-size: 14px;
            font-weight: lighter;
            .value {
                font-weight: bold;
                text-shadow: 0 0 10px #fff;
            }
            .icon {
                vertical-align: middle;
            }
        }
        .close {
            position: absolute;
            top: 2px;
            right: 6px;
            background-color: transparent;
            border: 0;
            color: #fff;
            font-size: 24px;
            cursor: pointer;
        }
        .description {
            margin: 6px 0;
        }
        .ask-ai-btn {
            margin-top: 15px;
            padding: 8px 16px;
            background: rgba(255, 255, 255, 0.1);
            border: none;
            border-radius: 5px;
            color: #F3F3F3;
            cursor: pointer;
            font-family: 'Chivo', sans-serif;
            transition: background 0.3s ease;

            &:hover {
                background: rgba(255, 255, 255, 0.2);
            }
        }
    }
    @media (max-width: 560px) {
        .planet-card {
            width: auto;
            height: auto;
            transform: none;
            top: 125px;
            left: 10px;
            right: 10px;
            bottom: 20px;
            z-index: 4;
            .info {
                top: 250px;
            }
            .close {
                font-size: 32px;
            }
        }
    }
    @media (max-height: 360px) {
        .planet-card {
            width: auto;
            height: auto;
            transform: none;
            top: 15px;
            left: 10px;
            right: 10px;
            bottom: 10px;
            z-index: 4;
            .planet-img {
                height: 100%;
                width: auto;
            }
            .info {
                top: 0;
                right: 0;
                width: auto;
                height: 100%;
                left: 230px;
            }
            .title {
                max-width: 250px;
            }
            .temperature {
                left: 110px;
                right: auto;
            }
            .close {
                right: auto;
                left: 6px;
                font-size: 32px;
            }
        }
    }
</style>