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
                        ? 'Mouse control enabled' 
                        : 'Mouse control disabled';
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
            
            fish.userData.speed = 0.03 + Math.random() * 0.02; // Significantly reduce base fish speed
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
                // Initialize natural swimming data
                fish.userData.swimData = {
                    baseSpeed: 0.008 + Math.random() * 0.007, // Very slow speed, following octopus slow movement
                    currentSpeed: 0,
                    targetDirection: fish.userData.direction.clone(),
                    currentDirection: fish.userData.direction.clone(),
                    swimPhase: Math.random() * Math.PI * 2,
                    lastDirectionChange: 0,
                    directionChangeInterval: 4000 + Math.random() * 6000 // Change direction every 4-10 seconds
                };
            }
            
            const swimData = fish.userData.swimData;
            const time = performance.now();
            
            // Check if swimming direction needs to change
            if (time - swimData.lastDirectionChange > swimData.directionChangeInterval) {
                swimData.lastDirectionChange = time;
                swimData.directionChangeInterval = 4000 + Math.random() * 6000;
                
                // Generate new target direction (extremely smooth turning)
                const currentAngle = Math.atan2(swimData.currentDirection.z, swimData.currentDirection.x);
                const turnAngle = (Math.random() - 0.5) * Math.PI * 0.4; // Maximum 36 degree turn
                const newAngle = currentAngle + turnAngle;
                
                swimData.targetDirection.set(
                    Math.cos(newAngle),
                    (Math.random() - 0.5) * 0.2, // Slight up and down swimming movement
                    Math.sin(newAngle)
                ).normalize();
            }
            
            // Extremely smooth direction interpolation
            swimData.currentDirection.lerp(swimData.targetDirection, 0.01);
            swimData.currentDirection.normalize();
            
            // Simplified avoidance behavior
            const distanceToOctopus = fish.position.distanceTo(this.octopusPosition);
            let targetSpeed = swimData.baseSpeed;
            
            if (distanceToOctopus < 5) {
                // Extremely subtle avoidance
                const avoidVector = fish.position.clone().sub(this.octopusPosition).normalize();
                swimData.targetDirection.lerp(avoidVector, 0.015);
                targetSpeed = swimData.baseSpeed * 1.3; // Slight acceleration
            }
            
            // Smooth speed changes
            swimData.currentSpeed = THREE.MathUtils.lerp(
                swimData.currentSpeed, 
                targetSpeed, 
                0.03
            );
            
            // Simplified swimming rhythm
            swimData.swimPhase += deltaTime * 1.5;
            const rhythmFactor = 0.7 + Math.sin(swimData.swimPhase) * 0.3;
            const finalSpeed = swimData.currentSpeed * rhythmFactor;
            
            // Slow movement
            const moveVector = swimData.currentDirection.clone().multiplyScalar(finalSpeed);
            fish.position.add(moveVector);
            
            // Smooth orientation toward movement direction
            const lookTarget = fish.position.clone().add(swimData.currentDirection);
            fish.lookAt(lookTarget);
            
            // Boundary control
            if (fish.position.length() > 60) {
                const returnVector = fish.position.clone().negate().normalize();
                swimData.targetDirection.lerp(returnVector, 0.05);
            }
            
            // Simplified tail fin animation
            const tail = fish.children[1];
            if (tail) {
                const swimTime = time * 0.004; // Very slow swaying
                const swimIntensity = finalSpeed * 15;
                tail.rotation.y = Math.sin(swimTime + fishIndex) * 0.3 * swimIntensity;
            }
            
            // Update original data to maintain compatibility
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
            
            seal.userData.speed = 0.015 + Math.random() * 0.005; // Greatly reduce seal speed, following octopus slow speed
            seal.userData.agility = 0.02;
            seal.userData.breathTimer = Math.random() * 20; // Surface breathing
            seal.userData.playfulTimer = Math.random() * 10; // Playful behavior
            
            this.capeFurSeals.push(seal);
            this.scene.add(seal);
        }
    }
    
    createSingleCapeFurSeal() {
        const group = new THREE.Group();
        
        // More realistic body - streamlined design
        const bodyGeometry = new THREE.SphereGeometry(1, 16, 12);
        bodyGeometry.scale(2.8, 1.1, 1.3); // Longer and more streamlined
        
        // Body gradient colors - dark back, light belly
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0x5d4037, // Warm brown color
            shininess: 80,
            specular: 0x333333
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        group.add(body);
        
        // Light-colored belly area
        const bellyGeometry = new THREE.SphereGeometry(0.85, 12, 8);
        bellyGeometry.scale(2.5, 0.8, 1.1);
        const bellyMaterial = new THREE.MeshPhongMaterial({
            color: 0x8d6e63, // Light brown belly
            shininess: 90
        });
        const belly = new THREE.Mesh(bellyGeometry, bellyMaterial);
        belly.position.set(0, -0.3, 0);
        group.add(belly);
        
        // More realistic head
        const headGeometry = new THREE.SphereGeometry(0.9, 16, 12);
        headGeometry.scale(1.3, 1.1, 1.2);
        const headMaterial = new THREE.MeshPhongMaterial({
            color: 0x6d4c41, // Head color
            shininess: 70
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(2.4, 0.3, 0);
        head.castShadow = true;
        group.add(head);
        
        // Large eyes - child-friendly
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
        
        // Cute nose
        const noseGeometry = new THREE.SphereGeometry(0.08, 8, 6);
        const noseMaterial = new THREE.MeshPhongMaterial({
            color: 0x2e2e2e,
            shininess: 50
        });
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.set(3.1, 0.3, 0);
        group.add(nose);
        
        // Whiskers
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
        
        // More realistic front flippers - oval shape
        const frontFlipperGeometry = new THREE.SphereGeometry(0.6, 10, 8);
        frontFlipperGeometry.scale(2.2, 0.25, 1.1);
        const flipperMaterial = new THREE.MeshPhongMaterial({
            color: 0x4a4a4a, // Dark colored fins
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
        
        // Rear fins - more like real tail fins
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
        
        // Dorsal fin
        const dorsalFinGeometry = new THREE.ConeGeometry(0.3, 0.6, 6);
        const dorsalFinMaterial = new THREE.MeshPhongMaterial({
            color: 0x5d4037,
            shininess: 50
        });
        const dorsalFin = new THREE.Mesh(dorsalFinGeometry, dorsalFinMaterial);
        dorsalFin.position.set(0, 1.2, 0);
        dorsalFin.rotation.x = Math.PI;
        group.add(dorsalFin);
        
        // Store fin references for animation
        group.userData.flippers = {
            frontL: frontFlipperL,
            frontR: frontFlipperR,
            backL: backFlipperL,
            backR: backFlipperR
        };
        
        // Educational label data
        group.userData.species = {
            name: "Cape Fur Seal",
            englishName: "Cape Fur Seal",
            photo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMDA0NDY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmaWxsPSIjODdDRUVCIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPkNhcGUgRnVyIFNlYWw8L3RleHQ+CjxjaXJjbGUgY3g9IjE1MCIgY3k9IjEyMCIgcj0iMjAiIGZpbGw9IiM2NjVBNDgiLz4KPC9zdmc+",
            facts: [
                "Body length up to 2.5 meters",
                "Excellent swimmers and divers", 
                "Social animals living in colonies",
                "Feed primarily on fish",
                "Lifespan up to 25 years"
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
            
            penguin.userData.speed = 0.02 + Math.random() * 0.01; // Greatly reduce penguin speed, following octopus slow speed
            penguin.userData.diveTimer = Math.random() * 15;
            penguin.userData.agility = 0.03;
            
            this.africanPenguins.push(penguin);
            this.scene.add(penguin);
        }
    }
    
    createSingleAfricanPenguin() {
        const group = new THREE.Group();
        
        // More realistic body - torpedo-shaped streamlined
        const bodyGeometry = new THREE.SphereGeometry(0.7, 16, 12);
        bodyGeometry.scale(1.6, 1.4, 1.1);
        
        // Black back
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0x1a1a1a, // Deep black
            shininess: 90,
            specular: 0x444444
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        group.add(body);
        
        // White belly - larger and more prominent
        const bellyGeometry = new THREE.SphereGeometry(0.6, 12, 10);
        bellyGeometry.scale(1.3, 1.2, 0.9);
        const bellyMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff, // Pure white
            shininess: 100,
            specular: 0x222222
        });
        const belly = new THREE.Mesh(bellyGeometry, bellyMaterial);
        belly.position.set(0.3, -0.1, 0);
        group.add(belly);
        
        // Head - round and cute
        const headGeometry = new THREE.SphereGeometry(0.45, 16, 12);
        headGeometry.scale(1.2, 1.1, 1.1);
        const headMaterial = new THREE.MeshPhongMaterial({
            color: 0x0d0d0d, // Head black color
            shininess: 85
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(1.1, 0.4, 0);
        head.castShadow = true;
        group.add(head);
        
        // White facial area
        const faceGeometry = new THREE.SphereGeometry(0.35, 10, 8);
        faceGeometry.scale(0.8, 0.9, 0.8);
        const faceMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            shininess: 95
        });
        const face = new THREE.Mesh(faceGeometry, faceMaterial);
        face.position.set(1.3, 0.3, 0);
        group.add(face);
        
        // Large eyes - child-friendly design
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
        
        // Black pupils
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
        
        // Orange beak - African penguin characteristic
        const beakGeometry = new THREE.ConeGeometry(0.08, 0.35, 6);
        const beakMaterial = new THREE.MeshPhongMaterial({
            color: 0xff8c00, // Orange beak
            shininess: 70
        });
        const beak = new THREE.Mesh(beakGeometry, beakMaterial);
        beak.position.set(1.6, 0.35, 0);
        beak.rotation.z = Math.PI / 2;
        group.add(beak);
        
        // Black band pattern unique to African penguins
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
        
        // Wings/flippers - more realistic shape
        const flipperGeometry = new THREE.SphereGeometry(0.45, 12, 8);
        flipperGeometry.scale(2.2, 0.3, 1);
        const flipperMaterial = new THREE.MeshPhongMaterial({
            color: 0x0d0d0d, // Black wings
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
        
        // White stripes on wing edges
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
        
        // Orange webbed feet
        const feetGeometry = new THREE.SphereGeometry(0.15, 8, 6);
        feetGeometry.scale(1.2, 0.3, 1.5);
        const feetMaterial = new THREE.MeshPhongMaterial({
            color: 0xff8c00, // Orange feet
            shininess: 60
        });
        
        const footL = new THREE.Mesh(feetGeometry, feetMaterial);
        footL.position.set(0.8, -1, 0.3);
        group.add(footL);
        
        const footR = new THREE.Mesh(feetGeometry.clone(), feetMaterial);
        footR.position.set(0.8, -1, -0.3);
        group.add(footR);
        
        // Store wing references
        group.userData.flippers = { left: flipperL, right: flipperR };
        
        // Educational label data
        group.userData.species = {
            name: "African Penguin",
            englishName: "African Penguin",
            photo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMDA0NDY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iOTAiIGZpbGw9IiM4N0NFRUIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCI+QWZyaWNhbiBQZW5ndWluPC90ZXh0Pgo8ZWxsaXBzZSBjeD0iMTUwIiBjeT0iMTMwIiByeD0iMjUiIHJ5PSIzNSIgZmlsbD0iIzMzMzMzMyIvPgo8ZWxsaXBzZSBjeD0iMTUwIiBjeT0iMTM1IiByeD0iMTUiIHJ5PSIyNSIgZmlsbD0iI0ZGRkZGRiIvPgo8Y2lyY2xlIGN4PSIxNDUiIGN5PSIxMjAiIHI9IjMiIGZpbGw9IiMwMDAwMDAiLz4KPGJ1cmNsZSBjeD0iMTU1IiBjeT0iMTIwIiByPSIzIiBmaWxsPSIjMDAwMDAwIi8+CjxyZWN0IHg9IjE0NyIgeT0iMTI1IiB3aWR0aD0iNiIgaGVpZ2h0PSI0IiBmaWxsPSIjRkY4QzAwIi8+Cjwvc3ZnPgo=",
            facts: [
                "Also known as Black-footed Penguin",
                "Swimming speed up to 20 km/h",
                "Can dive to depths of 130 meters",
                "Feed on small fish and squid",
                "Endangered species requiring protection"
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
            
            shark.userData.speed = 0.015 + Math.random() * 0.005; // Greatly reduce shark speed, following octopus slow speed
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
        
        // More realistic shark body - perfect streamlined
        const bodyGeometry = new THREE.SphereGeometry(1.3, 20, 16);
        bodyGeometry.scale(4.5, 1.3, 1.6); // Perfect shark proportions
        
        // Dark colored back
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0x4a5568, // Deep blue-gray back
            shininess: 85,
            specular: 0x666666
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        group.add(body);
        
        // White belly - shark's characteristic belly coloring
        const bellyGeometry = new THREE.SphereGeometry(1.1, 16, 12);
        bellyGeometry.scale(4.2, 1, 1.4);
        const bellyMaterial = new THREE.MeshPhongMaterial({
            color: 0xf7fafc, // White belly
            shininess: 90
        });
        const belly = new THREE.Mesh(bellyGeometry, bellyMaterial);
        belly.position.set(0, -0.4, 0);
        group.add(belly);
        
        // More realistic head/snout
        const headGeometry = new THREE.SphereGeometry(0.9, 16, 12);
        headGeometry.scale(1.8, 1.1, 1.3);
        const headMaterial = new THREE.MeshPhongMaterial({
            color: 0x2d3748, // Dark colored head
            shininess: 80
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(4.8, 0.2, 0);
        head.castShadow = true;
        group.add(head);
        
        // Shark eyes - dark but not menacing
        const eyeGeometry = new THREE.SphereGeometry(0.2, 12, 8);
        const eyeMaterial = new THREE.MeshPhongMaterial({
            color: 0x1a202c, // Dark colored eyes
            shininess: 100
        });
        
        const eyeL = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eyeL.position.set(5.5, 0.6, 0.5);
        group.add(eyeL);
        
        const eyeR = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eyeR.position.set(5.5, 0.6, -0.5);
        group.add(eyeR);
        
        // Snout
        const snoutGeometry = new THREE.ConeGeometry(0.6, 1.5, 12);
        const snoutMaterial = new THREE.MeshPhongMaterial({
            color: 0x4a5568,
            shininess: 75
        });
        const snout = new THREE.Mesh(snoutGeometry, snoutMaterial);
        snout.position.set(6.2, 0, 0);
        snout.rotation.z = -Math.PI / 2;
        group.add(snout);
        
        // Classic dorsal fin - triangular
        const dorsalGeometry = new THREE.ConeGeometry(1, 2.5, 8);
        const finMaterial = new THREE.MeshPhongMaterial({
            color: 0x2d3748, // 深色鳍
            shininess: 70
        });
        const dorsalFin = new THREE.Mesh(dorsalGeometry, finMaterial);
        dorsalFin.position.set(0.5, 2.2, 0);
        dorsalFin.rotation.x = Math.PI;
        dorsalFin.rotation.z = -Math.PI / 24; // Slight backward tilt
        group.add(dorsalFin);
        
        // Second dorsal fin (smaller)
        const secondDorsalGeometry = new THREE.ConeGeometry(0.5, 1.2, 6);
        const secondDorsal = new THREE.Mesh(secondDorsalGeometry, finMaterial);
        secondDorsal.position.set(-2.5, 1.5, 0);
        secondDorsal.rotation.x = Math.PI;
        group.add(secondDorsal);
        
        // Tail fin - asymmetric design (upper lobe larger)
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
        
        // Pectoral fins - long and pointed triangular
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
        
        // Ventral fins
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
        
        // Anal fin
        const analFin = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.8, 6), finMaterial);
        analFin.position.set(-2.8, -1.1, 0);
        analFin.rotation.x = Math.PI;
        group.add(analFin);
        
        // Gill slits - shark characteristic
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
            
            // Gills on the other side
            const gillR = gill.clone();
            gillR.position.z = -1.4;
            gillR.rotation.y = -Math.PI / 2;
            group.add(gillR);
        }
        
        // Store fin references for animation
        group.userData.fins = {
            tail: tailUpper,
            tailLower: tailLower,
            pectoralL: pectoralL,
            pectoralR: pectoralR,
            dorsal: dorsalFin
        };
        
        // Educational label data
        group.userData.species = {
            name: "Great White Shark",
            englishName: "Great White Shark",
            photo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMDA0NDY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMzAiIGZpbGw9IiM4N0NFRUIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCI+R3JlYXQgV2hpdGUgU2hhcms8L3RleHQ+CjxlbGxpcHNlIGN4PSIxNTAiIGN5PSIxMDAiIHJ4PSI4MCIgcnk9IjMwIiBmaWxsPSIjNzc3Nzc3Ii8+CjxlbGxpcHNlIGN4PSIxNTAiIGN5PSIxMTAiIHJ4PSI2MCIgcnk9IjIwIiBmaWxsPSIjRkZGRkZGIi8+Cjx0cmlhbmdsZSBjeD0iMjMwIiBjeT0iMTAwIiByPSIyMCIgZmlsbD0iIzc3Nzc3NyIvPgo8Y2lyY2xlIGN4PSIxMzAiIGN5PSI5MCIgcj0iNSIgZmlsbD0iIzAwMDAwMCIvPgo8cGF0aCBkPSJNMTIwIDEwNSBMMTgwIDEwNSBMMTgwIDExNSBMMTIwIDExNSBaIiBmaWxsPSIjMzMzMzMzIi8+Cjwvc3ZnPgo=",
            facts: [
                "Top ocean predator",
                "Body length up to 6 meters",
                "Has about 300 teeth",
                "Swimming speed up to 56 km/h",
                "Important for marine ecosystem balance",
                "Actually rarely attacks humans"
            ]
        };
        
        return group;
    }
    
    createCapeReefFish() {
        const fishTypes = [
            { 
                name: 'Yellowtail', 
                englishName: 'Yellowtail', 
                primaryColor: 0xFFD700, 
                secondaryColor: 0xFFA500,
                stripColor: 0xFF8C00,
                size: 0.8,
                pattern: 'stripes'
            },
            { 
                name: 'Roman', 
                englishName: 'Roman', 
                primaryColor: 0xFF6347, 
                secondaryColor: 0xFFB6C1,
                stripColor: 0x8B0000,
                size: 0.6,
                pattern: 'spots'
            },
            { 
                name: 'Hottentot', 
                englishName: 'Hottentot', 
                primaryColor: 0x4169E1, 
                secondaryColor: 0x87CEEB,
                stripColor: 0x000080,
                size: 0.5,
                pattern: 'bands'
            },
            { 
                name: 'Steentjie', 
                englishName: 'Steentjie', 
                primaryColor: 0x32CD32, 
                secondaryColor: 0x98FB98,
                stripColor: 0x006400,
                size: 0.4,
                pattern: 'gradient'
            },
            {
                name: 'Angelfish',
                englishName: 'Angelfish',
                primaryColor: 0xFF69B4,
                secondaryColor: 0xFFB6C1,
                stripColor: 0x8B008B,
                size: 0.7,
                pattern: 'stripes'
            },
            {
                name: 'Butterflyfish',
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
            
            fish.userData.speed = 0.02 + Math.random() * 0.03; // Significantly reduce coral fish speed
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
        
        // More realistic fish body - adjust shape based on fish type
        let bodyGeometry;
        if (fishType.pattern === 'eyespot') {
            // Butterflyfish - taller and rounder
            bodyGeometry = new THREE.SphereGeometry(size, 12, 10);
            bodyGeometry.scale(1.2, 1.4, 1);
        } else if (fishType.englishName === 'Angelfish') {
            // Angelfish - triangular body
            bodyGeometry = new THREE.SphereGeometry(size, 12, 10);
            bodyGeometry.scale(1.3, 1.6, 0.8);
        } else {
            // Standard fish shape
            bodyGeometry = new THREE.SphereGeometry(size, 12, 10);
            bodyGeometry.scale(1.6, 1.1, 1);
        }
        
        // Primary color
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: fishType.primaryColor,
            shininess: 90,
            specular: 0x444444
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        group.add(body);
        
        // Add patterns
        this.addFishPattern(group, fishType, size);
        
        // More realistic tail fin
        let tailGeometry;
        if (fishType.englishName === 'Angelfish') {
            // Angelfish fan-shaped tail fin
            tailGeometry = new THREE.ConeGeometry(size * 0.6, size * 1.2, 8);
        } else {
            // Standard forked tail fin
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
        
        // Dorsal fin
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
        
        // Ventral fins
        const ventralFin = new THREE.Mesh(
            new THREE.ConeGeometry(size * 0.2, size * 0.6, 5), 
            dorsalMaterial
        );
        ventralFin.position.set(0, -size * 0.8, 0);
        ventralFin.rotation.x = Math.PI;
        group.add(ventralFin);
        
        // Pectoral fins
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
        
        // Large eyes - child-friendly
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
        
        // Pupils
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
        
        // Mouth
        const mouthGeometry = new THREE.SphereGeometry(size * 0.08, 6, 4);
        const mouthMaterial = new THREE.MeshPhongMaterial({
            color: 0x333333,
            shininess: 60
        });
        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouth.position.set(size * 1.1, size * 0.1, 0);
        mouth.scale.set(1, 0.5, 1);
        group.add(mouth);
        
        // Store references
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
                // Vertical stripes
                for (let i = 0; i < 4; i++) {
                    const stripeGeometry = new THREE.PlaneGeometry(size * 0.1, size * 1.5);
                    const stripe = new THREE.Mesh(stripeGeometry, patternMaterial);
                    stripe.position.set(size * (0.8 - i * 0.4), 0, size * 1.01);
                    group.add(stripe);
                }
                break;
                
            case 'spots':
                // Circular dot pattern
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
                // Horizontal stripes
                for (let i = 0; i < 3; i++) {
                    const bandGeometry = new THREE.TorusGeometry(size * 0.8, size * 0.08, 6, 16);
                    const band = new THREE.Mesh(bandGeometry, patternMaterial);
                    band.position.set(size * (0.5 - i * 0.3), 0, 0);
                    band.rotation.y = Math.PI / 2;
                    group.add(band);
                }
                break;
                
            case 'eyespot':
                // Eye spots (butterflyfish characteristic)
                const eyespotGeometry = new THREE.SphereGeometry(size * 0.3, 12, 8);
                const eyespotMaterial = new THREE.MeshPhongMaterial({
                    color: 0x000000,
                    shininess: 70
                });
                const eyespot = new THREE.Mesh(eyespotGeometry, eyespotMaterial);
                eyespot.position.set(-size * 0.5, size * 0.3, size * 0.95);
                eyespot.scale.set(1, 1, 0.1);
                group.add(eyespot);
                
                // White dot in center of eye spot
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
                "Fast swimmers",
                "Group feeding behavior",
                "Carnivorous fish",
                "Can grow up to 1 meter"
            ],
            'Roman': [
                "Brightly colored",
                "Coral reef inhabitants",
                "Omnivorous diet",
                "Peaceful temperament"
            ],
            'Hottentot': [
                "Beautiful blue stripes",
                "Common in rocky reefs",
                "Feeds on small crustaceans",
                "Endemic to South Africa"
            ],
            'Steentjie': [
                "Green camouflage coloring",
                "Hides among rocks",
                "Feeds on algae",
                "Small bottom-dwelling fish"
            ],
            'Angelfish': [
                "Flat body like an angel",
                "Brilliant colors",
                "Coral reef cleaners",
                "Monogamous mating"
            ],
            'Butterflyfish': [
                "Eye spots confuse predators",
                "Long snout perfect for feeding",
                "Specialized coral feeders",
                "Swim in pairs"
            ]
        };
        
        return facts[englishName] || ["Beautiful coral reef fish"];
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
            
            // Initialize natural swimming data
            if (!sealData.naturalSwim) {
                sealData.naturalSwim = {
                    baseSpeed: 0.010 + Math.random() * 0.005, // Slow movement
                    currentSpeed: 0,
                    targetDirection: sealData.direction.clone(),
                    currentDirection: sealData.direction.clone(),
                    swimPhase: Math.random() * Math.PI * 2,
                    lastDirectionChange: 0,
                    directionChangeInterval: 5000 + Math.random() * 8000, // Change direction every 5-13 seconds
                    breathingTimer: Math.random() * 20000, // Breathing timer
                    playTimer: Math.random() * 30000, // Play timer
                    currentDepth: seal.position.y
                };
            }
            
            const naturalSwim = sealData.naturalSwim;
            const time = performance.now();
            
            // Check if swimming direction needs to change
            if (time - naturalSwim.lastDirectionChange > naturalSwim.directionChangeInterval) {
                naturalSwim.lastDirectionChange = time;
                naturalSwim.directionChangeInterval = 5000 + Math.random() * 8000;
                
                // Generate new target direction (smooth turning)
                const currentAngle = Math.atan2(naturalSwim.currentDirection.z, naturalSwim.currentDirection.x);
                const turnAngle = (Math.random() - 0.5) * Math.PI * 0.5; // Maximum 45 degree turn
                const newAngle = currentAngle + turnAngle;
                
                naturalSwim.targetDirection.set(
                    Math.cos(newAngle),
                    (Math.random() - 0.5) * 0.4, // More vertical variation
                    Math.sin(newAngle)
                ).normalize();
            }
            
            // Simple breathing behavior
            naturalSwim.breathingTimer -= deltaTime * 1000;
            if (naturalSwim.breathingTimer <= 0) {
                naturalSwim.breathingTimer = 15000 + Math.random() * 10000; // Breathe every 15-25 seconds
                if (seal.position.y < 2) {
                    naturalSwim.targetDirection.y = 0.6; // Surface to breathe
                } else {
                    naturalSwim.targetDirection.y = -0.4; // Dive down
                }
            }
            
            // 偶尔的玩耍行为（非常轻微）
            naturalSwim.playTimer -= deltaTime * 1000;
            if (naturalSwim.playTimer <= 0) {
                naturalSwim.playTimer = 25000 + Math.random() * 15000; // 25-40秒玩耍一次
                // 只是稍微改变方向，不做剧烈动作
                const playDirection = new THREE.Vector3(
                    (Math.random() - 0.5) * 0.3,
                    (Math.random() - 0.5) * 0.2,
                    (Math.random() - 0.5) * 0.3
                ).normalize();
                naturalSwim.targetDirection.lerp(playDirection, 0.3);
            }
            
            // 平滑插值到目标方向
            naturalSwim.currentDirection.lerp(naturalSwim.targetDirection, 0.015);
            naturalSwim.currentDirection.normalize();
            
            // Smooth speed changes
            const targetSpeed = naturalSwim.baseSpeed * (0.6 + Math.sin(naturalSwim.swimPhase) * 0.4);
            naturalSwim.currentSpeed = THREE.MathUtils.lerp(naturalSwim.currentSpeed, targetSpeed, 0.04);
            naturalSwim.swimPhase += deltaTime * 1.8;
            
            // 应用移动
            const moveVector = naturalSwim.currentDirection.clone().multiplyScalar(naturalSwim.currentSpeed);
            seal.position.add(moveVector);
            
            // Smooth orientation toward movement direction
            const lookAtTarget = seal.position.clone().add(naturalSwim.currentDirection);
            seal.lookAt(lookAtTarget);
            
            // 鳍状肢动画（更慢更自然）
            const swimTime = time * 0.002; // 很慢的游泳频率
            const flippers = sealData.flippers;
            if (flippers) {
                const swimIntensity = naturalSwim.currentSpeed * 20; // 根据速度调整动画强度
                flippers.frontL.rotation.z = Math.sin(swimTime * 3) * 0.3 * swimIntensity;
                flippers.frontR.rotation.z = -Math.sin(swimTime * 3) * 0.3 * swimIntensity;
                flippers.backL.rotation.y = Math.PI / 4 + Math.sin(swimTime * 4) * 0.2 * swimIntensity;
                flippers.backR.rotation.y = -Math.PI / 4 - Math.sin(swimTime * 4) * 0.2 * swimIntensity;
            }
            
            // Boundary control（慢速返回）
            if (seal.position.length() > 90) {
                const returnDirection = seal.position.clone().negate().normalize();
                naturalSwim.targetDirection.lerp(returnDirection, 0.08);
            }
            
            // 深度限制
            seal.position.y = THREE.MathUtils.clamp(seal.position.y, -15, 8);
        });
    }
    
    updateAfricanPenguins(deltaTime) {
        this.africanPenguins.forEach(penguin => {
            const penguinData = penguin.userData;
            
            // Initialize natural swimming data
            if (!penguinData.naturalSwim) {
                penguinData.naturalSwim = {
                    baseSpeed: 0.015 + Math.random() * 0.005, // 慢速移动
                    currentSpeed: 0,
                    targetDirection: penguinData.direction.clone(),
                    currentDirection: penguinData.direction.clone(),
                    swimPhase: Math.random() * Math.PI * 2,
                    lastDirectionChange: 0,
                    directionChangeInterval: 4000 + Math.random() * 6000, // 4-10秒改变方向
                    divePhase: Math.random() * Math.PI * 2,
                    surfaceTimer: Math.random() * 15000
                };
            }
            
            const naturalSwim = penguinData.naturalSwim;
            const time = performance.now();
            
            // Check if swimming direction needs to change 
            if (time - naturalSwim.lastDirectionChange > naturalSwim.directionChangeInterval) {
                naturalSwim.lastDirectionChange = time;
                naturalSwim.directionChangeInterval = 4000 + Math.random() * 6000;
                
                // Generate new target direction (smooth turning)
                const currentAngle = Math.atan2(naturalSwim.currentDirection.z, naturalSwim.currentDirection.x);
                const turnAngle = (Math.random() - 0.5) * Math.PI * 0.4; // Maximum 36 degree turn
                const newAngle = currentAngle + turnAngle;
                
                naturalSwim.targetDirection.set(
                    Math.cos(newAngle),
                    (Math.random() - 0.5) * 0.3, // 轻微的垂直变化
                    Math.sin(newAngle)
                ).normalize();
            }
            
            // 平滑插值到目标方向
            naturalSwim.currentDirection.lerp(naturalSwim.targetDirection, 0.02);
            naturalSwim.currentDirection.normalize();
            
            // 简单的浮潜行为
            naturalSwim.surfaceTimer -= deltaTime * 1000;
            if (naturalSwim.surfaceTimer <= 0) {
                naturalSwim.surfaceTimer = 12000 + Math.random() * 8000; // 12-20秒浮潜一次
                if (penguin.position.y > -3) {
                    naturalSwim.targetDirection.y = -0.4; // Dive down
                } else {
                    naturalSwim.targetDirection.y = 0.3; // 上浮
                }
            }
            
            // Smooth speed changes
            const targetSpeed = naturalSwim.baseSpeed * (0.8 + Math.sin(naturalSwim.swimPhase) * 0.2);
            naturalSwim.currentSpeed = THREE.MathUtils.lerp(naturalSwim.currentSpeed, targetSpeed, 0.05);
            naturalSwim.swimPhase += deltaTime * 2;
            
            // 应用移动
            const moveVector = naturalSwim.currentDirection.clone().multiplyScalar(naturalSwim.currentSpeed);
            penguin.position.add(moveVector);
            
            // Smooth orientation toward movement direction
            const lookAtTarget = penguin.position.clone().add(naturalSwim.currentDirection);
            penguin.lookAt(lookAtTarget);
            
            // 翅膀拍打动画（更慢更自然）
            const swimTime = time * 0.003; // 很慢的拍打频率
            const flippers = penguinData.flippers;
            if (flippers) {
                const flapIntensity = naturalSwim.currentSpeed * 15; // 根据速度调整拍打强度
                flippers.left.rotation.z = Math.sin(swimTime * 4) * 0.4 * flapIntensity;
                flippers.right.rotation.z = -Math.sin(swimTime * 4) * 0.4 * flapIntensity;
            }
            
            // Boundary control（慢速返回）
            if (penguin.position.length() > 80) {
                const returnDirection = penguin.position.clone().negate().normalize();
                naturalSwim.targetDirection.lerp(returnDirection, 0.05);
            }
            
            // 深度限制
            penguin.position.y = THREE.MathUtils.clamp(penguin.position.y, -20, 8);
        });
    }
    
    updateGreatWhiteSharks(deltaTime) {
        this.greatWhiteSharks.forEach(shark => {
            const sharkData = shark.userData;
            
            // Initialize natural swimming data
            if (!sharkData.naturalSwim) {
                sharkData.naturalSwim = {
                    baseSpeed: 0.012 + Math.random() * 0.008, // 慢速移动
                    currentSpeed: 0,
                    targetDirection: sharkData.direction.clone(),
                    currentDirection: sharkData.direction.clone(),
                    swimPhase: Math.random() * Math.PI * 2,
                    lastDirectionChange: 0,
                    directionChangeInterval: 6000 + Math.random() * 10000, // 6-16秒改变方向，很慢
                    patrolRadius: 40 + Math.random() * 30,
                    patrolCenter: shark.position.clone(),
                    huntingCooldown: 0
                };
            }
            
            const naturalSwim = sharkData.naturalSwim;
            const time = performance.now();
            
            // 简化的章鱼检测（减少攻击性）
            const distanceToOctopus = shark.position.distanceTo(this.octopusPosition);
            const isOctopusNear = distanceToOctopus < 15; // 更近才检测
            
            // 冷却时间管理
            if (naturalSwim.huntingCooldown > 0) {
                naturalSwim.huntingCooldown -= deltaTime * 1000;
            }
            
            // Check if swimming direction needs to change
            if (time - naturalSwim.lastDirectionChange > naturalSwim.directionChangeInterval) {
                naturalSwim.lastDirectionChange = time;
                naturalSwim.directionChangeInterval = 6000 + Math.random() * 10000;
                
                // 生成新的目标方向（非常缓慢的转向）
                const currentAngle = Math.atan2(naturalSwim.currentDirection.z, naturalSwim.currentDirection.x);
                const turnAngle = (Math.random() - 0.5) * Math.PI * 0.3; // 最大27度转向
                const newAngle = currentAngle + turnAngle;
                
                naturalSwim.targetDirection.set(
                    Math.cos(newAngle),
                    (Math.random() - 0.5) * 0.2, // 轻微的垂直变化
                    Math.sin(newAngle)
                ).normalize();
            }
            
            // 慢速巡游行为 - 围绕中心游泳
            const toCenter = naturalSwim.patrolCenter.clone().sub(shark.position);
            const distanceToCenter = toCenter.length();
            
            if (distanceToCenter > naturalSwim.patrolRadius) {
                // 慢速返回巡游区域
                naturalSwim.targetDirection.lerp(toCenter.normalize(), 0.02);
            } else {
                // 缓慢的圆形巡游
                const tangentDirection = new THREE.Vector3(-toCenter.z, 0, toCenter.x).normalize();
                naturalSwim.targetDirection.lerp(tangentDirection, 0.01);
            }
            
            // 极其缓慢的对章鱼反应（减少干扰性）
            if (isOctopusNear && naturalSwim.huntingCooldown <= 0) {
                const toOctopus = this.octopusPosition.clone().sub(shark.position).normalize();
                naturalSwim.targetDirection.lerp(toOctopus, 0.005); // 极其轻微的跟随
                naturalSwim.huntingCooldown = 5000; // 5秒冷却
            }
            
            // Extremely smooth direction interpolation
            naturalSwim.currentDirection.lerp(naturalSwim.targetDirection, 0.008);
            naturalSwim.currentDirection.normalize();
            
            // Smooth speed changes
            const targetSpeed = naturalSwim.baseSpeed * (0.7 + Math.sin(naturalSwim.swimPhase) * 0.3);
            naturalSwim.currentSpeed = THREE.MathUtils.lerp(naturalSwim.currentSpeed, targetSpeed, 0.03);
            naturalSwim.swimPhase += deltaTime * 1.5;
            
            // 应用移动
            const moveVector = naturalSwim.currentDirection.clone().multiplyScalar(naturalSwim.currentSpeed);
            shark.position.add(moveVector);
            
            // 极其平滑的朝向变化
            const lookAtTarget = shark.position.clone().add(naturalSwim.currentDirection);
            shark.lookAt(lookAtTarget);
            
            // 缓慢的鱼鳍动画
            const swimTime = time * 0.001; // 很慢的摆动频率
            const fins = sharkData.fins;
            if (fins) {
                const swimIntensity = naturalSwim.currentSpeed * 25; // 根据速度调整摆动强度
                fins.tail.rotation.y = Math.sin(swimTime * 5) * 0.2 * swimIntensity;
                fins.pectoralL.rotation.z = Math.PI / 3 + Math.sin(swimTime * 3) * 0.05 * swimIntensity;
                fins.pectoralR.rotation.z = -Math.PI / 3 - Math.sin(swimTime * 3) * 0.05 * swimIntensity;
            }
            
            // 深度限制
            shark.position.y = THREE.MathUtils.clamp(shark.position.y, -18, -3);
        });
    }
    
    updateCapeReefFish(deltaTime) {
        this.capeReefFish.forEach((fish, fishIndex) => {
            const fishData = fish.userData;
            
            // Initialize natural swimming data
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
            
            // Extremely smooth direction interpolation
            naturalSwim.currentDirection.lerp(naturalSwim.targetDirection, 0.01);
            naturalSwim.currentDirection.normalize();
            
            // Simplified avoidance behavior（减少干扰）
            const distanceToOctopus = fish.position.distanceTo(this.octopusPosition);
            let targetSpeed = naturalSwim.baseSpeed;
            
            if (distanceToOctopus < 4) {
                const avoidanceVector = fish.position.clone().sub(this.octopusPosition).normalize();
                naturalSwim.targetDirection.lerp(avoidanceVector, 0.02); // 极其轻微的避让
                targetSpeed = naturalSwim.baseSpeed * 1.2; // 轻微加速
            }
            
            // Smooth speed changes
            naturalSwim.currentSpeed = THREE.MathUtils.lerp(
                naturalSwim.currentSpeed,
                targetSpeed,
                0.03
            );
            
            // Simplified swimming rhythm
            naturalSwim.swimPhase += deltaTime * 1.5;
            const rhythmFactor = 0.8 + Math.sin(naturalSwim.swimPhase) * 0.2;
            const finalSpeed = naturalSwim.currentSpeed * rhythmFactor;
            
            // Slow movement
            const moveVector = naturalSwim.currentDirection.clone().multiplyScalar(finalSpeed);
            fish.position.add(moveVector);
            
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
            
            // Update original data to maintain compatibility
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