// Main Application Class - Ocean Forest Core Engine
// Main Application Class - Ocean Forest Core Engine

class OceanForest {
    constructor() {
        // Initialize basic properties
        this.canvas = document.getElementById('webgl-canvas');
        this.loadingScreen = document.getElementById('loading-screen');
        
        // Performance tracking
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 60;
        
        // Game objects
        this.octopus = null;
        this.kelp = [];
        this.fish = [];
        this.bubbles = [];
        this.particles = [];
        
        // South African marine life
        this.capeFurSeals = [];
        this.greatWhiteSharks = [];
        this.africanPenguins = [];
        this.capeReefFish = [];
        this.seaUrchinFields = [];
        this.seaAnemones = [];
        
        // Control system
        this.keys = {};
        this.mouse = { x: 0, y: 0 };
        this.mouseControl = { enabled: false, sensitivity: 0.005 };
        this.octopusPosition = new THREE.Vector3(0, -5, 0);
        this.cameraOffset = new THREE.Vector3(0, 3, 8);
        
        // System components
        this.audio = new OceanAudio();
        window.audioSystem = this.audio;
        this.education = null;
        this.speciesLabels = [];
        
        // Global reference for education system use
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
        
        // Add South African marine life
        this.createCapeFurSeals();
        this.createAfricanPenguins();
        this.createGreatWhiteSharks();
        this.createCapeReefFish();
        this.createSeaUrchinFields();
        this.createSeaAnemones();
        
        // Initialize education system
        this.education = new EducationSystem(this.scene, this.camera, this.canvas);
        this.registerClickableObjects();
        
        this.setupPostProcessing();
        
        // Initialize animal count display
        this.updateAnimalCounts();
        
        // Set up periodic animal count updates
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
        
        // Background gradient
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
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404080, 0.4);
        this.scene.add(ambientLight);
        
        // Main light source
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
        
        // Caustic light effects
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
        // Keyboard controls
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            this.audio.enableAudio();
            
            if (e.code === 'KeyM') {
                this.mouseControl.enabled = !this.mouseControl.enabled;
                const controlInfo = document.querySelector('.info');
                if (controlInfo) {
                    controlInfo.textContent = this.mouseControl.enabled 
                        ? 'Mouse control enabled' 
                        : 'Mouse control disabled';
                }
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Mouse controls
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
        
        // Touch controls
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
        
        // Window resize handling
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
            'Loading kelp forest...',
            'Creating octopus model...',
            'Spawning Cape Fur Seals...',
            'Adding African Penguins...',
            'Introducing Great White Sharks...',
            'Schooling Cape reef fish...',
            'Placing sea urchins and anemones...',
            'Optimizing marine ecosystem...',
            'Preparing educational features...'
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
        // Register all marine species as clickable educational objects
        [...this.capeFurSeals, ...this.africanPenguins, ...this.greatWhiteSharks, ...this.capeReefFish]
            .forEach(species => this.education.registerClickableObject(species));
        
        console.log(`Registered ${this.capeFurSeals.length + this.africanPenguins.length + this.greatWhiteSharks.length + this.capeReefFish.length} clickable marine species for education`);
        this.createFloatingLabels();
    }
    
    // Create ocean environment
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
    
    // Create octopus
    createOctopus() {
        this.octopusModel = new OctopusModel(this.scene);
        this.octopus = this.octopusModel.createOctopus();
        return this.octopus;
    }
    
    // Create basic fish (simple decoration)
    createFish() {
        // Basic decorative fish, main fish are in createCapeReefFish
        this.fish = [];
        return this.fish;
    }
    
    // Create South African marine life
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
        // Simplified sea urchin creation, main logic in other modules
        this.seaUrchinFields = [];
        return this.seaUrchinFields;
    }
    
    createSeaAnemones() {
        // Simplified sea anemone creation, main logic in other modules
        this.seaAnemones = [];
        return this.seaAnemones;
    }
    
    // Create floating labels
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
    
    // Setup post-processing
    setupPostProcessing() {
        this.renderEngine = new RenderEngine(this.renderer, this.scene, this.camera);
        this.renderEngine.setupPostProcessing();
        
        // Optional: Initialize cinematic systems (if available)
        this.initOptionalSystems();
    }
    
    // Start render loop
    startRenderLoop() {
        if (!this.renderEngine) {
            this.renderEngine = new RenderEngine(this.renderer, this.scene, this.camera);
        }
        this.renderEngine.startRenderLoop(this);
    }
    
    // Initialize optional advanced systems
    initOptionalSystems() {
        const moduleManager = window.moduleManager;
        if (!moduleManager) return;
        
        // Initialize cinematic animation system
        const CinematicAnimationSystem = moduleManager.getModule('CinematicAnimationSystem');
        if (CinematicAnimationSystem) {
            try {
                this.cinematicAnimation = new CinematicAnimationSystem(this.scene, this.camera, this.renderer);
                console.log('✅ Cinematic animation system enabled');
            } catch (error) {
                console.warn('⚠️ Cinematic animation system initialization failed:', error);
            }
        }
        
        // Initialize advanced particle system
        const AdvancedParticleSystem = moduleManager.getModule('AdvancedParticleSystem');
        if (AdvancedParticleSystem) {
            try {
                this.advancedParticles = new AdvancedParticleSystem(this.scene, this.camera);
                console.log('✅ Advanced particle system enabled');
            } catch (error) {
                console.warn('⚠️ Advanced particle system initialization failed:', error);
            }
        }
        
        // Initialize marine life behavior system
        const MarineLifeBehavior = moduleManager.getModule('MarineLifeBehavior');
        if (MarineLifeBehavior) {
            try {
                this.marineLifeBehavior = new MarineLifeBehavior();
                this.setupMarineLifeBehavior();
                console.log('✅ Marine life behavior system enabled');
            } catch (error) {
                console.warn('⚠️ Marine life behavior system initialization failed:', error);
            }
        }
        
        // Initialize cinematic camera system
        const CinematicCameraSystem = moduleManager.getModule('CinematicCameraSystem');
        if (CinematicCameraSystem) {
            try {
                this.cinematicCamera = new CinematicCameraSystem(this.camera, this.scene);
                this.cinematicCamera.setTarget(this.octopusPosition);
                console.log('✅ Cinematic camera system enabled');
            } catch (error) {
                console.warn('⚠️ Cinematic camera system initialization failed:', error);
            }
        }
    }
    
    // Setup marine life behavior
    setupMarineLifeBehavior() {
        if (!this.marineLifeBehavior) return;
        
        // Register fish behavior
        if (this.capeReefFish) {
            this.capeReefFish.forEach(fish => {
                const species = fish.userData.species ? fish.userData.species.englishName : 'Unknown';
                this.marineLifeBehavior.registerMarineLife(fish, 'schooling', species);
            });
        }
        
        // Register shark behavior
        if (this.greatWhiteSharks) {
            this.greatWhiteSharks.forEach(shark => {
                this.marineLifeBehavior.registerMarineLife(shark, 'hunting', 'Great White Shark');
            });
        }
        
        // Register seal behavior
        if (this.capeFurSeals) {
            this.capeFurSeals.forEach(seal => {
                this.marineLifeBehavior.registerMarineLife(seal, 'territorial', 'Cape Fur Seal');
            });
        }
    }
    
    // Update UI display of animal counts
    updateAnimalCounts() {
        try {
            const kelpCount = (this.kelp && this.kelp.length) || 0;
            const fishCount = ((this.fish && this.fish.length) || 0) + 
                             ((this.capeReefFish && this.capeReefFish.length) || 0);
            const sealCount = (this.capeFurSeals && this.capeFurSeals.length) || 0;
            const penguinCount = (this.africanPenguins && this.africanPenguins.length) || 0;
            const sharkCount = (this.greatWhiteSharks && this.greatWhiteSharks.length) || 0;
            
            // Safely update DOM elements
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
            console.warn('⚠️ Animal count update failed:', error);
        }
    }
}
// Register main application module
if (window.moduleManager) {
    window.moduleManager.registerModule('OceanForest', OceanForest);
}