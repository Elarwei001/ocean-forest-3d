/**
 * ProceduralModelGenerator - Advanced procedural 3D model generation
 * Uses reference photos and biological parameters to create realistic marine life
 */

class ProceduralModelGenerator {
    constructor() {
        this.generatedModels = new Map();
        this.biologyDatabase = new Map();
        this.morphologyTemplates = new Map();
        
        // Generation parameters
        this.qualityLevels = {
            preview: { segments: 16, detail: 0.3, texRes: 256 },
            standard: { segments: 32, detail: 0.7, texRes: 512 },
            high: { segments: 64, detail: 1.0, texRes: 1024 }
        };
        
        this.initializeBiologyDatabase();
        this.initializeMorphologyTemplates();
    }

    /**
     * Generate 3D model using procedural techniques guided by reference photos
     * @param {Array<string>} referenceImages - Reference photos of the species
     * @param {string} speciesName - Scientific or common name
     * @param {Object} biologicalParams - Biological parameters
     * @param {string} quality - Quality level
     * @returns {Promise<THREE.Group>} - Generated 3D model with animations
     */
    async generateFromReferences(referenceImages, speciesName, biologicalParams = {}, quality = 'standard') {
        console.log(`Generating procedural model for ${speciesName}...`);
        
        try {
            // Analyze reference images
            const analysis = await this.analyzeReferenceImages(referenceImages);
            
            // Extract biological parameters
            const bioParams = this.extractBiologicalParameters(analysis, biologicalParams, speciesName);
            
            // Generate base morphology
            const baseMesh = this.generateBaseMorphology(bioParams, quality);
            
            // Add anatomical details
            const detailedMesh = this.addAnatomicalDetails(baseMesh, bioParams, analysis);
            
            // Generate texture from references
            const texturedMesh = await this.generateProceduralTexture(detailedMesh, analysis, bioParams);
            
            // Add species-specific features
            const enhancedMesh = this.addSpeciesFeatures(texturedMesh, speciesName, bioParams);
            
            // Generate animation system
            const animatedModel = this.generateAnimationSystem(enhancedMesh, bioParams);
            
            // Create complete model group
            const completeModel = this.assembleCompleteModel(animatedModel, bioParams);
            
            // Cache the result
            this.generatedModels.set(speciesName, completeModel);
            
            console.log(`Procedural model generated successfully for ${speciesName}`);
            return completeModel;
            
        } catch (error) {
            console.error(`Procedural generation failed for ${speciesName}:`, error);
            return this.generateBasicFallback(speciesName);
        }
    }

    /**
     * Initialize biological parameter database
     */
    initializeBiologyDatabase() {
        // South African marine species data
        this.biologyDatabase.set('yellowtail', {
            family: 'Carangidae',
            bodyShape: 'fusiform',
            maxLength: 1.2,
            aspectRatio: 5.5,
            finConfiguration: 'standard_pelagic',
            coloration: 'silver_yellow',
            scales: 'small_cycloid',
            locomotion: 'fast_cruise',
            habitat: 'pelagic'
        });
        
        this.biologyDatabase.set('hottentot', {
            family: 'Sparidae',
            bodyShape: 'compressed',
            maxLength: 0.5,
            aspectRatio: 2.8,
            finConfiguration: 'reef_fish',
            coloration: 'silver_gray',
            scales: 'medium_ctenoid',
            locomotion: 'hovering',
            habitat: 'reef'
        });
        
        this.biologyDatabase.set('steentjie', {
            family: 'Sparidae',
            bodyShape: 'deep_compressed',
            maxLength: 0.3,
            aspectRatio: 2.2,
            finConfiguration: 'reef_fish',
            coloration: 'brown_bronze',
            scales: 'small_ctenoid',
            locomotion: 'maneuvering',
            habitat: 'rocky_reef'
        });
        
        this.biologyDatabase.set('great_white_shark', {
            family: 'Lamnidae',
            bodyShape: 'torpedo',
            maxLength: 6.0,
            aspectRatio: 8.0,
            finConfiguration: 'shark',
            coloration: 'countershaded',
            scales: 'placoid',
            locomotion: 'ram_ventilation',
            habitat: 'pelagic_coastal'
        });
        
        this.biologyDatabase.set('cape_fur_seal', {
            family: 'Otariidae',
            bodyShape: 'fusiform_mammal',
            maxLength: 2.3,
            aspectRatio: 4.5,
            finConfiguration: 'pinniped',
            coloration: 'brown_gray',
            scales: 'fur',
            locomotion: 'aquatic_mammal',
            habitat: 'coastal'
        });
    }

    /**
     * Initialize morphological templates for different body shapes
     */
    initializeMorphologyTemplates() {
        // Fusiform fish template (tuna-like)
        this.morphologyTemplates.set('fusiform', {
            profileCurve: this.createFusiformProfile(),
            crossSectionCurve: this.createCircularCrossSection(),
            finPlacements: this.getStandardFinPlacements(),
            headShape: 'pointed',
            tailShape: 'lunate'
        });
        
        // Compressed fish template (typical reef fish)
        this.morphologyTemplates.set('compressed', {
            profileCurve: this.createCompressedProfile(),
            crossSectionCurve: this.createCompressedCrossSection(),
            finPlacements: this.getReefFinPlacements(),
            headShape: 'rounded',
            tailShape: 'forked'
        });
        
        // Torpedo shape template (sharks)
        this.morphologyTemplates.set('torpedo', {
            profileCurve: this.createTorpedoProfile(),
            crossSectionCurve: this.createTorpedoCrossSection(),
            finPlacements: this.getSharkFinPlacements(),
            headShape: 'conical',
            tailShape: 'heterocercal'
        });
        
        // Mammalian fusiform (seals, dolphins)
        this.morphologyTemplates.set('fusiform_mammal', {
            profileCurve: this.createMammalProfile(),
            crossSectionCurve: this.createMammalCrossSection(),
            finPlacements: this.getMammalFinPlacements(),
            headShape: 'mammalian',
            tailShape: 'mammalian'
        });
    }

    /**
     * Analyze reference images to extract morphological data
     */
    async analyzeReferenceImages(imageUrls) {
        const analysis = {
            colorPalette: [],
            morphology: {},
            features: [],
            texture: null
        };
        
        for (const url of imageUrls) {
            try {
                const image = await this.loadImage(url);
                
                // Extract color information
                const colors = this.extractColorPalette(image);
                analysis.colorPalette.push(...colors);
                
                // Analyze shape and proportions
                const morphology = this.analyzeMorphology(image);
                analysis.morphology = this.mergeMorphologyData(analysis.morphology, morphology);
                
                // Detect special features
                const features = this.detectSpecialFeatures(image);
                analysis.features.push(...features);
                
                // Create composite texture
                analysis.texture = this.createCompositeTexture(analysis.texture, image);
                
            } catch (error) {
                console.warn(`Failed to analyze reference image: ${url}`, error);
            }
        }
        
        // Process and clean analysis data
        analysis.colorPalette = this.consolidateColorPalette(analysis.colorPalette);
        analysis.morphology = this.finalizeMorphologyData(analysis.morphology);
        
        return analysis;
    }

    /**
     * Extract biological parameters from analysis and database
     */
    extractBiologicalParameters(analysis, userParams, speciesName) {
        const dbParams = this.biologyDatabase.get(speciesName.toLowerCase()) || {};
        
        return {
            ...dbParams,
            ...userParams,
            analyzedMorphology: analysis.morphology,
            colorData: analysis.colorPalette,
            detectedFeatures: analysis.features
        };
    }

    /**
     * Generate base morphology using procedural techniques
     */
    generateBaseMorphology(bioParams, quality) {
        const settings = this.qualityLevels[quality];
        const template = this.morphologyTemplates.get(bioParams.bodyShape) || 
                        this.morphologyTemplates.get('fusiform');
        
        // Create body geometry using spline-based approach
        const bodyGeometry = this.createSplineBasedBody(
            template.profileCurve,
            template.crossSectionCurve,
            bioParams.aspectRatio,
            settings.segments
        );
        
        // Scale to appropriate size
        const scale = bioParams.maxLength || 1.0;
        bodyGeometry.scale(scale, scale, scale);
        
        // Create base mesh
        const material = new THREE.MeshStandardMaterial({
            color: 0x808080,
            metalness: 0.1,
            roughness: 0.8
        });
        
        const bodyMesh = new THREE.Mesh(bodyGeometry, material);
        bodyMesh.userData.bioParams = bioParams;
        bodyMesh.userData.template = template;
        
        return bodyMesh;
    }

    /**
     * Add anatomical details like fins, eyes, gills
     */
    addAnatomicalDetails(baseMesh, bioParams, analysis) {
        const group = new THREE.Group();
        group.add(baseMesh);
        
        const template = baseMesh.userData.template;
        const scale = bioParams.maxLength || 1.0;
        
        // Add fins based on fin configuration
        const fins = this.generateFins(bioParams.finConfiguration, scale, bioParams);
        fins.forEach(fin => group.add(fin));
        
        // Add head details
        const headDetails = this.generateHeadDetails(template.headShape, scale, bioParams);
        headDetails.forEach(detail => group.add(detail));
        
        // Add eyes
        const eyes = this.generateEyes(bioParams, scale);
        eyes.forEach(eye => group.add(eye));
        
        // Add gills (for fish)
        if (bioParams.family !== 'Otariidae') { // Not mammals
            const gills = this.generateGills(bioParams, scale);
            gills.forEach(gill => group.add(gill));
        }
        
        // Add special features detected in analysis
        const specialFeatures = this.generateSpecialFeatures(analysis.detectedFeatures, scale);
        specialFeatures.forEach(feature => group.add(feature));
        
        return group;
    }

    /**
     * Generate procedural texture from reference analysis
     */
    async generateProceduralTexture(mesh, analysis, bioParams) {
        const textureSize = this.qualityLevels.standard.texRes;
        
        // Create base texture canvas
        const canvas = document.createElement('canvas');
        canvas.width = textureSize;
        canvas.height = textureSize;
        const ctx = canvas.getContext('2d');
        
        // Generate base color pattern
        this.generateBaseColorPattern(ctx, analysis.colorPalette, bioParams);
        
        // Add scale texture
        if (bioParams.scales !== 'fur') {
            this.addScaleTexture(ctx, bioParams.scales, textureSize);
        } else {
            this.addFurTexture(ctx, textureSize);
        }
        
        // Add color variations and patterns
        this.addColorPatterns(ctx, analysis.colorPalette, bioParams);
        
        // Add surface details
        this.addSurfaceDetails(ctx, bioParams, textureSize);
        
        // Create Three.js texture
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        
        // Generate additional maps
        const normalMap = this.generateNormalMapFromTexture(canvas);
        const roughnessMap = this.generateRoughnessMapFromTexture(canvas, bioParams);
        
        // Apply to all meshes in the group
        mesh.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.map = texture;
                child.material.normalMap = normalMap;
                child.material.roughnessMap = roughnessMap;
                child.material.needsUpdate = true;
            }
        });
        
        return mesh;
    }

    /**
     * Add species-specific features and characteristics
     */
    addSpeciesFeatures(mesh, speciesName, bioParams) {
        const species = speciesName.toLowerCase();
        
        // Apply species-specific modifications
        if (species.includes('yellowtail')) {
            this.addYellowtailFeatures(mesh, bioParams);
        } else if (species.includes('hottentot')) {
            this.addHottentotFeatures(mesh, bioParams);
        } else if (species.includes('steentjie')) {
            this.addSteentjieFeatures(mesh, bioParams);
        } else if (species.includes('shark')) {
            this.addSharkFeatures(mesh, bioParams);
        } else if (species.includes('seal')) {
            this.addSealFeatures(mesh, bioParams);
        }
        
        return mesh;
    }

    /**
     * Generate animation system for the model
     */
    generateAnimationSystem(mesh, bioParams) {
        const animationGroup = new THREE.Group();
        animationGroup.add(mesh);
        
        // Create animation mixer
        const mixer = new THREE.AnimationMixer(animationGroup);
        
        // Generate swimming animation
        const swimAnimation = this.generateSwimAnimation(mesh, bioParams);
        const swimAction = mixer.clipAction(swimAnimation);
        
        // Generate fin animation
        const finAnimation = this.generateFinAnimation(mesh, bioParams);
        const finAction = mixer.clipAction(finAnimation);
        
        // Store animation data
        animationGroup.userData.mixer = mixer;
        animationGroup.userData.animations = {
            swim: swimAction,
            fins: finAction
        };
        
        // Set up automatic animation
        swimAction.play();
        finAction.play();
        
        return animationGroup;
    }

    /**
     * Assemble complete model with all components
     */
    assembleCompleteModel(animatedModel, bioParams) {
        const completeModel = new THREE.Group();
        completeModel.add(animatedModel);
        
        // Add bounding box for collision detection
        const bbox = new THREE.Box3().setFromObject(animatedModel);
        completeModel.userData.boundingBox = bbox;
        
        // Add metadata
        completeModel.userData.species = bioParams.family;
        completeModel.userData.locomotion = bioParams.locomotion;
        completeModel.userData.habitat = bioParams.habitat;
        completeModel.userData.maxLength = bioParams.maxLength;
        
        // Add LOD system
        const lodSystem = this.createLODSystem(completeModel);
        
        return lodSystem;
    }

    // Morphology creation methods
    createFusiformProfile() {
        // Create a fusiform (torpedo-shaped) profile curve
        const points = [];
        for (let i = 0; i <= 20; i++) {
            const t = i / 20;
            const x = t * 2 - 1; // -1 to 1
            const y = Math.sin(Math.PI * t) * 0.3; // Bell curve
            points.push(new THREE.Vector2(x, y));
        }
        return new THREE.SplineCurve(points);
    }

    createCompressedProfile() {
        // Create a laterally compressed fish profile
        const points = [];
        for (let i = 0; i <= 20; i++) {
            const t = i / 20;
            const x = t * 2 - 1;
            const y = Math.sin(Math.PI * t) * 0.5; // Taller than fusiform
            points.push(new THREE.Vector2(x, y));
        }
        return new THREE.SplineCurve(points);
    }

    createTorpedoProfile() {
        // Create a shark-like torpedo profile
        const points = [];
        for (let i = 0; i <= 20; i++) {
            const t = i / 20;
            const x = t * 2 - 1;
            // Asymmetric profile with pointed head
            const y = Math.pow(Math.sin(Math.PI * t), 0.7) * 0.25;
            points.push(new THREE.Vector2(x, y));
        }
        return new THREE.SplineCurve(points);
    }

    createMammalProfile() {
        // Create a marine mammal profile
        const points = [];
        for (let i = 0; i <= 20; i++) {
            const t = i / 20;
            const x = t * 2 - 1;
            const y = Math.sin(Math.PI * t) * 0.35; // Slightly compressed
            points.push(new THREE.Vector2(x, y));
        }
        return new THREE.SplineCurve(points);
    }

    createCircularCrossSection() {
        // Create circular cross-section for round fish
        const points = [];
        for (let i = 0; i <= 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const x = Math.cos(angle) * 0.5;
            const y = Math.sin(angle) * 0.5;
            points.push(new THREE.Vector2(x, y));
        }
        return new THREE.SplineCurve(points);
    }

    createCompressedCrossSection() {
        // Create laterally compressed cross-section
        const points = [];
        for (let i = 0; i <= 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const x = Math.cos(angle) * 0.3; // Narrower
            const y = Math.sin(angle) * 0.6; // Taller
            points.push(new THREE.Vector2(x, y));
        }
        return new THREE.SplineCurve(points);
    }

    createTorpedoCrossSection() {
        // Create torpedo cross-section
        return this.createCircularCrossSection(); // Similar to circular but optimized
    }

    createMammalCrossSection() {
        // Create mammalian cross-section
        const points = [];
        for (let i = 0; i <= 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const x = Math.cos(angle) * 0.45;
            const y = Math.sin(angle) * 0.4; // Slightly flattened
            points.push(new THREE.Vector2(x, y));
        }
        return new THREE.SplineCurve(points);
    }

    // Fin placement configurations
    getStandardFinPlacements() {
        return {
            dorsal: { position: [0, 0.3, 0.1], size: 1.0 },
            anal: { position: [0, -0.3, 0.2], size: 0.7 },
            pectoral: { position: [0.15, 0, 0.6], size: 0.8 },
            pelvic: { position: [0.1, -0.2, 0.3], size: 0.5 },
            caudal: { position: [0, 0, -0.9], size: 1.2 }
        };
    }

    getReefFinPlacements() {
        return {
            dorsal: { position: [0, 0.4, 0.0], size: 1.2 },
            anal: { position: [0, -0.3, 0.1], size: 0.9 },
            pectoral: { position: [0.2, 0, 0.5], size: 1.0 },
            pelvic: { position: [0.15, -0.25, 0.2], size: 0.7 },
            caudal: { position: [0, 0, -0.8], size: 1.0 }
        };
    }

    getSharkFinPlacements() {
        return {
            dorsal1: { position: [0, 0.3, 0.2], size: 1.5 },
            dorsal2: { position: [0, 0.2, -0.3], size: 0.8 },
            anal: { position: [0, -0.2, -0.2], size: 0.6 },
            pectoral: { position: [0.2, -0.1, 0.4], size: 1.3 },
            pelvic: { position: [0.1, -0.15, 0.0], size: 0.7 },
            caudal: { position: [0, 0, -0.9], size: 2.0 }
        };
    }

    getMammalFinPlacements() {
        return {
            dorsal: { position: [0, 0.2, 0.0], size: 0.8 },
            pectoral: { position: [0.3, 0, 0.3], size: 1.5 },
            caudal: { position: [0, 0, -0.9], size: 1.8 }
        };
    }

    // Helper methods
    createSplineBasedBody(profileCurve, crossSectionCurve, aspectRatio, segments) {
        // Create geometry by sweeping cross-section along profile
        const geometry = new THREE.BufferGeometry();
        
        const profilePoints = profileCurve.getPoints(segments);
        const crossSectionPoints = crossSectionCurve.getPoints(16);
        
        const vertices = [];
        const indices = [];
        const uvs = [];
        
        // Generate vertices
        for (let i = 0; i < profilePoints.length; i++) {
            const profilePoint = profilePoints[i];
            const scale = profilePoint.y;
            
            for (let j = 0; j < crossSectionPoints.length; j++) {
                const crossPoint = crossSectionPoints[j];
                
                const x = crossPoint.x * scale;
                const y = crossPoint.y * scale;
                const z = profilePoint.x * aspectRatio;
                
                vertices.push(x, y, z);
                uvs.push(i / (profilePoints.length - 1), j / (crossSectionPoints.length - 1));
            }
        }
        
        // Generate indices
        for (let i = 0; i < profilePoints.length - 1; i++) {
            for (let j = 0; j < crossSectionPoints.length; j++) {
                const a = i * crossSectionPoints.length + j;
                const b = i * crossSectionPoints.length + ((j + 1) % crossSectionPoints.length);
                const c = (i + 1) * crossSectionPoints.length + j;
                const d = (i + 1) * crossSectionPoints.length + ((j + 1) % crossSectionPoints.length);
                
                indices.push(a, b, c);
                indices.push(b, d, c);
            }
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        
        return geometry;
    }

    generateFins(finConfiguration, scale, bioParams) {
        const fins = [];
        const placements = this.getFinPlacements(finConfiguration);
        
        Object.entries(placements).forEach(([finType, config]) => {
            const fin = this.createSingleFin(finType, config, scale, bioParams);
            fins.push(fin);
        });
        
        return fins;
    }

    createSingleFin(finType, config, scale, bioParams) {
        // Create fin geometry based on type
        let geometry;
        
        switch (finType) {
            case 'dorsal':
            case 'dorsal1':
            case 'dorsal2':
                geometry = this.createDorsalFinGeometry(config.size * scale);
                break;
            case 'caudal':
                geometry = this.createCaudalFinGeometry(config.size * scale, bioParams);
                break;
            case 'pectoral':
                geometry = this.createPectoralFinGeometry(config.size * scale);
                break;
            default:
                geometry = this.createGenericFinGeometry(config.size * scale);
        }
        
        const material = new THREE.MeshStandardMaterial({
            color: 0x888888,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        
        const fin = new THREE.Mesh(geometry, material);
        fin.position.set(...config.position.map(p => p * scale));
        fin.userData.finType = finType;
        
        return fin;
    }

    createDorsalFinGeometry(size) {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(size * 0.3, size);
        shape.lineTo(size * 0.8, size * 0.7);
        shape.lineTo(size, 0);
        shape.lineTo(0, 0);
        
        const geometry = new THREE.ExtrudeGeometry(shape, {
            depth: 0.02,
            bevelEnabled: false
        });
        
        return geometry;
    }

    createCaudalFinGeometry(size, bioParams) {
        // Different tail shapes based on species
        let shape;
        
        if (bioParams.family === 'Lamnidae') { // Sharks
            shape = this.createHeterocercalTail(size);
        } else if (bioParams.locomotion === 'fast_cruise') {
            shape = this.createLunateTail(size);
        } else {
            shape = this.createForkedTail(size);
        }
        
        const geometry = new THREE.ExtrudeGeometry(shape, {
            depth: 0.05,
            bevelEnabled: true,
            bevelThickness: 0.01,
            bevelSize: 0.01
        });
        
        return geometry;
    }

    createPectoralFinGeometry(size) {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(size * 0.8, size * 0.4);
        shape.lineTo(size, size * 0.2);
        shape.lineTo(size * 0.9, -size * 0.2);
        shape.lineTo(size * 0.2, -size * 0.1);
        shape.lineTo(0, 0);
        
        const geometry = new THREE.ExtrudeGeometry(shape, {
            depth: 0.03,
            bevelEnabled: false
        });
        
        return geometry;
    }

    createGenericFinGeometry(size) {
        const geometry = new THREE.ConeGeometry(size * 0.3, size, 8);
        geometry.rotateZ(Math.PI / 2);
        return geometry;
    }

    // Texture generation methods
    generateBaseColorPattern(ctx, colorPalette, bioParams) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        
        // Create gradient based on coloration type
        let gradient;
        
        if (bioParams.coloration === 'countershaded') {
            gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, '#2c3e50'); // Dark top
            gradient.addColorStop(1, '#ecf0f1'); // Light bottom
        } else {
            const primaryColor = colorPalette[0] || '#808080';
            const secondaryColor = colorPalette[1] || '#606060';
            
            gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, primaryColor);
            gradient.addColorStop(1, secondaryColor);
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    addScaleTexture(ctx, scaleType, textureSize) {
        const width = textureSize;
        const height = textureSize;
        
        ctx.globalCompositeOperation = 'multiply';
        
        if (scaleType === 'small_cycloid') {
            this.drawSmallScales(ctx, width, height, 8);
        } else if (scaleType === 'medium_ctenoid') {
            this.drawMediumScales(ctx, width, height, 12);
        } else if (scaleType === 'placoid') {
            this.drawSharkSkin(ctx, width, height);
        }
        
        ctx.globalCompositeOperation = 'source-over';
    }

    drawSmallScales(ctx, width, height, scaleSize) {
        for (let y = 0; y < height; y += scaleSize / 2) {
            for (let x = 0; x < width; x += scaleSize) {
                const offsetX = (y % (scaleSize * 2)) === 0 ? 0 : scaleSize / 2;
                
                ctx.beginPath();
                ctx.arc(x + offsetX, y, scaleSize / 3, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.fill();
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
    }

    drawMediumScales(ctx, width, height, scaleSize) {
        for (let y = 0; y < height; y += scaleSize * 0.8) {
            for (let x = 0; x < width; x += scaleSize) {
                const offsetX = (y % (scaleSize * 2)) === 0 ? 0 : scaleSize / 2;
                
                // Draw scale with ctenoid pattern
                ctx.beginPath();
                ctx.ellipse(x + offsetX, y, scaleSize / 2.5, scaleSize / 3, 0, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.fill();
                
                // Add ctenii (spines)
                for (let i = 0; i < 5; i++) {
                    const angle = (i / 5) * Math.PI * 2;
                    const startX = x + offsetX + Math.cos(angle) * scaleSize / 4;
                    const startY = y + Math.sin(angle) * scaleSize / 4;
                    const endX = startX + Math.cos(angle) * 2;
                    const endY = startY + Math.sin(angle) * 2;
                    
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);
                    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    drawSharkSkin(ctx, width, height) {
        // Draw placoid scales (shark skin texture)
        for (let i = 0; i < 2000; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 3 + 1;
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${Math.floor(Math.random() * 50)}, ${Math.floor(Math.random() * 50)}, ${Math.floor(Math.random() * 50)}, 0.3)`;
            ctx.fill();
        }
    }

    // Utility methods
    async loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    }

    extractColorPalette(image) {
        // Extract dominant colors from image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 100;
        canvas.height = 100;
        
        ctx.drawImage(image, 0, 0, 100, 100);
        const imageData = ctx.getImageData(0, 0, 100, 100);
        
        // Simple color extraction (in production, use more sophisticated algorithms)
        const colors = [];
        for (let i = 0; i < imageData.data.length; i += 40) {
            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];
            colors.push(`rgb(${r}, ${g}, ${b})`);
        }
        
        return colors.slice(0, 5); // Return top 5 colors
    }

    generateBasicFallback(speciesName) {
        console.log(`Generating basic fallback for ${speciesName}`);
        
        const geometry = new THREE.CapsuleGeometry(0.5, 2, 8, 16);
        const material = new THREE.MeshStandardMaterial({
            color: 0x666666,
            roughness: 0.8
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData.isBasicFallback = true;
        
        return mesh;
    }

    // Species-specific feature methods (simplified versions)
    addYellowtailFeatures(mesh, bioParams) {
        // Add yellow coloring and streamlined fins
        mesh.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.color.setHex(0xffd700);
                child.material.metalness = 0.3;
            }
        });
    }

    addHottentotFeatures(mesh, bioParams) {
        // Add silver-gray coloring and reef fish proportions
        mesh.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.color.setHex(0xc0c0c0);
                child.material.roughness = 0.4;
            }
        });
    }

    addSteentjieFeatures(mesh, bioParams) {
        // Add brown-bronze coloring
        mesh.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.color.setHex(0x8b4513);
                child.material.roughness = 0.6;
            }
        });
    }

    addSharkFeatures(mesh, bioParams) {
        // Add shark-specific features
        mesh.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.roughness = 0.2;
                child.material.clearcoat = 0.8;
            }
        });
    }

    addSealFeatures(mesh, bioParams) {
        // Add mammalian features
        mesh.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.color.setHex(0x5d4037);
                child.material.roughness = 0.7;
            }
        });
    }

    // Animation generation (simplified)
    generateSwimAnimation(mesh, bioParams) {
        const tracks = [];
        const times = [0, 1, 2];
        const values = [0, 0.1, 0, 0, -0.1, 0, 0, 0.1, 0];
        
        const positionTrack = new THREE.VectorKeyframeTrack(
            '.position',
            times,
            values
        );
        
        tracks.push(positionTrack);
        
        return new THREE.AnimationClip('swim', 2, tracks);
    }

    generateFinAnimation(mesh, bioParams) {
        // Simple fin animation
        const tracks = [];
        // Add fin-specific animations here
        return new THREE.AnimationClip('fins', 1, tracks);
    }

    // LOD system
    createLODSystem(model) {
        const lod = new THREE.LOD();
        lod.addLevel(model, 0);
        
        // Create simplified versions
        const medium = model.clone();
        medium.scale.multiplyScalar(0.8);
        lod.addLevel(medium, 50);
        
        const low = model.clone();
        low.scale.multiplyScalar(0.6);
        lod.addLevel(low, 150);
        
        return lod;
    }
}

// Register the system
if (window.moduleManager) {
    window.moduleManager.registerModule('ProceduralModelGenerator', ProceduralModelGenerator);
}

export default ProceduralModelGenerator;