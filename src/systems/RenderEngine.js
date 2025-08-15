// 渲染引擎 - 主渲染循环和后处理效果
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
        
        // 后处理标志
        this.enablePostProcessing = false;
    }
    
    setupPostProcessing() {
        // 基础后处理设置
        // 可以在这里添加bloom、SSAO等效果
        console.log('Post-processing setup (basic)');
    }
    
    startRenderLoop(oceanForest) {
        const animate = (currentTime) => {
            const deltaTime = this.clock.getElapsedTime();
            
            // 更新性能指标
            this.updatePerformance(currentTime);
            
            // 更新海洋环境
            this.updateOceanEnvironment(oceanForest, deltaTime);
            
            // 更新海洋生物
            this.updateMarineLife(oceanForest, deltaTime);
            
            // 更新章鱼
            this.updateOctopus(oceanForest, deltaTime);
            
            // 更新摄像机
            this.updateCamera(oceanForest, deltaTime);
            
            // 更新光照效果
            this.updateLighting(oceanForest, deltaTime);
            
            // 更新高级系统（如果可用）
            this.updateAdvancedSystems(oceanForest, deltaTime);
            
            // 更新浮动标签
            if (oceanForest.floatingLabels) {
                oceanForest.floatingLabels.updateFloatingLabels();
            }
            
            // 渲染场景
            this.renderer.render(this.scene, this.camera);
            
            requestAnimationFrame(animate);
        };
        
        animate(0);
    }
    
    updateOceanEnvironment(oceanForest, deltaTime) {
        // 更新海带森林
        if (oceanForest.kelpForest && oceanForest.oceanEnvironment) {
            oceanForest.oceanEnvironment.updateKelp(oceanForest.kelpForest, deltaTime);
        }
        
        // 更新气泡
        if (oceanForest.bubbles && oceanForest.oceanEnvironment) {
            oceanForest.oceanEnvironment.updateBubbles(oceanForest.bubbles, deltaTime);
        }
        
        // 更新光线
        if (oceanForest.lightRays && oceanForest.oceanEnvironment) {
            oceanForest.oceanEnvironment.updateLightRays(oceanForest.lightRays, deltaTime);
        }
        
        // 更新天空盒
        if (oceanForest.skyboxMaterial) {
            oceanForest.skyboxMaterial.uniforms.time.value = deltaTime;
        }
    }
    
    updateMarineLife(oceanForest, deltaTime) {
        // 更新南非海狗
        if (oceanForest.marineAnimals) {
            oceanForest.marineAnimals.updateCapeFurSeals(deltaTime);
            oceanForest.marineAnimals.updateAfricanPenguins(deltaTime);
        }
        
        // 更新鲨鱼和鱼类
        if (oceanForest.sharksAndFish) {
            oceanForest.sharksAndFish.updateGreatWhiteSharks(deltaTime);
            oceanForest.sharksAndFish.updateCapeReefFish(deltaTime);
        }
        
        // 更新海胆和海葵
        this.updateSeaUrchinFields(oceanForest.seaUrchinFields, deltaTime);
        this.updateSeaAnemones(oceanForest.seaAnemones, deltaTime);
    }
    
    updateOctopus(oceanForest, deltaTime) {
        if (!oceanForest.octopusModel) return;
        
        // 处理输入
        const movement = this.processOctopusInput(oceanForest.keys);
        
        // 更新章鱼模型
        oceanForest.octopusModel.updateOctopus(
            deltaTime,
            oceanForest.octopusPosition,
            oceanForest.keys,
            movement.isMoving,
            movement.direction
        );
        
        // 更新章鱼位置引用
        const octopusPos = oceanForest.octopusModel.getPosition();
        if (octopusPos) {
            oceanForest.octopusPosition.copy(octopusPos);
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
        
        // 摄像机跟随章鱼
        const targetPosition = oceanForest.octopusPosition.clone().add(oceanForest.cameraOffset);
        
        // 更平滑的插值
        this.camera.position.lerp(targetPosition, 0.08);
        
        // 看向章鱼，带轻微鼠标影响
        const lookTarget = oceanForest.octopusPosition.clone();
        lookTarget.x += oceanForest.mouse.x * 2;
        lookTarget.y += oceanForest.mouse.y * 1.5;
        
        this.camera.lookAt(lookTarget);
        
        // 轻微的摄像机摇摆（游泳时）- 可选效果
        const enableCameraSwag = false; // 设为false禁用摇摆效果
        const movement = this.processOctopusInput(oceanForest.keys);
        if (movement.isMoving && enableCameraSwag) {
            const time = performance.now() * 0.001;
            // 使用正弦波创造平滑的摇摆效果
            const smoothShakeX = Math.sin(time * 8) * 0.015;
            const smoothShakeY = Math.sin(time * 6) * 0.008;
            this.camera.position.x += smoothShakeX;
            this.camera.position.y += smoothShakeY;
        }
    }
    
    updateLighting(oceanForest, deltaTime) {
        // 更新焦散光效
        if (oceanForest.causticLights && oceanForest.oceanEnvironment) {
            oceanForest.oceanEnvironment.updateCausticLights(oceanForest.causticLights, deltaTime);
        }
        
        // 动态光线强度
        const timeOfDay = Math.sin(deltaTime * 0.1) * 0.2 + 0.8;
        
        if (oceanForest.directionalLight) {
            oceanForest.directionalLight.intensity = timeOfDay;
        }
    }
    
    updateSeaUrchinFields(seaUrchinFields, deltaTime) {
        if (!seaUrchinFields) return;
        
        seaUrchinFields.forEach((urchin, index) => {
            const time = deltaTime + index * 0.5;
            
            // 海胆的轻微呼吸效果
            const breathe = 1 + Math.sin(time * 1.5) * 0.05;
            urchin.scale.setScalar(breathe);
            
            // 棘刺轻微摆动
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
            
            // 海葵触手摆动
            anemone.rotation.y = Math.sin(time * 0.8) * 0.2;
            
            // 开合效果
            const openClose = Math.sin(time * 0.5) * 0.1 + 0.9;
            anemone.scale.y = openClose;
            
            // 颜色变化
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
            
            // 更新UI显示
            const fpsElement = document.getElementById('fps');
            if (fpsElement) {
                fpsElement.textContent = this.fps;
            }
        }
    }
    
    // 调整渲染质量（性能优化）
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
    
    // 更新高级系统
    updateAdvancedSystems(oceanForest, deltaTime) {
        // 更新电影级动画系统
        if (oceanForest.cinematicAnimation) {
            try {
                oceanForest.cinematicAnimation.update();
                this.applyCinematicAnimations(oceanForest);
            } catch (error) {
                console.warn('电影级动画系统更新错误:', error);
            }
        }
        
        // 更新高级粒子系统
        if (oceanForest.advancedParticles) {
            try {
                oceanForest.advancedParticles.update(deltaTime);
            } catch (error) {
                console.warn('高级粒子系统更新错误:', error);
            }
        }
        
        // 更新海洋生物行为系统
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
                console.warn('海洋生物行为系统更新错误:', error);
            }
        }
        
        // 更新电影级摄像机系统
        if (oceanForest.cinematicCamera) {
            try {
                oceanForest.cinematicCamera.update(deltaTime, oceanForest.octopusPosition, oceanForest.keys);
            } catch (error) {
                console.warn('电影级摄像机系统更新错误:', error);
            }
        }
    }
    
    // 应用电影级动画到海洋生物
    applyCinematicAnimations(oceanForest) {
        if (!oceanForest.cinematicAnimation) return;
        
        // 为不同类型的海洋生物应用电影级动画
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
    
    // 获取渲染统计信息
    getRenderStats() {
        return {
            fps: this.fps,
            triangles: this.renderer.info.render.triangles,
            calls: this.renderer.info.render.calls,
            memory: this.renderer.info.memory
        };
    }
}

// 注册模块
if (window.moduleManager) {
    window.moduleManager.registerModule('RenderEngine', RenderEngine);
}