// 主应用类 - 海洋森林核心引擎
// Main Application Class - Ocean Forest Core Engine

class OceanForest {
    constructor() {
        // 初始化基础属性
        this.canvas = document.getElementById('webgl-canvas');
        this.loadingScreen = document.getElementById('loading-screen');
        
        // 性能跟踪
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 60;
        
        // 游戏对象
        this.octopus = null;
        this.kelp = [];
        this.fish = [];
        this.bubbles = [];
        this.particles = [];
        
        // 南非海洋生物
        this.capeFurSeals = [];
        this.greatWhiteSharks = [];
        this.africanPenguins = [];
        this.capeReefFish = [];
        this.seaUrchinFields = [];
        this.seaAnemones = [];
        
        // 控制系统
        this.keys = {};
        this.mouse = { x: 0, y: 0 };
        this.mouseControl = { enabled: false, sensitivity: 0.005 };
        this.octopusPosition = new THREE.Vector3(0, -5, 0);
        this.cameraOffset = new THREE.Vector3(0, 3, 8);
        
        // 系统组件
        this.audio = new OceanAudio();
        window.audioSystem = this.audio;
        this.education = null;
        this.speciesLabels = [];
        
        // 全局引用，供教育系统使用
        window.oceanForest = this;
        
        this.init();
    }
    
    async init() {
        this.setupRenderer();
        this.setupScene();
        this.setupCamera();
        this.setupLights();
        this.setupControls();
        
        await this.loadAssets();
        
        this.createOceanFloor();
        this.createKelpForest();
        this.createOctopus();
        this.createFish();
        
        // 添加南非海洋生物
        this.createCapeFurSeals();
        this.createAfricanPenguins();
        this.createGreatWhiteSharks();
        this.createCapeReefFish();
        this.createSeaUrchinFields();
        this.createSeaAnemones();
        
        // 初始化教育系统
        this.education = new EducationSystem(this.scene, this.camera, this.canvas);
        this.registerClickableObjects();
        
        this.setupPostProcessing();
        
        // 初始化动物计数显示
        this.updateAnimalCounts();
        
        // 设置定期更新动物计数
        setInterval(() => {
            this.updateAnimalCounts();
        }, 2000);
        
        this.hideLoadingScreen();
        this.startRenderLoop();
    }
    
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: false
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.8;
        this.renderer.setClearColor(0x001122, 1);
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x006699, 0.02);
        
        // 背景渐变
        const geometry = new THREE.SphereGeometry(500, 32, 32);
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                topColor: { value: new THREE.Color(0x001122) },
                bottomColor: { value: new THREE.Color(0x002244) }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 bottomColor;
                uniform float time;
                varying vec3 vWorldPosition;
                
                void main() {
                    float h = normalize(vWorldPosition + 250.0).y;
                    float ramp = max(pow(max(h, 0.0), 0.6), 0.0);
                    vec3 color = mix(bottomColor, topColor, ramp);
                    gl_FragColor = vec4(color, 1.0);
                }
            `,
            side: THREE.BackSide
        });
        
        const skybox = new THREE.Mesh(geometry, material);
        this.scene.add(skybox);
        this.skyboxMaterial = material;
    }
    
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 2, 15);
    }
    
    setupLights() {
        // 环境光
        const ambientLight = new THREE.AmbientLight(0x404080, 0.4);
        this.scene.add(ambientLight);
        
        // 主光源
        const directionalLight = new THREE.DirectionalLight(0x87ceeb, 0.8);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // 焦散光效
        this.causticLights = [];
        for (let i = 0; i < 8; i++) {
            const light = new THREE.SpotLight(0x4fc3f7, 0.3, 50, Math.PI * 0.3, 0.5);
            light.position.set(
                (Math.random() - 0.5) * 100,
                20 + Math.random() * 10,
                (Math.random() - 0.5) * 100
            );
            light.target.position.set(light.position.x, -20, light.position.z);
            this.scene.add(light);
            this.scene.add(light.target);
            this.causticLights.push(light);
        }
    }
    
    setupControls() {
        // 键盘控制
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            this.audio.enableAudio();
            
            if (e.code === 'KeyM') {
                this.mouseControl.enabled = !this.mouseControl.enabled;
                const controlInfo = document.querySelector('.info');
                if (controlInfo) {
                    controlInfo.textContent = this.mouseControl.enabled 
                        ? '鼠标控制已启用 / Mouse control enabled' 
                        : '鼠标控制已禁用 / Mouse control disabled';
                }
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // 鼠标控制
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            
            if (this.mouseControl.enabled && this.octopus) {
                const targetX = this.mouse.x * 10;
                const targetY = this.mouse.y * 8;
                
                this.octopusPosition.x += (targetX - this.octopusPosition.x) * this.mouseControl.sensitivity;
                this.octopusPosition.y += (targetY - this.octopusPosition.y) * this.mouseControl.sensitivity;
                
                this.octopusPosition.x = Math.max(-50, Math.min(50, this.octopusPosition.x));
                this.octopusPosition.y = Math.max(-30, Math.min(20, this.octopusPosition.y));
            }
        });
        
        // 触控控制
        let touchStartX = 0, touchStartY = 0;
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const deltaX = e.touches[0].clientX - touchStartX;
            const deltaY = e.touches[0].clientY - touchStartY;
            
            if (Math.abs(deltaX) > 20 || Math.abs(deltaY) > 20) {
                this.octopusPosition.x += deltaX * 0.01;
                this.octopusPosition.y -= deltaY * 0.01;
                
                this.octopusPosition.x = Math.max(-50, Math.min(50, this.octopusPosition.x));
                this.octopusPosition.y = Math.max(-30, Math.min(20, this.octopusPosition.y));
                
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            }
        });
        
        // 窗口大小调整
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    async loadAssets() {
        const loadingProgress = document.querySelector('.loading-progress');
        this.textureLoader = new THREE.TextureLoader();
        
        const tasks = [
            '加载海带森林... / Loading kelp forest...',
            '创建章鱼模型... / Creating octopus model...',
            '生成南非海狗... / Spawning Cape Fur Seals...',
            '添加非洲企鹅... / Adding African Penguins...',
            '引入大白鲨... / Introducing Great White Sharks...',
            '聚集开普鱼群... / Schooling Cape reef fish...',
            '放置海胆和海葵... / Placing sea urchins and anemones...',
            '优化海洋生态系统... / Optimizing marine ecosystem...',
            '准备教育功能... / Preparing educational features...'
        ];
        
        if (window.THREE && window.THREE.GLTFLoader) {
            this.gltfLoader = new THREE.GLTFLoader();
            console.log('GLTF loader initialized for enhanced 3D models');
        }
        
        for (let i = 0; i < tasks.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 350));
            loadingProgress.style.width = ((i + 1) / tasks.length) * 100 + '%';
            document.querySelector('.loading-content p').textContent = tasks[i];
        }
    }
    
    hideLoadingScreen() {
        setTimeout(() => {
            this.loadingScreen.classList.add('hidden');
            setTimeout(() => {
                this.loadingScreen.style.display = 'none';
            }, 1000);
        }, 500);
    }
    
    registerClickableObjects() {
        // 注册所有海洋物种为可点击教育对象
        [...this.capeFurSeals, ...this.africanPenguins, ...this.greatWhiteSharks, ...this.capeReefFish]
            .forEach(species => this.education.registerClickableObject(species));
        
        console.log(`已注册${this.capeFurSeals.length + this.africanPenguins.length + this.greatWhiteSharks.length + this.capeReefFish.length}个可点击海洋物种用于教育`);
        this.createFloatingLabels();
    }
    
    // 创建海洋环境
    createOceanFloor() {
        this.oceanEnvironment = new OceanEnvironment(this.scene);
        return this.oceanEnvironment.createOceanFloor();
    }
    
    createKelpForest() {
        if (!this.oceanEnvironment) {
            this.oceanEnvironment = new OceanEnvironment(this.scene);
        }
        this.kelpForest = this.oceanEnvironment.createKelpForest();
        this.bubbles = this.oceanEnvironment.createBubbleSystem();
        this.lightRays = this.oceanEnvironment.createLightRays();
        return this.kelpForest;
    }
    
    // 创建章鱼
    createOctopus() {
        this.octopusModel = new OctopusModel(this.scene);
        this.octopus = this.octopusModel.createOctopus();
        return this.octopus;
    }
    
    // 创建基础鱼类（简单装饰用）
    createFish() {
        // 基础装饰鱼类，主要的鱼类在 createCapeReefFish 中
        this.fish = [];
        return this.fish;
    }
    
    // 创建南非海洋生物
    createCapeFurSeals() {
        if (!this.marineAnimals) {
            this.marineAnimals = new MarineAnimals(this.scene);
        }
        this.capeFurSeals = this.marineAnimals.createCapeFurSeals();
        return this.capeFurSeals;
    }
    
    createAfricanPenguins() {
        if (!this.marineAnimals) {
            this.marineAnimals = new MarineAnimals(this.scene);
        }
        this.africanPenguins = this.marineAnimals.createAfricanPenguins();
        return this.africanPenguins;
    }
    
    createGreatWhiteSharks() {
        if (!this.sharksAndFish) {
            this.sharksAndFish = new SharksAndFish(this.scene);
        }
        this.greatWhiteSharks = this.sharksAndFish.createGreatWhiteSharks();
        return this.greatWhiteSharks;
    }
    
    createCapeReefFish() {
        if (!this.sharksAndFish) {
            this.sharksAndFish = new SharksAndFish(this.scene);
        }
        this.capeReefFish = this.sharksAndFish.createCapeReefFish();
        return this.capeReefFish;
    }
    
    createSeaUrchinFields() {
        // 简化的海胆创建，主要逻辑在其他模块
        this.seaUrchinFields = [];
        return this.seaUrchinFields;
    }
    
    createSeaAnemones() {
        // 简化的海葵创建，主要逻辑在其他模块
        this.seaAnemones = [];
        return this.seaAnemones;
    }
    
    // 创建浮动标签
    createFloatingLabels() {
        const allSpecies = [
            ...this.capeFurSeals,
            ...this.africanPenguins, 
            ...this.greatWhiteSharks,
            ...this.capeReefFish
        ];
        
        this.floatingLabels = new FloatingLabelsSystem(this.scene, this.camera);
        this.floatingLabels.createFloatingLabels(allSpecies);
    }
    
    // 设置后处理
    setupPostProcessing() {
        this.renderEngine = new RenderEngine(this.renderer, this.scene, this.camera);
        this.renderEngine.setupPostProcessing();
        
        // 可选：初始化电影级系统（如果可用）
        this.initOptionalSystems();
    }
    
    // 开始渲染循环
    startRenderLoop() {
        if (!this.renderEngine) {
            this.renderEngine = new RenderEngine(this.renderer, this.scene, this.camera);
        }
        this.renderEngine.startRenderLoop(this);
    }
    
    // 初始化可选的高级系统
    initOptionalSystems() {
        const moduleManager = window.moduleManager;
        if (!moduleManager) return;
        
        // 初始化电影级动画系统
        const CinematicAnimationSystem = moduleManager.getModule('CinematicAnimationSystem');
        if (CinematicAnimationSystem) {
            try {
                this.cinematicAnimation = new CinematicAnimationSystem(this.scene, this.camera, this.renderer);
                console.log('✅ 电影级动画系统已启用');
            } catch (error) {
                console.warn('⚠️ 电影级动画系统初始化失败:', error);
            }
        }
        
        // 初始化高级粒子系统
        const AdvancedParticleSystem = moduleManager.getModule('AdvancedParticleSystem');
        if (AdvancedParticleSystem) {
            try {
                this.advancedParticles = new AdvancedParticleSystem(this.scene, this.camera);
                console.log('✅ 高级粒子系统已启用');
            } catch (error) {
                console.warn('⚠️ 高级粒子系统初始化失败:', error);
            }
        }
        
        // 初始化海洋生物行为系统
        const MarineLifeBehavior = moduleManager.getModule('MarineLifeBehavior');
        if (MarineLifeBehavior) {
            try {
                this.marineLifeBehavior = new MarineLifeBehavior();
                this.setupMarineLifeBehavior();
                console.log('✅ 海洋生物行为系统已启用');
            } catch (error) {
                console.warn('⚠️ 海洋生物行为系统初始化失败:', error);
            }
        }
        
        // 初始化电影级摄像机系统
        const CinematicCameraSystem = moduleManager.getModule('CinematicCameraSystem');
        if (CinematicCameraSystem) {
            try {
                this.cinematicCamera = new CinematicCameraSystem(this.camera, this.scene);
                this.cinematicCamera.setTarget(this.octopusPosition);
                console.log('✅ 电影级摄像机系统已启用');
            } catch (error) {
                console.warn('⚠️ 电影级摄像机系统初始化失败:', error);
            }
        }
    }
    
    // 设置海洋生物行为
    setupMarineLifeBehavior() {
        if (!this.marineLifeBehavior) return;
        
        // 注册鱼类行为
        if (this.capeReefFish) {
            this.capeReefFish.forEach(fish => {
                const species = fish.userData.species ? fish.userData.species.englishName : 'Unknown';
                this.marineLifeBehavior.registerMarineLife(fish, 'schooling', species);
            });
        }
        
        // 注册鲨鱼行为
        if (this.greatWhiteSharks) {
            this.greatWhiteSharks.forEach(shark => {
                this.marineLifeBehavior.registerMarineLife(shark, 'hunting', 'Great White Shark');
            });
        }
        
        // 注册海豹行为
        if (this.capeFurSeals) {
            this.capeFurSeals.forEach(seal => {
                this.marineLifeBehavior.registerMarineLife(seal, 'territorial', 'Cape Fur Seal');
            });
        }
    }
    
    // 更新UI显示的动物计数
    updateAnimalCounts() {
        try {
            const kelpCount = (this.kelp && this.kelp.length) || 0;
            const fishCount = ((this.fish && this.fish.length) || 0) + 
                             ((this.capeReefFish && this.capeReefFish.length) || 0);
            const sealCount = (this.capeFurSeals && this.capeFurSeals.length) || 0;
            const penguinCount = (this.africanPenguins && this.africanPenguins.length) || 0;
            const sharkCount = (this.greatWhiteSharks && this.greatWhiteSharks.length) || 0;
            
            // 安全更新DOM元素
            const updateElement = (id, value) => {
                const element = document.getElementById(id);
                if (element) element.textContent = value;
            };
            
            updateElement('kelp-count', kelpCount);
            updateElement('fish-count', fishCount);
            updateElement('seal-count', sealCount);
            updateElement('penguin-count', penguinCount);
            updateElement('shark-count', sharkCount);
            
        } catch (error) {
            console.warn('⚠️ 动物计数更新失败:', error);
        }
    }
}
// 注册主应用模块
if (window.moduleManager) {
    window.moduleManager.registerModule('OceanForest', OceanForest);
}