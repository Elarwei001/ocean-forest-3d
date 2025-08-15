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

### 🎮 Control Panel
- **Real-time Parameter Adjustment** - Particle density, camera modes
- **Performance Monitoring** - FPS and rendering statistics
- **System Status** - Module loading status indicators
- **Built-in Console** - Debug and status information

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
│   │   └── RenderEngine.js # Render engine
│   └── ui/                 # User interface
│       └── CinematicControlPanel.js # Control panel
├── assets/                 # Resource files
│   ├── styles/            # CSS styles
│   ├── images/            # Image resources
│   └── sounds/            # Audio files
└── docs/                  # Documentation
```

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