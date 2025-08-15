// 电影级动画系统 - 高级动画控制和效果
// Cinematic Animation System - Advanced animation control and effects

class CinematicAnimationSystem {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        
        // 动画时间轴
        this.globalTime = 0;
        this.deltaTime = 0;
        this.lastFrameTime = performance.now();
        
        // 电影级效果控制
        this.cinematicEffects = {
            enabled: true,
            depthOfField: false,
            volumetricLighting: false,  // 禁用体积光以避免发光斑块
            caustics: false,            // 禁用焦散光以避免视觉噪音
            particleEffects: true,
            advancedMaterials: true
        };
        
        // 动画曲线库 - 专业级缓动函数
        this.easingFunctions = {
            // 基础缓动
            linear: t => t,
            easeInQuad: t => t * t,
            easeOutQuad: t => t * (2 - t),
            easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
            
            // 弹性缓动
            easeInElastic: t => t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI),
            easeOutElastic: t => t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1,
            
            // 海洋专用缓动
            oceanWave: t => Math.sin(t * Math.PI * 2) * 0.5 + 0.5,
            gentleFloat: t => Math.sin(t * Math.PI) * Math.sin(t * Math.PI * 0.5),
            currentFlow: t => Math.pow(Math.sin(t * Math.PI), 2)
        };
        
        // 噪声生成器 - 用于自然随机效果
        this.noiseOffset = Math.random() * 1000;
        
        this.init();
    }
    
    init() {
        // 设置高级渲染参数
        this.setupAdvancedRendering();
        
        // 创建电影级光照
        this.setupCinematicLighting();
        
        // 初始化后处理效果
        this.setupPostProcessing();
    }
    
    setupAdvancedRendering() {
        // 启用高级渲染特性
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        
        // 启用物理正确光照
        this.renderer.physicallyCorrectLights = true;
    }
    
    setupCinematicLighting() {
        // 保持现有光源，只进行必要的增强
        const existingLights = this.scene.children.filter(child => child.isLight);
        
        // 只添加一个柔和的主光源，不移除现有光源
        this.sunLight = new THREE.DirectionalLight(0x87CEEB, 1.5); // 降低强度
        this.sunLight.position.set(100, 200, 100);
        this.sunLight.castShadow = false; // 禁用阴影以提高性能
        this.scene.add(this.sunLight);
        
        // 添加柔和的补光
        this.fillLight = new THREE.DirectionalLight(0x4A90E2, 0.5); // 降低强度
        this.fillLight.position.set(-50, 50, -100);
        this.scene.add(this.fillLight);
        
        // 条件性创建效果（仅在启用时）
        if (this.cinematicEffects.volumetricLighting) {
            this.createVolumetricLighting();
        }
        
        if (this.cinematicEffects.caustics) {
            this.createAdvancedCaustics();
        }
        
        console.log('🎬 电影级光照已设置（简化模式）');
    }
    
    createVolumetricLighting() {
        // 创建体积光效果的几何体
        const volumetricGeometry = new THREE.ConeGeometry(50, 200, 8);
        const volumetricMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                opacity: { value: 0.15 },
                color: { value: new THREE.Color(0x87CEEB) }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                varying vec3 vNormal;
                
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform float opacity;
                uniform vec3 color;
                varying vec3 vWorldPosition;
                varying vec3 vNormal;
                
                // 简化的3D噪声函数
                float noise3D(vec3 p) {
                    return fract(sin(dot(p, vec3(12.9898, 78.233, 54.53))) * 43758.5453);
                }
                
                void main() {
                    vec3 pos = vWorldPosition * 0.01;
                    float noise = noise3D(pos + time * 0.1);
                    float fresnel = pow(1.0 - abs(dot(vNormal, normalize(vWorldPosition))), 2.0);
                    
                    float alpha = opacity * fresnel * (0.5 + noise * 0.5);
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        
        for (let i = 0; i < 5; i++) {
            const volumetricLight = new THREE.Mesh(volumetricGeometry, volumetricMaterial.clone());
            volumetricLight.position.set(
                (Math.random() - 0.5) * 100,
                50 + Math.random() * 50,
                (Math.random() - 0.5) * 100
            );
            volumetricLight.rotation.x = Math.PI;
            volumetricLight.userData.rotationSpeed = 0.1 + Math.random() * 0.1;
            this.scene.add(volumetricLight);
        }
        
        this.volumetricLights = this.scene.children.filter(child => 
            child.material && child.material.uniforms && child.material.uniforms.time
        );
    }
    
    createAdvancedCaustics() {
        // 创建更高级的焦散光效果
        this.causticLights = [];
        for (let i = 0; i < 12; i++) {
            const light = new THREE.SpotLight(0x4FC3F7, 0.8, 80, Math.PI * 0.25, 0.3, 2);
            light.position.set(
                (Math.random() - 0.5) * 150,
                30 + Math.random() * 20,
                (Math.random() - 0.5) * 150
            );
            light.target.position.set(light.position.x, -30, light.position.z);
            
            // 添加动态属性
            light.userData.baseIntensity = 0.5 + Math.random() * 0.3;
            light.userData.flickerSpeed = 2 + Math.random() * 3;
            light.userData.moveRadius = 10 + Math.random() * 15;
            light.userData.originalPos = light.position.clone();
            
            this.scene.add(light);
            this.scene.add(light.target);
            this.causticLights.push(light);
        }
    }
    
    setupPostProcessing() {
        // 如果可用，设置后处理效果
        if (window.THREE && window.THREE.EffectComposer) {
            this.setupAdvancedPostProcessing();
        }
    }
    
    // 高级动画函数 - 用于海洋生物
    animateMarineLife(marineObject, animationType = 'swimming', intensity = 1.0) {
        if (!marineObject || !marineObject.userData) return;
        
        const time = this.globalTime;
        const objectId = marineObject.id || 0;
        const phaseOffset = objectId * 0.1;
        
        switch (animationType) {
            case 'swimming':
                this.applySwimmingAnimation(marineObject, time + phaseOffset, intensity);
                break;
            case 'floating':
                this.applyFloatingAnimation(marineObject, time + phaseOffset, intensity);
                break;
            case 'schooling':
                this.applySchoolingAnimation(marineObject, time + phaseOffset, intensity);
                break;
            case 'hunting':
                this.applyHuntingAnimation(marineObject, time + phaseOffset, intensity);
                break;
        }
    }
    
    applySwimmingAnimation(obj, time, intensity) {
        // 身体波动 - 模拟鱼类游泳
        const bodyWave = Math.sin(time * 3) * 0.15 * intensity;
        const tailWave = Math.sin(time * 4 + Math.PI * 0.5) * 0.25 * intensity;
        
        obj.rotation.y = bodyWave;
        if (obj.userData.tail) {
            obj.userData.tail.rotation.y = tailWave;
        }
        
        // 垂直浮动
        const floatMotion = Math.sin(time * 0.8) * 0.3 * intensity;
        obj.position.y += floatMotion * this.deltaTime;
    }
    
    applyFloatingAnimation(obj, time, intensity) {
        // 优雅的漂浮动作
        const floatX = Math.sin(time * 0.5) * 0.2 * intensity;
        const floatY = Math.cos(time * 0.3) * 0.15 * intensity;
        const floatZ = Math.sin(time * 0.4) * 0.1 * intensity;
        
        obj.rotation.x += floatX * this.deltaTime;
        obj.rotation.y += floatY * this.deltaTime;
        obj.rotation.z += floatZ * this.deltaTime;
    }
    
    applySchoolingAnimation(obj, time, intensity) {
        // 群体游动效果
        if (!obj.userData.schoolingData) {
            obj.userData.schoolingData = {
                neighborRadius: 5,
                alignmentForce: 0.1,
                cohesionForce: 0.05,
                separationForce: 0.15
            };
        }
        
        // 这里可以实现复杂的群体行为算法
        const swayIntensity = 1 + Math.sin(time * 2) * 0.3;
        this.applySwimmingAnimation(obj, time, intensity * swayIntensity);
    }
    
    // 高级材质创建
    createCinematicMaterial(baseColor, materialType = 'standard') {
        const materialOptions = {
            color: baseColor,
            roughness: 0.3,
            metalness: 0.1,
            envMapIntensity: 1.0
        };
        
        switch (materialType) {
            case 'fish':
                return new THREE.MeshPhysicalMaterial({
                    ...materialOptions,
                    clearcoat: 0.8,
                    clearcoatRoughness: 0.2,
                    iridescence: 0.3,
                    iridescenceIOR: 1.3,
                    thickness: 0.5,
                    transmission: 0.1
                });
                
            case 'octopus':
                return new THREE.MeshPhysicalMaterial({
                    ...materialOptions,
                    roughness: 0.8,
                    subsurface: 0.3,
                    thickness: 1.0,
                    transmission: 0.05
                });
                
            case 'shell':
                return new THREE.MeshPhysicalMaterial({
                    ...materialOptions,
                    roughness: 0.1,
                    metalness: 0.05,
                    clearcoat: 1.0,
                    clearcoatRoughness: 0.1,
                    iridescence: 0.8
                });
                
            default:
                return new THREE.MeshStandardMaterial(materialOptions);
        }
    }
    
    // 更新循环
    update() {
        const currentTime = performance.now();
        this.deltaTime = (currentTime - this.lastFrameTime) * 0.001;
        this.globalTime += this.deltaTime;
        this.lastFrameTime = currentTime;
        
        // 更新光照效果
        this.updateCinematicLighting();
        
        // 更新体积光
        this.updateVolumetricLighting();
        
        // 更新焦散效果
        this.updateCaustics();
    }
    
    updateCinematicLighting() {
        // 动态调整主光源
        if (this.sunLight) {
            const lightVariation = Math.sin(this.globalTime * 0.1) * 0.2 + 1.0;
            this.sunLight.intensity = 2.5 * lightVariation;
            
            // 轻微的光源位置变化，模拟水面波动对光线的影响
            const positionOffset = Math.sin(this.globalTime * 0.5) * 5;
            this.sunLight.position.x = 100 + positionOffset;
        }
    }
    
    updateVolumetricLighting() {
        if (this.volumetricLights) {
            this.volumetricLights.forEach((light, index) => {
                if (light.material.uniforms) {
                    light.material.uniforms.time.value = this.globalTime + index;
                    light.rotation.y += light.userData.rotationSpeed * this.deltaTime;
                }
            });
        }
    }
    
    updateCaustics() {
        this.causticLights.forEach((light, index) => {
            const time = this.globalTime + index * 0.5;
            
            // 动态强度变化
            const flickerIntensity = light.userData.baseIntensity + 
                Math.sin(time * light.userData.flickerSpeed) * 0.2;
            light.intensity = Math.max(0.1, flickerIntensity);
            
            // 位置摆动
            const radius = light.userData.moveRadius;
            const angle = time * 0.5;
            light.position.x = light.userData.originalPos.x + Math.cos(angle) * radius * 0.5;
            light.position.z = light.userData.originalPos.z + Math.sin(angle) * radius * 0.5;
            
            // 目标位置同步
            light.target.position.set(light.position.x, -30, light.position.z);
        });
    }
    
    // 创建粒子系统
    createParticleSystem(type = 'bubbles', count = 100) {
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);
        const scales = new Float32Array(count);
        
        for (let i = 0; i < count; i++) {
            // 位置
            positions[i * 3] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 1] = Math.random() * 50 - 25;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
            
            // 速度
            velocities[i * 3] = (Math.random() - 0.5) * 0.5;
            velocities[i * 3 + 1] = Math.random() * 0.5 + 0.1;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
            
            // 缩放
            scales[i] = Math.random() * 0.5 + 0.1;
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        particles.setAttribute('scale', new THREE.BufferAttribute(scales, 1));
        
        const particleMaterial = new THREE.PointsMaterial({
            color: type === 'bubbles' ? 0x87CEEB : 0x4FC3F7,
            size: 0.5,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        
        const particleSystem = new THREE.Points(particles, particleMaterial);
        particleSystem.userData.type = type;
        
        return particleSystem;
    }
    
    // 电影级摄像机控制
    applyCinematicCamera(targetPosition, lookAtTarget, duration = 2.0, easing = 'easeInOutQuad') {
        // 这里实现平滑的摄像机运动
        const easingFunc = this.easingFunctions[easing] || this.easingFunctions.easeInOutQuad;
        
        // 摄像机动画可以使用 TWEEN 库或自定义插值
        // 这里提供基础框架
        return {
            start: () => {
                console.log(`开始电影级摄像机运动到位置: ${targetPosition.x}, ${targetPosition.y}, ${targetPosition.z}`);
            },
            update: (progress) => {
                const t = easingFunc(progress);
                // 插值计算摄像机位置和朝向
            }
        };
    }
}

// 注册模块
if (window.moduleManager) {
    window.moduleManager.registerModule('CinematicAnimationSystem', CinematicAnimationSystem);
}