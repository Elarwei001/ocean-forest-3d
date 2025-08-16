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
        
        // Follow system
        this.followTarget = null;
        
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
        
        // Marine life will be added via interactive controls
        // Initialize empty arrays
        this.capeFurSeals = [];
        this.africanPenguins = [];
        this.greatWhiteSharks = [];
        this.capeReefFish = [];
        this.seaUrchinFields = [];
        this.seaAnemones = [];
        
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
        
        // Initialize advanced 3D model generation system
        const Advanced3DModelSystem = moduleManager.getModule('Advanced3DModelSystem');
        if (Advanced3DModelSystem) {
            try {
                this.advanced3DModels = new Advanced3DModelSystem(this.scene, this.camera, this.renderer);
                this.generateEnhancedMarineModels();
                console.log('✅ Advanced 3D model generation system enabled');
            } catch (error) {
                console.warn('⚠️ Advanced 3D model system initialization failed:', error);
            }
        }
        
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
    
    // Generate enhanced marine models using 3D generation systems
    async generateEnhancedMarineModels() {
        if (!this.advanced3DModels) return;
        
        try {
            console.log('🎨 Generating enhanced 3D marine species models...');
            
            // Generate models for existing Ocean Forest species
            const enhancedModels = await this.advanced3DModels.generateOceanForestSpecies();
            
            // Replace existing simple models with enhanced ones
            this.replaceWithEnhancedModels(enhancedModels);
            
            console.log('✅ Enhanced marine models generation completed');
            
        } catch (error) {
            console.warn('⚠️ Enhanced model generation failed:', error);
        }
    }
    
    // Replace existing models with enhanced 3D generated models
    replaceWithEnhancedModels(enhancedModels) {
        // Replace great white sharks
        if (enhancedModels.great_white_shark && this.greatWhiteSharks) {
            this.greatWhiteSharks.forEach((shark, index) => {
                const enhancedShark = enhancedModels.great_white_shark.clone();
                enhancedShark.position.copy(shark.position);
                enhancedShark.rotation.copy(shark.rotation);
                enhancedShark.userData = { ...shark.userData };
                
                this.scene.remove(shark);
                this.scene.add(enhancedShark);
                this.greatWhiteSharks[index] = enhancedShark;
            });
            console.log('🦈 Replaced great white sharks with enhanced models');
        }
        
        // Replace cape fur seals
        if (enhancedModels.cape_fur_seal && this.capeFurSeals) {
            this.capeFurSeals.forEach((seal, index) => {
                const enhancedSeal = enhancedModels.cape_fur_seal.clone();
                enhancedSeal.position.copy(seal.position);
                enhancedSeal.rotation.copy(seal.rotation);
                enhancedSeal.userData = { ...seal.userData };
                
                this.scene.remove(seal);
                this.scene.add(enhancedSeal);
                this.capeFurSeals[index] = enhancedSeal;
            });
            console.log('🦭 Replaced cape fur seals with enhanced models');
        }
        
        // Replace reef fish with enhanced models
        const fishModels = ['yellowtail', 'hottentot', 'steentjie'];
        fishModels.forEach(fishType => {
            if (enhancedModels[fishType] && this.capeReefFish) {
                const targetFish = this.capeReefFish.filter(fish => 
                    fish.userData.species && fish.userData.species.englishName.toLowerCase().includes(fishType)
                );
                
                targetFish.forEach((fish, index) => {
                    const enhancedFish = enhancedModels[fishType].clone();
                    enhancedFish.position.copy(fish.position);
                    enhancedFish.rotation.copy(fish.rotation);
                    enhancedFish.userData = { ...fish.userData };
                    
                    this.scene.remove(fish);
                    this.scene.add(enhancedFish);
                    
                    // Update in the array
                    const fishIndex = this.capeReefFish.indexOf(fish);
                    if (fishIndex !== -1) {
                        this.capeReefFish[fishIndex] = enhancedFish;
                    }
                });
                console.log(`🐟 Replaced ${targetFish.length} ${fishType} with enhanced models`);
            }
        });
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
    
    // Interactive marine life control methods
    addCapeFurSeal() {
        if (!this.marineAnimals) {
            this.marineAnimals = new MarineAnimals(this.scene);
        }
        const newSeal = this.marineAnimals.createSingleCapeFurSeal();
        if (newSeal) {
            this.capeFurSeals.push(newSeal);
            if (this.education) {
                this.education.registerClickableObject(newSeal);
            }
            this.updateAnimalCounts();
            return newSeal;
        }
    }
    
    removeCapeFurSeal() {
        if (this.capeFurSeals.length > 0) {
            const seal = this.capeFurSeals.pop();
            this.scene.remove(seal);
            this.updateAnimalCounts();
            return true;
        }
        return false;
    }
    
    addAfricanPenguin() {
        if (!this.marineAnimals) {
            this.marineAnimals = new MarineAnimals(this.scene);
        }
        const newPenguin = this.marineAnimals.createSingleAfricanPenguin();
        if (newPenguin) {
            this.africanPenguins.push(newPenguin);
            if (this.education) {
                this.education.registerClickableObject(newPenguin);
            }
            this.updateAnimalCounts();
            return newPenguin;
        }
    }
    
    removeAfricanPenguin() {
        if (this.africanPenguins.length > 0) {
            const penguin = this.africanPenguins.pop();
            this.scene.remove(penguin);
            this.updateAnimalCounts();
            return true;
        }
        return false;
    }
    
    addGreatWhiteShark() {
        if (!this.sharksAndFish) {
            this.sharksAndFish = new SharksAndFish(this.scene);
        }
        const newShark = this.sharksAndFish.createSingleGreatWhiteShark();
        if (newShark) {
            this.scene.add(newShark);
            this.greatWhiteSharks.push(newShark);
            if (this.education) {
                this.education.registerClickableObject(newShark);
            }
            this.updateAnimalCounts();
            return newShark;
        }
    }
    
    removeGreatWhiteShark() {
        if (this.greatWhiteSharks.length > 0) {
            const shark = this.greatWhiteSharks.pop();
            this.scene.remove(shark);
            this.updateAnimalCounts();
            return true;
        }
        return false;
    }
    
    addCapeReefFish() {
        try {
            console.log('🐟 OceanForest: Adding Cape reef fish...');
            
            // Use the working manual fish creation method
            const fishTypes = [
                { name: "黄尾鰤鱼", englishName: "Yellowtail", 
                  bodyColor: 0xc0c0c0, finColor: 0xffd700 },
                { name: "霍屯督鱼", englishName: "Hottentot", 
                  bodyColor: 0xa0a0a0, finColor: 0x808080 },
                { name: "石头鱼", englishName: "Steentjie", 
                  bodyColor: 0x8b4513, finColor: 0x654321 }
            ];
            
            const fishType = fishTypes[Math.floor(Math.random() * fishTypes.length)];
            console.log('🎲 Creating fish type:', fishType.englishName);
            
            // Create fish using the proven working method
            const group = new THREE.Group();
            
            // Simple body
            const bodyGeometry = new THREE.SphereGeometry(0.5, 8, 6);
            bodyGeometry.scale(2, 1, 0.8);
            
            const bodyMaterial = new THREE.MeshPhongMaterial({
                color: fishType.bodyColor,
                shininess: 30
            });
            
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.castShadow = true;
            group.add(body);
            
            // Simple tail
            const tailGeometry = new THREE.ConeGeometry(0.3, 0.8, 6);
            const tailMaterial = new THREE.MeshPhongMaterial({
                color: fishType.finColor
            });
            
            const tail = new THREE.Mesh(tailGeometry, tailMaterial);
            tail.position.x = -1.0;
            tail.rotation.z = Math.PI / 2;
            group.add(tail);
            
            // Simple eyes
            const eyeGeometry = new THREE.SphereGeometry(0.1, 6, 4);
            const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
            
            const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            leftEye.position.set(0.4, 0.2, 0.3);
            group.add(leftEye);
            
            const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            rightEye.position.set(0.4, 0.2, -0.3);
            group.add(rightEye);
            
            // Add species data with correct profile pictures
            const profilePhotos = {
                'Yellowtail': 'assets/profiles/Yellowtail_profile.png',
                'Hottentot': 'assets/profiles/hottentot_profile.webp',
                'Steentjie': 'assets/profiles/Steentjie_profile.png'
            };
            
            const fishFacts = {
                'Yellowtail': [
                    "Fast swimming predator fish",
                    "Silver body with distinctive yellow tail fin", 
                    "Can grow up to 1 meter in length",
                    "Found in kelp forests and open waters"
                ],
                'Hottentot': [
                    "Beautiful blue-gray striped reef fish",
                    "Endemic to South African waters",
                    "Feeds on small crustaceans and algae",
                    "Common in rocky reef environments"
                ],
                'Steentjie': [
                    "Small bottom-dwelling reef fish",
                    "Brown camouflage coloring for protection",
                    "Hides among rocks and kelp",
                    "Feeds primarily on algae"
                ]
            };
            
            group.userData.species = {
                name: fishType.name,
                englishName: fishType.englishName,
                photo: profilePhotos[fishType.englishName] || "assets/profiles/default_fish.png",
                facts: fishFacts[fishType.englishName] || ["Beautiful South African reef fish"]
            };
            
            // Swimming behavior data for natural movement
            group.userData.swimPattern = Math.random() * Math.PI * 2;
            group.userData.schoolSpeed = 0.015 + Math.random() * 0.01; // Gentle swimming speed
            group.userData.targetPosition = new THREE.Vector3(
                (Math.random() - 0.5) * 50, // Random target X
                -8 + Math.random() * 6,     // Target depth
                (Math.random() - 0.5) * 50  // Random target Z
            );
            group.userData.spawnTime = Date.now();
            group.userData.isNewlySpawned = true;
            group.userData.isFollowed = false;
            group.userData.fishId = 'fish_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            // Start fish in center of screen (visible to camera)
            group.position.set(0, -2, 5); // In front of camera for immediate visibility
            
            // Add to scene and track
            this.scene.add(group);
            this.capeReefFish.push(group);
            
            if (this.education) {
                this.education.registerClickableObject(group);
            }
            
            this.updateAnimalCounts();
            this.updateFollowPanel();
            
            console.log('✅ Fish added successfully! Total fish:', this.capeReefFish.length);
            return group;
            
        } catch (error) {
            console.error('❌ Error in addCapeReefFish:', error);
            console.error('Error stack:', error.stack);
            return null;
        }
    }
    
    removeCapeReefFish() {
        if (this.capeReefFish.length > 0) {
            const fish = this.capeReefFish.pop();
            
            // Clear follow target if we're removing the followed fish
            if (this.followTarget === fish) {
                this.followTarget = null;
            }
            
            this.scene.remove(fish);
            this.updateAnimalCounts();
            this.updateFollowPanel();
            return true;
        }
        return false;
    }
    
    // Update fish swimming behavior
    updateFishMovement(deltaTime) {
        const currentTime = Date.now();
        
        this.capeReefFish.forEach((fish, index) => {
            if (!fish.userData) return;
            
            const timeSinceSpawn = currentTime - fish.userData.spawnTime;
            const isNewlySpawned = fish.userData.isNewlySpawned;
            
            // Debug logging for first fish
            if (index === 0 && Math.random() < 0.01) { // Log occasionally
                console.log('Fish 0 - Time since spawn:', timeSinceSpawn, 'Is newly spawned:', isNewlySpawned);
                console.log('Fish position:', fish.position.x.toFixed(2), fish.position.y.toFixed(2), fish.position.z.toFixed(2));
            }
            
            // For newly spawned fish, gradually move to target position
            if (isNewlySpawned && timeSinceSpawn < 3000) { // 3 seconds transition
                const progress = timeSinceSpawn / 3000;
                const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out curve
                
                // Interpolate from spawn position to target
                const startPos = new THREE.Vector3(0, -2, 5);
                fish.position.lerpVectors(startPos, fish.userData.targetPosition, easeProgress);
                
                // Mark as no longer newly spawned when transition completes
                if (progress >= 1) {
                    fish.userData.isNewlySpawned = false;
                    console.log('Fish finished spawning transition, starting normal swimming');
                }
            } else {
                // Species-specific realistic swimming behaviors
                this.updateSpecificFishBehavior(fish, deltaTime);
            }
        });
    }
    
    // Species-specific realistic swimming behaviors based on Wikipedia research
    updateSpecificFishBehavior(fish, deltaTime) {
        // Initialize behavior state for new fish
        if (!fish.userData.swimTime) {
            fish.userData.swimTime = 0;
            fish.userData.behaviorState = 'exploring';
            fish.userData.stateTimer = 0;
            fish.userData.patrolAngle = Math.random() * Math.PI * 2;
            fish.userData.isBeingFollowed = false;
            fish.userData.lastValidPosition = fish.position.clone();
        }
        
        // Check if this fish is being followed by octopus
        const isCurrentlyFollowed = (this.followTarget === fish);
        
        // If fish just started being followed, save its current position
        if (isCurrentlyFollowed && !fish.userData.isBeingFollowed) {
            fish.userData.lastValidPosition = fish.position.clone();
            fish.userData.isBeingFollowed = true;
            console.log('🐟 Fish is now being followed, saved position:', fish.userData.lastValidPosition);
        }
        
        // If fish is no longer being followed, restore stability
        if (!isCurrentlyFollowed && fish.userData.isBeingFollowed) {
            fish.userData.isBeingFollowed = false;
            // Reset behavior timers to prevent erratic transitions
            fish.userData.stateTimer = 0;
            fish.userData.behaviorState = 'exploring';
            console.log('🐟 Fish is no longer being followed, resetting behavior');
        }
        
        // Use stable time progression
        fish.userData.swimTime += Math.min(deltaTime, 0.033); // Cap deltaTime to prevent jumps
        fish.userData.stateTimer += Math.min(deltaTime, 0.033);
        
        const speciesName = fish.userData.species.englishName;
        const basePos = fish.userData.targetPosition || { x: 0, y: -5, z: 0 };
        
        // Species-specific behaviors based on research
        switch(speciesName) {
            case 'Yellowtail':
                this.updateYellowtailBehavior(fish, basePos, deltaTime);
                break;
            case 'Hottentot':
                this.updateHottentotBehavior(fish, basePos, deltaTime);
                break;
            case 'Steentjie':
                this.updateSteentjieBehavior(fish, basePos, deltaTime);
                break;
            default:
                this.updateGenericFishBehavior(fish, basePos, deltaTime);
        }
        
        // Keep fish within scene bounds
        const bounds = 35;
        fish.position.x = Math.max(-bounds, Math.min(bounds, fish.position.x));
        fish.position.y = Math.max(-18, Math.min(-2, fish.position.y));
        fish.position.z = Math.max(-bounds, Math.min(bounds, fish.position.z));
        
        // Store current position as last valid position
        fish.userData.lastValidPosition = fish.position.clone();
    }
    
    // Yellowtail: Fast schooling predators that swim in natural patterns
    updateYellowtailBehavior(fish, basePos, deltaTime) {
        const time = fish.userData.swimTime * 1.5; // Natural speed
        
        // Change behavior state every 8-12 seconds for more natural transitions
        if (fish.userData.stateTimer > 8 + Math.random() * 4) {
            const behaviors = ['cruising', 'burst_swimming', 'searching'];
            fish.userData.behaviorState = behaviors[Math.floor(Math.random() * behaviors.length)];
            fish.userData.stateTimer = 0;
            
            // Set new target direction for natural swimming
            if (!fish.userData.swimDirection) {
                fish.userData.swimDirection = Math.random() * Math.PI * 2;
            }
            fish.userData.swimDirection += (Math.random() - 0.5) * Math.PI * 0.5; // Gradual direction changes
        }
        
        switch(fish.userData.behaviorState) {
            case 'cruising':
                // Natural forward swimming with gentle curves - much slower
                fish.userData.swimDirection += Math.sin(time * 0.3) * 0.01; // Gentle course corrections
                const cruiseSpeed = 0.03; // Much slower - gentle cruising
                fish.position.x += Math.cos(fish.userData.swimDirection) * cruiseSpeed;
                fish.position.z += Math.sin(fish.userData.swimDirection) * cruiseSpeed;
                fish.position.y = basePos.y + Math.sin(time * 1.2) * 0.5; // Natural vertical movement
                fish.rotation.y = fish.userData.swimDirection;
                break;
                
            case 'burst_swimming':
                // Quick forward movement - still fast but not bullet speed
                fish.userData.swimDirection += Math.sin(time * 1.5) * 0.02; // More dynamic turns
                const burstSpeed = 0.08; // Fast but reasonable
                fish.position.x += Math.cos(fish.userData.swimDirection) * burstSpeed;
                fish.position.z += Math.sin(fish.userData.swimDirection) * burstSpeed;
                fish.position.y = basePos.y + Math.sin(time * 2.5) * 0.8; // More vertical movement
                fish.rotation.y = fish.userData.swimDirection + Math.sin(time * 2) * 0.1;
                break;
                
            case 'searching':
                // Exploring movement with natural turns and pauses - very slow
                const searchPattern = Math.sin(time * 1.8);
                fish.userData.swimDirection += searchPattern * 0.015;
                const baseSearchSpeed = 0.02;
                const searchSpeed = baseSearchSpeed + Math.abs(searchPattern) * 0.02; // Variable but slow speed
                fish.position.x += Math.cos(fish.userData.swimDirection) * searchSpeed;
                fish.position.z += Math.sin(fish.userData.swimDirection) * searchSpeed;
                fish.position.y = basePos.y + Math.sin(time * 1.4) * 0.6;
                fish.rotation.y = fish.userData.swimDirection + searchPattern * 0.2;
                break;
        }
    }
    
    // Hottentot: Bottom-dwelling fish that hide in kelp and move cautiously
    updateHottentotBehavior(fish, basePos, deltaTime) {
        const time = fish.userData.swimTime * 0.8; // Slower movement
        
        // Change behavior every 8-15 seconds (more sedentary)
        if (fish.userData.stateTimer > 8 + Math.random() * 7) {
            const behaviors = ['hiding', 'cautious_foraging', 'territory_defense'];
            fish.userData.behaviorState = behaviors[Math.floor(Math.random() * behaviors.length)];
            fish.userData.stateTimer = 0;
        }
        
        switch(fish.userData.behaviorState) {
            case 'hiding':
                // Minimal movement, staying close to substrate
                fish.position.x = basePos.x + Math.sin(time * 0.5) * 0.5;
                fish.position.z = basePos.z + Math.cos(time * 0.3) * 0.5;
                fish.position.y = basePos.y + Math.sin(time * 0.8) * 0.2; // Stay near bottom
                fish.rotation.y = Math.sin(time * 0.2) * 0.3;
                break;
                
            case 'cautious_foraging':
                // Slow movement with frequent stops
                const stopPattern = Math.sin(time * 3) > 0.5 ? 1 : 0.1; // Stop-and-go movement
                fish.position.x = basePos.x + Math.sin(time * 0.6) * 1.5 * stopPattern;
                fish.position.z = basePos.z + Math.cos(time * 0.4) * 1.5 * stopPattern;
                fish.position.y = basePos.y + Math.sin(time * 2) * 0.3;
                fish.rotation.y = Math.cos(time * 0.5) * 0.4;
                break;
                
            case 'territory_defense':
                // More aggressive movement within small area
                fish.position.x = basePos.x + Math.sin(time * 1.5) * 2;
                fish.position.z = basePos.z + Math.cos(time * 1.2) * 2;
                fish.position.y = basePos.y + Math.sin(time * 3) * 0.8;
                fish.rotation.y = time * 1.2;
                break;
        }
    }
    
    // Steentjie: Territorial bottom fish with seasonal spawning displays
    updateSteentjieBehavior(fish, basePos, deltaTime) {
        const time = fish.userData.swimTime;
        
        // Change behavior every 7-12 seconds
        if (fish.userData.stateTimer > 7 + Math.random() * 5) {
            const behaviors = ['territorial_patrol', 'spawning_display', 'resting'];
            fish.userData.behaviorState = behaviors[Math.floor(Math.random() * behaviors.length)];
            fish.userData.stateTimer = 0;
        }
        
        switch(fish.userData.behaviorState) {
            case 'territorial_patrol':
                // Circular patrol around territory
                fish.userData.patrolAngle += deltaTime * 0.6;
                const territoryRadius = 4;
                fish.position.x = basePos.x + Math.cos(fish.userData.patrolAngle) * territoryRadius;
                fish.position.z = basePos.z + Math.sin(fish.userData.patrolAngle) * territoryRadius;
                fish.position.y = basePos.y + Math.sin(time * 1.5) * 0.6;
                fish.rotation.y = fish.userData.patrolAngle + Math.PI/2;
                break;
                
            case 'spawning_display':
                // Dramatic vertical movements and spins (blue-yellow coloration behavior) - reduced intensity
                fish.position.x = basePos.x + Math.sin(time * 2) * 1.2;
                fish.position.z = basePos.z + Math.cos(time * 2) * 1.2;
                fish.position.y = basePos.y + Math.sin(time * 3) * 1.5; // Reduced vertical display
                fish.rotation.y = time * 2; // Reduced spinning
                break;
                
            case 'resting':
                // Gentle hovering near bottom structures
                fish.position.x = basePos.x + Math.sin(time * 0.4) * 0.8;
                fish.position.z = basePos.z + Math.cos(time * 0.3) * 0.8;
                fish.position.y = basePos.y + Math.sin(time * 0.8) * 0.3;
                fish.rotation.y = Math.sin(time * 0.3) * 0.2;
                break;
        }
    }
    
    // Generic behavior for any other fish species
    updateGenericFishBehavior(fish, basePos, deltaTime) {
        const time = fish.userData.swimTime;
        fish.position.x = basePos.x + Math.sin(time + fish.userData.swimPattern) * 2;
        fish.position.y = basePos.y + Math.cos(time * 0.7 + fish.userData.swimPattern) * 1;
        fish.position.z = basePos.z + Math.sin(time * 0.5 + fish.userData.swimPattern) * 2;
        fish.rotation.y = Math.sin(time * 0.5) * 0.4;
    }
    
    // Update follow panel UI
    updateFollowPanel() {
        console.log('🔄 updateFollowPanel called, fish count:', this.capeReefFish.length);
        
        const container = document.getElementById('follow-buttons-container');
        const noFishMessage = container.querySelector('.no-fish-message');
        const stopButton = document.getElementById('stop-follow-btn');
        const panel = document.getElementById('fish-follow-panel');
        
        console.log('📋 Panel elements found:');
        console.log('  - container:', !!container);
        console.log('  - noFishMessage:', !!noFishMessage);
        console.log('  - stopButton:', !!stopButton);
        console.log('  - panel:', !!panel);
        console.log('  - panel visible:', panel ? panel.style.display !== 'none' : 'no panel');
        
        if (!container) {
            console.error('❌ Follow buttons container not found!');
            return;
        }
        
        // Clear existing buttons (except no-fish message)
        const existingButtons = container.querySelectorAll('.follow-fish-btn');
        console.log('🗑️ Removing', existingButtons.length, 'existing buttons');
        existingButtons.forEach(btn => btn.remove());
        
        if (this.capeReefFish.length === 0) {
            console.log('❌ No fish available for following');
            if (noFishMessage) noFishMessage.style.display = 'block';
            stopButton.style.display = 'none';
        } else {
            console.log('✅ Creating follow buttons for', this.capeReefFish.length, 'fish');
            if (noFishMessage) noFishMessage.style.display = 'none';
            stopButton.style.display = this.followTarget ? 'block' : 'none';
            
            // Create button for each fish
            this.capeReefFish.forEach((fish, index) => {
                const button = document.createElement('button');
                button.className = 'follow-fish-btn';
                button.textContent = `🐟 ${fish.userData.species.englishName} #${index + 1}`;
                
                // Add multiple event handlers for debugging
                button.onclick = (event) => {
                    console.log('🖱️ Button ONCLICK triggered!');
                    event.preventDefault();
                    event.stopPropagation();
                    this.toggleFishFollowFromUI(fish);
                };
                
                button.addEventListener('click', (event) => {
                    console.log('🖱️ Button CLICK EVENT triggered!');
                    event.preventDefault();
                    event.stopPropagation();
                });
                
                button.addEventListener('mousedown', () => {
                    console.log('🖱️ Button MOUSEDOWN triggered!');
                    button.style.backgroundColor = 'red';
                });
                
                button.addEventListener('mouseup', () => {
                    console.log('🖱️ Button MOUSEUP triggered!');
                    button.style.backgroundColor = '';
                });
                
                if (this.followTarget === fish) {
                    button.classList.add('active');
                    button.textContent = `🎯 Following ${fish.userData.species.englishName} #${index + 1}`;
                }
                
                console.log('✅ Created follow button for:', fish.userData.species.englishName);
                container.appendChild(button);
            });
        }
    }
    
    // Toggle fish following from UI button
    toggleFishFollowFromUI(fish) {
        console.log('🔘 Follow button clicked!');
        console.log('Fish object:', fish);
        console.log('Fish species:', fish.userData.species ? fish.userData.species.englishName : 'Unknown');
        
        // Clear previous follow target
        if (this.followTarget) {
            this.followTarget.userData.isFollowed = false;
            console.log('🔄 Cleared previous follow target');
        }
        
        // Set new follow target or clear if same fish clicked
        if (this.followTarget === fish) {
            this.followTarget = null;
            console.log('🛑 Stopped following fish');
            alert('🛑 Stopped following fish');
        } else {
            this.followTarget = fish;
            fish.userData.isFollowed = true;
            const fishName = fish.userData.species.englishName;
            console.log('🎯 Now following:', fishName);
            alert('🎯 Now following: ' + fishName + '!\nWatch the octopus move toward the fish.');
        }
        
        // Debug current state
        console.log('Current follow target:', this.followTarget ? this.followTarget.userData.species.englishName : 'None');
        console.log('Follow target position:', this.followTarget ? this.followTarget.position : 'None');
        console.log('Octopus position:', this.octopusPosition);
        
        // Update UI
        this.updateFollowPanel();
    }
    
    // Stop following all fish
    stopFollowingAll() {
        console.log('🔘 Stop Following button clicked!');
        if (this.followTarget) {
            const fishName = this.followTarget.userData.species.englishName;
            this.followTarget.userData.isFollowed = false;
            this.followTarget = null;
            console.log('🛑 Stopped following all fish');
            alert('🛑 Stopped following ' + fishName);
            this.updateFollowPanel();
        } else {
            console.log('ℹ️ No fish was being followed');
            alert('ℹ️ No fish is currently being followed');
        }
    }
    
    // Update octopus follow behavior
    updateOctopusFollow(deltaTime) {
        if (!this.followTarget) return;
        
        const targetPos = this.followTarget.position;
        const currentPos = this.octopusPosition;
        
        // Calculate direction to fish with some offset to avoid collision
        const direction = targetPos.clone().sub(currentPos);
        const distance = direction.length();
        
        // Debug logging (occasional)
        if (Math.random() < 0.01) {
            console.log('🎯 Following fish:', this.followTarget.userData.species.englishName);
            console.log('Distance to fish:', distance.toFixed(2));
            console.log('Fish position:', targetPos.x.toFixed(2), targetPos.y.toFixed(2), targetPos.z.toFixed(2));
            console.log('Octopus position:', currentPos.x.toFixed(2), currentPos.y.toFixed(2), currentPos.z.toFixed(2));
        }
        
        // Maintain a comfortable following distance
        const followDistance = 6;
        if (distance > followDistance) {
            direction.normalize();
            
            // OCTOPUS FLYING EFFECT - Super dramatic movement!
            const baseSpeed = 0.5; // Even faster for flying effect
            const distanceMultiplier = Math.min(3.0, distance * 0.15); // Much more dramatic speed scaling
            const moveSpeed = baseSpeed * distanceMultiplier;
            const moveVector = direction.multiplyScalar(moveSpeed);
            
            this.octopusPosition.add(moveVector);
            
            // Add flying motion with more dramatic sway
            const time = performance.now() * 0.005;
            const flyingSway = Math.sin(time * 3) * 1.0; // Larger sway for flying effect
            const flyingBob = Math.cos(time * 2) * 0.8;   // Vertical bobbing
            this.octopusPosition.x += flyingSway;
            this.octopusPosition.y += flyingBob;
            
            console.log('🚀 Octopus FLYING to fish at speed:', moveSpeed.toFixed(3));
            
            // Keep octopus within scene bounds
            this.octopusPosition.x = Math.max(-40, Math.min(40, this.octopusPosition.x));
            this.octopusPosition.y = Math.max(-20, Math.min(10, this.octopusPosition.y));
            this.octopusPosition.z = Math.max(-40, Math.min(40, this.octopusPosition.z));
        }
    }
}
// Register main application module
if (window.moduleManager) {
    window.moduleManager.registerModule('OceanForest', OceanForest);
}