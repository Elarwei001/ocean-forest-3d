/**
 * PhotogrammetrySystem - Advanced 3D reconstruction from multiple images
 * Specialized for marine life hero species (sharks, seals, large marine animals)
 */

class PhotogrammetrySystem {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.reconstructedModels = new Map();
        this.processingQueue = [];
        this.isProcessing = false;
        
        // Feature detection parameters
        this.featureParams = {
            maxFeatures: 1000,
            qualityLevel: 0.01,
            minDistance: 10,
            blockSize: 3,
            useHarrisDetector: false,
            k: 0.04
        };
        
        // Reconstruction quality settings
        this.qualitySettings = {
            hero: { maxPoints: 50000, textureRes: 2048 },
            standard: { maxPoints: 20000, textureRes: 1024 },
            preview: { maxPoints: 5000, textureRes: 512 }
        };
    }

    /**
     * Process multiple images to create 3D model of marine species
     * @param {Array<string>} imageUrls - Array of image URLs from different angles
     * @param {string} speciesName - Name of the marine species
     * @param {string} quality - Quality level: 'hero', 'standard', or 'preview'
     * @returns {Promise<THREE.Mesh>} - Generated 3D mesh
     */
    async processMarineSpecies(imageUrls, speciesName, quality = 'standard') {
        console.log(`Starting photogrammetry reconstruction for ${speciesName}...`);
        
        try {
            // Load and preprocess images
            const images = await this.loadImages(imageUrls);
            const preprocessedImages = await this.preprocessImages(images);
            
            // Extract features from all images
            const featureSets = await this.extractFeatures(preprocessedImages);
            
            // Match features between image pairs
            const matches = await this.matchFeatures(featureSets);
            
            // Perform Structure from Motion (SfM)
            const cameraData = await this.structureFromMotion(matches, preprocessedImages);
            
            // Generate dense point cloud using Multi-View Stereo
            const pointCloud = await this.multiViewStereo(preprocessedImages, cameraData);
            
            // Reconstruct mesh from point cloud
            const mesh = await this.reconstructMesh(pointCloud, quality);
            
            // Generate and apply texture
            const texturedMesh = await this.generateTexture(mesh, preprocessedImages, cameraData, quality);
            
            // Optimize for marine environment
            const optimizedMesh = this.optimizeForMarine(texturedMesh, speciesName);
            
            // Cache the result
            this.reconstructedModels.set(speciesName, optimizedMesh);
            
            console.log(`Photogrammetry reconstruction completed for ${speciesName}`);
            return optimizedMesh;
            
        } catch (error) {
            console.error(`Photogrammetry failed for ${speciesName}:`, error);
            return this.generateFallbackModel(speciesName);
        }
    }

    /**
     * Load and validate images for processing
     */
    async loadImages(imageUrls) {
        const images = [];
        
        for (const url of imageUrls) {
            try {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = url;
                });
                
                images.push(img);
            } catch (error) {
                console.warn(`Failed to load image: ${url}`, error);
            }
        }
        
        if (images.length < 3) {
            throw new Error('Insufficient images for photogrammetry (minimum 3 required)');
        }
        
        return images;
    }

    /**
     * Preprocess images for better feature detection
     */
    async preprocessImages(images) {
        const processed = [];
        
        for (const img of images) {
            // Resize to standard dimensions for processing
            const standardSize = 1024;
            this.canvas.width = standardSize;
            this.canvas.height = standardSize;
            
            // Draw and enhance image
            this.ctx.drawImage(img, 0, 0, standardSize, standardSize);
            
            // Apply preprocessing filters
            const imageData = this.ctx.getImageData(0, 0, standardSize, standardSize);
            
            // Enhance contrast and reduce noise
            this.enhanceContrast(imageData);
            this.reduceNoise(imageData);
            
            this.ctx.putImageData(imageData, 0, 0);
            
            // Convert to format suitable for feature detection
            const processedImage = {
                canvas: this.canvas.cloneNode(),
                data: imageData,
                width: standardSize,
                height: standardSize,
                original: img
            };
            
            processed.push(processedImage);
        }
        
        return processed;
    }

    /**
     * Extract SIFT-like features from images
     */
    async extractFeatures(images) {
        const featureSets = [];
        
        for (const img of images) {
            const features = this.detectFeatures(img);
            const descriptors = this.computeDescriptors(img, features);
            
            featureSets.push({
                keypoints: features,
                descriptors: descriptors,
                image: img
            });
        }
        
        return featureSets;
    }

    /**
     * Detect corner features using Harris corner detection
     */
    detectFeatures(image) {
        const gray = this.convertToGrayscale(image.data);
        const corners = this.harrisCornerDetection(gray, image.width, image.height);
        
        // Filter and rank corners
        return corners
            .sort((a, b) => b.response - a.response)
            .slice(0, this.featureParams.maxFeatures);
    }

    /**
     * Harris corner detection implementation
     */
    harrisCornerDetection(grayData, width, height) {
        const corners = [];
        const k = this.featureParams.k;
        const threshold = 0.01;
        
        // Compute gradients
        const { Ix, Iy } = this.computeGradients(grayData, width, height);
        
        // Compute structure tensor elements
        const Ix2 = new Float32Array(width * height);
        const Iy2 = new Float32Array(width * height);
        const IxIy = new Float32Array(width * height);
        
        for (let i = 0; i < width * height; i++) {
            Ix2[i] = Ix[i] * Ix[i];
            Iy2[i] = Iy[i] * Iy[i];
            IxIy[i] = Ix[i] * Iy[i];
        }
        
        // Apply Gaussian blur to structure tensor
        const blurredIx2 = this.gaussianBlur(Ix2, width, height, 1.5);
        const blurredIy2 = this.gaussianBlur(Iy2, width, height, 1.5);
        const blurredIxIy = this.gaussianBlur(IxIy, width, height, 1.5);
        
        // Compute corner response
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = y * width + x;
                
                const A = blurredIx2[idx];
                const B = blurredIxIy[idx];
                const C = blurredIy2[idx];
                
                const det = A * C - B * B;
                const trace = A + C;
                const response = det - k * trace * trace;
                
                if (response > threshold) {
                    corners.push({
                        x: x,
                        y: y,
                        response: response
                    });
                }
            }
        }
        
        return corners;
    }

    /**
     * Match features between image pairs
     */
    async matchFeatures(featureSets) {
        const matches = [];
        
        for (let i = 0; i < featureSets.length; i++) {
            for (let j = i + 1; j < featureSets.length; j++) {
                const pairMatches = this.matchFeaturePair(
                    featureSets[i], 
                    featureSets[j]
                );
                
                if (pairMatches.length > 8) { // Minimum for fundamental matrix
                    matches.push({
                        imageA: i,
                        imageB: j,
                        matches: pairMatches
                    });
                }
            }
        }
        
        return matches;
    }

    /**
     * Structure from Motion - estimate camera poses and sparse 3D points
     */
    async structureFromMotion(matches, images) {
        const cameras = [];
        const points3D = [];
        
        // Initialize first camera pair
        if (matches.length > 0) {
            const initialPair = matches[0];
            const { camera1, camera2, initial3DPoints } = this.initializeCameraPair(
                initialPair, 
                images[initialPair.imageA], 
                images[initialPair.imageB]
            );
            
            cameras[initialPair.imageA] = camera1;
            cameras[initialPair.imageB] = camera2;
            points3D.push(...initial3DPoints);
            
            // Incrementally add more cameras
            for (let i = 2; i < images.length; i++) {
                const newCamera = this.estimateNewCamera(i, matches, cameras, points3D);
                if (newCamera) {
                    cameras[i] = newCamera;
                    const newPoints = this.triangulateNewPoints(i, matches, cameras);
                    points3D.push(...newPoints);
                }
            }
        }
        
        return { cameras, points3D };
    }

    /**
     * Multi-View Stereo - generate dense point cloud
     */
    async multiViewStereo(images, cameraData) {
        const densePoints = [];
        
        for (let i = 0; i < images.length; i++) {
            for (let j = i + 1; j < images.length; j++) {
                if (cameraData.cameras[i] && cameraData.cameras[j]) {
                    const stereoPoints = this.computeStereoDepth(
                        images[i], 
                        images[j], 
                        cameraData.cameras[i], 
                        cameraData.cameras[j]
                    );
                    densePoints.push(...stereoPoints);
                }
            }
        }
        
        // Filter and clean point cloud
        return this.filterPointCloud(densePoints);
    }

    /**
     * Reconstruct mesh from point cloud using Poisson reconstruction
     */
    async reconstructMesh(pointCloud, quality) {
        const settings = this.qualitySettings[quality];
        
        // Subsample point cloud if needed
        const sampledPoints = pointCloud.length > settings.maxPoints 
            ? this.subsamplePointCloud(pointCloud, settings.maxPoints)
            : pointCloud;
        
        // Estimate normals
        const pointsWithNormals = this.estimateNormals(sampledPoints);
        
        // Poisson surface reconstruction
        const mesh = this.poissonReconstruction(pointsWithNormals);
        
        return mesh;
    }

    /**
     * Generate texture from source images
     */
    async generateTexture(mesh, images, cameraData, quality) {
        const settings = this.qualitySettings[quality];
        const textureSize = settings.textureRes;
        
        // Create UV mapping
        const uvMapping = this.generateUVMapping(mesh);
        
        // Project images onto mesh surface
        const textureCanvas = document.createElement('canvas');
        textureCanvas.width = textureSize;
        textureCanvas.height = textureSize;
        const textureCtx = textureCanvas.getContext('2d');
        
        // Blend multiple image projections
        const blendedTexture = this.blendImageProjections(
            mesh, images, cameraData, textureCanvas, textureCtx
        );
        
        // Create Three.js texture
        const texture = new THREE.CanvasTexture(textureCanvas);
        texture.flipY = false;
        
        // Apply texture to mesh
        mesh.material = new THREE.MeshStandardMaterial({
            map: texture,
            normalMap: this.generateNormalMap(mesh),
            roughness: 0.4,
            metalness: 0.1
        });
        
        return mesh;
    }

    /**
     * Optimize mesh for marine environment
     */
    optimizeForMarine(mesh, speciesName) {
        // Add marine-specific materials
        if (speciesName.toLowerCase().includes('shark')) {
            mesh.material.roughness = 0.2;
            mesh.material.metalness = 0.0;
            mesh.material.clearcoat = 0.8;
        } else if (speciesName.toLowerCase().includes('seal')) {
            mesh.material.roughness = 0.6;
            mesh.material.metalness = 0.0;
            mesh.material.clearcoat = 0.3;
        }
        
        // Add underwater lighting response
        mesh.material.transparent = true;
        mesh.material.opacity = 0.95;
        
        // Generate LOD versions
        const lod = new THREE.LOD();
        lod.addLevel(mesh, 0);
        lod.addLevel(this.createLOD(mesh, 0.5), 50);
        lod.addLevel(this.createLOD(mesh, 0.25), 150);
        
        return lod;
    }

    /**
     * Generate fallback model if photogrammetry fails
     */
    generateFallbackModel(speciesName) {
        console.log(`Generating fallback model for ${speciesName}`);
        
        // Create basic procedural model
        let geometry;
        if (speciesName.toLowerCase().includes('shark')) {
            geometry = this.createBasicSharkGeometry();
        } else if (speciesName.toLowerCase().includes('seal')) {
            geometry = this.createBasicSealGeometry();
        } else {
            geometry = new THREE.CapsuleGeometry(1, 3, 8, 16);
        }
        
        const material = new THREE.MeshStandardMaterial({
            color: 0x666666,
            roughness: 0.8,
            metalness: 0.1
        });
        
        return new THREE.Mesh(geometry, material);
    }

    // Helper methods for image processing
    convertToGrayscale(imageData) {
        const gray = new Uint8Array(imageData.length / 4);
        for (let i = 0; i < gray.length; i++) {
            const r = imageData[i * 4];
            const g = imageData[i * 4 + 1];
            const b = imageData[i * 4 + 2];
            gray[i] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
        }
        return gray;
    }

    enhanceContrast(imageData) {
        const data = imageData.data;
        const factor = 1.2;
        
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] * factor);     // R
            data[i + 1] = Math.min(255, data[i + 1] * factor); // G
            data[i + 2] = Math.min(255, data[i + 2] * factor); // B
        }
    }

    reduceNoise(imageData) {
        // Simple 3x3 median filter implementation
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const result = new Uint8ClampedArray(data);
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                for (let c = 0; c < 3; c++) {
                    const values = [];
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            const idx = ((y + dy) * width + (x + dx)) * 4 + c;
                            values.push(data[idx]);
                        }
                    }
                    values.sort((a, b) => a - b);
                    const idx = (y * width + x) * 4 + c;
                    result[idx] = values[4]; // median
                }
            }
        }
        
        for (let i = 0; i < data.length; i++) {
            data[i] = result[i];
        }
    }

    computeGradients(grayData, width, height) {
        const Ix = new Float32Array(width * height);
        const Iy = new Float32Array(width * height);
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = y * width + x;
                
                // Sobel operators
                Ix[idx] = (
                    grayData[y * width + (x + 1)] - 
                    grayData[y * width + (x - 1)]
                ) / 2;
                
                Iy[idx] = (
                    grayData[(y + 1) * width + x] - 
                    grayData[(y - 1) * width + x]
                ) / 2;
            }
        }
        
        return { Ix, Iy };
    }

    gaussianBlur(data, width, height, sigma) {
        // Simple 1D Gaussian blur approximation
        const result = new Float32Array(data.length);
        const kernel = this.createGaussianKernel(sigma);
        const radius = Math.floor(kernel.length / 2);
        
        // Horizontal pass
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let sum = 0;
                let weightSum = 0;
                
                for (let i = -radius; i <= radius; i++) {
                    const xi = Math.max(0, Math.min(width - 1, x + i));
                    const weight = kernel[i + radius];
                    sum += data[y * width + xi] * weight;
                    weightSum += weight;
                }
                
                result[y * width + x] = sum / weightSum;
            }
        }
        
        return result;
    }

    createGaussianKernel(sigma) {
        const size = Math.ceil(sigma * 3) * 2 + 1;
        const kernel = new Float32Array(size);
        const center = Math.floor(size / 2);
        let sum = 0;
        
        for (let i = 0; i < size; i++) {
            const x = i - center;
            kernel[i] = Math.exp(-(x * x) / (2 * sigma * sigma));
            sum += kernel[i];
        }
        
        // Normalize
        for (let i = 0; i < size; i++) {
            kernel[i] /= sum;
        }
        
        return kernel;
    }

    createBasicSharkGeometry() {
        const geometry = new THREE.CylinderGeometry(0.3, 0.8, 4, 12);
        // Add shark-like modifications
        return geometry;
    }

    createBasicSealGeometry() {
        const geometry = new THREE.CapsuleGeometry(0.8, 2.5, 8, 16);
        // Add seal-like modifications
        return geometry;
    }

    createLOD(mesh, factor) {
        const geometry = mesh.geometry.clone();
        const simplifier = new THREE.SimplifyModifier();
        const simplified = simplifier.modify(geometry, factor);
        return new THREE.Mesh(simplified, mesh.material);
    }
}

// Register the system
if (window.moduleManager) {
    window.moduleManager.registerModule('PhotogrammetrySystem', PhotogrammetrySystem);
}

export default PhotogrammetrySystem;