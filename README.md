# 🌊 Ocean Forest - Interactive 3D Marine Educational Experience

An immersive 3D ocean ecosystem educational website built with Three.js, showcasing the magical world of South African kelp forests.

![Ocean Forest](https://img.shields.io/badge/Version-1.0-blue) ![Three.js](https://img.shields.io/badge/Three.js-r128-green) ![License](https://img.shields.io/badge/License-MIT-yellow)

## 🎯 Project Features

### 🐙 Core Functionality
- **Controllable 3D Octopus** - WASD movement with mouse camera control
- **Authentic Marine Life** - Seals, penguins, sharks, reef fish, and more
- **Natural Ecosystem Behaviors** - Schooling, predation, foraging behaviors
- **Educational Interactive System** - Click marine animals to learn
- **Immersive Audio** - Ocean waves, bubbles, marine life sounds

### 🎬 Cinema-Quality Visual Effects
- **Advanced Material System** - PBR materials with iridescent fish scale effects
- **Dynamic Lighting** - Volumetric lighting and caustic effects
- **Particle Systems** - Bubbles and bioluminescent plankton
- **Post-Processing Effects** - Depth of field and motion blur
- **Cinematic Camera System** - Multiple professional camera modes

### 🎨 Advanced 3D Model Generation
- **Photogrammetry System** - Multi-image 3D reconstruction for hero species
- **AI Depth Estimation** - Single-image depth mapping for fish textures
- **Procedural Generation** - Biologically-accurate procedural marine life
- **Intelligent Model Selection** - Automatic best-method selection per species
- **Performance Optimization** - LOD systems and memory management

### 🎮 Performance Monitoring
- **Real-time FPS Display** - Performance tracking
- **Marine Life Counters** - Live animal counts
- **System Status** - Module loading indicators

## 🚀 Quick Start

### Live Experience
🌐 **Visit the live demo:** https://elarwei001.github.io/ocean-forest-3d/

### Local Development
```bash
# Clone the repository
git clone https://github.com/Elarwei001/ocean-forest-3d.git
cd ocean-forest-3d

# Start local server (recommended)
python3 -m http.server 8000
# Or using Node.js
npx http-server

# Visit http://localhost:8000
```

## 🎮 Controls Guide

### Basic Controls
- **WASD** - Move octopus
- **Mouse Movement** - Camera view control
- **M Key** - Toggle mouse control mode
- **Spacebar** - Swim up
- **Shift** - Swim down

### Educational Interaction
- **Click Marine Life** - View detailed information
- **🎬 Cinema Control Panel** - Upper-right control panel
- **Camera Modes** - Follow, cinematic, orbit, documentary modes

## 🐠 Marine Life

### South African Endemic Species
- **🦭 Cape Fur Seal** (Arctocephalus pusillus)
- **🐧 African Penguin** (Spheniscus demersus) 
- **🦈 Great White Shark** (Carcharodon carcharias)
- **🐟 Yellowtail Amberjack** (Seriola lalandi)
- **🐠 Hottentot Fish** (Pachymetopon blochii)

### Ecological Behaviors
- **Schooling** - Fish separation, alignment, and cohesion behaviors
- **Predation** - Shark hunting patterns
- **Territorial** - Seal habitat protection
- **Avoidance** - Escape responses to predators

## 📁 Project Structure

```
ocean_forest/
├── index.html              # Main page
├── src/                     # Source code directory
│   ├── core/               # Core systems
│   │   ├── OceanForest.js  # Main application class
│   │   └── ModuleManager.js # Module manager
│   ├── models/             # 3D models
│   │   ├── OctopusModel.js # Octopus model
│   │   ├── MarineAnimals.js # Marine animals
│   │   └── ReefFishModel.js # Reef fish model
│   ├── systems/            # System modules
│   │   ├── AudioSystem.js  # Audio system
│   │   ├── EducationSystem.js # Education system
│   │   ├── RenderEngine.js # Render engine
│   │   ├── PhotogrammetrySystem.js # 3D reconstruction
│   │   ├── AIDepthEstimation.js # AI depth mapping
│   │   ├── ProceduralModelGenerator.js # Procedural models
│   │   └── Advanced3DModelSystem.js # 3D model hub
│   ├── ui/                 # User interface
│   └── tests/              # Testing system
│       └── 3DModelGenerationTest.js # 3D model tests
├── assets/                 # Resource files
│   ├── styles/            # CSS styles
│   ├── images/            # Image resources
│   └── sounds/            # Audio files
└── docs/                  # Documentation
    └── 3D-Model-Generation-Guide.md # Complete 3D model guide
```

## 📚 Documentation

### 3D Model Generation System
For comprehensive information about the advanced 3D model generation system, see:
- **[3D Model Generation Guide](docs/3D-Model-Generation-Guide.md)** - Complete documentation
- **Testing Guide** - Automated testing with `src/tests/3DModelGenerationTest.js`

### Quick Start Guide
1. **Hero Species** - Use photogrammetry with 3+ reference images
2. **Standard Fish** - Use AI depth estimation with single reference image  
3. **Background Species** - Use procedural generation with biological parameters

## 🔧 Technology Stack

- **Three.js r128** - 3D graphics rendering
- **WebGL** - Hardware-accelerated graphics
- **Web Audio API** - Spatial audio
- **ES6+ JavaScript** - Modern JavaScript
- **CSS3** - Modern styling and animations
- **Modular Architecture** - Scalable code structure

## 🎬 Cinema-Quality Features

### Visual Effects
- **Physical Rendering** - PBR material system
- **Dynamic Lighting** - Real-time shadows and reflections
- **Particle Effects** - 200+ bubbles, 150+ bioluminescent plankton
- **Post-Processing** - Depth of field, tone mapping

### Camera System
- **Follow Mode** - Smooth octopus following
- **Cinematic Mode** - Professional camera movements
- **Orbit Mode** - Orbital cinematography
- **Documentary Mode** - Handheld camera effects

## 🐛 Troubleshooting

### Common Issues
1. **Page Loading Stuck** - Check browser WebGL support
2. **Abnormal Fish Swimming** - Refresh page to reset state
3. **Control Panel Not Showing** - Ensure all scripts are loaded

### Performance Optimization
- Reduce particle density
- Disable advanced lighting effects
- Reduce marine life count

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- **Three.js Community** - Powerful 3D library
- **South African Marine Research Institute** - Behavioral references
- **Marine Conservation Organizations** - Educational content support

---

🌊 **Experience the Mysterious Ocean Forest World!** 🐙

*Developed with assistance from Claude Code*