// 电影级摄像机系统 - 动态摄像机效果
// Cinematic Camera System - Dynamic camera effects

class CinematicCameraSystem {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        
        // 摄像机状态
        this.currentMode = 'follow'; // follow, cinematic, orbit, tracking
        this.target = null;
        this.originalPosition = camera.position.clone();
        this.originalRotation = camera.rotation.clone();
        
        // 电影模式参数
        this.cinematicParams = {
            shakingIntensity: 0,
            breathingAmount: 0.02,
            focusPulling: false,
            depthOfField: true,
            motionBlur: false
        };
        
        // 跟踪参数
        this.followParams = {
            smoothness: 0.05,
            offset: new THREE.Vector3(0, 3, 8),
            lookAhead: 2.0,
            verticalDamping: 0.8
        };
        
        // 轨道运动参数
        this.orbitParams = {
            radius: 15,
            height: 5,
            speed: 0.2,
            angle: 0,
            target: new THREE.Vector3(0, 0, 0)
        };
        
        // 镜头效果
        this.lensEffects = {
            focalLength: 50, // mm
            aperture: 2.8,
            focusDistance: 10,
            bokehIntensity: 0.5
        };
        
        // 时间轴动画
        this.animations = [];
        this.currentAnimation = null;
        
        // 噪声生成器 - 用于自然的摄像机运动
        this.noiseOffset = Math.random() * 1000;
        this.time = 0;
        
        this.init();
    }
    
    init() {
        // 设置初始摄像机参数
        this.setupCameraProperties();
        
        // 创建虚拟摄像机辅助对象
        this.createCameraRig();
    }
    
    setupCameraProperties() {
        // 存储原始设置
        this.camera.userData.originalFov = this.camera.fov;
        this.camera.userData.originalNear = this.camera.near;
        this.camera.userData.originalFar = this.camera.far;
        
        // 优化摄像机设置用于电影效果
        this.camera.near = 0.1;
        this.camera.far = 2000;
        this.camera.updateProjectionMatrix();
    }
    
    createCameraRig() {
        // 创建摄像机钻机 - 用于复杂的摄像机运动
        this.cameraRig = new THREE.Object3D();
        this.cameraArm = new THREE.Object3D();
        this.cameraMount = new THREE.Object3D();
        
        this.scene.add(this.cameraRig);
        this.cameraRig.add(this.cameraArm);
        this.cameraArm.add(this.cameraMount);
        this.cameraMount.add(this.camera);
        
        // 设置钻机初始位置
        this.cameraRig.position.copy(this.originalPosition);
    }
    
    // === 主要摄像机模式 ===
    
    setMode(mode, options = {}) {
        this.currentMode = mode;
        
        switch (mode) {
            case 'follow':
                this.setupFollowMode(options);
                break;
            case 'cinematic':
                this.setupCinematicMode(options);
                break;
            case 'orbit':
                this.setupOrbitMode(options);
                break;
            case 'tracking':
                this.setupTrackingMode(options);
                break;
            case 'documentary':
                this.setupDocumentaryMode(options);
                break;
        }
    }
    
    setupFollowMode(options) {
        this.target = options.target || this.target;
        if (options.offset) this.followParams.offset.copy(options.offset);
        if (options.smoothness) this.followParams.smoothness = options.smoothness;
    }
    
    setupCinematicMode(options) {
        // 电影级摄像机设置
        this.cinematicParams.shakingIntensity = options.shakingIntensity || 0.1;
        this.cinematicParams.breathingAmount = options.breathingAmount || 0.02;
        this.cinematicParams.depthOfField = options.depthOfField !== false;
        
        // 调整视野角度为电影标准
        const cinematicFov = options.fov || 35; // 电影标准焦距
        this.smoothFovChange(cinematicFov, 2.0);
    }
    
    setupOrbitMode(options) {
        if (options.target) this.orbitParams.target.copy(options.target);
        this.orbitParams.radius = options.radius || 15;
        this.orbitParams.height = options.height || 5;
        this.orbitParams.speed = options.speed || 0.2;
        this.orbitParams.angle = options.startAngle || 0;
    }
    
    setupTrackingMode(options) {
        // 跟拍模式 - 平滑跟随目标
        this.target = options.target;
        this.trackingParams = {
            distance: options.distance || 12,
            height: options.height || 3,
            leadFactor: options.leadFactor || 1.5,
            smoothness: options.smoothness || 0.08
        };
    }
    
    setupDocumentaryMode(options) {
        // 纪录片风格 - 更自然的手持感觉
        this.documentaryParams = {
            handheldAmount: options.handheldAmount || 0.05,
            focusHunting: options.focusHunting !== false,
            naturalMovement: true
        };
        
        this.cinematicParams.shakingIntensity = 0.02;
        this.cinematicParams.breathingAmount = 0.03;
    }
    
    // === 更新循环 ===
    
    update(deltaTime, octopusPosition, keys) {
        this.time += deltaTime;
        
        // 更新当前模式
        switch (this.currentMode) {
            case 'follow':
                this.updateFollowMode(deltaTime, octopusPosition, keys);
                break;
            case 'cinematic':
                this.updateCinematicMode(deltaTime);
                break;
            case 'orbit':
                this.updateOrbitMode(deltaTime);
                break;
            case 'tracking':
                this.updateTrackingMode(deltaTime);
                break;
            case 'documentary':
                this.updateDocumentaryMode(deltaTime);
                break;
        }
        
        // 应用全局摄像机效果
        this.applyCameraEffects(deltaTime);
        
        // 更新动画
        this.updateAnimations(deltaTime);
    }
    
    updateFollowMode(deltaTime, octopusPosition, keys) {
        if (!octopusPosition) return;
        
        // 计算目标位置
        const targetPosition = octopusPosition.clone().add(this.followParams.offset);
        
        // 预测性跟踪 - 根据移动方向调整摄像机
        const movement = this.detectMovement(keys);
        if (movement.isMoving) {
            const lookAheadOffset = movement.direction.clone().multiplyScalar(this.followParams.lookAhead);
            targetPosition.add(lookAheadOffset);
        }
        
        // 平滑插值到目标位置
        this.camera.position.lerp(targetPosition, this.followParams.smoothness);
        
        // 计算注视点 - 带轻微偏移
        const lookTarget = octopusPosition.clone();
        
        // 添加细微的摄像机运动
        this.addSubtleCameraMovement();
        
        // 平滑注视
        this.smoothLookAt(lookTarget);
    }
    
    updateCinematicMode(deltaTime) {
        // 电影级呼吸效果
        const breathing = Math.sin(this.time * 0.8) * this.cinematicParams.breathingAmount;
        this.camera.position.y += breathing;
        
        // 微妙的摄像机震动
        this.applyCameraShake(this.cinematicParams.shakingIntensity);
        
        // 焦点拉拽效果
        if (this.cinematicParams.focusPulling) {
            this.updateFocusPulling();
        }
    }
    
    updateOrbitMode(deltaTime) {
        // 限制deltaTime以避免极端值导致的鬼畜效果
        deltaTime = Math.min(deltaTime, 0.1);
        
        this.orbitParams.angle += this.orbitParams.speed * deltaTime * 10; // 调整速度系数
        
        const x = this.orbitParams.target.x + Math.cos(this.orbitParams.angle) * this.orbitParams.radius;
        const z = this.orbitParams.target.z + Math.sin(this.orbitParams.angle) * this.orbitParams.radius;
        const y = this.orbitParams.target.y + this.orbitParams.height;
        
        // 使用摄像机钻机而不是直接设置摄像机位置
        if (this.cameraRig) {
            this.cameraRig.position.set(x, y, z);
            this.cameraRig.lookAt(this.orbitParams.target);
            
            // 重置本地摄像机位置以避免冲突
            this.camera.position.set(0, 0, 0);
            this.camera.rotation.set(0, 0, 0);
        } else {
            // 备用方案：直接控制摄像机
            this.camera.position.set(x, y, z);
            this.camera.lookAt(this.orbitParams.target);
        }
        
        // 添加平滑的高度变化
        const heightVariation = Math.sin(this.orbitParams.angle * 0.3) * 1.5;
        if (this.cameraRig) {
            this.cameraRig.position.y += heightVariation;
        } else {
            this.camera.position.y += heightVariation;
        }
    }
    
    updateTrackingMode(deltaTime) {
        if (!this.target) return;
        
        // 计算理想摄像机位置
        const targetPos = this.target.clone();
        const cameraOffset = new THREE.Vector3(
            -this.trackingParams.distance,
            this.trackingParams.height,
            0
        );
        
        // 应用目标方向
        if (this.targetVelocity) {
            const leadPosition = this.targetVelocity.clone().multiplyScalar(this.trackingParams.leadFactor);
            targetPos.add(leadPosition);
        }
        
        const idealPosition = targetPos.add(cameraOffset);
        
        // 平滑移动
        this.camera.position.lerp(idealPosition, this.trackingParams.smoothness);
        this.camera.lookAt(this.target);
    }
    
    updateDocumentaryMode(deltaTime) {
        // 手持摄像机效果
        const handheld = this.generateHandheldMovement(this.time);
        this.camera.position.add(handheld.multiplyScalar(this.documentaryParams.handheldAmount));
        
        // 自然的焦点搜索
        if (this.documentaryParams.focusHunting) {
            this.simulateFocusHunting();
        }
    }
    
    // === 摄像机效果函数 ===
    
    applyCameraShake(intensity) {
        const shake = new THREE.Vector3(
            (Math.random() - 0.5) * intensity,
            (Math.random() - 0.5) * intensity * 0.5,
            (Math.random() - 0.5) * intensity
        );
        
        this.camera.position.add(shake);
    }
    
    addSubtleCameraMovement() {
        // 基于柏林噪声的自然摄像机运动
        const noiseScale = 0.5;
        const timeScale = 0.3;
        
        const noiseX = this.noise(this.time * timeScale, this.noiseOffset) * noiseScale;
        const noiseY = this.noise(this.time * timeScale, this.noiseOffset + 100) * noiseScale * 0.3;
        const noiseZ = this.noise(this.time * timeScale, this.noiseOffset + 200) * noiseScale;
        
        this.camera.position.x += noiseX * 0.01;
        this.camera.position.y += noiseY * 0.01;
        this.camera.position.z += noiseZ * 0.01;
    }
    
    generateHandheldMovement(time) {
        // 模拟手持摄像机的自然运动
        const frequency1 = 2.1;
        const frequency2 = 1.7;
        const frequency3 = 0.9;
        
        return new THREE.Vector3(
            Math.sin(time * frequency1) * 0.5 + Math.sin(time * frequency2 * 1.2) * 0.3,
            Math.cos(time * frequency2) * 0.3 + Math.sin(time * frequency3) * 0.6,
            Math.sin(time * frequency3 * 1.3) * 0.4 + Math.cos(time * frequency1 * 0.8) * 0.2
        );
    }
    
    smoothLookAt(target) {
        // 创建平滑的注视过渡
        const currentTarget = new THREE.Vector3();
        this.camera.getWorldDirection(currentTarget);
        currentTarget.multiplyScalar(-1).add(this.camera.position);
        
        // 插值到新目标
        currentTarget.lerp(target, 0.1);
        this.camera.lookAt(currentTarget);
    }
    
    smoothFovChange(targetFov, duration) {
        // 平滑改变视野角度
        const startFov = this.camera.fov;
        const startTime = this.time;
        
        this.animations.push({
            type: 'fov',
            start: startTime,
            duration: duration,
            startValue: startFov,
            endValue: targetFov,
            easing: this.easeInOutQuad
        });
    }
    
    // === 高级摄像机功能 ===
    
    createCinematicSequence(keyframes) {
        // 创建电影序列
        this.currentAnimation = {
            type: 'sequence',
            keyframes: keyframes,
            startTime: this.time,
            duration: keyframes[keyframes.length - 1].time
        };
        
        this.animations.push(this.currentAnimation);
    }
    
    dollyZoom(targetFocalLength, duration = 3.0) {
        // 希区柯克式变焦效果
        const startFov = this.camera.fov;
        const targetFov = 2 * Math.atan(35 / (2 * targetFocalLength)) * 180 / Math.PI;
        
        this.animations.push({
            type: 'dollyZoom',
            start: this.time,
            duration: duration,
            startFov: startFov,
            endFov: targetFov,
            originalDistance: this.camera.position.distanceTo(this.target || new THREE.Vector3())
        });
    }
    
    rackFocus(nearTarget, farTarget, duration = 2.0) {
        // 拉焦效果
        this.animations.push({
            type: 'rackFocus',
            start: this.time,
            duration: duration,
            nearTarget: nearTarget,
            farTarget: farTarget,
            phase: 0
        });
    }
    
    // === 动画更新 ===
    
    updateAnimations(deltaTime) {
        this.animations = this.animations.filter(animation => {
            const elapsed = this.time - animation.start;
            const progress = Math.min(elapsed / animation.duration, 1.0);
            
            switch (animation.type) {
                case 'fov':
                    const fov = this.lerp(animation.startValue, animation.endValue, animation.easing(progress));
                    this.camera.fov = fov;
                    this.camera.updateProjectionMatrix();
                    break;
                    
                case 'dollyZoom':
                    this.updateDollyZoom(animation, progress);
                    break;
                    
                case 'rackFocus':
                    this.updateRackFocus(animation, progress);
                    break;
                    
                case 'sequence':
                    this.updateCinematicSequence(animation, elapsed);
                    break;
            }
            
            return progress < 1.0;
        });
    }
    
    updateDollyZoom(animation, progress) {
        const easedProgress = this.easeInOutQuad(progress);
        
        // 改变FOV
        this.camera.fov = this.lerp(animation.startFov, animation.endFov, easedProgress);
        this.camera.updateProjectionMatrix();
        
        // 调整摄像机位置保持目标大小不变
        if (this.target) {
            const currentDistance = this.camera.position.distanceTo(this.target);
            const fovRatio = animation.endFov / animation.startFov;
            const targetDistance = animation.originalDistance * fovRatio;
            
            const direction = this.camera.position.clone().sub(this.target).normalize();
            const newPosition = this.target.clone().add(direction.multiplyScalar(targetDistance));
            
            this.camera.position.lerp(newPosition, 0.1);
        }
    }
    
    updateRackFocus(animation, progress) {
        // 模拟拉焦效果（如果有后处理）
        animation.phase = progress;
        
        // 这里可以集成景深后处理效果
        if (this.onRackFocus) {
            this.onRackFocus(animation.nearTarget, animation.farTarget, progress);
        }
    }
    
    // === 工具函数 ===
    
    detectMovement(keys) {
        const movement = {
            isMoving: false,
            direction: new THREE.Vector3()
        };
        
        if (keys['KeyW'] || keys['ArrowUp']) {
            movement.direction.z -= 1;
            movement.isMoving = true;
        }
        if (keys['KeyS'] || keys['ArrowDown']) {
            movement.direction.z += 1;
            movement.isMoving = true;
        }
        if (keys['KeyA'] || keys['ArrowLeft']) {
            movement.direction.x -= 1;
            movement.isMoving = true;
        }
        if (keys['KeyD'] || keys['ArrowRight']) {
            movement.direction.x += 1;
            movement.isMoving = true;
        }
        
        movement.direction.normalize();
        return movement;
    }
    
    // 简化的噪声函数
    noise(x, seed = 0) {
        const n = Math.sin(x + seed) * 43758.5453;
        return n - Math.floor(n);
    }
    
    lerp(start, end, t) {
        return start + (end - start) * t;
    }
    
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    
    applyCameraEffects(deltaTime) {
        // 应用任何全局摄像机效果
        // 例如色彩校正、晕影等
    }
    
    simulateFocusHunting() {
        // 模拟自动对焦的搜索行为
        const huntAmount = Math.sin(this.time * 8) * 0.1;
        
        // 这里可以调整焦距或景深效果
        if (this.onFocusHunting) {
            this.onFocusHunting(huntAmount);
        }
    }
    
    // === 公共接口 ===
    
    setTarget(target) {
        this.target = target;
    }
    
    getCurrentMode() {
        return this.currentMode;
    }
    
    resetToDefault() {
        this.setMode('follow');
        this.camera.position.copy(this.originalPosition);
        this.camera.rotation.copy(this.originalRotation);
        this.camera.fov = this.camera.userData.originalFov;
        this.camera.updateProjectionMatrix();
    }
    
    // 手动控制接口
    enableShake(intensity = 0.1) {
        this.cinematicParams.shakingIntensity = intensity;
    }
    
    disableShake() {
        this.cinematicParams.shakingIntensity = 0;
    }
    
    setBreathing(amount = 0.02) {
        this.cinematicParams.breathingAmount = amount;
    }
}

// 注册模块
if (window.moduleManager) {
    window.moduleManager.registerModule('CinematicCameraSystem', CinematicCameraSystem);
}