/**
 * Advanced3DModelSystem - Integration hub for all 3D model generation systems
 * Coordinates photogrammetry, AI depth estimation, and procedural generation
 */

class Advanced3DModelSystem {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        
        // Initialize subsystems
        this.photogrammetrySystem = null;
        this.aiDepthSystem = null;
        this.proceduralSystem = null;
        
        // Model management
        this.generatedModels = new Map();
        this.loadingQueue = [];
        this.isProcessing = false;
        
        // Performance tracking
        this.performanceMetrics = {
            modelsGenerated: 0,
            averageGenerationTime: 0,
            memoryUsage: 0,
            activeModels: 0
        };
        
        // Configuration
        this.config = {
            maxConcurrentGeneration: 2,
            enablePhotogrammetryForHeroes: true,
            enableAIDepthForFish: true,
            enableProceduralGeneration: true,
            autoOptimizePerformance: true,
            cacheGeneratedModels: true
        };
        
        this.initializeSystems();
    }

    /**
     * Initialize all 3D model generation subsystems
     */
    async initializeSystems() {
        console.log('Initializing Advanced 3D Model System...');
        
        try {
            // Initialize photogrammetry system
            if (this.config.enablePhotogrammetryForHeroes) {
                this.photogrammetrySystem = new PhotogrammetrySystem();
                console.log('Photogrammetry system initialized');
            }
            
            // Initialize AI depth estimation system
            if (this.config.enableAIDepthForFish) {
                this.aiDepthSystem = new AIDepthEstimation();
                console.log('AI depth estimation system initialized');
            }
            
            // Initialize procedural generation system
            if (this.config.enableProceduralGeneration) {
                this.proceduralSystem = new ProceduralModelGenerator();
                console.log('Procedural generation system initialized');
            }
            
            console.log('Advanced 3D Model System initialization complete');
            
        } catch (error) {
            console.error('Failed to initialize 3D model systems:', error);
        }
    }

    /**
     * Generate 3D model for marine species using the most appropriate method
     * @param {Object} speciesData - Species information and requirements
     * @returns {Promise<THREE.Object3D>} - Generated 3D model
     */
    async generateMarineSpeciesModel(speciesData) {
        const {
            name,
            type, // 'hero', 'standard', 'background'
            referenceImages = [],
            biologicalParams = {},
            quality = 'standard',
            forceMethod = null
        } = speciesData;

        console.log(`Generating 3D model for ${name} (${type} quality: ${quality})`);
        
        // Check cache first
        const cacheKey = this.getCacheKey(speciesData);
        if (this.config.cacheGeneratedModels && this.generatedModels.has(cacheKey)) {
            console.log(`Using cached model for ${name}`);
            return this.generatedModels.get(cacheKey).clone();
        }
        
        // Add to processing queue
        return new Promise((resolve, reject) => {
            this.loadingQueue.push({
                speciesData,
                resolve,
                reject,
                timestamp: Date.now()
            });
            
            this.processQueue();
        });
    }

    /**
     * Process the model generation queue
     */
    async processQueue() {
        if (this.isProcessing || this.loadingQueue.length === 0) {
            return;
        }
        
        this.isProcessing = true;
        
        while (this.loadingQueue.length > 0) {
            const currentBatch = this.loadingQueue.splice(0, this.config.maxConcurrentGeneration);
            
            const promises = currentBatch.map(item => this.generateSingleModel(item));
            
            try {
                await Promise.all(promises);
            } catch (error) {
                console.error('Error in batch processing:', error);
            }
        }
        
        this.isProcessing = false;
    }

    /**
     * Generate a single model using the appropriate method
     */
    async generateSingleModel(queueItem) {
        const { speciesData, resolve, reject } = queueItem;
        const startTime = Date.now();
        
        try {
            let generatedModel = null;
            const method = this.selectGenerationMethod(speciesData);
            
            console.log(`Using ${method} method for ${speciesData.name}`);
            
            switch (method) {
                case 'photogrammetry':
                    generatedModel = await this.generateWithPhotogrammetry(speciesData);
                    break;
                    
                case 'ai_depth':
                    generatedModel = await this.generateWithAIDepth(speciesData);
                    break;
                    
                case 'procedural':
                    generatedModel = await this.generateWithProcedural(speciesData);
                    break;
                    
                case 'hybrid':
                    generatedModel = await this.generateWithHybridMethod(speciesData);
                    break;
                    
                default:
                    generatedModel = await this.generateFallbackModel(speciesData);
            }
            
            // Post-process the model
            const finalModel = await this.postProcessModel(generatedModel, speciesData);
            
            // Cache the result
            if (this.config.cacheGeneratedModels) {
                const cacheKey = this.getCacheKey(speciesData);
                this.generatedModels.set(cacheKey, finalModel);
            }
            
            // Update performance metrics
            const generationTime = Date.now() - startTime;
            this.updatePerformanceMetrics(generationTime);
            
            console.log(`Model generation completed for ${speciesData.name} in ${generationTime}ms`);
            resolve(finalModel);
            
        } catch (error) {
            console.error(`Model generation failed for ${speciesData.name}:`, error);
            
            // Try fallback method
            try {
                const fallbackModel = await this.generateFallbackModel(speciesData);
                resolve(fallbackModel);
            } catch (fallbackError) {
                reject(fallbackError);
            }
        }
    }

    /**
     * Select the most appropriate generation method based on species data
     */
    selectGenerationMethod(speciesData) {
        const { type, referenceImages, name, forceMethod } = speciesData;
        
        // User can force a specific method
        if (forceMethod) {
            return forceMethod;
        }
        
        // Hero species with multiple reference images - use photogrammetry
        if (type === 'hero' && referenceImages.length >= 3 && this.photogrammetrySystem) {
            return 'photogrammetry';
        }
        
        // Fish with single reference image - use AI depth estimation
        if ((type === 'standard' || name.toLowerCase().includes('fish')) && 
            referenceImages.length >= 1 && this.aiDepthSystem) {
            return 'ai_depth';
        }
        
        // Use procedural generation for background species or when no images available
        if (this.proceduralSystem) {
            return 'procedural';
        }
        
        // Hybrid approach for complex cases
        if (referenceImages.length >= 2) {
            return 'hybrid';
        }
        
        return 'fallback';
    }

    /**
     * Generate model using photogrammetry
     */
    async generateWithPhotogrammetry(speciesData) {
        if (!this.photogrammetrySystem) {
            throw new Error('Photogrammetry system not available');
        }
        
        const { name, referenceImages, quality } = speciesData;
        
        return await this.photogrammetrySystem.processMarineSpecies(
            referenceImages,
            name,
            quality
        );
    }

    /**
     * Generate model using AI depth estimation
     */
    async generateWithAIDepth(speciesData) {
        if (!this.aiDepthSystem) {
            throw new Error('AI depth estimation system not available');
        }
        
        const { name, referenceImages, biologicalParams } = speciesData;
        const primaryImage = referenceImages[0];
        
        const options = {
            quality: speciesData.quality,
            enableNormalMapping: true,
            enableDisplacement: true,
            generateVariations: false
        };
        
        return await this.aiDepthSystem.generateFishModel(
            primaryImage,
            name,
            options
        );
    }

    /**
     * Generate model using procedural techniques
     */
    async generateWithProcedural(speciesData) {
        if (!this.proceduralSystem) {
            throw new Error('Procedural generation system not available');
        }
        
        const { name, referenceImages, biologicalParams, quality } = speciesData;
        
        return await this.proceduralSystem.generateFromReferences(
            referenceImages,
            name,
            biologicalParams,
            quality
        );
    }

    /**
     * Generate model using hybrid approach (combining multiple methods)
     */
    async generateWithHybridMethod(speciesData) {
        console.log(`Using hybrid generation for ${speciesData.name}`);
        
        const { referenceImages } = speciesData;
        
        // Use AI depth estimation for base geometry
        const baseModel = await this.generateWithAIDepth({
            ...speciesData,
            referenceImages: [referenceImages[0]]
        });
        
        // Enhance with procedural details
        const enhancedModel = await this.enhanceWithProcedural(baseModel, speciesData);
        
        // Apply photogrammetric texture if enough images available
        if (referenceImages.length >= 3) {
            return await this.enhanceWithPhotogrammetricTexture(enhancedModel, speciesData);
        }
        
        return enhancedModel;
    }

    /**
     * Enhance model with procedural details
     */
    async enhanceWithProcedural(baseModel, speciesData) {
        if (!this.proceduralSystem) {
            return baseModel;
        }
        
        // Add procedural enhancements like detailed fins, scales, etc.
        const group = new THREE.Group();
        group.add(baseModel);
        
        // Generate additional procedural elements
        const proceduralDetails = await this.proceduralSystem.generateFromReferences(
            speciesData.referenceImages,
            speciesData.name + '_details',
            speciesData.biologicalParams,
            'preview' // Lower quality for details
        );
        
        // Merge the models
        group.add(proceduralDetails);
        
        return group;
    }

    /**
     * Enhance model with photogrammetric texture
     */
    async enhanceWithPhotogrammetricTexture(model, speciesData) {
        if (!this.photogrammetrySystem) {
            return model;
        }
        
        // Generate high-quality texture using photogrammetry
        try {
            const textureModel = await this.photogrammetrySystem.processMarineSpecies(
                speciesData.referenceImages,
                speciesData.name + '_texture',
                'preview'
            );
            
            // Extract texture from photogrammetric model and apply to base model
            if (textureModel.material && textureModel.material.map) {
                model.traverse((child) => {
                    if (child.isMesh && child.material) {
                        child.material.map = textureModel.material.map;
                        child.material.needsUpdate = true;
                    }
                });
            }
        } catch (error) {
            console.warn('Failed to enhance with photogrammetric texture:', error);
        }
        
        return model;
    }

    /**
     * Generate fallback model for when all other methods fail
     */
    async generateFallbackModel(speciesData) {
        console.log(`Generating fallback model for ${speciesData.name}`);
        
        const { name, type } = speciesData;
        
        // Create basic geometric model based on species type
        let geometry, material;
        
        if (name.toLowerCase().includes('shark')) {
            geometry = new THREE.CylinderGeometry(0.3, 0.8, 4, 12);
            material = new THREE.MeshStandardMaterial({
                color: 0x444444,
                roughness: 0.2,
                metalness: 0.1
            });
        } else if (name.toLowerCase().includes('seal')) {
            geometry = new THREE.CapsuleGeometry(0.8, 2.5, 8, 16);
            material = new THREE.MeshStandardMaterial({
                color: 0x5d4037,
                roughness: 0.8,
                metalness: 0.0
            });
        } else {
            // Generic fish
            geometry = new THREE.CapsuleGeometry(0.3, 1.2, 8, 16);
            material = new THREE.MeshStandardMaterial({
                color: 0x888888,
                roughness: 0.4,
                metalness: 0.2
            });
        }
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData.isFallback = true;
        mesh.userData.species = name;
        
        return mesh;
    }

    /**
     * Post-process generated model for ocean environment
     */
    async postProcessModel(model, speciesData) {
        // Apply ocean-specific optimizations
        model.traverse((child) => {
            if (child.isMesh) {
                // Enable shadows
                child.castShadow = true;
                child.receiveShadow = true;
                
                // Optimize for underwater environment
                if (child.material) {
                    child.material.transparent = true;
                    child.material.opacity = 0.95;
                    
                    // Add underwater light absorption
                    if (!child.material.userData.originalColor) {
                        child.material.userData.originalColor = child.material.color.clone();
                    }
                }
            }
        });
        
        // Add species metadata
        model.userData.speciesName = speciesData.name;
        model.userData.speciesType = speciesData.type;
        model.userData.generationMethod = this.selectGenerationMethod(speciesData);
        model.userData.generationTime = Date.now();
        
        // Add LOD system for performance
        const lodModel = this.createLODSystem(model, speciesData);
        
        // Add to scene if requested
        if (speciesData.addToScene !== false) {
            this.scene.add(lodModel);
            this.performanceMetrics.activeModels++;
        }
        
        return lodModel;
    }

    /**
     * Create LOD (Level of Detail) system for performance optimization
     */
    createLODSystem(model, speciesData) {
        const lod = new THREE.LOD();
        
        // High detail (close)
        lod.addLevel(model, 0);
        
        // Medium detail (medium distance)
        const mediumDetail = this.createSimplifiedVersion(model, 0.6);
        lod.addLevel(mediumDetail, 30);
        
        // Low detail (far distance)
        const lowDetail = this.createSimplifiedVersion(model, 0.3);
        lod.addLevel(lowDetail, 100);
        
        // Impostor (very far)
        const impostor = this.createImpostor(model);
        lod.addLevel(impostor, 200);
        
        return lod;
    }

    /**
     * Create simplified version of model for LOD
     */
    createSimplifiedVersion(model, complexity) {
        const simplified = model.clone();
        
        simplified.traverse((child) => {
            if (child.isMesh && child.geometry) {
                // Simplify geometry (in a real implementation, use proper mesh simplification)
                const vertices = child.geometry.attributes.position.count;
                const targetVertices = Math.floor(vertices * complexity);
                
                // For demonstration, just scale down slightly
                child.scale.multiplyScalar(0.95);
            }
        });
        
        return simplified;
    }

    /**
     * Create billboard impostor for very distant rendering
     */
    createImpostor(model) {
        // Create a simple billboard with the model's silhouette
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // Simple silhouette rendering
        ctx.fillStyle = '#444444';
        ctx.fillRect(20, 16, 24, 32);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);
        
        // Match the original model's scale
        const bbox = new THREE.Box3().setFromObject(model);
        const size = bbox.getSize(new THREE.Vector3());
        sprite.scale.set(size.x, size.y, 1);
        
        return sprite;
    }

    /**
     * Generate species-specific models for ocean forest
     */
    async generateOceanForestSpecies() {
        console.log('Generating species models for Ocean Forest...');
        
        const speciesConfigs = [
            // Hero species (high quality)
            {
                name: 'great_white_shark',
                type: 'hero',
                referenceImages: [
                    '/assets/images/great_white_1.jpg',
                    '/assets/images/great_white_2.jpg',
                    '/assets/images/great_white_3.jpg'
                ],
                biologicalParams: {
                    maxLength: 6.0,
                    family: 'Lamnidae',
                    habitat: 'pelagic'
                },
                quality: 'high'
            },
            {
                name: 'cape_fur_seal',
                type: 'hero',
                referenceImages: [
                    '/assets/images/cape_seal_1.jpg',
                    '/assets/images/cape_seal_2.jpg'
                ],
                biologicalParams: {
                    maxLength: 2.3,
                    family: 'Otariidae',
                    habitat: 'coastal'
                },
                quality: 'high'
            },
            
            // Standard fish (medium quality)
            {
                name: 'yellowtail',
                type: 'standard',
                referenceImages: ['/assets/profiles/Yellowtail_profile.png'],
                biologicalParams: {
                    maxLength: 1.2,
                    family: 'Carangidae',
                    habitat: 'pelagic'
                },
                quality: 'standard'
            },
            {
                name: 'hottentot',
                type: 'standard',
                referenceImages: ['/assets/profiles/hottentot_profile.webp'],
                biologicalParams: {
                    maxLength: 0.5,
                    family: 'Sparidae',
                    habitat: 'reef'
                },
                quality: 'standard'
            },
            {
                name: 'steentjie',
                type: 'standard',
                referenceImages: ['/assets/profiles/Steentjie_profile.png'],
                biologicalParams: {
                    maxLength: 0.3,
                    family: 'Sparidae',
                    habitat: 'rocky_reef'
                },
                quality: 'standard'
            },
            
            // Background species (procedural)
            {
                name: 'generic_reef_fish',
                type: 'background',
                referenceImages: [],
                biologicalParams: {
                    maxLength: 0.2,
                    family: 'Various',
                    habitat: 'reef'
                },
                quality: 'preview'
            }
        ];
        
        const generatedModels = {};
        
        for (const config of speciesConfigs) {
            try {
                const model = await this.generateMarineSpeciesModel({
                    ...config,
                    addToScene: false // Don't add to scene automatically
                });
                
                generatedModels[config.name] = model;
                console.log(`Generated model for ${config.name}`);
                
            } catch (error) {
                console.error(`Failed to generate ${config.name}:`, error);
            }
        }
        
        console.log('Ocean Forest species generation completed');
        return generatedModels;
    }

    /**
     * Update animation systems for all generated models
     */
    updateAnimations(deltaTime) {
        this.scene.traverse((object) => {
            if (object.userData.mixer) {
                object.userData.mixer.update(deltaTime);
            }
        });
    }

    /**
     * Performance management
     */
    updatePerformanceMetrics(generationTime) {
        this.performanceMetrics.modelsGenerated++;
        this.performanceMetrics.averageGenerationTime = 
            (this.performanceMetrics.averageGenerationTime + generationTime) / 2;
        
        // Auto-optimize if enabled
        if (this.config.autoOptimizePerformance) {
            this.optimizePerformance();
        }
    }

    optimizePerformance() {
        // Implement performance optimization strategies
        const memoryUsage = this.estimateMemoryUsage();
        
        if (memoryUsage > 100 * 1024 * 1024) { // 100MB threshold
            this.cleanupOldModels();
        }
        
        if (this.performanceMetrics.activeModels > 100) {
            this.reduceLODDetails();
        }
    }

    estimateMemoryUsage() {
        // Estimate memory usage of generated models
        let totalVertices = 0;
        let totalTextures = 0;
        
        this.scene.traverse((object) => {
            if (object.isMesh && object.geometry) {
                totalVertices += object.geometry.attributes.position.count;
            }
            if (object.material && object.material.map) {
                totalTextures++;
            }
        });
        
        // Rough estimation: vertices * 12 bytes + textures * 1MB
        return totalVertices * 12 + totalTextures * 1024 * 1024;
    }

    cleanupOldModels() {
        // Remove old cached models to free memory
        const cutoffTime = Date.now() - 600000; // 10 minutes
        
        for (const [key, model] of this.generatedModels.entries()) {
            if (model.userData.generationTime < cutoffTime) {
                this.generatedModels.delete(key);
            }
        }
    }

    reduceLODDetails() {
        // Reduce LOD detail levels to improve performance
        this.scene.traverse((object) => {
            if (object.isLOD) {
                // Increase distance thresholds for LOD switches
                object.levels.forEach((level, index) => {
                    level.distance *= 1.2;
                });
            }
        });
    }

    /**
     * Utility methods
     */
    getCacheKey(speciesData) {
        const { name, type, quality, referenceImages } = speciesData;
        const imageHash = referenceImages.join('|');
        return `${name}_${type}_${quality}_${imageHash}`;
    }

    getPerformanceMetrics() {
        return { ...this.performanceMetrics };
    }

    dispose() {
        // Clean up resources
        this.generatedModels.clear();
        this.loadingQueue = [];
        
        if (this.photogrammetrySystem) {
            this.photogrammetrySystem = null;
        }
        if (this.aiDepthSystem) {
            this.aiDepthSystem = null;
        }
        if (this.proceduralSystem) {
            this.proceduralSystem = null;
        }
    }
}

// Register the system
if (window.moduleManager) {
    window.moduleManager.registerModule('Advanced3DModelSystem', Advanced3DModelSystem);
}

export default Advanced3DModelSystem;