# 太阳系行星运动模拟系统 | Solar System Simulation

[中文](#太阳系行星运动模拟系统-1) | [English](#solar-system-simulation)

这是一个基于Three.js、Vue.js和ECharts开发的太阳系行星运动模拟系统，提供了交互式的3D太阳系模型展示和数据分析功能。

## 功能特点

1. **行星运动模拟**
   - 精确的行星轨道运动模拟
   - 可调节时间流速
   - 真实的天体比例和轨道关系
   - 支持理想化和真实轨道切换

2. **交互功能**
   - 自由视角控制（缩放、旋转、平移）
   - 行星信息卡片展示
   - 行星轨道高亮显示
   - 时间日期显示
   - 行星点击交互
   - 轨道追踪和聚焦
   - 流畅的相机动画过渡
   - 行星材质和光照效果
   - 实时阴影渲染

3. **数据分析**
   - 行星位置实时追踪
   - 中国传统天文方位显示
   - 特殊天象预警（合相、冲相等）
   - 行星运动数据统计图表：
     * 实时位置雷达图
     * 行星大小对比图
     * 温度分布曲线图
     * 轨道周期分析
     * 速度变化趋势图
   - 中国传统天文历法集成
   - 行星数据实时更新
   - 交互式图表操作
   - 数据筛选和过滤功能

4. **AI智能助手**
   - 内置AI聊天助手，支持自然语言交互
   - 可配置OpenAI API，支持自定义模型
   - 智能解答天文相关问题
   - 历史对话记录保存
   - 支持设置API密钥和服务器地址

## 界面展示

### 主界面
![主界面](./public/picture/Main%20interface.png)
*3D太阳系模拟主界面，展示行星轨道和实时运动*

### 数据分析界面
![数据分析界面](./public/picture/Data%20analysis%20interface.png)
*行星数据分析面板，提供多种图表和数据可视化*

### 行星信息卡与AI助手
![行星信息卡与AI助手](./public/picture/card%20with%20AI.png)
*行星详细信息卡片展示和智能AI助手交互*

## 技术栈

- **前端框架**: Vue.js 3.x
- **3D渲染**: 
  * Three.js 核心引擎
  * WebGL着色器
  * 自定义材质系统
  * 后期处理效果
- **数据可视化**: 
  * ECharts 5.x
  * 自定义图表组件
  * WebGL数据渲染
  * 实时数据流处理
- **交互控制**:
  * OrbitControls 相机控制
  * Raycaster 射线检测
  * GSAP 动画库
  * 自定义事件系统
- **构建工具**: Vite
- **样式处理**: SCSS
- **3D模型加载**: GLTFLoader
- **后处理效果**: Postprocessing
- **AI集成**: OpenAI API
- **HTTP客户端**: isomorphic-fetch

## 项目结构

```
solarsystem/
├── src/                    # 源代码目录
│   ├── components/        # Vue组件
│   │   ├── Scene.vue     # 3D场景主组件
│   │   ├── DashBoard.vue # 数据分析面板
│   │   ├── Options.vue   # 控制选项组件
│   │   └── PlanetCard.vue# 行星信息卡片
│   ├── sass/             # SCSS样式文件
│   ├── utils/            # 工具函数
│   ├── constants.js      # 常量定义
│   ├── router.js         # 路由配置
│   ├── chat.js          # AI聊天助手实现
│   ├── chat.css         # AI聊天界面样式
│   └── main.js          # 应用入口
├── public/               # 静态资源
│   └── models/          # 3D模型文件
├── package.json         # 项目依赖配置
└── vite.config.js       # Vite配置文件
```

## 部署步骤

1. **环境准备**
   ```bash
   # 确保安装了Node.js (建议版本 >= 14.x)
   node -v
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **开发环境运行**
   ```bash
   npm run dev
   ```
   开发服务器将在 http://localhost:3000 启动

4. **生产环境构建**
   ```bash
   npm run build
   ```
   构建产物将生成在 `dist` 目录下

5. **预览生产构建**
   ```bash
   npm run preview
   ```

## 浏览器支持

- 推荐使用现代浏览器（Chrome、Firefox、Safari、Edge等）
- 需要支持WebGL
- 建议使用较新版本的浏览器以获得最佳性能和体验

## 注意事项

- 首次加载可能需要一些时间，因为需要加载3D模型和纹理资源
- 性能表现取决于设备的硬件配置，特别是GPU性能
- 建议在性能较好的设备上运行以获得最佳体验

## 使用说明

### 3D场景交互
- **视角控制**
  * 左键拖动：旋转视角
  * 右键拖动：平移视角
  * 滚轮：缩放视角
  * 双击行星：聚焦到特定行星

- **行星交互**
  * 鼠标悬停：显示行星基本信息
  * 点击行星：显示详细信息卡片
  * 点击轨道：高亮显示轨道路径
  * ESC键：返回太阳系整体视图

### 数据分析面板
- **实时天象**
  * 查看当前行星位置和方位
  * 监测特殊天象（合相、冲相等）
  * 观察行星运动趋势

- **图表交互**
  * 支持图表缩放和平移
  * 数据点悬停显示详情
  * 可选择时间范围
  * 支持数据筛选和对比

### AI助手使用
- 点击右下角对话图标打开AI助手
- 支持自然语言提问
- 可询问天文知识和数据分析
- 支持上下文对话
- 历史记录自动保存

---

# Solar System Simulation

This is a Solar System simulation system based on Three.js, Vue.js, and ECharts, providing an interactive 3D Solar System model display and data analysis capabilities.

## Features

1. **Planetary Motion Simulation**
   - Accurate planetary orbit simulation
   - Adjustable time flow rate
   - Real celestial body proportions and orbital relationships
   - Support for switching between idealized and real orbits

2. **Interactive Features**
   - Free viewpoint control (zoom, rotate, pan)
   - Planet information card display
   - Planetary orbit highlighting
   - Time and date display
   - Planet click interaction
   - Orbit tracking and focusing
   - Smooth camera animation transitions
   - Planet materials and lighting effects
   - Real-time shadow rendering

3. **Data Analysis**
   - Real-time planet position tracking
   - Chinese traditional astronomical orientation display
   - Special astronomical phenomena alerts (conjunction, opposition, etc.)
   - Planetary motion statistical charts:
     * Real-time position radar chart
     * Planet size comparison chart
     * Temperature distribution curve
     * Orbital period analysis
     * Velocity change trend chart
   - Chinese traditional astronomical calendar integration
   - Real-time planet data updates
   - Interactive chart operations
   - Data filtering and screening functions

4. **AI Intelligent Assistant**
   - Built-in AI chat assistant with natural language interaction
   - Configurable OpenAI API with custom model support
   - Intelligent answers to astronomy-related questions
   - History conversation record saving
   - Support for setting API keys and server addresses

## Interface Display

### Main Interface
![Main Interface](./public/picture/Main%20interface.png)
*3D Solar System simulation main interface, displaying planetary orbits and real-time motion*

### Data Analysis Interface
![Data Analysis Interface](./public/picture/Data%20analysis%20interface.png)
*Planetary data analysis panel, providing various charts and data visualizations*

### Planet Information Card and AI Assistant
![Planet Information Card and AI Assistant](./public/picture/card%20with%20AI.png)
*Detailed planet information card display and intelligent AI assistant interaction*

## Technology Stack

- **Frontend Framework**: Vue.js 3.x
- **3D Rendering**: 
  * Three.js core engine
  * WebGL shaders
  * Custom material system
  * Post-processing effects
- **Data Visualization**: 
  * ECharts 5.x
  * Custom chart components
  * WebGL data rendering
  * Real-time data stream processing
- **Interactive Control**:
  * OrbitControls camera control
  * Raycaster detection
  * GSAP animation library
  * Custom event system
- **Build Tool**: Vite
- **Style Processing**: SCSS
- **3D Model Loading**: GLTFLoader
- **Post-processing Effects**: Postprocessing
- **AI Integration**: OpenAI API
- **HTTP Client**: isomorphic-fetch

## Project Structure

```
solarsystem/
├── src/                    # Source code directory
│   ├── components/        # Vue components
│   │   ├── Scene.vue     # 3D scene main component
│   │   ├── DashBoard.vue # Data analysis panel
│   │   ├── Options.vue   # Control options component
│   │   └── PlanetCard.vue# Planet information card
│   ├── sass/             # SCSS style files
│   ├── utils/            # Utility functions
│   ├── constants.js      # Constant definitions
│   ├── router.js         # Router configuration
│   ├── chat.js          # AI chat assistant implementation
│   ├── chat.css         # AI chat interface styles
│   └── main.js          # Application entry
├── public/               # Static resources
│   └── models/          # 3D model files
├── package.json         # Project dependency configuration
└── vite.config.js       # Vite configuration file
```

## Deployment Steps

1. **Environment Preparation**
   ```bash
   # Ensure Node.js is installed (recommended version >= 14.x)
   node -v
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run Development Environment**
   ```bash
   npm run dev
   ```
   The development server will start at http://localhost:3000

4. **Production Environment Build**
   ```bash
   npm run build
   ```
   Build artifacts will be generated in the `dist` directory

5. **Preview Production Build**
   ```bash
   npm run preview
   ```

## Browser Support

- Recommended to use modern browsers (Chrome, Firefox, Safari, Edge, etc.)
- WebGL support required
- Newer browser versions are recommended for the best performance and experience

## Notes

- Initial loading may take some time due to 3D model and texture resource loading
- Performance depends on the device's hardware configuration, especially GPU performance
- Recommended to run on devices with good performance for the best experience

## User Guide

### 3D Scene Interaction
- **View Control**
  * Left-click drag: Rotate view
  * Right-click drag: Pan view
  * Scroll wheel: Zoom view
  * Double-click planet: Focus on specific planet

- **Planet Interaction**
  * Mouse hover: Display basic planet information
  * Click planet: Display detailed information card
  * Click orbit: Highlight orbit path
  * ESC key: Return to overall Solar System view

### Data Analysis Panel
- **Real-time Astronomical Phenomena**
  * View current planet positions and orientations
  * Monitor special astronomical phenomena (conjunction, opposition, etc.)
  * Observe planetary motion trends

- **Chart Interaction**
  * Support chart zooming and panning
  * Data point hover displays details
  * Select time ranges
  * Support data filtering and comparison

### AI Assistant Usage
- Click the dialogue icon in the bottom right corner to open the AI assistant
- Support natural language questions
- Can inquire about astronomical knowledge and data analysis
- Support contextual conversations
- History records automatically saved

