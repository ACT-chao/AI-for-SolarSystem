// 天文计算工具
import { PLANETS } from '../constants';

// 天干地支
const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 五行
const FIVE_ELEMENTS = {
    '木': ['甲', '乙'],
    '火': ['丙', '丁'],
    '土': ['戊', '己'],
    '金': ['庚', '辛'],
    '水': ['壬', '癸']
};

// 八卦
const TRIGRAMS = {
    '乾': { element: '金', nature: '天', direction: '西北' },
    '兑': { element: '金', nature: '泽', direction: '西' },
    '离': { element: '火', nature: '火', direction: '南' },
    '震': { element: '木', nature: '雷', direction: '东' },
    '巽': { element: '木', nature: '风', direction: '东南' },
    '坎': { element: '水', nature: '水', direction: '北' },
    '艮': { element: '土', nature: '山', direction: '东北' },
    '坤': { element: '土', nature: '地', direction: '西南' }
};

export class AstronomyCalculator {
    constructor() {
        this.planets = PLANETS;
    }

    // 计算行星当前位置
    calculateCurrentPositions(currentTime) {
        return this.planets.map(planet => {
            if (planet.name === 'sun') return { 
                ...planet, 
                currentPosition: { x: 0, y: 0, z: 0 },
                velocity: 0,
                distance: 0
            };

            // 使用开普勒定律计算行星位置
            const orbitalPeriod = this.parseYear(planet.year);
            const meanAnomaly = (2 * Math.PI * (currentTime % orbitalPeriod)) / orbitalPeriod;
            
            // 计算位置
            const x = planet.orbitalRadius * Math.cos(meanAnomaly);
            const y = planet.orbitalRadius * Math.sin(meanAnomaly);
            const z = 0; // 简化为平面运动

            // 计算轨道速度 (km/s)
            const velocity = 2 * Math.PI * planet.orbitalRadius / (orbitalPeriod * 24 * 3600);
            
            // 计算与太阳的距离
            const distance = Math.sqrt(x * x + y * y + z * z);

            return {
                ...planet,
                currentPosition: { x, y, z },
                velocity,
                distance
            };
        });
    }

    // 计算行星相位角
    calculatePhaseAngles(positions) {
        const planets = positions.filter(p => p.name !== 'sun');
        const angles = [];

        for (let i = 0; i < planets.length; i++) {
            for (let j = i + 1; j < planets.length; j++) {
                const angle = this.calculateAngleBetweenPlanets(
                    planets[i].currentPosition,
                    planets[j].currentPosition
                );
                angles.push({
                    planets: [planets[i].displayName, planets[j].displayName],
                    angle: angle
                });
            }
        }

        return angles;
    }

    // 计算特殊天象
    calculateCelestialEvents(positions) {
        const events = [];
        const planets = positions.filter(p => p.name !== 'sun');

        // 检查合相
        for (let i = 0; i < planets.length; i++) {
            for (let j = i + 1; j < planets.length; j++) {
                const angle = this.calculateAngleBetweenPlanets(
                    planets[i].currentPosition,
                    planets[j].currentPosition
                );
                
                if (angle < 10) { // 合相阈值为10度
                    events.push({
                        type: '合相',
                        planets: [planets[i].displayName, planets[j].displayName],
                        angle: angle
                    });
                }
            }
        }

        return events;
    }

    // 计算天干地支
    calculateChineseZodiac(currentTime) {
        const year = new Date(currentTime).getFullYear();
        const baseYear = 1984; // 甲子年
        const cycle = (year - baseYear) % 60;
        
        const stemIndex = cycle % 10;
        const branchIndex = cycle % 12;
        
        return {
            year: `${HEAVENLY_STEMS[stemIndex]}${EARTHLY_BRANCHES[branchIndex]}年`,
            stem: HEAVENLY_STEMS[stemIndex],
            branch: EARTHLY_BRANCHES[branchIndex],
            element: this.getFiveElement(HEAVENLY_STEMS[stemIndex])
        };
    }

    // 获取五行属性
    getFiveElement(stem) {
        for (const [element, stems] of Object.entries(FIVE_ELEMENTS)) {
            if (stems.includes(stem)) return element;
        }
        return null;
    }

    // 计算八卦方位
    calculateTrigramPositions(positions) {
        const results = [];
        const planets = positions.filter(p => p.name !== 'sun');

        planets.forEach(planet => {
            const angle = Math.atan2(planet.currentPosition.y, planet.currentPosition.x);
            const degrees = (angle * 180 / Math.PI + 360) % 360;
            
            // 根据角度判断方位
            let trigram;
            if (degrees >= 337.5 || degrees < 22.5) trigram = '坎';
            else if (degrees < 67.5) trigram = '艮';
            else if (degrees < 112.5) trigram = '震';
            else if (degrees < 157.5) trigram = '巽';
            else if (degrees < 202.5) trigram = '离';
            else if (degrees < 247.5) trigram = '坤';
            else if (degrees < 292.5) trigram = '兑';
            else trigram = '乾';

            results.push({
                planet: planet.displayName,
                trigram: trigram,
                properties: TRIGRAMS[trigram]
            });
        });

        return results;
    }

    // 辅助方法：解析年份字符串
    parseYear(yearStr) {
        if (yearStr.includes('地球年')) {
            return parseFloat(yearStr) * 365.25 * 24 * 60 * 60 * 1000; // 转换为毫秒
        }
        if (yearStr.includes('地球日')) {
            return parseFloat(yearStr) * 24 * 60 * 60 * 1000; // 转换为毫秒
        }
        return 365.25 * 24 * 60 * 60 * 1000; // 默认一年
    }

    // 辅助方法：计算两个行星之间的角度
    calculateAngleBetweenPlanets(pos1, pos2) {
        const dot = pos1.x * pos2.x + pos1.y * pos2.y;
        const mag1 = Math.sqrt(pos1.x * pos1.x + pos1.y * pos1.y);
        const mag2 = Math.sqrt(pos2.x * pos2.x + pos2.y * pos2.y);
        const angle = Math.acos(dot / (mag1 * mag2));
        return (angle * 180 / Math.PI);
    }
}

export const calculator = new AstronomyCalculator();
