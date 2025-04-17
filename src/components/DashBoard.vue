<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1 class="dashboard-title">太阳系数据分析</h1>
      <div class="chinese-astrology">
        <div class="year-info">
          {{ chineseZodiac.year }} - {{ chineseZodiac.element }}
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <!-- 左侧面板：实时数据 -->
      <div class="panel real-time-panel">
        <h2>实时天象</h2>
        <div class="real-time-data">
          <div class="chart-section">
            <div ref="realTimeChart" class="real-time-chart"></div>
            <div ref="phaseAngleChart" class="phase-angle-chart"></div>
          </div>
          <div class="planet-positions">
            <div v-for="planet in currentPositions" :key="planet.name" class="planet-position">
              <span class="planet-name">{{ planet.displayName }}</span>
              <span class="position-data">
                方位: {{ getPlanetTrigram(planet).trigram }}
                ({{ getPlanetTrigram(planet).properties.direction }})
              </span>
            </div>
          </div>
          
          <div class="celestial-events" v-if="specialEvents.length > 0">
            <h3>特殊天象</h3>
            <div v-for="(event, index) in specialEvents" :key="index" class="event">
              {{ event.planets.join(' 和 ') }} {{ event.type }}
              ({{ event.angle.toFixed(1) }}°)
            </div>
          </div>
        </div>
      </div>

      <!-- 中间面板：图表 -->
      <div class="panel charts-panel">
        <div class="chart-grid">
          <div class="chart-container">
            <div ref="planetPositionChart" class="chart"></div>
          </div>
          <div class="chart-container">
            <div ref="planetSizeChart" class="chart"></div>
          </div>
          <div class="chart-container">
            <div ref="planetTempChart" class="chart"></div>
          </div>
          <div class="chart-container">
            <div ref="planetOrbitalChart" class="chart"></div>
          </div>
        </div>
      </div>

      <!-- 右侧面板：八卦与五行 -->
      <div class="panel trigrams-panel">
        <h2>八卦五行</h2>
        <div ref="trigramChart" class="trigram-chart"></div>
        <div class="charts-container">
          <div ref="elementEnergyChart" class="element-chart"></div>
          <div ref="directionChart" class="direction-chart"></div>
        </div>
        <div class="five-elements">
          <div v-for="(planets, element) in elementalGroups" :key="element" 
               class="element-group" :class="element">
            <h4>{{ element }}</h4>
            <div class="planet-list">
              {{ planets.join('、') }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, ref, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { PLANETS } from '../constants'
import { calculator } from '../utils/astronomyCalculator'

export default {
  name: 'DashBoard',
  setup() {
    const planetPositionChart = ref(null)
    const planetSizeChart = ref(null)
    const planetTempChart = ref(null)
    const planetOrbitalChart = ref(null)
    const trigramChart = ref(null)
    const realTimeChart = ref(null)
    const phaseAngleChart = ref(null)
    const elementEnergyChart = ref(null)
    const directionChart = ref(null)

    const currentPositions = ref([])
    const specialEvents = ref([])
    const chineseZodiac = ref({})
    const elementalGroups = ref({})

    let charts = []
    let updateTimer = null

    const baseTime = ref(Date.now())
    const timeScale = 24 * 60 * 60 * 1000 // 一天的毫秒数

    const updateData = () => {
      baseTime.value += timeScale // 累加时间
      currentPositions.value = calculator.calculateCurrentPositions(baseTime.value)
      specialEvents.value = calculator.calculateCelestialEvents(currentPositions.value)
      chineseZodiac.value = calculator.calculateChineseZodiac(baseTime.value)
      
      const trigramPositions = calculator.calculateTrigramPositions(currentPositions.value)
      updateElementalGroups(trigramPositions)
      
      // 更新图表数据
      const lastChart = charts[charts.length - 4] // 实时轨道图现在是倒数第四个
      if (lastChart) {
        const planets = PLANETS.filter(p => 
          !p.isSatellite && 
          p.name !== 'sun' && 
          p.name !== 'moon' &&
          p.orbitObject === 'sun'  // 只选择围绕太阳运转的天体
        )
        
        const minRadius = Math.min(...planets.map(p => p.orbitalRadius))
        const maxRadius = Math.max(...planets.map(p => p.orbitalRadius))
        const logMin = Math.log(minRadius)
        const logMax = Math.log(maxRadius)
        
        // 计算每个行星的当前位置（使用对数比例）
        const positions = currentPositions.value
          .filter(p => !p.isSatellite && p.name !== 'sun' && p.orbitObject === 'sun')
          .sort((a, b) => a.orbitalRadius - b.orbitalRadius)
          .map(p => {
            const pos = p.currentPosition
            const currentRadius = Math.sqrt(pos.x * pos.x + pos.y * pos.y)
            const logValue = Math.log(currentRadius)
            return (logValue - logMin) / (logMax - logMin)
          })

        lastChart.setOption({
          series: [
            {
              data: [
                {
                  value: positions,
                  name: '轨道位置'
                }
              ]
            }
          ]
        })
      }
      
      // 更新相位角图表
      const phaseChart = charts[charts.length - 3]
      if (phaseChart) {
        const { angles, labels } = calculatePhaseAngles(currentPositions.value)
        phaseChart.setOption({
          xAxis: {
            data: labels
          },
          series: [{
            data: angles
          }]
        })
      }

      // 更新元素能量图表
      const elementChart = charts[charts.length - 2]
      if (elementChart) {
        // 计算每个元素的能量值
        const elementEnergies = {
          '金': 0, '木': 0, '水': 0, '火': 0, '土': 0
        }

        currentPositions.value.forEach(planet => {
          if (planet.name === 'sun') return
          
          // 基于行星速度和位置计算能量
          const speed = planet.velocity || 0
          const distance = Math.sqrt(
            planet.currentPosition.x * planet.currentPosition.x + 
            planet.currentPosition.y * planet.currentPosition.y
          )
          
          // 根据行星位置判断方位，并增加相应元素的能量
          const angle = Math.atan2(planet.currentPosition.y, planet.currentPosition.x) * (180 / Math.PI)
          const normalizedAngle = (angle + 360) % 360
          
          // 计算能量基值 - 使用速度的平方来增加变化幅度
          const baseEnergy = (speed * speed) / (distance + 1) // 加1避免除以0
          
          // 根据角度范围分配能量到不同元素
          // 每个元素对应的角度范围都有主要和次要影响区
          if (normalizedAngle >= 337.5 || normalizedAngle < 22.5) {
            elementEnergies['金'] += baseEnergy
            elementEnergies['水'] += baseEnergy * 0.5
          } else if (normalizedAngle >= 22.5 && normalizedAngle < 67.5) {
            elementEnergies['木'] += baseEnergy
            elementEnergies['火'] += baseEnergy * 0.5
          } else if (normalizedAngle >= 67.5 && normalizedAngle < 112.5) {
            elementEnergies['木'] += baseEnergy
            elementEnergies['土'] += baseEnergy * 0.5
          } else if (normalizedAngle >= 112.5 && normalizedAngle < 157.5) {
            elementEnergies['火'] += baseEnergy
            elementEnergies['木'] += baseEnergy * 0.5
          } else if (normalizedAngle >= 157.5 && normalizedAngle < 202.5) {
            elementEnergies['火'] += baseEnergy
            elementEnergies['土'] += baseEnergy * 0.5
          } else if (normalizedAngle >= 202.5 && normalizedAngle < 247.5) {
            elementEnergies['土'] += baseEnergy
            elementEnergies['金'] += baseEnergy * 0.5
          } else {
            elementEnergies['水'] += baseEnergy
            elementEnergies['金'] += baseEnergy * 0.5
          }
        })

        // 归一化能量值，使其在0-100之间
        const maxEnergy = Math.max(...Object.values(elementEnergies))
        if (maxEnergy > 0) {
          Object.keys(elementEnergies).forEach(key => {
            elementEnergies[key] = (elementEnergies[key] / maxEnergy) * 100
          })
        }

        elementChart.setOption({
          series: [{
            data: [
              {
                value: elementEnergies['金'],
                itemStyle: { color: '#FFD700' }
              },
              {
                value: elementEnergies['木'],
                itemStyle: { color: '#90EE90' }
              },
              {
                value: elementEnergies['水'],
                itemStyle: { color: '#87CEEB' }
              },
              {
                value: elementEnergies['火'],
                itemStyle: { color: '#FF4500' }
              },
              {
                value: elementEnergies['土'],
                itemStyle: { color: '#DEB887' }
              }
            ]
          }]
        })
      }
      
      // 更新方位图表
      const directionChart = charts[charts.length - 1]
      if (directionChart) {
        // 计算每个方向的行星分布
        const directions = {
          '东': 0, '南': 0, '西': 0, '北': 0
        }

        currentPositions.value.forEach(planet => {
          if (planet.name === 'sun') return
          
          const angle = Math.atan2(planet.currentPosition.y, planet.currentPosition.x) * (180 / Math.PI)
          const normalizedAngle = (angle + 360) % 360
          
          // 根据角度确定方向并增加权重
          if (normalizedAngle >= 315 || normalizedAngle < 45) directions['东'] += 1
          else if (normalizedAngle >= 45 && normalizedAngle < 135) directions['南'] += 1
          else if (normalizedAngle >= 135 && normalizedAngle < 225) directions['西'] += 1
          else directions['北'] += 1
        })

        // 归一化数值
        const maxCount = Math.max(...Object.values(directions))
        Object.keys(directions).forEach(key => {
          directions[key] = (directions[key] / maxCount) * 100
        })

        directionChart.setOption({
          series: [{
            data: [{
              value: [
                directions['东'],
                directions['南'],
                directions['西'],
                directions['北']
              ]
            }]
          }]
        })
      }
    }

    const updateElementalGroups = (trigramPositions) => {
      const groups = {
        '金': [], '木': [], '水': [], '火': [], '土': []
      }
      
      trigramPositions.forEach(pos => {
        const element = pos.properties.element
        groups[element].push(pos.planet)
      })
      
      elementalGroups.value = groups
    }

    const getPlanetTrigram = (planet) => {
      const positions = calculator.calculateTrigramPositions([planet])
      return positions[0]
    }

    const calculatePhaseAngles = (positions) => {
      // 只选择主要行星：水星、金星、火星、木星、土星
      const mainPlanets = ['mercury', 'venus', 'mars', 'jupiter', 'saturn']
      const planets = positions.filter(p => mainPlanets.includes(p.name))
      const angles = []
      const labels = []
      
      // 只计算相邻行星之间的相位角
      for (let i = 0; i < planets.length - 1; i++) {
        const planet1 = planets[i]
        const planet2 = planets[i + 1]
        
        // 计算两个行星之间的相位角
        const angle1 = Math.atan2(planet1.currentPosition.y, planet1.currentPosition.x)
        const angle2 = Math.atan2(planet2.currentPosition.y, planet2.currentPosition.x)
        let phaseAngle = Math.abs(angle1 - angle2) * (180 / Math.PI)
        
        // 确保角度在0-180度之间
        if (phaseAngle > 180) {
          phaseAngle = 360 - phaseAngle
        }
        
        angles.push(phaseAngle)
        labels.push(`${planet1.displayName}-${planet2.displayName}`)
      }
      
      return { angles, labels }
    }

    const initPlanetPositionChart = () => {
      const chart = echarts.init(planetPositionChart.value)
      
      // 只选择主要行星数据（不包括太阳、卫星，也不包括木星和海王星的卫星）
      const planets = PLANETS.filter(planet => 
        !planet.isSatellite && 
        planet.name !== 'sun' && 
        planet.name !== 'moon' &&
        planet.orbitObject === 'sun'  // 只选择围绕太阳运转的天体
      )
      
      const option = {
        title: {
          text: '行星基本参数',
          textStyle: {
            color: '#e1e1e1'
          },
          left: 'center',  // 居中对齐
          top: 10
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: planets.map(p => p.displayName),
          textStyle: {
            color: '#e1e1e1',
            fontSize: 12
          },
          top: 'middle',
          right: 10,
          orient: 'vertical',
          itemGap: 15,
          itemWidth: 15,
          itemHeight: 10,
          textGap: 10,
          padding: [20, 0],
          icon: 'circle'
        },
        parallelAxis: [
          {
            dim: 0,
            name: '自转周期',
            nameLocation: 'start',
            nameGap: 25,
            nameTextStyle: {
              color: '#e1e1e1',
              padding: [0, 0, 0, -50]  // 向左偏移文字位置
            },
            type: 'log',
            min: 0.1,
            max: 300,
            axisLabel: {
              formatter: '{value} 天'
            }
          },
          {
            dim: 1,
            name: '轴倾角',
            nameLocation: 'start',  // 改为start，与其他两个标题一致
            nameGap: 25,
            nameTextStyle: {
              color: '#e1e1e1',
              padding: [0, 0, 0, 0]  // 居中对齐
            },
            min: 0,
            max: 180,
            axisLabel: {
              formatter: '{value}°'
            }
          },
          {
            dim: 2,
            name: '公转倾角',
            nameLocation: 'start',
            nameGap: 25,
            nameTextStyle: {
              color: '#e1e1e1',
              padding: [0, -50, 0, 0]  // 向右偏移文字位置
            },
            min: 0,
            max: 10,
            axisLabel: {
              formatter: '{value}°'
            }
          }
        ],
        parallel: {
          left: '10%',   // 增加左边距
          right: '20%',  // 保持右边距给图例
          bottom: '15%',
          top: '15%',    // 增加顶部边距
          parallelAxisDefault: {
            type: 'value',
            nameLocation: 'end',
            nameGap: 20,
            axisLine: {
              lineStyle: {
                color: '#666'
              }
            },
            axisTick: {
              lineStyle: {
                color: '#666'
              }
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: 'rgba(255,255,255,0.1)'
              }
            }
          }
        },
        series: planets.map(planet => ({
          name: planet.displayName,
          type: 'parallel',
          lineStyle: {
            width: 3,
            color: planet.color,
            opacity: 0.8
          },
          emphasis: {
            lineStyle: {
              width: 5,
              opacity: 1
            }
          },
          data: [[
            parseFloat(planet.day) || 1,  // 自转周期
            planet.axialTilt,             // 轴倾角
            planet.orbitalInclination     // 公转倾角
          ]]
        }))
      }
      
      chart.setOption(option)
      charts.push(chart)
    }

    const initPlanetSizeChart = () => {
      const chart = echarts.init(planetSizeChart.value)
      const planetsData = PLANETS
        .filter(planet => !planet.isSatellite && planet.name !== '太阳') // 只显示行星
        .map(planet => ({
          name: planet.displayName,
          value: planet.radius
        }))

      chart.setOption({
        title: {
          text: '行星体积比较',
          textStyle: {
            color: '#e1e1e1'
          },
          left: 'center'  // 居中对齐
        },
        tooltip: {
          trigger: 'item'
        },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          data: planetsData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          itemStyle: {
            normal: {
              borderColor: '#0a0a0a',
              borderWidth: 2
            }
          },
          label: {
            color: '#e1e1e1'
          }
        }]
      })
    }

    const initPlanetTempChart = () => {
      const chart = echarts.init(planetTempChart.value)
      
      // 分离太阳和行星数据
      const sun = PLANETS.find(p => p.name === 'sun')
      const planets = PLANETS.filter(planet => 
        !planet.isSatellite && 
        planet.name !== 'sun' && 
        planet.name !== 'moon' &&
        planet.orbitObject === 'sun'
      )

      // 准备行星数据
      const planetData = planets.map(planet => ({
        name: planet.displayName,
        value: planet.meanTemp || ((planet.minTemp + planet.maxTemp) / 2),
        itemStyle: {
          color: planet.color
        }
      }))

      chart.setOption({
        title: {
          text: '行星平均温度',
          textStyle: {
            color: '#e1e1e1'
          },
          left: 'center'  // 居中对齐
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function(params) {
            const temp = params[0].value
            if (params[0].seriesName === '太阳') {
              return `太阳: ${temp}°C`
            }
            return `${params[0].name}: ${temp}°C`
          }
        },
        grid: {
          left: '8%',
          right: '8%',
          bottom: '15%',
          top: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: [...planetData.map(p => p.name), '太阳'],
          axisLabel: {
            color: '#e1e1e1',
            interval: 0,
            rotate: 30
          },
          axisLine: {
            lineStyle: {
              color: '#666'
            }
          }
        },
        yAxis: [
          {
            // 行星温度轴
            type: 'value',
            name: '行星温度 (°C)',
            position: 'left',
            nameTextStyle: {
              color: '#e1e1e1',
              padding: [0, 0, 0, 50]
            },
            axisLabel: {
              color: '#e1e1e1',
              formatter: '{value}°C'
            },
            splitLine: {
              lineStyle: {
                color: 'rgba(255, 255, 255, 0.1)'
              }
            },
            max: 500,
            min: -250
          },
          {
            // 太阳温度轴
            type: 'value',
            name: '太阳温度 (°C)',
            position: 'right',
            nameTextStyle: {
              color: '#ffff00',
              padding: [0, 0, 0, 50]
            },
            axisLabel: {
              color: '#ffff00',
              formatter: '{value}°C'
            },
            splitLine: {
              show: false
            },
            min: 0,
            max: 6000
          }
        ],
        series: [
          {
            name: '行星',
            type: 'bar',
            data: planetData.map(p => ({
              value: p.value,
              itemStyle: p.itemStyle
            })).concat({
              value: null  // 行星系列不显示太阳的数据
            }),
            yAxisIndex: 0,
            barMaxWidth: 40
          },
          {
            name: '太阳',
            type: 'bar',
            data: [
              ...planetData.map(() => null),  // 太阳系列不显示行星的数据
              {
                value: sun.meanTemp,
                itemStyle: {
                  color: sun.color
                }
              }
            ],
            yAxisIndex: 1,
            barMaxWidth: 40
          }
        ]
      })
      charts.push(chart)
    }

    const initPlanetOrbitalChart = () => {
      const chart = echarts.init(planetOrbitalChart.value)
      const planetsData = PLANETS
        .filter(planet => !planet.isSatellite && planet.name !== 'sun') // 只显示行星
        .map(planet => ({
          name: planet.displayName,
          value: planet.orbitalVelocity
        }))

      chart.setOption({
        title: {
          text: '公转速度',
          textStyle: {
            color: '#e1e1e1'
          },
          left: 'center'  // 居中对齐
        },
        tooltip: {
          trigger: 'axis'
        },
        radar: {
          indicator: planetsData.map(item => ({
            name: item.name,
            max: Math.max(...planetsData.map(p => p.value)) * 1.2
          })),
          center: ['50%', '50%'],  // Changed from 77% to 50% to center vertically
          radius: '60%',           // Increased from 35% to 60% to match other charts
          name: {
            textStyle: {
              color: '#e1e1e1'
            }
          },
          splitArea: {
            areaStyle: {
              color: ['rgba(0, 0, 0, 0)', 'rgba(20, 20, 20, 0.2)']
            }
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        },
        series: [{
          type: 'radar',
          data: [{
            value: planetsData.map(item => item.value),
            name: '公转速度 (km/s)',
            areaStyle: {
              color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
                { offset: 0, color: 'rgba(0, 255, 155, 0.5)' },
                { offset: 1, color: 'rgba(0, 255, 155, 0)' }
              ])
            },
            lineStyle: {
              color: '#00ff9b'
            },
            itemStyle: {
              color: '#00ff9b'
            }
          }]
        }]
      })
    }

    const initRealTimeChart = () => {
      const chart = echarts.init(realTimeChart.value)
      
      // 只选择主要行星（不包括太阳和卫星）
      const planets = PLANETS.filter(p => 
        !p.isSatellite && 
        p.name !== 'sun' && 
        p.orbitObject === 'sun'
      ).sort((a, b) => a.orbitalRadius - b.orbitalRadius)  // 按轨道半径排序
      
      // 使用对数刻度来创建更合理的显示比例
      const minRadius = Math.min(...planets.map(p => p.orbitalRadius))
      const maxRadius = Math.max(...planets.map(p => p.orbitalRadius))
      const logMin = Math.log(minRadius)
      const logMax = Math.log(maxRadius)
      
      // 创建5个同心圆的刻度值
      const scales = Array.from({length: 5}, (_, i) => {
        const logValue = logMin + (logMax - logMin) * (i + 1) / 5
        return Math.exp(logValue)
      })
      
      const option = {
        title: {
          text: '行星轨道分布',
          textStyle: {
            color: '#e1e1e1'
          },
          left: 'center'  // 居中对齐
        },
        tooltip: {
          trigger: 'item',
          formatter: function(params) {
            const planet = planets[params.dataIndex]
            const distanceAU = (planet.orbitalRadius / 149597870.7).toFixed(2) // 转换为天文单位
            return `${planet.displayName}<br/>` +
                   `轨道半径: ${distanceAU} AU<br/>` +
                   `公转速度: ${planet.orbitalVelocity.toFixed(1)} km/s`
          }
        },
        legend: {
          top: '5%',
          left: 'center',
          textStyle: {
            color: '#e1e1e1'
          }
        },
        radar: {
          shape: 'circle',
          center: ['50%', '60%'],
          radius: '50%',
          startAngle: 90,
          splitNumber: 5,
          axisName: {
            color: '#e1e1e1',
            formatter: function(name, idx) {
              return name
            }
          },
          splitArea: {
            areaStyle: {
              color: ['rgba(0, 0, 0, 0)', 'rgba(20, 20, 20, 0.2)']
            }
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          indicator: planets.map(p => ({
            name: p.displayName,
            max: 1,
            color: p.color
          }))
        },
        series: [
          {
            type: 'radar',
            data: [
              {
                value: planets.map(p => {
                  const logValue = Math.log(p.orbitalRadius)
                  return (logValue - logMin) / (logMax - logMin)
                }),
                name: '轨道位置',
                symbol: 'circle',
                symbolSize: 8,
                lineStyle: {
                  width: 2
                },
                itemStyle: {
                  color: function(params) {
                    return planets[params.dataIndex].color
                  }
                },
                areaStyle: {
                  color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
                    {
                      offset: 0,
                      color: 'rgba(5, 135, 204, 0.3)'
                    },
                    {
                      offset: 1,
                      color: 'rgba(5, 135, 204, 0)'
                    }
                  ])
                }
              }
            ]
          }
        ]
      }
      
      chart.setOption(option)
      charts.push(chart)
    }

    const initPhaseAngleChart = () => {
      const chart = echarts.init(phaseAngleChart.value)
      
      const option = {
        title: {
          text: '行星相位角',
          textStyle: {
            color: '#e1e1e1'
          },
          left: 'center'  // 居中对齐
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function(params) {
            const data = params[0]
            const [planet1, planet2] = data.name.split('-')
            return `${planet1} 和 ${planet2} 之间的相位角：${data.value.toFixed(2)}°`
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: [],
          axisLabel: {
            color: '#e1e1e1',
            interval: 0,
            rotate: 30
          }
        },
        yAxis: {
          type: 'value',
          name: '相位角 (度)',
          nameTextStyle: {
            color: '#e1e1e1'
          },
          axisLabel: {
            color: '#e1e1e1'
          },
          max: 180,
          splitLine: {
            show: true,
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        },
        series: [{
          type: 'bar',
          data: [],
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' }
            ])
          },
          barWidth: '40%'
        }]
      }
      
      chart.setOption(option)
      charts.push(chart)
    }

    const initElementEnergyChart = () => {
      const chart = echarts.init(elementEnergyChart.value)
      chart.setOption({
        title: {
          text: '元素能量',
          textStyle: {
            color: '#e1e1e1'
          },
          left: 'center'  // 居中对齐
        },
        tooltip: {
          trigger: 'axis',
          formatter: '{b}: {c}%'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['金', '木', '水', '火', '土'],
          axisLine: {
            lineStyle: {
              color: '#666'
            }
          },
          axisLabel: {
            color: '#e1e1e1'
          }
        },
        yAxis: {
          type: 'value',
          max: 100,
          axisLine: {
            lineStyle: {
              color: '#666'
            }
          },
          axisLabel: {
            color: '#e1e1e1',
            formatter: '{value}%'
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        },
        series: [{
          name: '元素能量',
          type: 'bar',
          data: [
            {
              value: 20,
              itemStyle: { color: '#FFD700' }
            },
            {
              value: 20,
              itemStyle: { color: '#90EE90' }
            },
            {
              value: 20,
              itemStyle: { color: '#87CEEB' }
            },
            {
              value: 20,
              itemStyle: { color: '#FF4500' }
            },
            {
              value: 20,
              itemStyle: { color: '#DEB887' }
            }
          ],
          barWidth: '40%',
          itemStyle: {
            borderRadius: [10, 10, 0, 0]
          }
        }]
      })
      charts.push(chart)
    }

    const initDirectionChart = () => {
      const chart = echarts.init(directionChart.value)
      chart.setOption({
        title: {
          text: '方向',
          textStyle: {
            color: '#e1e1e1'
          },
          left: 'center'  // 居中对齐
        },
        tooltip: {
          trigger: 'axis',
          formatter: '{b}: {c}%'
        },
        radar: {
          indicator: [
            { name: '东', max: 100, color: '#4169E1' },
            { name: '南', max: 100, color: '#FF4500' },
            { name: '西', max: 100, color: '#FFD700' },
            { name: '北', max: 100, color: '#87CEEB' }
          ],
          center: ['50%', '50%'],
          radius: '60%',
          name: {
            textStyle: {
              color: '#e1e1e1',
              fontSize: 14,
              padding: [3, 5]
            }
          },
          splitArea: {
            areaStyle: {
              color: [
                'rgba(20, 20, 20, 0.05)',
                'rgba(20, 20, 20, 0.1)',
                'rgba(20, 20, 20, 0.15)',
                'rgba(20, 20, 20, 0.2)',
                'rgba(20, 20, 20, 0.25)'
              ]
            }
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)'
            }
          }
        },
        series: [{
          type: 'radar',
          data: [{
            value: [0, 0, 0, 0],
            name: '方向',
            symbolSize: 6,
            areaStyle: {
              color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
                { offset: 0, color: 'rgba(65, 105, 225, 0.5)' },
                { offset: 1, color: 'rgba(65, 105, 225, 0)' }
              ])
            },
            lineStyle: {
              color: '#4169E1',
              width: 2
            },
            itemStyle: {
              color: '#4169E1'
            }
          }]
        }]
      })
      charts.push(chart)
    }

    const updateCharts = () => {
      charts.forEach(chart => chart && chart.resize())
    }

    onMounted(() => {
      updateData()
      initPlanetPositionChart()
      initPlanetSizeChart()
      initPlanetTempChart()
      initPlanetOrbitalChart()
      initRealTimeChart()
      initPhaseAngleChart()
      initElementEnergyChart()
      initDirectionChart()
      
      updateTimer = setInterval(updateData, 100) // 加快更新频率

      window.addEventListener('resize', () => {
        updateCharts()
      })
    })

    onUnmounted(() => {
      if (updateTimer) clearInterval(updateTimer)
      charts.forEach(chart => chart && chart.dispose())
    })

    return {
      planetPositionChart,
      planetSizeChart,
      planetTempChart,
      planetOrbitalChart,
      trigramChart,
      realTimeChart,
      phaseAngleChart,
      elementEnergyChart,
      directionChart,
      currentPositions,
      specialEvents,
      chineseZodiac,
      elementalGroups,
      getPlanetTrigram
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  padding: 2rem;
  padding-top: 8rem;  /* Increased top padding to move content down */
  background: linear-gradient(to bottom, #0a0a0a, #1a1a1a);
  color: #e1e1e1;
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  position: relative;
}

.dashboard-title {
  font-size: 2rem;
  background: linear-gradient(45deg, #00ff9b, #00b8ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 10px rgba(0, 255, 155, 0.5);
  text-align: center;
  margin-top: -3rem;  /* 向上移动标题，可以根据需要调整这个值 */
  position: relative;  /* 确保位置调整不会影响其他元素 */
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 300px 1fr 300px;
  gap: 1rem;
  max-width: 1800px;
  margin: 0 auto;
  padding: 0 1rem;  /* 添加两侧内边距 */
}

.panel {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.charts-panel {
  padding: 1.5rem;  /* 增加内边距 */
}

.charts-panel .chart-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2.5rem;  /* 增加图表间距 */
  padding: 0.5rem;  /* 微调内边距 */
  margin: 0 auto;
  max-width: 100%;  /* 调整为充满容器 */
}

.chart {
  width: 100%;
  height: 300px;
  margin: 0 auto;
}

.real-time-data {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chart-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 500px;
}

.real-time-chart {
  width: 100%;
  height: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.phase-angle-chart {
  width: 100%;
  height: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.planet-position {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.celestial-events .event {
  padding: 0.5rem;
  margin: 0.5rem 0;
  background: rgba(0, 255, 155, 0.1);
  border-radius: 8px;
}

.five-elements {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 1rem;
}

.element-group {
  padding: 0.5rem;
  border-radius: 8px;
  text-align: center;
}

.element-group.金 { background: rgba(255, 215, 0, 0.2); }
.element-group.木 { background: rgba(0, 255, 0, 0.2); }
.element-group.水 { background: rgba(0, 191, 255, 0.2); }
.element-group.火 { background: rgba(255, 69, 0, 0.2); }
.element-group.土 { background: rgba(210, 180, 140, 0.2); }

.charts-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.element-chart {
  width: 100%;
  height: 200px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.direction-chart {
  width: 100%;
  height: 200px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.tech-title {
  position: absolute;
  top: 20px;
  left: 20px;
  font-size: 24px;
  font-weight: bold;
  color: #00ffd9;
  text-shadow: 0 0 10px rgba(0, 255, 217, 0.5);
  font-family: "Microsoft YaHei", sans-serif;
  letter-spacing: 2px;
}

@media (max-width: 1400px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .charts-panel .chart-grid {
    grid-template-columns: 1fr;
  }
}
</style>
