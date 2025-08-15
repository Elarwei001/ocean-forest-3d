# 🌊 Ocean Forest - 3D海洋森林教育体验

一个基于Three.js的沉浸式3D海洋生态系统教育网站，展现南非开普敦海洋森林的神奇世界。

![Ocean Forest](https://img.shields.io/badge/Version-1.0-blue) ![Three.js](https://img.shields.io/badge/Three.js-r128-green) ![License](https://img.shields.io/badge/License-MIT-yellow)

## 🎯 项目特点

### 🐙 核心功能
- **可控制的3D章鱼** - WASD移动，鼠标视角控制
- **真实海洋生物** - 海豹、企鹅、鲨鱼、珊瑚鱼等
- **自然生态行为** - 鱼群游动、捕食、觅食行为
- **教育互动系统** - 点击海洋生物学习知识
- **沉浸式音效** - 海浪、气泡、海洋生物声音

### 🎬 电影级视觉效果
- **高级材质系统** - PBR材质，彩虹色鱼鳞效果
- **动态光照** - 体积光、焦散光效果
- **粒子系统** - 气泡、生物发光浮游生物
- **后处理效果** - 景深、运动模糊
- **电影级摄像机** - 多种摄像机模式

### 🎮 控制面板
- **实时参数调整** - 粒子密度、摄像机模式
- **性能监控** - FPS、渲染统计
- **系统状态** - 各模块加载状态
- **内置控制台** - 调试和状态信息

## 🚀 快速开始

### 在线体验
直接打开 `index.html` 文件在现代浏览器中体验。

### 本地开发
```bash
# 克隆项目
git clone [your-repo-url]
cd ocean_forest

# 启动本地服务器（推荐）
python3 -m http.server 8000
# 或者使用Node.js
npx http-server

# 访问 http://localhost:8000
```

## 🎮 操作指南

### 基本控制
- **WASD** - 移动章鱼
- **鼠标移动** - 视角控制
- **M键** - 切换鼠标控制模式
- **空格** - 上游
- **Shift** - 下游

### 教育互动
- **点击海洋生物** - 查看详细信息
- **🎬 电影级控制面板** - 右上角控制面板
- **摄像机模式** - 跟随、电影、环绕、纪录片模式

## 🐠 海洋生物

### 南非特有物种
- **🦭 开普毛皮海豹** (Arctocephalus pusillus)
- **🐧 非洲企鹅** (Spheniscus demersus) 
- **🦈 大白鲨** (Carcharodon carcharias)
- **🐟 黄尾鰤鱼** (Seriola lalandi)
- **🐠 霍屯督鱼** (Pachymetopon blochii)

### 生态行为
- **群体游动** - 鱼群的分离、对齐、凝聚行为
- **捕食行为** - 鲨鱼的狩猎模式
- **领域行为** - 海豹的栖息地保护
- **避让行为** - 遇到捕食者的逃避反应

## 📁 项目结构

```
ocean_forest/
├── index.html              # 主页面
├── src/                     # 源代码目录
│   ├── core/               # 核心系统
│   │   ├── OceanForest.js  # 主应用类
│   │   └── ModuleManager.js # 模块管理器
│   ├── models/             # 3D模型
│   │   ├── OctopusModel.js # 章鱼模型
│   │   ├── MarineAnimals.js # 海洋动物
│   │   └── ReefFishModel.js # 珊瑚鱼模型
│   ├── systems/            # 系统模块
│   │   ├── AudioSystem.js  # 音频系统
│   │   ├── EducationSystem.js # 教育系统
│   │   └── RenderEngine.js # 渲染引擎
│   └── ui/                 # 用户界面
│       └── CinematicControlPanel.js # 控制面板
├── assets/                 # 资源文件
│   ├── styles/            # CSS样式
│   ├── images/            # 图像资源
│   └── sounds/            # 音频文件
└── docs/                  # 文档
```

## 🔧 技术栈

- **Three.js r128** - 3D图形渲染
- **WebGL** - 硬件加速图形
- **Web Audio API** - 空间音频
- **ES6+ JavaScript** - 现代JavaScript
- **CSS3** - 现代样式和动画
- **模块化架构** - 可扩展的代码结构

## 🎬 电影级特性

### 视觉效果
- **物理渲染** - PBR材质系统
- **动态光照** - 实时阴影和反射
- **粒子特效** - 200+气泡，150+发光浮游生物
- **后处理** - 景深、色调映射

### 摄像机系统
- **跟随模式** - 平滑跟随章鱼
- **电影模式** - 专业摄像机运动
- **环绕模式** - 轨道环绕拍摄
- **纪录片模式** - 手持式摄像效果

## 🐛 故障排除

### 常见问题
1. **页面加载卡住** - 检查浏览器支持WebGL
2. **鱼类游动异常** - 刷新页面重置状态
3. **控制面板不显示** - 确保所有脚本已加载

### 性能优化
- 降低粒子密度
- 禁用高级光照效果
- 减少海洋生物数量

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目基于 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- **Three.js社区** - 强大的3D库
- **南非海洋研究所** - 生物行为参考
- **海洋保护组织** - 教育内容支持

---

🌊 **体验神秘的海洋森林世界！** 🐙

*由Claude Code助手协助开发*