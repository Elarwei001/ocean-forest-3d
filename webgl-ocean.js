// WebGL Ocean Forest with Three.js
class OceanForest {
    constructor() {
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
        
        // Controls
        this.keys = {};
        this.mouse = { x: 0, y: 0 };
        this.mouseControl = { enabled: false, sensitivity: 0.02 };
        this.octopusPosition = new THREE.Vector3(0, -5, 0);
        this.cameraOffset = new THREE.Vector3(0, 3, 8);
        
        // Audio system
        this.audio = new OceanAudio();
        // Make audio available globally for education system
        window.audioSystem = this.audio;
        
        // Education system (will be initialized after scene setup)
        this.education = null;
        
        // Floating labels system
        this.speciesLabels = [];
        
        this.init();
    }
    
    async init() {
        this.setupRenderer();
        this.setupScene();
        this.setupCamera();
        this.setupLights();
        this.setupControls();
        
        // Show loading progress
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
        
        // Initialize education system after all objects are created
        this.education = new EducationSystem(this.scene, this.camera, this.canvas);
        this.registerClickableObjects();
        
        this.setupPostProcessing();
        
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
        
        // Enable fog for depth
        this.renderer.setClearColor(0x001122, 1);
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        
        // Underwater fog effect
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
                    float h = normalize(vWorldPosition + vec3(0.0, 50.0, 0.0)).y;
                    float wave = sin(time * 0.5 + vWorldPosition.x * 0.01) * 0.1;
                    gl_FragColor = vec4(mix(bottomColor, topColor, max(0.0, h + wave)), 1.0);
                }
            `,
            side: THREE.BackSide
        });
        
        this.skybox = new THREE.Mesh(geometry, material);
        this.scene.add(this.skybox);
    }
    
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        
        this.camera.position.copy(this.octopusPosition).add(this.cameraOffset);
        this.camera.lookAt(this.octopusPosition);
    }
    
    setupLights() {
        // Ambient underwater light
        this.ambientLight = new THREE.AmbientLight(0x004488, 0.3);
        this.scene.add(this.ambientLight);
        
        // Main sunlight filtering through water
        this.sunLight = new THREE.DirectionalLight(0x88ccff, 1.2);
        this.sunLight.position.set(50, 100, 30);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 200;
        this.sunLight.shadow.camera.left = -50;
        this.sunLight.shadow.camera.right = 50;
        this.sunLight.shadow.camera.top = 50;
        this.sunLight.shadow.camera.bottom = -50;
        this.scene.add(this.sunLight);
        
        // Caustic light patterns
        this.causticLights = [];
        for (let i = 0; i < 5; i++) {
            const light = new THREE.SpotLight(0x77aaff, 0.5, 30, Math.PI / 6, 0.5);
            light.position.set(
                (Math.random() - 0.5) * 80,
                20 + Math.random() * 20,
                (Math.random() - 0.5) * 80
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
            
            // Toggle mouse control with M key
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
        
        // Mouse controls for camera and octopus movement
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            
            // Move octopus with mouse when enabled
            if (this.mouseControl.enabled && this.octopus) {
                const targetX = this.mouse.x * 40; // Scale mouse position to world coordinates
                const targetY = this.mouse.y * 20;
                
                // Smooth interpolation towards mouse position
                this.octopusPosition.x += (targetX - this.octopusPosition.x) * this.mouseControl.sensitivity;
                this.octopusPosition.y += (targetY - this.octopusPosition.y) * this.mouseControl.sensitivity;
                
                // Constrain within bounds
                this.octopusPosition.x = Math.max(-50, Math.min(50, this.octopusPosition.x));
                this.octopusPosition.y = Math.max(-30, Math.min(20, this.octopusPosition.y));
            }
        });
        
        // Touch controls for mobile
        let touchStartX = 0;
        let touchStartY = 0;
        
        window.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            this.audio.enableAudio();
        });
        
        window.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const deltaX = e.touches[0].clientX - touchStartX;
            const deltaY = e.touches[0].clientY - touchStartY;
            
            this.keys['ArrowLeft'] = deltaX < -30;
            this.keys['ArrowRight'] = deltaX > 30;
            this.keys['ArrowUp'] = deltaY < -30;
            this.keys['ArrowDown'] = deltaY > 30;
        });
        
        window.addEventListener('touchend', () => {
            this.keys = {};
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    async loadAssets() {
        const loadingProgress = document.querySelector('.loading-progress');
        
        // Initialize texture loader for better marine effects
        this.textureLoader = new THREE.TextureLoader();
        
        // Enhanced loading progress with better marine models preparation
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
        
        // Try to initialize GLTF loader for potential 3D model loading
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
    
    createOceanFloor() {
        const geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
        
        // Add some variation to the ocean floor
        const vertices = geometry.attributes.position.array;
        for (let i = 2; i < vertices.length; i += 3) {
            vertices[i] = Math.random() * 2 - 1; // Random height variation
        }
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
        
        const material = new THREE.MeshLambertMaterial({
            color: 0x2d2418,
            transparent: true,
            opacity: 0.8
        });
        
        this.oceanFloor = new THREE.Mesh(geometry, material);
        this.oceanFloor.rotation.x = -Math.PI / 2;
        this.oceanFloor.position.y = -15;
        this.oceanFloor.receiveShadow = true;
        
        this.scene.add(this.oceanFloor);
    }
    
    createKelpForest() {
        const kelpCount = 50;
        
        for (let i = 0; i < kelpCount; i++) {
            const kelp = this.createKelpPlant();
            
            // Random positioning
            kelp.position.set(
                (Math.random() - 0.5) * 100,
                -15,
                (Math.random() - 0.5) * 100
            );
            
            // Ensure kelp doesn't spawn too close to octopus start position
            if (kelp.position.distanceTo(this.octopusPosition) < 10) {
                kelp.position.x += 15;
                kelp.position.z += 15;
            }
            
            this.kelp.push(kelp);
            this.scene.add(kelp);
        }
        
        document.getElementById('kelp-count').textContent = this.kelp.length;
        document.getElementById('seal-count').textContent = this.capeFurSeals.length;
        document.getElementById('penguin-count').textContent = this.africanPenguins.length; 
        document.getElementById('shark-count').textContent = this.greatWhiteSharks.length;
    }
    
    createKelpPlant() {
        const group = new THREE.Group();
        const segments = 8 + Math.floor(Math.random() * 6);
        const height = 15 + Math.random() * 10;
        const segmentHeight = height / segments;
        
        for (let i = 0; i < segments; i++) {
            const geometry = new THREE.CylinderGeometry(
                0.3 - (i * 0.02), // Top radius (tapering)
                0.4 - (i * 0.02), // Bottom radius
                segmentHeight,
                6
            );
            
            const material = new THREE.MeshLambertMaterial({
                color: new THREE.Color().setHSL(0.25, 0.6, 0.2 + Math.random() * 0.3),
                transparent: true,
                opacity: 0.9
            });
            
            const segment = new THREE.Mesh(geometry, material);
            segment.position.y = i * segmentHeight + segmentHeight / 2;
            segment.castShadow = true;
            segment.userData = { 
                baseY: segment.position.y,
                swayOffset: Math.random() * Math.PI * 2,
                swayAmount: 0.1 + Math.random() * 0.2
            };
            
            group.add(segment);
        }
        
        return group;
    }
    
    createOctopus() {
        this.octopus = new THREE.Group();
        
        // Octopus head/body
        const bodyGeometry = new THREE.SphereGeometry(1.5, 16, 12);
        // Flatten the bottom for more octopus-like shape
        const bodyVertices = bodyGeometry.attributes.position.array;
        for (let i = 0; i < bodyVertices.length; i += 3) {
            if (bodyVertices[i + 1] < 0) { // Bottom half
                bodyVertices[i + 1] *= 0.6; // Flatten
            }
        }
        bodyGeometry.attributes.position.needsUpdate = true;
        bodyGeometry.computeVertexNormals();
        
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0xff4444,
            shininess: 30,
            specular: 0x444444
        });
        
        this.octopusBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.octopusBody.castShadow = true;
        this.octopus.add(this.octopusBody);
        
        // Eyes
        this.octopusEyes = [];
        for (let i = 0; i < 2; i++) {
            const eyeGroup = new THREE.Group();
            
            const eyeGeometry = new THREE.SphereGeometry(0.3, 12, 8);
            const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            
            const pupilGeometry = new THREE.SphereGeometry(0.15, 8, 6);
            const pupilMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
            const pupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
            pupil.position.z = 0.2;
            
            eyeGroup.add(eye);
            eyeGroup.add(pupil);
            eyeGroup.position.set(i === 0 ? -0.6 : 0.6, 0.3, 1.2);
            
            this.octopus.add(eyeGroup);
            this.octopusEyes.push(eyeGroup);
        }
        
        // Tentacles
        this.octopusTentacles = [];
        for (let i = 0; i < 8; i++) {
            const tentacle = this.createTentacle();
            const angle = (i / 8) * Math.PI * 2;
            tentacle.position.set(
                Math.cos(angle) * 0.8,
                -1,
                Math.sin(angle) * 0.8
            );
            
            // Set the base angle properly
            tentacle.userData.baseAngle = angle;
            tentacle.userData.angle = angle;
            
            this.octopusTentacles.push(tentacle);
            this.octopus.add(tentacle);
        }
        
        this.octopus.position.copy(this.octopusPosition);
        this.scene.add(this.octopus);
    }
    
    createTentacle() {
        const tentacle = new THREE.Group();
        const segments = 8; // More segments for smoother movement
        const segmentLength = 0.6;
        
        // Store segment references for physics calculations
        tentacle.segments = [];
        tentacle.joints = [];
        
        for (let i = 0; i < segments; i++) {
            const radius = 0.18 - (i * 0.015);
            const geometry = new THREE.CylinderGeometry(radius * 0.7, radius, segmentLength, 8);
            const material = new THREE.MeshPhongMaterial({
                color: 0xff2222,
                shininess: 20
            });
            
            const segment = new THREE.Mesh(geometry, material);
            segment.position.y = -(i * segmentLength + segmentLength / 2);
            segment.castShadow = true;
            
            // Enhanced segment data for physics
            segment.userData = {
                segmentIndex: i,
                baseY: segment.position.y,
                currentAngleX: 0,
                currentAngleZ: 0,
                targetAngleX: 0,
                targetAngleZ: 0,
                velocity: new THREE.Vector3(),
                restPosition: segment.position.clone(),
                mass: 1.0 - (i * 0.1), // Lighter towards the tip
                stiffness: 0.8 - (i * 0.05), // More flexible towards the tip
                damping: 0.85
            };
            
            tentacle.add(segment);
            tentacle.segments.push(segment);
            
            // Create joint for connecting segments
            if (i > 0) {
                const joint = {
                    parent: tentacle.segments[i - 1],
                    child: segment,
                    restAngle: 0,
                    maxAngle: Math.PI / 3, // Maximum bend angle
                    stiffness: 0.7 - (i * 0.05)
                };
                tentacle.joints.push(joint);
            }
        }
        
        // Add tentacle physics properties
        tentacle.userData = {
            isSwimming: false,
            swimPhase: 0,
            swimFrequency: 2.0,
            propulsionForce: new THREE.Vector3(),
            waterResistance: 0.95,
            naturalCurl: Math.random() * 0.3 - 0.15, // Natural curl variation
            strokeDirection: 1, // 1 for power stroke, -1 for recovery stroke
            lastMovement: new THREE.Vector3()
        };
        
        return tentacle;
    }
    
    createFish() {
        const fishCount = 20;
        
        for (let i = 0; i < fishCount; i++) {
            const fish = this.createSingleFish();
            
            // Random positioning in a large area
            fish.position.set(
                (Math.random() - 0.5) * 150,
                Math.random() * 20 - 10,
                (Math.random() - 0.5) * 150
            );
            
            // Random initial direction
            fish.userData.direction = new THREE.Vector3(
                Math.random() - 0.5,
                (Math.random() - 0.5) * 0.3,
                Math.random() - 0.5
            ).normalize();
            
            fish.userData.speed = 0.03 + Math.random() * 0.02; // 大幅降低基础鱼类速度
            fish.userData.turnRate = 0.01 + Math.random() * 0.02;
            
            this.fish.push(fish);
            this.scene.add(fish);
        }
        
        document.getElementById('fish-count').textContent = this.fish.length + this.capeReefFish.length;
    }
    
    createSingleFish() {
        const group = new THREE.Group();
        
        // Fish body
        const bodyGeometry = new THREE.SphereGeometry(0.5, 8, 6);
        bodyGeometry.scale(1.5, 0.8, 1);
        
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: new THREE.Color().setHSL(0.15 + Math.random() * 0.1, 0.8, 0.6)
        });
        
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        group.add(body);
        
        // Tail
        const tailGeometry = new THREE.ConeGeometry(0.3, 0.8, 4);
        const tailMaterial = new THREE.MeshPhongMaterial({
            color: bodyMaterial.color.clone().multiplyScalar(0.8)
        });
        
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.set(-1.2, 0, 0);
        tail.rotation.z = Math.PI / 2;
        group.add(tail);
        
        return group;
    }
    
    setupPostProcessing() {
        // Add subtle underwater distortion effect
        this.distortionUniforms = {
            time: { value: 0 },
            distortion: { value: 0.02 }
        };
    }
    
    updateOctopus(deltaTime) {
        if (!this.octopus) return;
        
        const moveSpeed = 8;
        const rotationSpeed = 3;
        let isMoving = false;
        
        // Movement controls
        const direction = new THREE.Vector3();
        
        if (this.keys['KeyW'] || this.keys['ArrowUp']) {
            direction.z -= 1;
            isMoving = true;
        }
        if (this.keys['KeyS'] || this.keys['ArrowDown']) {
            direction.z += 1;
            isMoving = true;
        }
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
            direction.x -= 1;
            isMoving = true;
        }
        if (this.keys['KeyD'] || this.keys['ArrowRight']) {
            direction.x += 1;
            isMoving = true;
        }
        if (this.keys['Space']) {
            direction.y += 1;
            isMoving = true;
        }
        if (this.keys['ShiftLeft'] || this.keys['ShiftRight']) {
            direction.y -= 1;
            isMoving = true;
        }
        
        // Calculate movement vector
        const movement = new THREE.Vector3();
        
        if (direction.length() > 0) {
            direction.normalize();
            direction.multiplyScalar(moveSpeed * deltaTime);
            
            // Apply camera-relative movement
            const forward = new THREE.Vector3();
            this.camera.getWorldDirection(forward);
            forward.y = 0;
            forward.normalize();
            
            const right = new THREE.Vector3();
            right.crossVectors(forward, new THREE.Vector3(0, 1, 0));
            
            movement.addScaledVector(forward, -direction.z);
            movement.addScaledVector(right, direction.x);
            movement.y += direction.y;
            
            this.octopusPosition.add(movement);
            
            // Rotate octopus to face movement direction
            if (movement.length() > 0.1) {
                const targetRotation = Math.atan2(movement.x, movement.z);
                this.octopus.rotation.y = THREE.MathUtils.lerp(
                    this.octopus.rotation.y,
                    targetRotation,
                    rotationSpeed * deltaTime
                );
            }
            
            // Play movement sound occasionally
            if (Math.random() < 0.02) {
                this.audio.playMovementSound();
            }
        }
        
        // Update octopus position
        this.octopus.position.lerp(this.octopusPosition, 5 * deltaTime);
        
        // Update tentacles with realistic swimming physics
        this.updateTentaclePhysics(deltaTime, movement, isMoving);
        
        // Bob the octopus body slightly
        const time = performance.now() * 0.001;
        this.octopusBody.rotation.x = Math.sin(time * 2) * 0.05;
        this.octopusBody.rotation.z = Math.cos(time * 1.5) * 0.03;
    }
    
    updateTentaclePhysics(deltaTime, movementVector, isMoving) {
        const time = performance.now() * 0.001;
        
        this.octopusTentacles.forEach((tentacle, tentacleIndex) => {
            // Safety check
            if (!tentacle || !tentacle.userData) return;
            
            const tentacleData = tentacle.userData;
            const angle = tentacleData.baseAngle || 0;
            
            // Update swimming state
            tentacleData.isSwimming = isMoving;
            
            // Simple but effective tentacle animation
            if (isMoving) {
                // Swimming animation - wave motion
                this.animateSwimmingTentacle(tentacle, tentacleIndex, deltaTime, movementVector, time);
            } else {
                // Idle animation - gentle floating
                this.animateIdleTentacle(tentacle, tentacleIndex, time);
            }
        });
    }
    
    animateSwimmingTentacle(tentacle, tentacleIndex, deltaTime, movementVector, time) {
        const tentacleData = tentacle.userData;
        const angle = tentacleData.baseAngle || 0;
        
        // Swimming frequency based on movement speed
        const swimSpeed = 4.0 + movementVector.length() * 3;
        const phaseOffset = tentacleIndex * (Math.PI / 4);
        const swimPhase = time * swimSpeed + phaseOffset;
        
        // Calculate movement direction relative to tentacle
        const movementAngle = Math.atan2(movementVector.x, movementVector.z);
        const tentacleRelativeAngle = angle - movementAngle;
        const isPropulsionTentacle = Math.abs(tentacleRelativeAngle) > Math.PI / 3;
        
        // Animate each segment
        tentacle.children.forEach((segment, segIndex) => {
            if (!segment.userData) return;
            
            const segmentFactor = segIndex / tentacle.children.length;
            const flexibility = 0.5 + segmentFactor * 0.5; // More flexible towards tip
            
            if (isPropulsionTentacle) {
                // Power stroke - create wave motion for propulsion
                const wavePhase = swimPhase + segIndex * 0.4;
                const amplitude = 0.8 * flexibility;
                
                const strokeIntensity = Math.sin(wavePhase);
                segment.rotation.x = Math.sin(wavePhase) * amplitude;
                segment.rotation.z = Math.cos(tentacleRelativeAngle + Math.PI) * amplitude * 0.6;
                
                // Add power snap
                if (strokeIntensity > 0.6) {
                    segment.rotation.x += (strokeIntensity - 0.6) * 2 * flexibility;
                }
            } else {
                // Steering tentacles - smoother, stabilizing motion
                const steerPhase = swimPhase * 0.8 + segIndex * 0.2;
                const amplitude = 0.4 * flexibility;
                
                segment.rotation.x = Math.sin(steerPhase) * amplitude;
                segment.rotation.z = Math.cos(tentacleRelativeAngle) * amplitude * 0.5;
            }
            
            // Add some randomness for natural look
            segment.rotation.y = Math.sin(time * 1.5 + tentacleIndex + segIndex) * 0.1 * flexibility;
        });
    }
    
    animateIdleTentacle(tentacle, tentacleIndex, time) {
        const tentacleData = tentacle.userData;
        const angle = tentacleData.baseAngle || 0;
        
        // Gentle floating motion
        tentacle.children.forEach((segment, segIndex) => {
            if (!segment.userData) return;
            
            const segmentFactor = segIndex / tentacle.children.length;
            const flexibility = 0.3 + segmentFactor * 0.4;
            
            // Natural floating undulation
            const floatPhase = time * 0.8 + tentacleIndex + segIndex * 0.3;
            const amplitude = 0.2 * flexibility;
            
            segment.rotation.x = Math.sin(floatPhase) * amplitude;
            segment.rotation.z = Math.cos(floatPhase * 0.7 + angle) * amplitude * 0.6;
            segment.rotation.y = Math.sin(time * 0.5 + tentacleIndex) * 0.05 * flexibility;
            
            // Add natural curl
            const curlAmount = tentacleData.naturalCurl || 0;
            segment.rotation.x += curlAmount * segmentFactor * 0.3;
        });
    }
    
    updateCamera(deltaTime) {
        if (!this.octopus) return;
        
        // Smooth camera following
        const targetPosition = this.octopusPosition.clone().add(this.cameraOffset);
        this.camera.position.lerp(targetPosition, 2 * deltaTime);
        
        // Look at octopus with slight mouse influence
        const lookTarget = this.octopusPosition.clone();
        lookTarget.x += this.mouse.x * 5;
        lookTarget.y += this.mouse.y * 3;
        
        this.camera.lookAt(lookTarget);
    }
    
    updateKelp(deltaTime) {
        const time = performance.now() * 0.001;
        
        this.kelp.forEach((kelpPlant, plantIndex) => {
            kelpPlant.children.forEach((segment, segIndex) => {
                const { swayOffset, swayAmount } = segment.userData;
                const wave = Math.sin(time * 0.8 + swayOffset + segIndex * 0.3) * swayAmount;
                const heightFactor = segIndex / kelpPlant.children.length;
                
                segment.rotation.x = wave * heightFactor;
                segment.rotation.z = Math.cos(time * 0.6 + swayOffset) * swayAmount * heightFactor;
            });
        });
    }
    
    updateFish(deltaTime) {
        this.fish.forEach((fish, fishIndex) => {
            if (!fish.userData.swimData) {
                // 初始化游泳数据
                fish.userData.swimData = {
                    baseSpeed: 0.01 + Math.random() * 0.005, // 大幅降低速度，仿照章鱼0.08的比例
                    currentSpeed: 0,
                    targetDirection: fish.userData.direction.clone(),
                    currentDirection: fish.userData.direction.clone(),
                    wanderAngle: Math.random() * Math.PI * 2,
                    swimPhase: Math.random() * Math.PI * 2,
                    personalityFactor: 0.5 + Math.random() * 0.5, // 0.5-1.0个性因子
                    lastDirectionChange: 0,
                    directionChangeInterval: 3000 + Math.random() * 5000 // 3-8秒改变一次方向，更慢更稳定
                };
            }
            
            const swimData = fish.userData.swimData;
            const time = performance.now();
            
            // 检查是否需要改变游泳方向
            if (time - swimData.lastDirectionChange > swimData.directionChangeInterval) {
                swimData.lastDirectionChange = time;
                swimData.directionChangeInterval = 2000 + Math.random() * 3000;
                
                // 生成新的目标方向（相对平滑的转向）
                const currentAngle = Math.atan2(swimData.currentDirection.z, swimData.currentDirection.x);
                const turnAngle = (Math.random() - 0.5) * Math.PI * 0.6; // 最大54度转向
                const newAngle = currentAngle + turnAngle;
                
                swimData.targetDirection.set(
                    Math.cos(newAngle),
                    (Math.random() - 0.5) * 0.3, // 轻微的上下游动
                    Math.sin(newAngle)
                ).normalize();
            }
            
            // 平滑插值到目标方向
            swimData.currentDirection.lerp(swimData.targetDirection, deltaTime * 0.8);
            swimData.currentDirection.normalize();
            
            // 检查与章鱼的距离
            const toOctopus = fish.position.clone().sub(this.octopusPosition);
            const distanceToOctopus = toOctopus.length();
            
            let targetSpeed = swimData.baseSpeed;
            
            if (distanceToOctopus < 8) {
                // 避开章鱼 - 平滑转向
                toOctopus.normalize();
                swimData.targetDirection.lerp(toOctopus, deltaTime * 2.0);
                targetSpeed = swimData.baseSpeed * 1.5; // 轻微加速
            }
            
            // 平滑速度变化
            swimData.currentSpeed = THREE.MathUtils.lerp(
                swimData.currentSpeed, 
                targetSpeed, 
                deltaTime * 2.0
            );
            
            // 添加自然的游泳波动
            swimData.swimPhase += deltaTime * 3.0;
            const swimOscillation = Math.sin(swimData.swimPhase) * 0.2 + 1.0;
            const finalSpeed = swimData.currentSpeed * swimOscillation * swimData.personalityFactor;
            
            // 移动鱼类
            fish.position.addScaledVector(swimData.currentDirection, finalSpeed * deltaTime * 10);
            
            // 平滑转向面对游泳方向
            const lookTarget = fish.position.clone().add(swimData.currentDirection);
            const currentLookDir = new THREE.Vector3();
            fish.getWorldDirection(currentLookDir);
            const targetLookDir = lookTarget.clone().sub(fish.position).normalize();
            
            // 使用slerp进行平滑旋转
            currentLookDir.lerp(targetLookDir, deltaTime * 3.0);
            fish.lookAt(fish.position.clone().add(currentLookDir));
            
            // 边界检查 - 平滑转向回中心
            const distanceFromCenter = fish.position.length();
            if (distanceFromCenter > 70) {
                const toCenter = fish.position.clone().negate().normalize();
                swimData.targetDirection.lerp(toCenter, deltaTime * 1.5);
            }
            
            // 自然的尾巴摆动动画
            const tail = fish.children[1];
            if (tail) {
                const swimIntensity = finalSpeed / swimData.baseSpeed;
                const tailPhase = time * 0.008 * swimIntensity + fishIndex;
                tail.rotation.y = Math.sin(tailPhase) * 0.4 * swimIntensity;
            }
            
            // 更新原始方向数据以保持兼容性
            fish.userData.direction.copy(swimData.currentDirection);
            fish.userData.speed = finalSpeed;
        });
    }
    
    // South African Marine Life Creation
    createCapeFurSeals() {
        const sealCount = 3; // Seals are large, so fewer
        
        for (let i = 0; i < sealCount; i++) {
            const seal = this.createSingleCapeFurSeal();
            
            // Position seals in mid-water column
            seal.position.set(
                (Math.random() - 0.5) * 120,
                Math.random() * 15 - 5, // Mid-water
                (Math.random() - 0.5) * 120
            );
            
            seal.userData.direction = new THREE.Vector3(
                Math.random() - 0.5,
                (Math.random() - 0.5) * 0.2,
                Math.random() - 0.5
            ).normalize();
            
            seal.userData.speed = 0.015 + Math.random() * 0.005; // 极大降低海豹速度，仿照章鱼慢速
            seal.userData.agility = 0.02;
            seal.userData.breathTimer = Math.random() * 20; // Surface breathing
            seal.userData.playfulTimer = Math.random() * 10; // Playful behavior
            
            this.capeFurSeals.push(seal);
            this.scene.add(seal);
        }
    }
    
    createSingleCapeFurSeal() {
        const group = new THREE.Group();
        
        // 更逼真的身体 - 流线型设计
        const bodyGeometry = new THREE.SphereGeometry(1, 16, 12);
        bodyGeometry.scale(2.8, 1.1, 1.3); // 更长更流线型
        
        // 身体渐变色彩 - 背部深色，腹部浅色
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0x5d4037, // 温暖的棕色
            shininess: 80,
            specular: 0x333333
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        group.add(body);
        
        // 腹部浅色区域
        const bellyGeometry = new THREE.SphereGeometry(0.85, 12, 8);
        bellyGeometry.scale(2.5, 0.8, 1.1);
        const bellyMaterial = new THREE.MeshPhongMaterial({
            color: 0x8d6e63, // 浅棕色腹部
            shininess: 90
        });
        const belly = new THREE.Mesh(bellyGeometry, bellyMaterial);
        belly.position.set(0, -0.3, 0);
        group.add(belly);
        
        // 更逼真的头部
        const headGeometry = new THREE.SphereGeometry(0.9, 16, 12);
        headGeometry.scale(1.3, 1.1, 1.2);
        const headMaterial = new THREE.MeshPhongMaterial({
            color: 0x6d4c41, // 头部颜色
            shininess: 70
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(2.4, 0.3, 0);
        head.castShadow = true;
        group.add(head);
        
        // 大眼睛 - 儿童友好
        const eyeGeometry = new THREE.SphereGeometry(0.15, 12, 8);
        const eyeMaterial = new THREE.MeshPhongMaterial({
            color: 0x000000,
            shininess: 100
        });
        
        const eyeL = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eyeL.position.set(2.8, 0.5, 0.3);
        group.add(eyeL);
        
        const eyeR = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eyeR.position.set(2.8, 0.5, -0.3);
        group.add(eyeR);
        
        // 可爱的鼻子
        const noseGeometry = new THREE.SphereGeometry(0.08, 8, 6);
        const noseMaterial = new THREE.MeshPhongMaterial({
            color: 0x2e2e2e,
            shininess: 50
        });
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.set(3.1, 0.3, 0);
        group.add(nose);
        
        // 胡须
        const whiskerMaterial = new THREE.MeshPhongMaterial({
            color: 0x424242,
            transparent: true,
            opacity: 0.8
        });
        
        for (let i = 0; i < 6; i++) {
            const whiskerGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.5, 4);
            const whisker = new THREE.Mesh(whiskerGeometry, whiskerMaterial);
            const side = i < 3 ? 1 : -1;
            const height = 0.2 + (i % 3) * 0.1;
            whisker.position.set(3, height, side * 0.2);
            whisker.rotation.z = side * Math.PI / 6;
            whisker.rotation.y = side * Math.PI / 8;
            group.add(whisker);
        }
        
        // 更逼真的前鳍 - 椭圆形
        const frontFlipperGeometry = new THREE.SphereGeometry(0.6, 10, 8);
        frontFlipperGeometry.scale(2.2, 0.25, 1.1);
        const flipperMaterial = new THREE.MeshPhongMaterial({
            color: 0x4a4a4a, // 深色鳍
            shininess: 60
        });
        
        const frontFlipperL = new THREE.Mesh(frontFlipperGeometry, flipperMaterial);
        frontFlipperL.position.set(0.3, -0.2, 1.4);
        frontFlipperL.rotation.z = Math.PI / 8;
        frontFlipperL.rotation.y = Math.PI / 12;
        group.add(frontFlipperL);
        
        const frontFlipperR = new THREE.Mesh(frontFlipperGeometry.clone(), flipperMaterial);
        frontFlipperR.position.set(0.3, -0.2, -1.4);
        frontFlipperR.rotation.z = -Math.PI / 8;
        frontFlipperR.rotation.y = -Math.PI / 12;
        group.add(frontFlipperR);
        
        // 后鳍 - 更像真实的尾鳍
        const backFlipperGeometry = new THREE.SphereGeometry(0.5, 8, 6);
        backFlipperGeometry.scale(1.8, 0.2, 1);
        
        const backFlipperL = new THREE.Mesh(backFlipperGeometry, flipperMaterial);
        backFlipperL.position.set(-2.2, 0, 0.6);
        backFlipperL.rotation.y = Math.PI / 5;
        group.add(backFlipperL);
        
        const backFlipperR = new THREE.Mesh(backFlipperGeometry.clone(), flipperMaterial);
        backFlipperR.position.set(-2.2, 0, -0.6);
        backFlipperR.rotation.y = -Math.PI / 5;
        group.add(backFlipperR);
        
        // 背鳍
        const dorsalFinGeometry = new THREE.ConeGeometry(0.3, 0.6, 6);
        const dorsalFinMaterial = new THREE.MeshPhongMaterial({
            color: 0x5d4037,
            shininess: 50
        });
        const dorsalFin = new THREE.Mesh(dorsalFinGeometry, dorsalFinMaterial);
        dorsalFin.position.set(0, 1.2, 0);
        dorsalFin.rotation.x = Math.PI;
        group.add(dorsalFin);
        
        // 存储鳍的引用用于动画
        group.userData.flippers = {
            frontL: frontFlipperL,
            frontR: frontFlipperR,
            backL: backFlipperL,
            backR: backFlipperR
        };
        
        // 教育标签数据
        group.userData.species = {
            name: "南非海狗",
            englishName: "Cape Fur Seal",
            photo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMDA0NDY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmaWxsPSIjODdDRUVCIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPkNhcGUgRnVyIFNlYWw8L3RleHQ+CjxjaXJjbGUgY3g9IjE1MCIgY3k9IjEyMCIgcj0iMjAiIGZpbGw9IiM2NjVBNDgiLz4KPC9zdmc+",
            facts: [
                "体长可达2.5米 / Body length up to 2.5 meters",
                "擅长游泳和潜水 / Excellent swimmers and divers", 
                "群居动物 / Social animals living in colonies",
                "以鱼类为食 / Feed primarily on fish",
                "寿命可达25年 / Lifespan up to 25 years"
            ]
        };
        
        return group;
    }
    
    createAfricanPenguins() {
        const penguinCount = 5;
        
        for (let i = 0; i < penguinCount; i++) {
            const penguin = this.createSingleAfricanPenguin();
            
            // Penguins dive deep and surface frequently
            penguin.position.set(
                (Math.random() - 0.5) * 100,
                Math.random() * 25 - 5, // Various depths
                (Math.random() - 0.5) * 100
            );
            
            penguin.userData.direction = new THREE.Vector3(
                Math.random() - 0.5,
                (Math.random() - 0.5) * 0.4, // More vertical movement
                Math.random() - 0.5
            ).normalize();
            
            penguin.userData.speed = 0.02 + Math.random() * 0.01; // 极大降低企鹅速度，仿照章鱼慢速
            penguin.userData.diveTimer = Math.random() * 15;
            penguin.userData.agility = 0.03;
            
            this.africanPenguins.push(penguin);
            this.scene.add(penguin);
        }
    }
    
    createSingleAfricanPenguin() {
        const group = new THREE.Group();
        
        // 更逼真的身体 - 梭形流线型
        const bodyGeometry = new THREE.SphereGeometry(0.7, 16, 12);
        bodyGeometry.scale(1.6, 1.4, 1.1);
        
        // 黑色背部
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0x1a1a1a, // 深黑色
            shininess: 90,
            specular: 0x444444
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        group.add(body);
        
        // 白色腹部 - 更大更明显
        const bellyGeometry = new THREE.SphereGeometry(0.6, 12, 10);
        bellyGeometry.scale(1.3, 1.2, 0.9);
        const bellyMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff, // 纯白色
            shininess: 100,
            specular: 0x222222
        });
        const belly = new THREE.Mesh(bellyGeometry, bellyMaterial);
        belly.position.set(0.3, -0.1, 0);
        group.add(belly);
        
        // 头部 - 圆润可爱
        const headGeometry = new THREE.SphereGeometry(0.45, 16, 12);
        headGeometry.scale(1.2, 1.1, 1.1);
        const headMaterial = new THREE.MeshPhongMaterial({
            color: 0x0d0d0d, // 头部黑色
            shininess: 85
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(1.1, 0.4, 0);
        head.castShadow = true;
        group.add(head);
        
        // 白色面部区域
        const faceGeometry = new THREE.SphereGeometry(0.35, 10, 8);
        faceGeometry.scale(0.8, 0.9, 0.8);
        const faceMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            shininess: 95
        });
        const face = new THREE.Mesh(faceGeometry, faceMaterial);
        face.position.set(1.3, 0.3, 0);
        group.add(face);
        
        // 大眼睛 - 儿童友好设计
        const eyeGeometry = new THREE.SphereGeometry(0.12, 12, 8);
        const eyeWhiteMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            shininess: 100
        });
        
        const eyeL = new THREE.Mesh(eyeGeometry, eyeWhiteMaterial);
        eyeL.position.set(1.45, 0.45, 0.2);
        group.add(eyeL);
        
        const eyeR = new THREE.Mesh(eyeGeometry, eyeWhiteMaterial);
        eyeR.position.set(1.45, 0.45, -0.2);
        group.add(eyeR);
        
        // 黑色瞳孔
        const pupilGeometry = new THREE.SphereGeometry(0.06, 8, 6);
        const pupilMaterial = new THREE.MeshPhongMaterial({
            color: 0x000000,
            shininess: 120
        });
        
        const pupilL = new THREE.Mesh(pupilGeometry, pupilMaterial);
        pupilL.position.set(1.52, 0.48, 0.2);
        group.add(pupilL);
        
        const pupilR = new THREE.Mesh(pupilGeometry, pupilMaterial);
        pupilR.position.set(1.52, 0.48, -0.2);
        group.add(pupilR);
        
        // 橙色喙 - 非洲企鹅特征
        const beakGeometry = new THREE.ConeGeometry(0.08, 0.35, 6);
        const beakMaterial = new THREE.MeshPhongMaterial({
            color: 0xff8c00, // 橙色喙
            shininess: 70
        });
        const beak = new THREE.Mesh(beakGeometry, beakMaterial);
        beak.position.set(1.6, 0.35, 0);
        beak.rotation.z = Math.PI / 2;
        group.add(beak);
        
        // 非洲企鹅特有的黑色带纹
        const bandGeometry = new THREE.TorusGeometry(0.8, 0.08, 6, 16);
        const bandMaterial = new THREE.MeshPhongMaterial({
            color: 0x000000,
            shininess: 80
        });
        const band = new THREE.Mesh(bandGeometry, bandMaterial);
        band.position.set(0.2, 0.1, 0);
        band.rotation.y = Math.PI / 2;
        band.scale.set(1, 0.6, 1);
        group.add(band);
        
        // 翅膀/鳍状肢 - 更逼真的形状
        const flipperGeometry = new THREE.SphereGeometry(0.45, 12, 8);
        flipperGeometry.scale(2.2, 0.3, 1);
        const flipperMaterial = new THREE.MeshPhongMaterial({
            color: 0x0d0d0d, // 黑色翅膀
            shininess: 85
        });
        
        const flipperL = new THREE.Mesh(flipperGeometry, flipperMaterial);
        flipperL.position.set(0.1, 0.1, 1);
        flipperL.rotation.y = Math.PI / 10;
        flipperL.rotation.z = Math.PI / 12;
        group.add(flipperL);
        
        const flipperR = new THREE.Mesh(flipperGeometry.clone(), flipperMaterial);
        flipperR.position.set(0.1, 0.1, -1);
        flipperR.rotation.y = -Math.PI / 10;
        flipperR.rotation.z = -Math.PI / 12;
        group.add(flipperR);
        
        // 翅膀边缘的白色条纹
        const stripeGeometry = new THREE.SphereGeometry(0.4, 8, 6);
        stripeGeometry.scale(1.8, 0.1, 0.8);
        const stripeMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            shininess: 90
        });
        
        const stripeL = new THREE.Mesh(stripeGeometry, stripeMaterial);
        stripeL.position.set(0.1, 0.05, 1);
        stripeL.rotation.y = Math.PI / 10;
        group.add(stripeL);
        
        const stripeR = new THREE.Mesh(stripeGeometry.clone(), stripeMaterial);
        stripeR.position.set(0.1, 0.05, -1);
        stripeR.rotation.y = -Math.PI / 10;
        group.add(stripeR);
        
        // 橙色脚蹼
        const feetGeometry = new THREE.SphereGeometry(0.15, 8, 6);
        feetGeometry.scale(1.2, 0.3, 1.5);
        const feetMaterial = new THREE.MeshPhongMaterial({
            color: 0xff8c00, // 橙色脚
            shininess: 60
        });
        
        const footL = new THREE.Mesh(feetGeometry, feetMaterial);
        footL.position.set(0.8, -1, 0.3);
        group.add(footL);
        
        const footR = new THREE.Mesh(feetGeometry.clone(), feetMaterial);
        footR.position.set(0.8, -1, -0.3);
        group.add(footR);
        
        // 存储翅膀引用
        group.userData.flippers = { left: flipperL, right: flipperR };
        
        // 教育标签数据
        group.userData.species = {
            name: "非洲企鹅",
            englishName: "African Penguin",
            photo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMDA0NDY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iOTAiIGZpbGw9IiM4N0NFRUIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCI+QWZyaWNhbiBQZW5ndWluPC90ZXh0Pgo8ZWxsaXBzZSBjeD0iMTUwIiBjeT0iMTMwIiByeD0iMjUiIHJ5PSIzNSIgZmlsbD0iIzMzMzMzMyIvPgo8ZWxsaXBzZSBjeD0iMTUwIiBjeT0iMTM1IiByeD0iMTUiIHJ5PSIyNSIgZmlsbD0iI0ZGRkZGRiIvPgo8Y2lyY2xlIGN4PSIxNDUiIGN5PSIxMjAiIHI9IjMiIGZpbGw9IiMwMDAwMDAiLz4KPGJ1cmNsZSBjeD0iMTU1IiBjeT0iMTIwIiByPSIzIiBmaWxsPSIjMDAwMDAwIi8+CjxyZWN0IHg9IjE0NyIgeT0iMTI1IiB3aWR0aD0iNiIgaGVpZ2h0PSI0IiBmaWxsPSIjRkY4QzAwIi8+Cjwvc3ZnPgo=",
            facts: [
                "又称斑嘴环企鹅 / Also known as Black-footed Penguin",
                "游泳速度可达20公里/小时 / Swimming speed up to 20 km/h",
                "能潜水到130米深 / Can dive to depths of 130 meters",
                "以小鱼和乌贼为食 / Feed on small fish and squid",
                "濒危物种，需要保护 / Endangered species requiring protection"
            ]
        };
        
        return group;
    }
    
    createGreatWhiteSharks() {
        const sharkCount = 1; // Rare but dramatic
        
        for (let i = 0; i < sharkCount; i++) {
            const shark = this.createSingleGreatWhiteShark();
            
            // Sharks patrol the outer edges
            const angle = Math.random() * Math.PI * 2;
            const distance = 60 + Math.random() * 40;
            
            shark.position.set(
                Math.cos(angle) * distance,
                Math.random() * 10 - 15, // Deeper water
                Math.sin(angle) * distance
            );
            
            shark.userData.direction = new THREE.Vector3(
                Math.random() - 0.5,
                (Math.random() - 0.5) * 0.1,
                Math.random() - 0.5
            ).normalize();
            
            shark.userData.speed = 0.015 + Math.random() * 0.005; // 极大降低鲨鱼速度，仿照章鱼慢速
            shark.userData.huntingMode = false;
            shark.userData.agility = 0.01;
            shark.userData.patrolRadius = distance;
            shark.userData.patrolCenter = new THREE.Vector3(0, -10, 0);
            
            this.greatWhiteSharks.push(shark);
            this.scene.add(shark);
        }
    }
    
    createSingleGreatWhiteShark() {
        const group = new THREE.Group();
        
        // 更逼真的鲨鱼身体 - 完美流线型
        const bodyGeometry = new THREE.SphereGeometry(1.3, 20, 16);
        bodyGeometry.scale(4.5, 1.3, 1.6); // 完美的鲨鱼比例
        
        // 背部深色
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0x4a5568, // 深蓝灰色背部
            shininess: 85,
            specular: 0x666666
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        group.add(body);
        
        // 白色腹部 - 鲨鱼特有的腹部着色
        const bellyGeometry = new THREE.SphereGeometry(1.1, 16, 12);
        bellyGeometry.scale(4.2, 1, 1.4);
        const bellyMaterial = new THREE.MeshPhongMaterial({
            color: 0xf7fafc, // 白色腹部
            shininess: 90
        });
        const belly = new THREE.Mesh(bellyGeometry, bellyMaterial);
        belly.position.set(0, -0.4, 0);
        group.add(belly);
        
        // 更逼真的头部/鼻部
        const headGeometry = new THREE.SphereGeometry(0.9, 16, 12);
        headGeometry.scale(1.8, 1.1, 1.3);
        const headMaterial = new THREE.MeshPhongMaterial({
            color: 0x2d3748, // 深色头部
            shininess: 80
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(4.8, 0.2, 0);
        head.castShadow = true;
        group.add(head);
        
        // 鲨鱼眼睛 - 深色但不凶恶
        const eyeGeometry = new THREE.SphereGeometry(0.2, 12, 8);
        const eyeMaterial = new THREE.MeshPhongMaterial({
            color: 0x1a202c, // 深色眼睛
            shininess: 100
        });
        
        const eyeL = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eyeL.position.set(5.5, 0.6, 0.5);
        group.add(eyeL);
        
        const eyeR = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eyeR.position.set(5.5, 0.6, -0.5);
        group.add(eyeR);
        
        // 鼻部
        const snoutGeometry = new THREE.ConeGeometry(0.6, 1.5, 12);
        const snoutMaterial = new THREE.MeshPhongMaterial({
            color: 0x4a5568,
            shininess: 75
        });
        const snout = new THREE.Mesh(snoutGeometry, snoutMaterial);
        snout.position.set(6.2, 0, 0);
        snout.rotation.z = -Math.PI / 2;
        group.add(snout);
        
        // 经典的背鳍 - 三角形
        const dorsalGeometry = new THREE.ConeGeometry(1, 2.5, 8);
        const finMaterial = new THREE.MeshPhongMaterial({
            color: 0x2d3748, // 深色鳍
            shininess: 70
        });
        const dorsalFin = new THREE.Mesh(dorsalGeometry, finMaterial);
        dorsalFin.position.set(0.5, 2.2, 0);
        dorsalFin.rotation.x = Math.PI;
        dorsalFin.rotation.z = -Math.PI / 24; // 轻微向后倾斜
        group.add(dorsalFin);
        
        // 第二背鳍（小一些）
        const secondDorsalGeometry = new THREE.ConeGeometry(0.5, 1.2, 6);
        const secondDorsal = new THREE.Mesh(secondDorsalGeometry, finMaterial);
        secondDorsal.position.set(-2.5, 1.5, 0);
        secondDorsal.rotation.x = Math.PI;
        group.add(secondDorsal);
        
        // 尾鳍 - 不对称设计（上叶更大）
        const tailUpperGeometry = new THREE.ConeGeometry(1.5, 3.5, 8);
        const tailUpper = new THREE.Mesh(tailUpperGeometry, finMaterial);
        tailUpper.position.set(-5.8, 1, 0);
        tailUpper.rotation.z = Math.PI / 2;
        tailUpper.rotation.x = Math.PI / 8;
        group.add(tailUpper);
        
        const tailLowerGeometry = new THREE.ConeGeometry(0.8, 2, 6);
        const tailLower = new THREE.Mesh(tailLowerGeometry, finMaterial);
        tailLower.position.set(-5.5, -0.8, 0);
        tailLower.rotation.z = Math.PI / 2;
        tailLower.rotation.x = -Math.PI / 12;
        group.add(tailLower);
        
        // 胸鳍 - 长而尖的三角形
        const pectoralGeometry = new THREE.ConeGeometry(0.8, 2.5, 8);
        
        const pectoralL = new THREE.Mesh(pectoralGeometry, finMaterial);
        pectoralL.position.set(1.5, -0.3, 2.2);
        pectoralL.rotation.z = Math.PI / 2.5;
        pectoralL.rotation.y = Math.PI / 6;
        pectoralL.rotation.x = -Math.PI / 12;
        group.add(pectoralL);
        
        const pectoralR = new THREE.Mesh(pectoralGeometry.clone(), finMaterial);
        pectoralR.position.set(1.5, -0.3, -2.2);
        pectoralR.rotation.z = -Math.PI / 2.5;
        pectoralR.rotation.y = -Math.PI / 6;
        pectoralR.rotation.x = -Math.PI / 12;
        group.add(pectoralR);
        
        // 腹鳍
        const ventralGeometry = new THREE.ConeGeometry(0.4, 1, 6);
        
        const ventralL = new THREE.Mesh(ventralGeometry, finMaterial);
        ventralL.position.set(-0.5, -1.2, 0.8);
        ventralL.rotation.x = Math.PI;
        ventralL.rotation.z = Math.PI / 8;
        group.add(ventralL);
        
        const ventralR = new THREE.Mesh(ventralGeometry.clone(), finMaterial);
        ventralR.position.set(-0.5, -1.2, -0.8);
        ventralR.rotation.x = Math.PI;
        ventralR.rotation.z = -Math.PI / 8;
        group.add(ventralR);
        
        // 臀鳍
        const analFin = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.8, 6), finMaterial);
        analFin.position.set(-2.8, -1.1, 0);
        analFin.rotation.x = Math.PI;
        group.add(analFin);
        
        // 鳃裂 - 鲨鱼特征
        const gillMaterial = new THREE.MeshPhongMaterial({
            color: 0x1a202c,
            transparent: true,
            opacity: 0.7
        });
        
        for (let i = 0; i < 5; i++) {
            const gillGeometry = new THREE.PlaneGeometry(0.3, 0.8);
            const gill = new THREE.Mesh(gillGeometry, gillMaterial);
            gill.position.set(2.5 - i * 0.3, 0.3, 1.4);
            gill.rotation.y = Math.PI / 2;
            gill.rotation.z = Math.PI / 12;
            group.add(gill);
            
            // 另一侧的鳃
            const gillR = gill.clone();
            gillR.position.z = -1.4;
            gillR.rotation.y = -Math.PI / 2;
            group.add(gillR);
        }
        
        // 存储鳍的引用用于动画
        group.userData.fins = {
            tail: tailUpper,
            tailLower: tailLower,
            pectoralL: pectoralL,
            pectoralR: pectoralR,
            dorsal: dorsalFin
        };
        
        // 教育标签数据
        group.userData.species = {
            name: "大白鲨",
            englishName: "Great White Shark",
            photo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMDA0NDY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMzAiIGZpbGw9IiM4N0NFRUIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCI+R3JlYXQgV2hpdGUgU2hhcms8L3RleHQ+CjxlbGxpcHNlIGN4PSIxNTAiIGN5PSIxMDAiIHJ4PSI4MCIgcnk9IjMwIiBmaWxsPSIjNzc3Nzc3Ii8+CjxlbGxpcHNlIGN4PSIxNTAiIGN5PSIxMTAiIHJ4PSI2MCIgcnk9IjIwIiBmaWxsPSIjRkZGRkZGIi8+Cjx0cmlhbmdsZSBjeD0iMjMwIiBjeT0iMTAwIiByPSIyMCIgZmlsbD0iIzc3Nzc3NyIvPgo8Y2lyY2xlIGN4PSIxMzAiIGN5PSI5MCIgcj0iNSIgZmlsbD0iIzAwMDAwMCIvPgo8cGF0aCBkPSJNMTIwIDEwNSBMMTgwIDEwNSBMMTgwIDExNSBMMTIwIDExNSBaIiBmaWxsPSIjMzMzMzMzIi8+Cjwvc3ZnPgo=",
            facts: [
                "海洋顶级掠食者 / Top ocean predator",
                "体长可达6米 / Body length up to 6 meters",
                "拥有300颗牙齿 / Has about 300 teeth",
                "游泳速度可达56公里/小时 / Swimming speed up to 56 km/h",
                "对海洋生态平衡很重要 / Important for marine ecosystem balance",
                "实际上很少攻击人类 / Actually rarely attacks humans"
            ]
        };
        
        return group;
    }
    
    createCapeReefFish() {
        const fishTypes = [
            { 
                name: '黄尾鱼', 
                englishName: 'Yellowtail', 
                primaryColor: 0xFFD700, 
                secondaryColor: 0xFFA500,
                stripColor: 0xFF8C00,
                size: 0.8,
                pattern: 'stripes'
            },
            { 
                name: '罗马鱼', 
                englishName: 'Roman', 
                primaryColor: 0xFF6347, 
                secondaryColor: 0xFFB6C1,
                stripColor: 0x8B0000,
                size: 0.6,
                pattern: 'spots'
            },
            { 
                name: '霍顿托鱼', 
                englishName: 'Hottentot', 
                primaryColor: 0x4169E1, 
                secondaryColor: 0x87CEEB,
                stripColor: 0x000080,
                size: 0.5,
                pattern: 'bands'
            },
            { 
                name: '石头鱼', 
                englishName: 'Steentjie', 
                primaryColor: 0x32CD32, 
                secondaryColor: 0x98FB98,
                stripColor: 0x006400,
                size: 0.4,
                pattern: 'gradient'
            },
            {
                name: '天使鱼',
                englishName: 'Angelfish',
                primaryColor: 0xFF69B4,
                secondaryColor: 0xFFB6C1,
                stripColor: 0x8B008B,
                size: 0.7,
                pattern: 'stripes'
            },
            {
                name: '蝴蝶鱼',
                englishName: 'Butterflyfish',
                primaryColor: 0xFFFF00,
                secondaryColor: 0xFFFFE0,
                stripColor: 0x000000,
                size: 0.5,
                pattern: 'eyespot'
            }
        ];
        
        const totalFish = 25;
        
        for (let i = 0; i < totalFish; i++) {
            const fishType = fishTypes[Math.floor(Math.random() * fishTypes.length)];
            const fish = this.createSingleCapeReefFish(fishType);
            
            // Create schools near kelp
            const kelpPosition = this.kelp.length > 0 ? 
                this.kelp[Math.floor(Math.random() * this.kelp.length)].position :
                new THREE.Vector3(0, -10, 0);
                
            fish.position.set(
                kelpPosition.x + (Math.random() - 0.5) * 20,
                kelpPosition.y + Math.random() * 15,
                kelpPosition.z + (Math.random() - 0.5) * 20
            );
            
            fish.userData.direction = new THREE.Vector3(
                Math.random() - 0.5,
                (Math.random() - 0.5) * 0.3,
                Math.random() - 0.5
            ).normalize();
            
            fish.userData.speed = 0.02 + Math.random() * 0.03; // 大幅降低珊瑚鱼速度
            fish.userData.schoolCenter = kelpPosition.clone();
            fish.userData.agility = 0.04;
            fish.userData.type = fishType.name;
            
            this.capeReefFish.push(fish);
            this.scene.add(fish);
        }
    }
    
    createSingleCapeReefFish(fishType) {
        const group = new THREE.Group();
        const size = fishType.size;
        
        // 更逼真的鱼身 - 根据鱼类调整形状
        let bodyGeometry;
        if (fishType.pattern === 'eyespot') {
            // 蝴蝶鱼 - 更高更圆
            bodyGeometry = new THREE.SphereGeometry(size, 12, 10);
            bodyGeometry.scale(1.2, 1.4, 1);
        } else if (fishType.englishName === 'Angelfish') {
            // 天使鱼 - 三角形身体
            bodyGeometry = new THREE.SphereGeometry(size, 12, 10);
            bodyGeometry.scale(1.3, 1.6, 0.8);
        } else {
            // 标准鱼形
            bodyGeometry = new THREE.SphereGeometry(size, 12, 10);
            bodyGeometry.scale(1.6, 1.1, 1);
        }
        
        // 主体颜色
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: fishType.primaryColor,
            shininess: 90,
            specular: 0x444444
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        group.add(body);
        
        // 添加图案
        this.addFishPattern(group, fishType, size);
        
        // 更逼真的尾鳍
        let tailGeometry;
        if (fishType.englishName === 'Angelfish') {
            // 天使鱼的扇形尾鳍
            tailGeometry = new THREE.ConeGeometry(size * 0.6, size * 1.2, 8);
        } else {
            // 标准叉形尾鳍
            tailGeometry = new THREE.ConeGeometry(size * 0.5, size * 1, 6);
        }
        
        const tailMaterial = new THREE.MeshPhongMaterial({
            color: fishType.secondaryColor,
            shininess: 85,
            transparent: true,
            opacity: 0.9
        });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.set(-size * 1.8, 0, 0);
        tail.rotation.z = Math.PI / 2;
        group.add(tail);
        
        // 背鳍
        const dorsalGeometry = new THREE.ConeGeometry(size * 0.3, size * 1, 6);
        const dorsalMaterial = new THREE.MeshPhongMaterial({
            color: fishType.stripColor,
            shininess: 70,
            transparent: true,
            opacity: 0.8
        });
        const dorsalFin = new THREE.Mesh(dorsalGeometry, dorsalMaterial);
        dorsalFin.position.set(0, size * 1.1, 0);
        dorsalFin.rotation.x = Math.PI;
        group.add(dorsalFin);
        
        // 腹鳍
        const ventralFin = new THREE.Mesh(
            new THREE.ConeGeometry(size * 0.2, size * 0.6, 5), 
            dorsalMaterial
        );
        ventralFin.position.set(0, -size * 0.8, 0);
        ventralFin.rotation.x = Math.PI;
        group.add(ventralFin);
        
        // 胸鳍
        const pectoralGeometry = new THREE.ConeGeometry(size * 0.25, size * 0.7, 5);
        const pectoralMaterial = new THREE.MeshPhongMaterial({
            color: fishType.secondaryColor,
            shininess: 80,
            transparent: true,
            opacity: 0.7
        });
        
        const pectoralL = new THREE.Mesh(pectoralGeometry, pectoralMaterial);
        pectoralL.position.set(size * 0.3, 0, size * 0.8);
        pectoralL.rotation.z = Math.PI / 3;
        pectoralL.rotation.y = Math.PI / 6;
        group.add(pectoralL);
        
        const pectoralR = new THREE.Mesh(pectoralGeometry.clone(), pectoralMaterial);
        pectoralR.position.set(size * 0.3, 0, -size * 0.8);
        pectoralR.rotation.z = -Math.PI / 3;
        pectoralR.rotation.y = -Math.PI / 6;
        group.add(pectoralR);
        
        // 大眼睛 - 儿童友好
        const eyeGeometry = new THREE.SphereGeometry(size * 0.2, 12, 8);
        const eyeWhiteMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            shininess: 100
        });
        
        const eyeL = new THREE.Mesh(eyeGeometry, eyeWhiteMaterial);
        eyeL.position.set(size * 0.9, size * 0.4, size * 0.5);
        group.add(eyeL);
        
        const eyeR = new THREE.Mesh(eyeGeometry, eyeWhiteMaterial);
        eyeR.position.set(size * 0.9, size * 0.4, -size * 0.5);
        group.add(eyeR);
        
        // 瞳孔
        const pupilGeometry = new THREE.SphereGeometry(size * 0.1, 8, 6);
        const pupilMaterial = new THREE.MeshPhongMaterial({
            color: 0x000000,
            shininess: 120
        });
        
        const pupilL = new THREE.Mesh(pupilGeometry, pupilMaterial);
        pupilL.position.set(size * 0.98, size * 0.45, size * 0.5);
        group.add(pupilL);
        
        const pupilR = new THREE.Mesh(pupilGeometry, pupilMaterial);
        pupilR.position.set(size * 0.98, size * 0.45, -size * 0.5);
        group.add(pupilR);
        
        // 嘴部
        const mouthGeometry = new THREE.SphereGeometry(size * 0.08, 6, 4);
        const mouthMaterial = new THREE.MeshPhongMaterial({
            color: 0x333333,
            shininess: 60
        });
        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouth.position.set(size * 1.1, size * 0.1, 0);
        mouth.scale.set(1, 0.5, 1);
        group.add(mouth);
        
        // 存储引用
        group.userData.tail = tail;
        group.userData.species = {
            name: fishType.name,
            englishName: fishType.englishName,
            photo: this.getFishPhoto(fishType.englishName),
            facts: this.getFishFacts(fishType.englishName)
        };
        
        return group;
    }
    
    addFishPattern(group, fishType, size) {
        const patternMaterial = new THREE.MeshPhongMaterial({
            color: fishType.stripColor,
            shininess: 80,
            transparent: true,
            opacity: 0.6
        });
        
        switch(fishType.pattern) {
            case 'stripes':
                // 垂直条纹
                for (let i = 0; i < 4; i++) {
                    const stripeGeometry = new THREE.PlaneGeometry(size * 0.1, size * 1.5);
                    const stripe = new THREE.Mesh(stripeGeometry, patternMaterial);
                    stripe.position.set(size * (0.8 - i * 0.4), 0, size * 1.01);
                    group.add(stripe);
                }
                break;
                
            case 'spots':
                // 圆点图案
                for (let i = 0; i < 6; i++) {
                    const spotGeometry = new THREE.SphereGeometry(size * 0.15, 8, 6);
                    const spot = new THREE.Mesh(spotGeometry, patternMaterial);
                    const angle = (i / 6) * Math.PI * 2;
                    spot.position.set(
                        size * 0.3,
                        Math.sin(angle) * size * 0.6,
                        Math.cos(angle) * size * 0.8
                    );
                    spot.scale.set(1, 1, 0.1);
                    group.add(spot);
                }
                break;
                
            case 'bands':
                // 水平带纹
                for (let i = 0; i < 3; i++) {
                    const bandGeometry = new THREE.TorusGeometry(size * 0.8, size * 0.08, 6, 16);
                    const band = new THREE.Mesh(bandGeometry, patternMaterial);
                    band.position.set(size * (0.5 - i * 0.3), 0, 0);
                    band.rotation.y = Math.PI / 2;
                    group.add(band);
                }
                break;
                
            case 'eyespot':
                // 眼斑（蝴蝶鱼特征）
                const eyespotGeometry = new THREE.SphereGeometry(size * 0.3, 12, 8);
                const eyespotMaterial = new THREE.MeshPhongMaterial({
                    color: 0x000000,
                    shininess: 70
                });
                const eyespot = new THREE.Mesh(eyespotGeometry, eyespotMaterial);
                eyespot.position.set(-size * 0.5, size * 0.3, size * 0.95);
                eyespot.scale.set(1, 1, 0.1);
                group.add(eyespot);
                
                // 眼斑中心的白点
                const centerDot = new THREE.Mesh(
                    new THREE.SphereGeometry(size * 0.1, 8, 6),
                    new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 100 })
                );
                centerDot.position.copy(eyespot.position);
                centerDot.position.z += size * 0.05;
                centerDot.scale.set(1, 1, 0.1);
                group.add(centerDot);
                break;
        }
    }
    
    getFishFacts(englishName) {
        const facts = {
            'Yellowtail': [
                "游泳速度很快 / Fast swimmers",
                "群体觅食 / Group feeding behavior",
                "肉食性鱼类 / Carnivorous fish",
                "可长到1米长 / Can grow up to 1 meter"
            ],
            'Roman': [
                "色彩鲜艳 / Brightly colored",
                "珊瑚礁栖居者 / Coral reef inhabitants",
                "杂食性 / Omnivorous diet",
                "性格温和 / Peaceful temperament"
            ],
            'Hottentot': [
                "蓝色条纹美丽 / Beautiful blue stripes",
                "岩礁区常见 / Common in rocky reefs",
                "以小型甲壳动物为食 / Feeds on small crustaceans",
                "南非特有种 / Endemic to South Africa"
            ],
            'Steentjie': [
                "绿色保护色 / Green camouflage coloring",
                "藏身岩石间 / Hides among rocks",
                "以藻类为食 / Feeds on algae",
                "小型底栖鱼类 / Small bottom-dwelling fish"
            ],
            'Angelfish': [
                "身体扁平如天使 / Flat body like an angel",
                "色彩绚丽 / Brilliant colors",
                "珊瑚礁清洁工 / Coral reef cleaners",
                "一夫一妻制 / Monogamous mating"
            ],
            'Butterflyfish': [
                "眼斑用来迷惑天敌 / Eye spots confuse predators",
                "长长的嘴适合觅食 / Long snout perfect for feeding",
                "珊瑚虫专食者 / Specialized coral feeders",
                "成对游泳 / Swim in pairs"
            ]
        };
        
        return facts[englishName] || ["美丽的珊瑚礁鱼类 / Beautiful coral reef fish"];
    }
    
    getFishPhoto(englishName) {
        const photos = {
            'Yellowtail': "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMDA0NDY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMzAiIGZpbGw9IiM4N0NFRUIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiI+WWVsbG93dGFpbCBGaXNoPC90ZXh0Pgo8ZWxsaXBzZSBjeD0iMTUwIiBjeT0iMTAwIiByeD0iNjAiIHJ5PSIyNSIgZmlsbD0iI0ZGRDcwMCIvPgo8cGF0aCBkPSJNMjEwIDEwMCBMMjQwIDgwIEwyNDAgMTIwIFoiIGZpbGw9IiNGRkQ3MDAiLz4KPGJ1cmNsZSBjeD0iMTMwIiBjeT0iOTAiIHI9IjMiIGZpbGw9IiMwMDAwMDAiLz4KPC9zdmc+",
            'Roman': "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMDA0NDY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMzAiIGZpbGw9IiM4N0NFRUIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiI+Um9tYW4gRmlzaDwvdGV4dD4KPGVsbGlwc2UgY3g9IjE1MCIgY3k9IjEwMCIgcng9IjUwIiByeT0iMzAiIGZpbGw9IiNGRjY5QjQiLz4KPHA+YXRoIGQ9Ik0yMDAgMTAwIEwyMzAgODUgTDIzMCAxMTUgWiIgZmlsbD0iI0ZGNjlCNCIvPgo8Y2lyY2xlIGN4PSIxMzUiIGN5PSI5MCIgcj0iMyIgZmlsbD0iIzAwMDAwMCIvPgo8L3N2Zz4=",
            'Hottentot': "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMDA0NDY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMzAiIGZpbGw9IiM4N0NFRUIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiI+SG90dGVudG90IEZpc2g8L3RleHQ+CjxlbGxpcHNlIGN4PSIxNTAiIGN5PSIxMDAiIHJ4PSI1NSIgcnk9IjI4IiBmaWxsPSIjNEZDM0Y3Ii8+CjxyZWN0IHg9IjEyMCIgeT0iODUiIHdpZHRoPSI0IiBoZWlnaHQ9IjMwIiBmaWxsPSIjMDAzMzY2Ii8+CjxyZWN0IHg9IjE0MCIgeT0iODUiIHdpZHRoPSI0IiBoZWlnaHQ9IjMwIiBmaWxsPSIjMDAzMzY2Ii8+CjxyZWN0IHg9IjE2MCIgeT0iODUiIHdpZHRoPSI0IiBoZWlnaHQ9IjMwIiBmaWxsPSIjMDAzMzY2Ii8+CjxwYXRoIGQ9Ik0yMDUgMTAwIEwyMzUgODUgTDIzNSAxMTUgWiIgZmlsbD0iIzRGQzNGNyIvPgo8Y2lyY2xlIGN4PSIxMzUiIGN5PSI5MCIgcj0iMyIgZmlsbD0iIzAwMDAwMCIvPgo8L3N2Zz4=",
            'Steentjie': "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMDA0NDY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMzAiIGZpbGw9IiM4N0NFRUIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiI+U3RlZW50amllIEZpc2g8L3RleHQ+CjxlbGxpcHNlIGN4PSIxNTAiIGN5PSIxMDAiIHJ4PSI0NSIgcnk9IjI1IiBmaWxsPSIjNjY5OTAwIi8+CjxwYXRoIGQ9Ik0xOTUgMTAwIEwyMjAgODggTDIyMCAxMTIgWiIgZmlsbD0iIzY2OTkwMCIvPgo8Y2lyY2xlIGN4PSIxMzUiIGN5PSI5MCIgcj0iMyIgZmlsbD0iIzAwMDAwMCIvPgo8L3N2Zz4=",
            'Angelfish': "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMDA0NDY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMzAiIGZpbGw9IiM4N0NFRUIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiI+QW5nZWxmaXNoPC90ZXh0Pgo8ZWxsaXBzZSBjeD0iMTUwIiBjeT0iMTAwIiByeD0iMzAiIHJ5PSI0NSIgZmlsbD0iI0ZGRkZGRiIvPgo8ZWxsaXBzZSBjeD0iMTM1IiBjeT0iNzAiIHJ4PSIxNSIgcnk9IjIwIiBmaWxsPSIjRkY5OTAwIi8+CjxlbGxpcHNlIGN4PSIxMzUiIGN5PSIxMzAiIHJ4PSIxNSIgcnk9IjIwIiBmaWxsPSIjRkY5OTAwIi8+CjxjaXJjbGUgY3g9IjE0MCIgY3k9IjkwIiByPSIzIiBmaWxsPSIjMDAwMDAwIi8+Cjwvc3ZnPg==",
            'Butterflyfish': "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMDA0NDY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMzAiIGZpbGw9IiM4N0NFRUIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiI+QnV0dGVyZmx5ZmlzaDwvdGV4dD4KPGVsbGlwc2UgY3g9IjE1MCIgY3k9IjEwMCIgcng9IjQwIiByeT0iMzAiIGZpbGw9IiNGRkQ3MDAiLz4KPGJ1cmNsZSBjeD0iMTc1IiBjeT0iODAiIHI9IjgiIGZpbGw9IiMwMDMzNjYiLz4KPGJ1cmNsZSBjeD0iMTc1IiBjeT0iMTIwIiByPSI4IiBmaWxsPSIjMDAzMzY2Ii8+CjxjaXJjbGUgY3g9IjE0MCIgY3k9IjkwIiByPSIzIiBmaWxsPSIjMDAwMDAwIi8+CjwvdGc+"
        };
        
        return photos[englishName] || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMDA0NDY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmaWxsPSIjODdDRUVCIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPkNvcmFsIFJlZWYgRmlzaDwvdGV4dD4KPC9zdmc+";
    }
    
    createSeaUrchinFields() {
        const urchinCount = 15;
        
        for (let i = 0; i < urchinCount; i++) {
            const urchin = this.createSingleSeaUrchin();
            
            // Place on ocean floor
            urchin.position.set(
                (Math.random() - 0.5) * 150,
                -14.8, // On the ocean floor
                (Math.random() - 0.5) * 150
            );
            
            urchin.userData.swayPhase = Math.random() * Math.PI * 2;
            urchin.userData.swaySpeed = 0.5 + Math.random() * 0.5;
            
            this.seaUrchinFields.push(urchin);
            this.scene.add(urchin);
        }
    }
    
    createSingleSeaUrchin() {
        const group = new THREE.Group();
        
        // Main body
        const bodyGeometry = new THREE.SphereGeometry(0.4, 8, 6);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0x301020, // Dark purple
            shininess: 20
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        group.add(body);
        
        // Spines
        const spineGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1, 4);
        const spineMaterial = new THREE.MeshPhongMaterial({
            color: 0x2a0a1a,
            shininess: 30
        });
        
        const spineCount = 20;
        for (let i = 0; i < spineCount; i++) {
            const spine = new THREE.Mesh(spineGeometry, spineMaterial);
            
            // Random positioning around sphere
            const phi = Math.acos(2 * Math.random() - 1);
            const theta = Math.random() * 2 * Math.PI;
            
            spine.position.set(
                0.4 * Math.sin(phi) * Math.cos(theta),
                0.4 * Math.cos(phi),
                0.4 * Math.sin(phi) * Math.sin(theta)
            );
            
            spine.lookAt(
                spine.position.x * 2,
                spine.position.y * 2,
                spine.position.z * 2
            );
            
            spine.userData = { baseRotation: spine.rotation.clone() };
            group.add(spine);
        }
        
        group.userData.spines = group.children.slice(1); // All except body
        
        return group;
    }
    
    createSeaAnemones() {
        const anemoneCount = 12;
        
        for (let i = 0; i < anemoneCount; i++) {
            const anemone = this.createSingleSeaAnemone();
            
            // Attach to rocks or kelp bases
            anemone.position.set(
                (Math.random() - 0.5) * 120,
                -14.5, // On ocean floor
                (Math.random() - 0.5) * 120
            );
            
            anemone.userData.wavePhase = Math.random() * Math.PI * 2;
            anemone.userData.waveSpeed = 0.3 + Math.random() * 0.4;
            
            this.seaAnemones.push(anemone);
            this.scene.add(anemone);
        }
    }
    
    createSingleSeaAnemone() {
        const group = new THREE.Group();
        
        // Base/stem
        const stemGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.8, 8);
        const stemMaterial = new THREE.MeshPhongMaterial({
            color: 0x8B4513, // Brown
            shininess: 20
        });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = 0.4;
        group.add(stem);
        
        // Tentacles
        const tentacleColors = [0xFF69B4, 0xFF1493, 0xDC143C, 0xB22222]; // Pink/red variations
        const tentacleCount = 16;
        const tentacles = [];
        
        for (let i = 0; i < tentacleCount; i++) {
            const angle = (i / tentacleCount) * Math.PI * 2;
            const radius = 0.2 + Math.random() * 0.1;
            
            const tentacleGeometry = new THREE.CylinderGeometry(0.05, 0.1, 1.5, 4);
            const tentacleMaterial = new THREE.MeshPhongMaterial({
                color: tentacleColors[Math.floor(Math.random() * tentacleColors.length)],
                shininess: 40,
                transparent: true,
                opacity: 0.8
            });
            
            const tentacle = new THREE.Mesh(tentacleGeometry, tentacleMaterial);
            tentacle.position.set(
                Math.cos(angle) * radius,
                1.2,
                Math.sin(angle) * radius
            );
            
            tentacle.userData = {
                baseAngle: angle,
                baseY: tentacle.position.y,
                waveOffset: Math.random() * Math.PI * 2
            };
            
            tentacles.push(tentacle);
            group.add(tentacle);
        }
        
        group.userData.tentacles = tentacles;
        
        return group;
    }
    
    // South African Marine Life Updates
    updateCapeFurSeals(deltaTime) {
        this.capeFurSeals.forEach(seal => {
            const sealData = seal.userData;
            
            // Breathing behavior - surface occasionally
            sealData.breathTimer -= deltaTime;
            if (sealData.breathTimer <= 0) {
                sealData.breathTimer = 15 + Math.random() * 10;
                sealData.direction.y = 0.8; // Head to surface
            } else if (seal.position.y > 5) {
                sealData.direction.y = -0.3; // Dive back down
            }
            
            // Playful behavior
            sealData.playfulTimer -= deltaTime;
            if (sealData.playfulTimer <= 0) {
                sealData.playfulTimer = 8 + Math.random() * 12;
                // Barrel roll or spin
                seal.rotation.z += Math.PI * 2 * deltaTime;
            }
            
            // Movement
            seal.position.addScaledVector(sealData.direction, sealData.speed * deltaTime);
            
            // Random direction changes
            if (Math.random() < sealData.agility) {
                sealData.direction.add(new THREE.Vector3(
                    (Math.random() - 0.5) * 0.2,
                    (Math.random() - 0.5) * 0.1,
                    (Math.random() - 0.5) * 0.2
                ));
                sealData.direction.normalize();
            }
            
            // Face movement direction
            if (sealData.direction.length() > 0.1) {
                seal.lookAt(seal.position.clone().add(sealData.direction));
            }
            
            // Animate flippers
            const time = performance.now() * 0.003;
            const flippers = sealData.flippers;
            if (flippers) {
                const swimIntensity = sealData.speed / 3;
                flippers.frontL.rotation.z = Math.sin(time * 4) * 0.4 * swimIntensity;
                flippers.frontR.rotation.z = -Math.sin(time * 4) * 0.4 * swimIntensity;
                flippers.backL.rotation.y = Math.PI / 4 + Math.sin(time * 6) * 0.3 * swimIntensity;
                flippers.backR.rotation.y = -Math.PI / 4 - Math.sin(time * 6) * 0.3 * swimIntensity;
            }
            
            // Keep in bounds
            if (seal.position.length() > 120) {
                sealData.direction.copy(seal.position.clone().negate().normalize());
            }
        });
    }
    
    updateAfricanPenguins(deltaTime) {
        this.africanPenguins.forEach(penguin => {
            const penguinData = penguin.userData;
            
            // Diving behavior
            penguinData.diveTimer -= deltaTime;
            if (penguinData.diveTimer <= 0) {
                penguinData.diveTimer = 10 + Math.random() * 20;
                // Dive deep or surface
                if (penguin.position.y > -5) {
                    penguinData.direction.y = -1; // Deep dive
                } else {
                    penguinData.direction.y = 0.6; // Surface
                }
            }
            
            // Fast, agile movement
            penguin.position.addScaledVector(penguinData.direction, penguinData.speed * deltaTime);
            
            // Frequent direction changes (very agile)
            if (Math.random() < penguinData.agility) {
                penguinData.direction.add(new THREE.Vector3(
                    (Math.random() - 0.5) * 0.4,
                    (Math.random() - 0.5) * 0.3,
                    (Math.random() - 0.5) * 0.4
                ));
                penguinData.direction.normalize();
            }
            
            // Face movement direction
            penguin.lookAt(penguin.position.clone().add(penguinData.direction));
            
            // Animate flippers (like underwater flying)
            const time = performance.now() * 0.005;
            const flippers = penguinData.flippers;
            if (flippers) {
                const flapIntensity = penguinData.speed / 4;
                flippers.left.rotation.z = Math.sin(time * 8) * 0.6 * flapIntensity;
                flippers.right.rotation.z = -Math.sin(time * 8) * 0.6 * flapIntensity;
            }
            
            // Keep in bounds
            if (penguin.position.length() > 100) {
                penguinData.direction.copy(penguin.position.clone().negate().normalize());
            }
            
            // Depth limits
            penguin.position.y = THREE.MathUtils.clamp(penguin.position.y, -25, 10);
        });
    }
    
    updateGreatWhiteSharks(deltaTime) {
        this.greatWhiteSharks.forEach(shark => {
            const sharkData = shark.userData;
            
            // Check if octopus is nearby - hunting mode
            const distanceToOctopus = shark.position.distanceTo(this.octopusPosition);
            if (distanceToOctopus < 25 && !sharkData.huntingMode) {
                sharkData.huntingMode = true;
                sharkData.speed = Math.min(sharkData.speed * 1.3, 0.03); // 轻微加速但限制最大速度，保持慢速
                this.audio.playBubbleSound(200, 1); // Low ominous sound
            } else if (distanceToOctopus > 40) {
                sharkData.huntingMode = false;
                sharkData.speed = 0.015 + Math.random() * 0.005; // 重置为慢速巡游速度
            }
            
            if (sharkData.huntingMode) {
                // Chase octopus
                const toOctopus = this.octopusPosition.clone().sub(shark.position).normalize();
                sharkData.direction.lerp(toOctopus, 0.02);
            } else {
                // Patrol behavior - circle around center
                const toCenter = sharkData.patrolCenter.clone().sub(shark.position);
                const distanceToCenter = toCenter.length();
                
                if (distanceToCenter > sharkData.patrolRadius + 20) {
                    // Return to patrol area
                    sharkData.direction.lerp(toCenter.normalize(), 0.01);
                } else {
                    // Circle patrol
                    const circleDirection = new THREE.Vector3(-toCenter.z, 0, toCenter.x).normalize();
                    sharkData.direction.lerp(circleDirection, 0.005);
                }
            }
            
            // Movement
            shark.position.addScaledVector(sharkData.direction, sharkData.speed * deltaTime);
            
            // Face movement direction
            shark.lookAt(shark.position.clone().add(sharkData.direction));
            
            // Animate fins
            const time = performance.now() * 0.002;
            const fins = sharkData.fins;
            if (fins) {
                const swimIntensity = sharkData.speed / 2;
                fins.tail.rotation.y = Math.sin(time * 6) * 0.3 * swimIntensity;
                fins.pectoralL.rotation.z = Math.PI / 3 + Math.sin(time * 4) * 0.1 * swimIntensity;
                fins.pectoralR.rotation.z = -Math.PI / 3 - Math.sin(time * 4) * 0.1 * swimIntensity;
            }
        });
    }
    
    updateCapeReefFish(deltaTime) {
        this.capeReefFish.forEach((fish, fishIndex) => {
            const fishData = fish.userData;
            
            // 初始化自然游泳数据
            if (!fishData.naturalSwim) {
                fishData.naturalSwim = {
                    baseSpeed: 0.008 + Math.random() * 0.007, // 极大降低速度，仿照章鱼慢速
                    currentSpeed: fishData.speed,
                    targetDirection: fishData.direction.clone(),
                    currentDirection: fishData.direction.clone(),
                    swimPhase: Math.random() * Math.PI * 2,
                    personalityFactor: 0.6 + Math.random() * 0.4,
                    lastDirectionChange: performance.now(),
                    directionChangeInterval: 2500 + Math.random() * 4000, // 更长的方向变化间隔
                    schoolingStrength: 0.3 + Math.random() * 0.4
                };
            }
            
            const naturalSwim = fishData.naturalSwim;
            const time = performance.now();
            
            // 群体行为 - 朝向学校中心但不过于强制
            if (fishData.schoolCenter) {
                const toSchoolCenter = fishData.schoolCenter.clone().sub(fish.position);
                const distanceToCenter = toSchoolCenter.length();
                
                if (distanceToCenter > 20) {
                    // 温和地朝向群体中心
                    const centerInfluence = Math.min(distanceToCenter / 30, 1.0) * naturalSwim.schoolingStrength;
                    naturalSwim.targetDirection.lerp(toSchoolCenter.normalize(), centerInfluence * deltaTime);
                }
            }
            
            // 定期改变游泳方向（模拟自然觅食行为）
            if (time - naturalSwim.lastDirectionChange > naturalSwim.directionChangeInterval) {
                naturalSwim.lastDirectionChange = time;
                naturalSwim.directionChangeInterval = 1500 + Math.random() * 2500;
                
                // 生成相对平滑的新方向
                const currentAngle = Math.atan2(naturalSwim.currentDirection.z, naturalSwim.currentDirection.x);
                const maxTurn = Math.PI * 0.4; // 最大72度转向
                const turnAngle = (Math.random() - 0.5) * maxTurn;
                const newAngle = currentAngle + turnAngle;
                
                naturalSwim.targetDirection.set(
                    Math.cos(newAngle),
                    (Math.random() - 0.5) * 0.2, // 轻微垂直游动
                    Math.sin(newAngle)
                ).normalize();
            }
            
            // 平滑插值到目标方向
            naturalSwim.currentDirection.lerp(naturalSwim.targetDirection, deltaTime * 1.2);
            naturalSwim.currentDirection.normalize();
            
            // 避开章鱼行为
            const distanceToOctopus = fish.position.distanceTo(this.octopusPosition);
            let targetSpeed = naturalSwim.baseSpeed;
            
            if (distanceToOctopus < 6) {
                const avoidanceVector = fish.position.clone().sub(this.octopusPosition).normalize();
                naturalSwim.targetDirection.lerp(avoidanceVector, deltaTime * 3.0);
                targetSpeed = naturalSwim.baseSpeed * 1.8; // 适度加速
            }
            
            // 平滑速度变化
            naturalSwim.currentSpeed = THREE.MathUtils.lerp(
                naturalSwim.currentSpeed,
                targetSpeed,
                deltaTime * 1.5
            );
            
            // 添加自然游泳节奏
            naturalSwim.swimPhase += deltaTime * 2.5;
            const rhythmFactor = Math.sin(naturalSwim.swimPhase) * 0.3 + 1.0;
            const finalSpeed = naturalSwim.currentSpeed * rhythmFactor * naturalSwim.personalityFactor;
            
            // 移动鱼类
            fish.position.addScaledVector(naturalSwim.currentDirection, finalSpeed * deltaTime * 12);
            
            // 平滑旋转面向游泳方向
            const currentLookDir = new THREE.Vector3();
            fish.getWorldDirection(currentLookDir);
            const targetLookDir = naturalSwim.currentDirection.clone();
            
            currentLookDir.lerp(targetLookDir, deltaTime * 2.5);
            fish.lookAt(fish.position.clone().add(currentLookDir));
            
            // 边界约束
            const distanceFromOrigin = fish.position.length();
            if (distanceFromOrigin > 60) {
                const returnVector = fish.position.clone().negate().normalize();
                naturalSwim.targetDirection.lerp(returnVector, deltaTime * 2.0);
            }
            
            // 自然尾鳍摆动
            const tail = fishData.tail;
            if (tail) {
                const swimIntensity = finalSpeed / naturalSwim.baseSpeed;
                const tailPhase = time * 0.006 * swimIntensity + fishIndex * 0.5;
                tail.rotation.y = Math.sin(tailPhase) * 0.3 * Math.min(swimIntensity, 2.0);
            }
            
            // 更新原始数据保持兼容性
            fishData.direction.copy(naturalSwim.currentDirection);
            fishData.speed = finalSpeed;
        });
    }
    
    updateSeaUrchinFields(deltaTime) {
        this.seaUrchinFields.forEach(urchin => {
            const urchinData = urchin.userData;
            
            // Gentle spine swaying
            const time = performance.now() * 0.001;
            const swayPhase = time * urchinData.swaySpeed + urchinData.swayPhase;
            
            if (urchinData.spines) {
                urchinData.spines.forEach((spine, index) => {
                    const spinePhase = swayPhase + index * 0.1;
                    const sway = Math.sin(spinePhase) * 0.05;
                    
                    spine.rotation.x = spine.userData.baseRotation.x + sway;
                    spine.rotation.z = spine.userData.baseRotation.z + sway * 0.7;
                });
            }
        });
    }
    
    updateSeaAnemones(deltaTime) {
        this.seaAnemones.forEach(anemone => {
            const anemoneData = anemone.userData;
            
            // Tentacle waving
            const time = performance.now() * 0.001;
            const wavePhase = time * anemoneData.waveSpeed + anemoneData.wavePhase;
            
            if (anemoneData.tentacles) {
                anemoneData.tentacles.forEach(tentacle => {
                    const tentacleData = tentacle.userData;
                    const phase = wavePhase + tentacleData.waveOffset;
                    
                    const wave = Math.sin(phase) * 0.2;
                    const wave2 = Math.cos(phase * 0.7) * 0.15;
                    
                    tentacle.rotation.x = wave + wave2;
                    tentacle.rotation.z = Math.sin(phase + tentacleData.baseAngle) * 0.1;
                });
            }
            
            // React to nearby octopus - close tentacles
            const distanceToOctopus = anemone.position.distanceTo(this.octopusPosition);
            if (distanceToOctopus < 8) {
                if (anemoneData.tentacles) {
                    anemoneData.tentacles.forEach(tentacle => {
                        tentacle.rotation.x *= 0.3; // Close tentacles
                        tentacle.position.y = tentacle.userData.baseY * 0.7;
                    });
                }
            } else {
                // Restore normal position
                if (anemoneData.tentacles) {
                    anemoneData.tentacles.forEach(tentacle => {
                        tentacle.position.y = THREE.MathUtils.lerp(
                            tentacle.position.y,
                            tentacle.userData.baseY,
                            deltaTime * 2
                        );
                    });
                }
            }
        });
    }
    
    updateLighting(deltaTime) {
        const time = performance.now() * 0.001;
        
        // Animate caustic lights
        this.causticLights.forEach((light, index) => {
            const offset = index * Math.PI * 0.4;
            light.intensity = 0.3 + Math.sin(time * 2 + offset) * 0.2;
            
            // Move lights slightly
            light.position.x += Math.sin(time * 0.5 + offset) * 0.1;
            light.position.z += Math.cos(time * 0.7 + offset) * 0.1;
        });
        
        // Update skybox
        if (this.skybox && this.skybox.material.uniforms) {
            this.skybox.material.uniforms.time.value = time;
        }
    }
    
    updateBubbles(deltaTime) {
        // Create new bubbles occasionally
        if (Math.random() < 0.05) {
            this.createBubble();
        }
        
        // Update existing bubbles
        this.bubbles = this.bubbles.filter(bubble => {
            bubble.position.y += bubble.userData.speed * deltaTime;
            bubble.rotation.x += bubble.userData.rotSpeed * deltaTime;
            bubble.rotation.z += bubble.userData.rotSpeed * 0.7 * deltaTime;
            
            // Remove bubbles that are too high
            if (bubble.position.y > 30) {
                this.scene.remove(bubble);
                return false;
            }
            
            return true;
        });
    }
    
    createBubble() {
        const geometry = new THREE.SphereGeometry(0.1 + Math.random() * 0.3, 6, 4);
        const material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3,
            shininess: 100
        });
        
        const bubble = new THREE.Mesh(geometry, material);
        bubble.position.set(
            (Math.random() - 0.5) * 100,
            -15 + Math.random() * 5,
            (Math.random() - 0.5) * 100
        );
        
        bubble.userData = {
            speed: 5 + Math.random() * 10,
            rotSpeed: (Math.random() - 0.5) * 4
        };
        
        this.bubbles.push(bubble);
        this.scene.add(bubble);
        
        // Play bubble sound
        if (Math.random() < 0.3) {
            this.audio.playAmbientBubbles();
        }
    }
    
    updatePerformance() {
        this.frameCount++;
        const now = performance.now();
        
        if (now - this.lastTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime));
            document.getElementById('fps').textContent = this.fps;
            
            this.frameCount = 0;
            this.lastTime = now;
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
    
    startRenderLoop() {
        let lastTime = 0;
        
        const animate = (currentTime) => {
            const deltaTime = (currentTime - lastTime) / 1000;
            lastTime = currentTime;
            
            // Update all systems
            this.updateOctopus(deltaTime);
            this.updateCamera(deltaTime);
            this.updateKelp(deltaTime);
            this.updateFish(deltaTime);
            
            // Update South African marine life
            this.updateCapeFurSeals(deltaTime);
            this.updateAfricanPenguins(deltaTime);
            this.updateGreatWhiteSharks(deltaTime);
            this.updateCapeReefFish(deltaTime);
            this.updateSeaUrchinFields(deltaTime);
            this.updateSeaAnemones(deltaTime);
            
            this.updateLighting(deltaTime);
            this.updateBubbles(deltaTime);
            this.updatePerformance();
            
            // Update floating labels positions
            this.updateFloatingLabels();
            
            // Render
            this.renderer.render(this.scene, this.camera);
            
            requestAnimationFrame(animate);
        };
        
        animate(0);
    }
    
    registerClickableObjects() {
        // Register all marine species as clickable for educational interaction
        
        // Register Cape Fur Seals
        this.capeFurSeals.forEach(seal => {
            this.education.registerClickableObject(seal);
        });
        
        // Register African Penguins
        this.africanPenguins.forEach(penguin => {
            this.education.registerClickableObject(penguin);
        });
        
        // Register Great White Sharks
        this.greatWhiteSharks.forEach(shark => {
            this.education.registerClickableObject(shark);
        });
        
        // Register Cape Reef Fish
        this.capeReefFish.forEach(fish => {
            this.education.registerClickableObject(fish);
        });
        
        console.log(`Registered ${this.capeFurSeals.length + this.africanPenguins.length + this.greatWhiteSharks.length + this.capeReefFish.length} clickable marine species for education`);
        
        // Create floating labels for all species
        this.createFloatingLabels();
    }
    
    createFloatingLabels() {
        const allSpecies = [
            ...this.capeFurSeals,
            ...this.africanPenguins, 
            ...this.greatWhiteSharks,
            ...this.capeReefFish
        ];
        
        allSpecies.forEach(species => {
            if (species.userData.species) {
                this.createSpeciesLabel(species);
            }
        });
    }
    
    createSpeciesLabel(speciesObject) {
        const label = document.createElement('div');
        label.className = 'species-label fade-in';
        label.textContent = speciesObject.userData.species.englishName;
        
        // Store reference to the 3D object
        label.speciesObject = speciesObject;
        speciesObject.userData.label = label;
        
        document.body.appendChild(label);
        this.speciesLabels.push(label);
        
        // Position label initially
        this.updateLabelPosition(label, speciesObject);
    }
    
    updateLabelPosition(label, speciesObject) {
        if (!speciesObject || !label) return;
        
        // Get world position of the species
        const worldPosition = new THREE.Vector3();
        speciesObject.getWorldPosition(worldPosition);
        
        // Project to screen coordinates
        const screenPosition = worldPosition.clone().project(this.camera);
        
        // Convert to pixel coordinates
        const x = (screenPosition.x * 0.5 + 0.5) * window.innerWidth;
        const y = (screenPosition.y * -0.5 + 0.5) * window.innerHeight;
        
        // Position label above the species
        label.style.left = (x - label.offsetWidth / 2) + 'px';
        label.style.top = (y - 40) + 'px';
        
        // Hide label if species is too far or behind camera
        const distance = this.camera.position.distanceTo(worldPosition);
        const isVisible = screenPosition.z < 1 && distance < 100;
        label.style.display = isVisible ? 'block' : 'none';
    }
    
    updateFloatingLabels() {
        this.speciesLabels.forEach(label => {
            if (label.speciesObject && document.body.contains(label)) {
                this.updateLabelPosition(label, label.speciesObject);
            }
        });
    }
}

// Educational Information System
class EducationSystem {
    constructor(scene, camera, canvas) {
        this.scene = scene;
        this.camera = camera;
        this.canvas = canvas;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.clickableObjects = [];
        this.infoPanel = document.getElementById('species-info');
        this.closeBtn = document.getElementById('close-info');
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Handle clicks on species
        this.canvas.addEventListener('click', (event) => {
            event.preventDefault();
            this.handleClick(event);
        });
        
        // Handle close button
        this.closeBtn.addEventListener('click', () => {
            this.hideSpeciesInfo();
        });
        
        // Close on escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.hideSpeciesInfo();
            }
        });
    }
    
    registerClickableObject(object) {
        if (object.userData.species) {
            this.clickableObjects.push(object);
        }
    }
    
    handleClick(event) {
        // Calculate mouse position in normalized device coordinates
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Update the raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Calculate objects intersecting the picking ray
        const intersects = this.raycaster.intersectObjects(this.clickableObjects, true);
        
        let speciesFound = false;
        
        if (intersects.length > 0) {
            // Find the first object with species data
            for (let intersect of intersects) {
                let obj = intersect.object;
                
                // Traverse up the hierarchy to find species data
                while (obj && !obj.userData.species) {
                    obj = obj.parent;
                }
                
                if (obj && obj.userData.species) {
                    this.showSpeciesInfo(obj.userData.species);
                    speciesFound = true;
                    break;
                }
            }
        }
        
        // If no species was clicked, hide the info panel
        if (!speciesFound && !this.infoPanel.classList.contains('hidden')) {
            this.hideSpeciesInfo();
        }
    }
    
    showSpeciesInfo(speciesData) {
        const nameElement = document.getElementById('species-name');
        const englishElement = document.getElementById('species-english');
        const factsElement = document.getElementById('species-facts');
        const imageElement = document.getElementById('species-image');
        
        // Set species information
        nameElement.textContent = speciesData.name;
        englishElement.textContent = speciesData.englishName;
        
        // Set species photo
        if (speciesData.photo) {
            imageElement.src = speciesData.photo;
            imageElement.alt = `${speciesData.englishName} photo`;
            imageElement.style.display = 'block';
        } else {
            // Create a simple placeholder image
            imageElement.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMDA0NDY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmaWxsPSIjODdDRUVCIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPk1hcmluZSBBbmltYWw8L3RleHQ+Cjwvc3ZnPgo=";
            imageElement.alt = `${speciesData.englishName} placeholder`;
        }
        
        // Create facts list
        const factsList = document.createElement('ul');
        speciesData.facts.forEach(fact => {
            const listItem = document.createElement('li');
            listItem.textContent = fact;
            factsList.appendChild(listItem);
        });
        
        // Clear previous facts and add new ones
        factsElement.innerHTML = '';
        factsElement.appendChild(factsList);
        
        // Show the panel
        this.infoPanel.classList.remove('hidden');
        
        // Play an educational sound effect
        if (window.audioSystem) {
            window.audioSystem.playBubbleSound(1200, 0.3);
        }
    }
    
    hideSpeciesInfo() {
        this.infoPanel.classList.add('hidden');
    }
}

// Audio system (reuse from previous implementation)
class OceanAudio {
    constructor() {
        this.audioContext = null;
        this.enabled = false;
        this.init();
    }
    
    init() {
        document.addEventListener('click', () => this.enableAudio(), { once: true });
        document.addEventListener('keydown', () => this.enableAudio(), { once: true });
    }
    
    enableAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.enabled = true;
        }
    }
    
    playBubbleSound(pitch = 1000, duration = 0.3) {
        if (!this.enabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(pitch, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(pitch * 0.3, this.audioContext.currentTime + duration);
        
        gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        oscillator.type = 'sine';
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    playMovementSound() {
        if (!this.enabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(80, this.audioContext.currentTime + 0.2);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.03, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
        
        oscillator.type = 'sawtooth';
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }
    
    playAmbientBubbles() {
        if (!this.enabled || !this.audioContext) return;
        
        const pitch = 800 + Math.random() * 400;
        const duration = 0.1 + Math.random() * 0.3;
        this.playBubbleSound(pitch, duration);
    }
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', () => {
    new OceanForest();
});