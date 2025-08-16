// Render Engine - Main render loop and post-processing effects

class RenderEngine {
    constructor(renderer, scene, camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.clock = new THREE.Clock();
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 60;
        
        // Post-processing flag
        this.enablePostProcessing = false;
    }
    
    setupPostProcessing() {
        // Basic post-processing setup
        // Can add bloom, SSAO and other effects here
        console.log('Post-processing setup (basic)');
    }
    
    startRenderLoop(oceanForest) {
        const animate = (currentTime) => {
            const deltaTime = this.clock.getElapsedTime();
            
            // Update performance metrics
            this.updatePerformance(currentTime);
            
            // Update ocean environment
            this.updateOceanEnvironment(oceanForest, deltaTime);
            
            // Update marine life
            this.updateMarineLife(oceanForest, deltaTime);
            
            // Update octopus
            this.updateOctopus(oceanForest, deltaTime);
            
            // Update camera
            this.updateCamera(oceanForest, deltaTime);
            
            // Update lighting effects
            this.updateLighting(oceanForest, deltaTime);
            
            // Update advanced systems (if available)
            this.updateAdvancedSystems(oceanForest, deltaTime);
            
            // Update floating labels
            if (oceanForest.floatingLabels) {
                oceanForest.floatingLabels.updateFloatingLabels();
            }
            
            // Render scene
            this.renderer.render(this.scene, this.camera);
            
            requestAnimationFrame(animate);
        };
        
        animate(0);
    }
    
    updateOceanEnvironment(oceanForest, deltaTime) {
        // Update kelp forest
        if (oceanForest.kelpForest && oceanForest.oceanEnvironment) {
            oceanForest.oceanEnvironment.updateKelp(oceanForest.kelpForest, deltaTime);
        }
        
        // Update bubbles
        if (oceanForest.bubbles && oceanForest.oceanEnvironment) {
            oceanForest.oceanEnvironment.updateBubbles(oceanForest.bubbles, deltaTime);
        }
        
        // Update light rays
        if (oceanForest.lightRays && oceanForest.oceanEnvironment) {
            oceanForest.oceanEnvironment.updateLightRays(oceanForest.lightRays, deltaTime);
        }
        
        // Update skybox
        if (oceanForest.skyboxMaterial) {
            oceanForest.skyboxMaterial.uniforms.time.value = deltaTime;
        }
    }
    
    updateMarineLife(oceanForest, deltaTime) {
        // Update Cape fur seals
        if (oceanForest.marineAnimals) {
            oceanForest.marineAnimals.updateCapeFurSeals(deltaTime);
            oceanForest.marineAnimals.updateAfricanPenguins(deltaTime);
        }
        
        // Update sharks and fish
        if (oceanForest.sharksAndFish) {
            oceanForest.sharksAndFish.updateGreatWhiteSharks(deltaTime);
            oceanForest.sharksAndFish.updateCapeReefFish(deltaTime);
        }
        
        // Update our custom fish movement (for fish created via buttons)
        if (oceanForest.capeReefFish && oceanForest.capeReefFish.length > 0) {
            // Debug: Log occasionally to verify this is being called
            if (Math.random() < 0.001) { // Very rare logging
                console.log('Updating fish movement, fish count:', oceanForest.capeReefFish.length);
            }
            oceanForest.updateFishMovement(deltaTime);
        }
        
        // Update sea urchins and anemones
        this.updateSeaUrchinFields(oceanForest.seaUrchinFields, deltaTime);
        this.updateSeaAnemones(oceanForest.seaAnemones, deltaTime);
    }
    
    updateOctopus(oceanForest, deltaTime) {
        if (!oceanForest.octopusModel) return;
        
        // Check if we're following a fish - prioritize follow behavior
        if (oceanForest.followTarget) {
            // When following, apply follow behavior first
            if (oceanForest.updateOctopusFollow) {
                console.log('🎯 Applying follow behavior, target:', oceanForest.followTarget.userData.species.englishName);
                oceanForest.updateOctopusFollow(deltaTime);
            }
            
            // IMPORTANT: Always update octopus natural animations while following
            // This preserves tentacle flowing, body animations, and natural movements
            oceanForest.octopusModel.updateOctopus(
                deltaTime,
                oceanForest.octopusPosition,
                oceanForest.keys,
                true, // Mark as moving to keep animations active
                'swimming' // Direction doesn't matter, we want natural swimming animation
            );
            
            // Update the octopus model position to the follow position (after animations)
            if (oceanForest.octopusModel.mesh) {
                oceanForest.octopusModel.mesh.position.copy(oceanForest.octopusPosition);
            }
            
            // Check for manual override with keyboard input during following
            const movement = this.processOctopusInput(oceanForest.keys);
            if (movement.isMoving) {
                // Manual input detected - temporarily disable following for responsive control
                console.log('📱 Manual control detected while following - allowing manual override');
                oceanForest.octopusModel.updateOctopus(
                    deltaTime,
                    oceanForest.octopusPosition,
                    oceanForest.keys,
                    movement.isMoving,
                    movement.direction
                );
                
                // Update position from manual control
                const octopusPos = oceanForest.octopusModel.getPosition();
                if (octopusPos) {
                    oceanForest.octopusPosition.copy(octopusPos);
                }
            }
        } else {
            // Normal manual control when not following
            const movement = this.processOctopusInput(oceanForest.keys);
            
            // Update octopus model
            oceanForest.octopusModel.updateOctopus(
                deltaTime,
                oceanForest.octopusPosition,
                oceanForest.keys,
                movement.isMoving,
                movement.direction
            );
            
            // Update octopus position reference
            const octopusPos = oceanForest.octopusModel.getPosition();
            if (octopusPos) {
                oceanForest.octopusPosition.copy(octopusPos);
            }
        }
    }
    
    processOctopusInput(keys) {
        let isMoving = false;
        let direction = null;
        
        if (keys['KeyW'] || keys['ArrowUp']) {
            isMoving = true;
            direction = 'forward';
        }
        if (keys['KeyS'] || keys['ArrowDown']) {
            isMoving = true;
            direction = 'backward';
        }
        if (keys['KeyA'] || keys['ArrowLeft']) {
            isMoving = true;
            direction = 'left';
        }
        if (keys['KeyD'] || keys['ArrowRight']) {
            isMoving = true;
            direction = 'right';
        }
        if (keys['Space']) {
            isMoving = true;
            direction = 'up';
        }
        if (keys['ShiftLeft'] || keys['ShiftRight']) {
            isMoving = true;
            direction = 'down';
        }
        
        return { isMoving, direction };
    }
    
    updateCamera(oceanForest, deltaTime) {
        if (!oceanForest.octopusPosition) return;
        
        // When octopus is following a fish, keep camera stationary to watch the dramatic flight
        if (oceanForest.followTarget) {
            // Keep camera in fixed position to observe the octopus flying to fish
            // Only allow mouse look around
            const lookTarget = oceanForest.octopusPosition.clone();
            lookTarget.x += oceanForest.mouse.x * 2;
            lookTarget.y += oceanForest.mouse.y * 1.5;
            
            this.camera.lookAt(lookTarget);
            console.log('📹 Camera fixed - watching octopus fly to fish');
            return;
        }
        
        // Normal camera follows octopus when not following fish
        const targetPosition = oceanForest.octopusPosition.clone().add(oceanForest.cameraOffset);
        
        // Smoother interpolation
        this.camera.position.lerp(targetPosition, 0.08);
        
        // Look at octopus with slight mouse influence
        const lookTarget = oceanForest.octopusPosition.clone();
        lookTarget.x += oceanForest.mouse.x * 2;
        lookTarget.y += oceanForest.mouse.y * 1.5;
        
        this.camera.lookAt(lookTarget);
        
        // Slight camera sway (when swimming) - optional effect
        const enableCameraSwag = false; // Set to false to disable sway effect
        const movement = this.processOctopusInput(oceanForest.keys);
        if (movement.isMoving && enableCameraSwag) {
            const time = performance.now() * 0.001;
            // Use sine wave to create smooth sway effect
            const smoothShakeX = Math.sin(time * 8) * 0.015;
            const smoothShakeY = Math.sin(time * 6) * 0.008;
            this.camera.position.x += smoothShakeX;
            this.camera.position.y += smoothShakeY;
        }
    }
    
    updateLighting(oceanForest, deltaTime) {
        // Update caustic light effects
        if (oceanForest.causticLights && oceanForest.oceanEnvironment) {
            oceanForest.oceanEnvironment.updateCausticLights(oceanForest.causticLights, deltaTime);
        }
        
        // Dynamic light intensity
        const timeOfDay = Math.sin(deltaTime * 0.1) * 0.2 + 0.8;
        
        if (oceanForest.directionalLight) {
            oceanForest.directionalLight.intensity = timeOfDay;
        }
    }
    
    updateSeaUrchinFields(seaUrchinFields, deltaTime) {
        if (!seaUrchinFields) return;
        
        seaUrchinFields.forEach((urchin, index) => {
            const time = deltaTime + index * 0.5;
            
            // Sea urchin gentle breathing effect
            const breathe = 1 + Math.sin(time * 1.5) * 0.05;
            urchin.scale.setScalar(breathe);
            
            // Spine gentle swaying
            if (urchin.children) {
                urchin.children.forEach((spine, spineIndex) => {
                    const spineTime = time + spineIndex * 0.1;
                    spine.rotation.z = Math.sin(spineTime * 2) * 0.1;
                });
            }
        });
    }
    
    updateSeaAnemones(seaAnemones, deltaTime) {
        if (!seaAnemones) return;
        
        seaAnemones.forEach((anemone, index) => {
            const time = deltaTime + index * 0.7;
            
            // Anemone tentacle swaying
            anemone.rotation.y = Math.sin(time * 0.8) * 0.2;
            
            // Opening and closing effect
            const openClose = Math.sin(time * 0.5) * 0.1 + 0.9;
            anemone.scale.y = openClose;
            
            // Color changes
            if (anemone.material) {
                const colorShift = Math.sin(time * 0.3) * 0.1;
                anemone.material.color.setHSL(0.8 + colorShift, 0.8, 0.6);
            }
        });
    }
    
    updatePerformance(currentTime) {
        this.frameCount++;
        
        if (currentTime - this.lastTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
            this.frameCount = 0;
            this.lastTime = currentTime;
            
            // Update UI display
            const fpsElement = document.getElementById('fps');
            if (fpsElement) {
                fpsElement.textContent = this.fps;
            }
        }
    }
    
    // Adjust render quality (performance optimization)
    adjustQuality(level) {
        switch(level) {
            case 'low':
                this.renderer.setPixelRatio(1);
                this.renderer.shadowMap.enabled = false;
                break;
            case 'medium':
                this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
                this.renderer.shadowMap.enabled = true;
                break;
            case 'high':
                this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                this.renderer.shadowMap.enabled = true;
                break;
        }
    }
    
    // Update advanced systems
    updateAdvancedSystems(oceanForest, deltaTime) {
        // Update advanced 3D model animations
        if (oceanForest.advanced3DModels) {
            try {
                oceanForest.advanced3DModels.updateAnimations(deltaTime);
            } catch (error) {
                console.warn('Advanced 3D model system update error:', error);
            }
        }
        
        // Update cinematic animation system
        if (oceanForest.cinematicAnimation) {
            try {
                oceanForest.cinematicAnimation.update();
                this.applyCinematicAnimations(oceanForest);
            } catch (error) {
                console.warn('Cinematic animation system update error:', error);
            }
        }
        
        // Update advanced particle system
        if (oceanForest.advancedParticles) {
            try {
                oceanForest.advancedParticles.update(deltaTime);
            } catch (error) {
                console.warn('Advanced particle system update error:', error);
            }
        }
        
        // Update marine life behavior system
        if (oceanForest.marineLifeBehavior) {
            try {
                const allAnimals = [
                    ...(oceanForest.capeReefFish || []),
                    ...(oceanForest.capeFurSeals || []),
                    ...(oceanForest.africanPenguins || []),
                    ...(oceanForest.greatWhiteSharks || [])
                ];
                oceanForest.marineLifeBehavior.update(allAnimals, deltaTime);
            } catch (error) {
                console.warn('Marine life behavior system update error:', error);
            }
        }
        
        // Update cinematic camera system
        if (oceanForest.cinematicCamera) {
            try {
                oceanForest.cinematicCamera.update(deltaTime, oceanForest.octopusPosition, oceanForest.keys);
            } catch (error) {
                console.warn('Cinematic camera system update error:', error);
            }
        }
    }
    
    // Apply cinematic animations to marine life
    applyCinematicAnimations(oceanForest) {
        if (!oceanForest.cinematicAnimation) return;
        
        // Apply cinematic animations to different types of marine life
        if (oceanForest.capeReefFish) {
            oceanForest.capeReefFish.forEach(fish => {
                oceanForest.cinematicAnimation.animateMarineLife(fish, 'swimming', 1.0);
            });
        }
        
        if (oceanForest.capeFurSeals) {
            oceanForest.capeFurSeals.forEach(seal => {
                oceanForest.cinematicAnimation.animateMarineLife(seal, 'floating', 0.8);
            });
        }
        
        if (oceanForest.africanPenguins) {
            oceanForest.africanPenguins.forEach(penguin => {
                oceanForest.cinematicAnimation.animateMarineLife(penguin, 'schooling', 1.2);
            });
        }
        
        if (oceanForest.greatWhiteSharks) {
            oceanForest.greatWhiteSharks.forEach(shark => {
                oceanForest.cinematicAnimation.animateMarineLife(shark, 'hunting', 1.5);
            });
        }
    }
    
    // Get render statistics
    getRenderStats() {
        return {
            fps: this.fps,
            triangles: this.renderer.info.render.triangles,
            calls: this.renderer.info.render.calls,
            memory: this.renderer.info.memory
        };
    }
}

// Register module
if (window.moduleManager) {
    window.moduleManager.registerModule('RenderEngine', RenderEngine);
}