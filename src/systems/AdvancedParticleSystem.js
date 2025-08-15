// 高级粒子系统 - 电影级环境效果
// Advanced Particle System - Cinematic environment effects

class AdvancedParticleSystem {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.particleSystems = new Map();
        
        this.globalTime = 0;
        this.init();
    }
    
    init() {
        // 创建各种粒子效果（简化版，避免视觉问题）
        this.createBubbleSystemSimple();
        this.createMarineSnowSimple();
        this.createSedimentParticles();
        // 暂时禁用生物发光浮游生物以避免发光斑块
        // this.createBioluminescentPlankton();
        this.createFloatingDebris();
    }
    
    // 简化气泡系统 - 避免发光斑块
    createBubbleSystemSimple() {
        const bubbleCount = 50; // 减少数量
        const geometry = new THREE.BufferGeometry();
        
        const positions = new Float32Array(bubbleCount * 3);
        const scales = new Float32Array(bubbleCount);
        
        for (let i = 0; i < bubbleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 1] = -20 + Math.random() * 30;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
            scales[i] = 0.1 + Math.random() * 0.2;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));
        
        // 使用简单的材质避免复杂着色器
        const bubbleMaterial = new THREE.PointsMaterial({
            color: 0x87CEEB,
            size: 2,
            transparent: true,
            opacity: 0.3,
            blending: THREE.NormalBlending // 避免AdditiveBlending
        });
        
        const bubbleSystem = new THREE.Points(geometry, bubbleMaterial);
        this.scene.add(bubbleSystem);
        this.particleSystems.set('bubbles', {
            system: bubbleSystem,
            material: bubbleMaterial,
            count: bubbleCount
        });
    }
    
    // 简化海洋雪花系统
    createMarineSnowSimple() {
        const snowCount = 100;
        const geometry = new THREE.BufferGeometry();
        
        const positions = new Float32Array(snowCount * 3);
        
        for (let i = 0; i < snowCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 120;
            positions[i * 3 + 1] = -10 + Math.random() * 40;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 120;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const snowMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 1,
            transparent: true,
            opacity: 0.2
        });
        
        const snowSystem = new THREE.Points(geometry, snowMaterial);
        this.scene.add(snowSystem);
        this.particleSystems.set('marineSnow', {
            system: snowSystem,
            count: snowCount
        });
    }
    
    // 气泡系统 - 增强版
    createBubbleSystem() {
        const bubbleCount = 200;
        const geometry = new THREE.BufferGeometry();
        
        const positions = new Float32Array(bubbleCount * 3);
        const velocities = new Float32Array(bubbleCount * 3);
        const scales = new Float32Array(bubbleCount);
        const lifetimes = new Float32Array(bubbleCount);
        const opacities = new Float32Array(bubbleCount);
        
        for (let i = 0; i < bubbleCount; i++) {
            // 初始位置 - 从海底发出
            positions[i * 3] = (Math.random() - 0.5) * 150;
            positions[i * 3 + 1] = -30 + Math.random() * 5;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 150;
            
            // 上升速度 - 带随机摆动
            velocities[i * 3] = (Math.random() - 0.5) * 0.2;
            velocities[i * 3 + 1] = 0.3 + Math.random() * 0.4;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
            
            // 大小和生命周期
            scales[i] = 0.1 + Math.random() * 0.3;
            lifetimes[i] = 20 + Math.random() * 15;
            opacities[i] = 0.3 + Math.random() * 0.4;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));
        geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));
        geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));
        
        // 高级气泡材质
        const bubbleMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                cameraPosition: { value: new THREE.Vector3() },
                color: { value: new THREE.Color(0x87CEEB) }
            },
            vertexShader: `
                attribute float scale;
                attribute float lifetime;
                attribute float opacity;
                attribute vec3 velocity;
                
                uniform float time;
                uniform vec3 cameraPosition;
                
                varying float vOpacity;
                varying vec3 vNormal;
                varying vec3 vViewDir;
                
                void main() {
                    vec3 pos = position;
                    
                    // 生命周期动画
                    float life = mod(time, lifetime) / lifetime;
                    
                    // 气泡上升运动
                    pos.y += velocity.y * time * life;
                    pos.x += velocity.x * time + sin(time * 2.0 + position.x) * 0.5;
                    pos.z += velocity.z * time + cos(time * 1.5 + position.z) * 0.5;
                    
                    // 重置到底部
                    if (life > 0.95) {
                        pos.y = position.y;
                    }
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                    
                    // 动态大小 - 气泡上升时变大
                    float dynamicScale = scale * (1.0 + life * 0.5);
                    gl_PointSize = dynamicScale * 100.0 / -mvPosition.z;
                    
                    // 传递变量到片段着色器
                    vOpacity = opacity * (1.0 - life * 0.3);
                    vNormal = normalize(normalMatrix * vec3(0.0, 1.0, 0.0));
                    vViewDir = normalize(cameraPosition - pos);
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                varying float vOpacity;
                varying vec3 vNormal;
                varying vec3 vViewDir;
                
                void main() {
                    vec2 center = gl_PointCoord - 0.5;
                    float dist = length(center);
                    
                    // 圆形气泡形状
                    if (dist > 0.5) discard;
                    
                    // 气泡的球面反射效果
                    float fresnel = pow(1.0 - dot(vNormal, vViewDir), 2.0);
                    vec3 bubbleColor = mix(color, vec3(1.0), fresnel * 0.8);
                    
                    // 边缘高光
                    float rim = 1.0 - dist * 2.0;
                    float highlight = pow(rim, 3.0);
                    
                    gl_FragColor = vec4(bubbleColor + highlight * 0.5, vOpacity * rim);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        
        const bubbleSystem = new THREE.Points(geometry, bubbleMaterial);
        this.scene.add(bubbleSystem);
        this.particleSystems.set('bubbles', {
            system: bubbleSystem,
            material: bubbleMaterial,
            count: bubbleCount
        });
    }
    
    // 海洋雪花系统 - 下沉的有机物
    createMarineSnow() {
        const snowCount = 300;
        const geometry = new THREE.BufferGeometry();
        
        const positions = new Float32Array(snowCount * 3);
        const velocities = new Float32Array(snowCount * 3);
        const rotations = new Float32Array(snowCount * 3);
        const scales = new Float32Array(snowCount);
        
        for (let i = 0; i < snowCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 200;
            positions[i * 3 + 1] = 20 + Math.random() * 30;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
            
            velocities[i * 3] = (Math.random() - 0.5) * 0.1;
            velocities[i * 3 + 1] = -0.05 - Math.random() * 0.1;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
            
            rotations[i * 3] = Math.random() * Math.PI * 2;
            rotations[i * 3 + 1] = Math.random() * 0.02;
            rotations[i * 3 + 2] = Math.random() * 0.02;
            
            scales[i] = 0.05 + Math.random() * 0.15;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('rotation', new THREE.BufferAttribute(rotations, 3));
        geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));
        
        const snowMaterial = new THREE.PointsMaterial({
            color: 0xE6E6FA,
            size: 0.1,
            transparent: true,
            opacity: 0.4,
            blending: THREE.NormalBlending
        });
        
        const marineSnowSystem = new THREE.Points(geometry, snowMaterial);
        this.scene.add(marineSnowSystem);
        this.particleSystems.set('marineSnow', {
            system: marineSnowSystem,
            geometry: geometry,
            count: snowCount
        });
    }
    
    // 生物发光浮游生物
    createBioluminescentPlankton() {
        const planktonCount = 150;
        const geometry = new THREE.BufferGeometry();
        
        const positions = new Float32Array(planktonCount * 3);
        const colors = new Float32Array(planktonCount * 3);
        const intensities = new Float32Array(planktonCount);
        const phases = new Float32Array(planktonCount);
        
        for (let i = 0; i < planktonCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 180;
            positions[i * 3 + 1] = -20 + Math.random() * 40;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 180;
            
            // 不同的发光颜色
            const colorChoice = Math.random();
            if (colorChoice < 0.4) {
                // 蓝绿色
                colors[i * 3] = 0.0;
                colors[i * 3 + 1] = 0.8;
                colors[i * 3 + 2] = 1.0;
            } else if (colorChoice < 0.7) {
                // 青色
                colors[i * 3] = 0.0;
                colors[i * 3 + 1] = 1.0;
                colors[i * 3 + 2] = 0.8;
            } else {
                // 紫色
                colors[i * 3] = 0.6;
                colors[i * 3 + 1] = 0.3;
                colors[i * 3 + 2] = 1.0;
            }
            
            intensities[i] = 0.3 + Math.random() * 0.7;
            phases[i] = Math.random() * Math.PI * 2;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('intensity', new THREE.BufferAttribute(intensities, 1));
        geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
        
        const planktonMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                globalIntensity: { value: 1.0 }
            },
            vertexShader: `
                attribute vec3 color;
                attribute float intensity;
                attribute float phase;
                
                uniform float time;
                
                varying vec3 vColor;
                varying float vIntensity;
                
                void main() {
                    vec3 pos = position;
                    
                    // 缓慢漂流
                    pos.x += sin(time * 0.1 + phase) * 2.0;
                    pos.z += cos(time * 0.15 + phase) * 2.0;
                    pos.y += sin(time * 0.05 + phase * 2.0) * 0.5;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                    
                    // 闪烁效果
                    float flicker = sin(time * 3.0 + phase) * 0.3 + 0.7;
                    gl_PointSize = (intensity * flicker + 0.1) * 50.0 / -mvPosition.z;
                    
                    vColor = color;
                    vIntensity = intensity * flicker;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vIntensity;
                
                void main() {
                    vec2 center = gl_PointCoord - 0.5;
                    float dist = length(center);
                    
                    if (dist > 0.5) discard;
                    
                    // 发光核心
                    float core = 1.0 - dist * 2.0;
                    float glow = pow(core, 2.0);
                    
                    gl_FragColor = vec4(vColor * glow, vIntensity * glow);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            vertexColors: true
        });
        
        const planktonSystem = new THREE.Points(geometry, planktonMaterial);
        this.scene.add(planktonSystem);
        this.particleSystems.set('plankton', {
            system: planktonSystem,
            material: planktonMaterial,
            count: planktonCount
        });
    }
    
    // 沉积物粒子
    createSedimentParticles() {
        const sedimentCount = 100;
        const geometry = new THREE.BufferGeometry();
        
        const positions = new Float32Array(sedimentCount * 3);
        const velocities = new Float32Array(sedimentCount * 3);
        const scales = new Float32Array(sedimentCount);
        
        for (let i = 0; i < sedimentCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 1] = -25 + Math.random() * 5;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
            
            velocities[i * 3] = (Math.random() - 0.5) * 0.05;
            velocities[i * 3 + 1] = Math.random() * 0.02;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
            
            scales[i] = 0.02 + Math.random() * 0.08;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));
        
        const sedimentMaterial = new THREE.PointsMaterial({
            color: 0x8B7355,
            size: 0.05,
            transparent: true,
            opacity: 0.6
        });
        
        const sedimentSystem = new THREE.Points(geometry, sedimentMaterial);
        this.scene.add(sedimentSystem);
        this.particleSystems.set('sediment', {
            system: sedimentSystem,
            geometry: geometry,
            count: sedimentCount
        });
    }
    
    // 漂浮杂物
    createFloatingDebris() {
        const debrisCount = 50;
        const debris = [];
        
        for (let i = 0; i < debrisCount; i++) {
            const size = 0.1 + Math.random() * 0.3;
            const geometry = Math.random() < 0.5 ? 
                new THREE.BoxGeometry(size, size * 0.1, size * 0.5) :
                new THREE.SphereGeometry(size * 0.3, 6, 4);
                
            const material = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color().setHSL(0.1 + Math.random() * 0.2, 0.3, 0.2),
                roughness: 0.9,
                metalness: 0.1,
                transparent: true,
                opacity: 0.7
            });
            
            const piece = new THREE.Mesh(geometry, material);
            piece.position.set(
                (Math.random() - 0.5) * 120,
                -20 + Math.random() * 30,
                (Math.random() - 0.5) * 120
            );
            
            piece.userData.velocity = {
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.01,
                z: (Math.random() - 0.5) * 0.02
            };
            
            piece.userData.rotationVelocity = {
                x: (Math.random() - 0.5) * 0.01,
                y: (Math.random() - 0.5) * 0.01,
                z: (Math.random() - 0.5) * 0.01
            };
            
            piece.castShadow = true;
            this.scene.add(piece);
            debris.push(piece);
        }
        
        this.particleSystems.set('debris', { pieces: debris });
    }
    
    // 更新所有粒子系统
    update(deltaTime) {
        this.globalTime += deltaTime;
        
        // 更新气泡系统
        if (this.particleSystems.has('bubbles')) {
            const bubbles = this.particleSystems.get('bubbles');
            bubbles.material.uniforms.time.value = this.globalTime;
            bubbles.material.uniforms.cameraPosition.value.copy(this.camera.position);
        }
        
        // 更新海洋雪花
        if (this.particleSystems.has('marineSnow')) {
            this.updateMarineSnow(deltaTime);
        }
        
        // 更新生物发光浮游生物
        if (this.particleSystems.has('plankton')) {
            const plankton = this.particleSystems.get('plankton');
            plankton.material.uniforms.time.value = this.globalTime;
        }
        
        // 更新沉积物
        if (this.particleSystems.has('sediment')) {
            this.updateSediment(deltaTime);
        }
        
        // 更新漂浮杂物
        if (this.particleSystems.has('debris')) {
            this.updateDebris(deltaTime);
        }
    }
    
    updateMarineSnow(deltaTime) {
        const snow = this.particleSystems.get('marineSnow');
        const positions = snow.geometry.attributes.position.array;
        const velocities = snow.geometry.attributes.velocity.array;
        
        for (let i = 0; i < snow.count; i++) {
            // 下沉运动
            positions[i * 3] += velocities[i * 3] * deltaTime * 10;
            positions[i * 3 + 1] += velocities[i * 3 + 1] * deltaTime * 10;
            positions[i * 3 + 2] += velocities[i * 3 + 2] * deltaTime * 10;
            
            // 重置到顶部
            if (positions[i * 3 + 1] < -30) {
                positions[i * 3 + 1] = 50;
            }
        }
        
        snow.geometry.attributes.position.needsUpdate = true;
    }
    
    updateSediment(deltaTime) {
        const sediment = this.particleSystems.get('sediment');
        const positions = sediment.geometry.attributes.position.array;
        const velocities = sediment.geometry.attributes.velocity.array;
        
        for (let i = 0; i < sediment.count; i++) {
            // 缓慢漂流
            positions[i * 3] += velocities[i * 3] * deltaTime * 5;
            positions[i * 3 + 1] += velocities[i * 3 + 1] * deltaTime * 5;
            positions[i * 3 + 2] += velocities[i * 3 + 2] * deltaTime * 5;
            
            // 边界处理
            if (Math.abs(positions[i * 3]) > 60) velocities[i * 3] *= -1;
            if (Math.abs(positions[i * 3 + 2]) > 60) velocities[i * 3 + 2] *= -1;
        }
        
        sediment.geometry.attributes.position.needsUpdate = true;
    }
    
    updateDebris(deltaTime) {
        const debris = this.particleSystems.get('debris');
        
        debris.pieces.forEach(piece => {
            // 位置更新
            piece.position.x += piece.userData.velocity.x * deltaTime * 50;
            piece.position.y += piece.userData.velocity.y * deltaTime * 50;
            piece.position.z += piece.userData.velocity.z * deltaTime * 50;
            
            // 旋转更新
            piece.rotation.x += piece.userData.rotationVelocity.x * deltaTime * 50;
            piece.rotation.y += piece.userData.rotationVelocity.y * deltaTime * 50;
            piece.rotation.z += piece.userData.rotationVelocity.z * deltaTime * 50;
            
            // 边界检查
            if (Math.abs(piece.position.x) > 80) piece.userData.velocity.x *= -1;
            if (Math.abs(piece.position.z) > 80) piece.userData.velocity.z *= -1;
            if (piece.position.y > 30) piece.userData.velocity.y *= -1;
            if (piece.position.y < -30) piece.userData.velocity.y *= -1;
        });
    }
    
    // 控制粒子密度
    adjustParticleDensity(type, factor) {
        if (this.particleSystems.has(type)) {
            const system = this.particleSystems.get(type);
            if (system.material && system.material.uniforms) {
                system.material.uniforms.globalIntensity.value = factor;
            }
        }
    }
    
    // 清理资源
    dispose() {
        this.particleSystems.forEach((system, key) => {
            if (system.system) {
                this.scene.remove(system.system);
                if (system.material) system.material.dispose();
                if (system.geometry) system.geometry.dispose();
            }
            if (system.pieces) {
                system.pieces.forEach(piece => {
                    this.scene.remove(piece);
                    piece.geometry.dispose();
                    piece.material.dispose();
                });
            }
        });
        this.particleSystems.clear();
    }
}

// 注册模块
if (window.moduleManager) {
    window.moduleManager.registerModule('AdvancedParticleSystem', AdvancedParticleSystem);
}