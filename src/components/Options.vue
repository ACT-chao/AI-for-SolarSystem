<template>
    <div class="options">
        <div class="form-group">
            <label>速度</label>
            <div class="input-select">
                    <div class="select-item">
                    <input name="speed" id="realtime" type="radio" value="realtime" v-model="speed" @change="onSpeedChange">
                    <label for="realtime">静止</label>
                </div>
                <div class="select-item">
                    <input checked name="speed" id="day_sec" type="radio" value="day_sec" v-model="speed" @change="onSpeedChange">
                    <label for="day_sec">1天/秒</label>
                </div>
                <div class="select-item">
                    <input name="speed" id="mon_sec" type="radio" value="mon_sec" v-model="speed" @change="onSpeedChange">
                    <label for="mon_sec">1月/秒</label>
                </div>
                <div class="select-item">
                    <input name="speed" id="idealized" type="radio" value="idealized" v-model="speed" @change="onSpeedChange">
                    <label for="idealized">最佳速度</label>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            speed: "day_sec"
        }
    },
    emits: ["speedChanged"],
    methods: {
        onSpeedChange(e) {
            const value = e.target.value;
            this.$emit('speedChanged', value);
        }
    },
    mounted() {
        this.$emit('speedChanged', this.speed);
    }
}
</script>

<style scoped lang="scss">
    .options {
        position: absolute;
        right: 20px;
        top: 100px;
        .form-group {
            margin: 15px 5px;
            text-align: center;
            > label {
                font-size: 16px;
                color: #00ffd9;
                text-shadow: 0 0 10px rgba(0, 255, 217, 0.3);
                margin-bottom: 8px;
                display: block;
            }
        }
        .input-select {
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(0, 255, 217, 0.2);
            border-radius: 12px;
            margin-top: 10px;
            width: 120px;
            margin-left: auto;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(10px);
            
            .select-item {
                display: flex;
                justify-content: stretch;
                align-items: stretch;
                text-align: center;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                
                &:last-child {
                    border-bottom: none;
                }
                
                input {
                    appearance: none;
                    &:checked + label {
                        background: linear-gradient(90deg, rgba(0, 255, 217, 0.2), rgba(0, 166, 255, 0.2));
                        color: #00ffd9;
                        text-shadow: 0 0 10px rgba(0, 255, 217, 0.3);
                    }
                }
                label {
                    padding: 12px 16px;
                    cursor: pointer;
                    flex-grow: 1;
                    font-size: 14px;
                    transition: all 0.3s ease;
                    
                    &:hover {
                        background: rgba(255, 255, 255, 0.1);
                    }
                }
            }
        }
    }
    @media (max-height: 360px) {
        .options {
            top: 50px;
        }
    }
</style>