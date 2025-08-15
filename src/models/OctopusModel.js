// 章鱼模型 - 主角章鱼的3D模型和动画
// Octopus Model - Main character octopus 3D model and animations

class OctopusModel {
    constructor(scene) {
        this.scene = scene;
        this.octopus = null;
        this.tentacles = [];
        this.isMoving = false;
        this.movementDirection = null;
    }
    
    createOctopus() {
        const octopusGroup = new THREE.Group();
        
        // 头部
        const headGeometry = new THREE.SphereGeometry(2.5, 16, 12);
        headGeometry.scale(1, 0.8, 1.1);
        
        // 电影级章鱼材质 - 渐进式升级
        const headMaterial = window.THREE.MeshPhysicalMaterial ? 
            new THREE.MeshPhysicalMaterial({
                color: 0xff6b6b,
                roughness: 0.6,
                metalness: 0.0,
                clearcoat: 0.4,
                clearcoatRoughness: 0.6,
                transmission: 0.05,
                thickness: 1.0
            }) : 
            new THREE.MeshPhongMaterial({
                color: 0xff6b6b,
                shininess: 80,
                specular: 0x555555
            });
        
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1;
        head.castShadow = true;
        octopusGroup.add(head);
        
        // 眼睛
        this.createEyes(octopusGroup);
        
        // 触手
        this.createTentacles(octopusGroup);
        
        // 添加到场景
        this.scene.add(octopusGroup);
        this.octopus = octopusGroup;
        
        return octopusGroup;
    }
    
    createEyes(parent) {
        const eyeGeometry = new THREE.SphereGeometry(0.4, 12, 8);
        const eyeMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            shininess: 100
        });
        
        // 左眼
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.8, 1.5, 1.8);
        parent.add(leftEye);
        
        // 右眼
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.8, 1.5, 1.8);
        parent.add(rightEye);
        
        // 瞳孔
        const pupilGeometry = new THREE.SphereGeometry(0.2, 8, 6);
        const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        
        const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        leftPupil.position.set(-0.8, 1.5, 2.1);
        parent.add(leftPupil);
        
        const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        rightPupil.position.set(0.8, 1.5, 2.1);
        parent.add(rightPupil);
        
        // 存储眼睛引用
        this.eyes = { left: leftEye, right: rightEye, leftPupil, rightPupil };
    }
    
    createTentacles(parent) {
        const tentaclePositions = [
            { x: -1.5, y: -0.5, z: 1.0, length: 6 },
            { x: -0.5, y: -0.8, z: 1.2, length: 7 },
            { x: 0.5, y: -0.8, z: 1.2, length: 6.5 },
            { x: 1.5, y: -0.5, z: 1.0, length: 6.8 },
            { x: -1.0, y: -1.0, z: -0.5, length: 7.2 },
            { x: 0, y: -1.2, z: -0.8, length: 6.3 },
            { x: 1.0, y: -1.0, z: -0.5, length: 7.1 },
            { x: 0, y: -0.3, z: -1.5, length: 5.8 }
        ];
        
        this.tentacles = [];
        
        tentaclePositions.forEach((pos, index) => {
            const tentacle = this.createSingleTentacle(pos.length, index);
            tentacle.position.set(pos.x, pos.y, pos.z);
            parent.add(tentacle);
            this.tentacles.push(tentacle);
        });
    }
    
    createSingleTentacle(length, index) {
        const tentacleGroup = new THREE.Group();
        const segmentCount = 12; // 增加分段数量，使飘带效果更流畅
        const segmentLength = length / segmentCount;
        
        for (let i = 0; i < segmentCount; i++) {
            // 更自然的渐变粗细，模拟真实章鱼触手
            const baseRadius = 0.35;
            const tapering = Math.pow(1 - (i / segmentCount), 1.5); // 指数渐变
            const radius = baseRadius * tapering + 0.08; // 末端保持最小粗细
            
            // 使用更多面的圆柱体，使表面更光滑
            const segmentGeometry = new THREE.CylinderGeometry(
                radius * 0.9, // 顶部稍细
                radius,        // 底部
                segmentLength,
                12            // 增加面数
            );
            
            // 电影级触手材质 - 兼容性优先
            const segmentMaterial = window.THREE.MeshPhysicalMaterial ? 
                new THREE.MeshPhysicalMaterial({
                    color: 0xff6b6b,
                    roughness: 0.5,
                    metalness: 0.0,
                    clearcoat: 0.6,
                    clearcoatRoughness: 0.4,
                    transmission: 0.08,
                    thickness: 0.8,
                    opacity: 0.95
                }) :
                new THREE.MeshPhongMaterial({
                    color: 0xff6b6b,
                    shininess: 90,
                    specular: 0x555555,
                    transparent: true,
                    opacity: 0.95
                });
            
            const segment = new THREE.Mesh(segmentGeometry, segmentMaterial);
            segment.position.y = -i * segmentLength - segmentLength / 2;
            segment.castShadow = true;
            segment.receiveShadow = true;
            
            // 轻微的随机初始角度，增加自然感
            segment.rotation.z = (Math.random() - 0.5) * 0.1;
            segment.rotation.x = (Math.random() - 0.5) * 0.05;
            
            tentacleGroup.add(segment);
        }
        
        // 添加触手末端的吸盘
        this.addSuckers(tentacleGroup, length, segmentCount);
        
        // 增强动画属性，增加更多变化
        tentacleGroup.userData.baseAngle = index * Math.PI / 4 + Math.random() * Math.PI / 8;
        tentacleGroup.userData.swaySpeed = 0.8 + Math.random() * 0.6; // 稍微慢一些，更优雅
        tentacleGroup.userData.segments = tentacleGroup.children.slice(0, segmentCount); // 只包含分段，不包含吸盘
        tentacleGroup.userData.phaseOffset = Math.random() * Math.PI * 2; // 每个触手的相位偏移
        
        return tentacleGroup;
    }
    
    addSuckers(tentacle, length, segmentCount) {
        const suckerCount = Math.floor(length / 1.5);
        
        for (let i = 0; i < suckerCount; i++) {
            const suckerGeometry = new THREE.SphereGeometry(0.1, 6, 4);
            const suckerMaterial = new THREE.MeshPhongMaterial({
                color: 0xcc5555,
                shininess: 80
            });
            
            const sucker = new THREE.Mesh(suckerGeometry, suckerMaterial);
            const segmentIndex = Math.floor(i / (suckerCount / segmentCount));
            const yPos = -segmentIndex * (length / segmentCount) - Math.random() * (length / segmentCount);
            
            sucker.position.set(
                (Math.random() - 0.5) * 0.4,
                yPos,
                0.2 + Math.random() * 0.1
            );
            
            tentacle.add(sucker);
        }
    }
    
    updateOctopus(deltaTime, position, keys, isMoving, direction) {
        if (!this.octopus) return;
        
        // 更新位置
        this.octopus.position.copy(position);
        
        // 更新移动状态
        this.isMoving = isMoving;
        this.movementDirection = direction;
        
        // 处理键盘输入
        this.handleMovement(keys, deltaTime);
        
        // 更新触手动画
        this.updateTentacles(deltaTime);
        
        // 更新眼睛
        this.updateEyes(deltaTime);
        
        // 基础浮动动画
        if (!isMoving) {
            this.octopus.position.y += Math.sin(deltaTime * 0.8) * 0.1;
            this.octopus.rotation.z = Math.sin(deltaTime * 0.6) * 0.05;
        }
    }
    
    handleMovement(keys, deltaTime) {
        if (!this.octopus) return;
        
        let moving = false;
        const moveSpeed = 0.08; // 极慢的固定移动速度
        
        // 简化的直接移动，不使用deltaTime避免帧率问题
        if (keys['KeyW'] || keys['ArrowUp']) {
            this.octopus.position.z -= moveSpeed;
            this.octopus.rotation.x = -0.05;
            moving = true;
        }
        if (keys['KeyS'] || keys['ArrowDown']) {
            this.octopus.position.z += moveSpeed;
            this.octopus.rotation.x = 0.05;
            moving = true;
        }
        if (keys['KeyA'] || keys['ArrowLeft']) {
            this.octopus.position.x -= moveSpeed;
            this.octopus.rotation.y = 0.1;
            this.octopus.rotation.z = -0.05;
            moving = true;
        }
        if (keys['KeyD'] || keys['ArrowRight']) {
            this.octopus.position.x += moveSpeed;
            this.octopus.rotation.y = -0.1;
            this.octopus.rotation.z = 0.05;
            moving = true;
        }
        if (keys['Space']) {
            this.octopus.position.y += moveSpeed;
            moving = true;
        }
        if (keys['ShiftLeft'] || keys['ShiftRight']) {
            this.octopus.position.y -= moveSpeed;
            moving = true;
        }
        
        // 位置限制
        this.octopus.position.x = Math.max(-50, Math.min(50, this.octopus.position.x));
        this.octopus.position.y = Math.max(-25, Math.min(15, this.octopus.position.y));
        this.octopus.position.z = Math.max(-50, Math.min(50, this.octopus.position.z));
        
        // 如果没有移动，重置旋转
        if (!moving) {
            this.octopus.rotation.x *= 0.9;
            this.octopus.rotation.y *= 0.9;
            this.octopus.rotation.z *= 0.9;
        }
        
        this.isMoving = moving;
    }
    
    updateTentacles(deltaTime) {
        this.tentacles.forEach((tentacle, index) => {
            if (!tentacle.userData) return;
            
            const time = deltaTime + tentacle.userData.baseAngle;
            const speed = tentacle.userData.swaySpeed;
            const phaseOffset = tentacle.userData.phaseOffset || 0;
            
            // 飘带效果的基础参数
            const baseFreq = 0.6; // 降低基础频率，更优雅
            const waveSpeed = 1.8; // 稍微降低波浪传播速度
            const intensity = this.isMoving ? 1.2 : 0.9; // 调整强度比例
            
            // 主触手根部的自然摆动（3D空间中的椭圆运动）
            const primaryWave = Math.sin(time * baseFreq * speed + phaseOffset) * 0.25 * intensity;
            const secondaryWave = Math.cos(time * baseFreq * speed * 0.7 + phaseOffset * 1.3) * 0.18 * intensity;
            const tertiaryWave = Math.sin(time * baseFreq * speed * 1.3 + phaseOffset * 0.8) * 0.12 * intensity;
            
            // 根据移动状态调整触手根部姿态
            if (this.isMoving) {
                // 游泳时触手更有力度的推进动作
                const propulsionWave = Math.sin(time * waveSpeed * 1.5) * 0.4;
                tentacle.rotation.x = primaryWave + propulsionWave;
                tentacle.rotation.z = secondaryWave * 1.2;
                tentacle.rotation.y = tertiaryWave * 0.8;
                
                // 根据移动方向调整
                if (this.movementDirection === 'forward') {
                    tentacle.rotation.x += 0.3;
                } else if (this.movementDirection === 'backward') {
                    tentacle.rotation.x -= 0.3;
                } else if (this.movementDirection === 'left') {
                    tentacle.rotation.z += 0.2;
                } else if (this.movementDirection === 'right') {
                    tentacle.rotation.z -= 0.2;
                }
            } else {
                // 静止时的优雅飘动
                tentacle.rotation.x = primaryWave;
                tentacle.rotation.z = secondaryWave;
                tentacle.rotation.y = tertiaryWave;
            }
            
            // 增强的分段弯曲效果 - 真正的飘带波浪传播
            if (tentacle.userData.segments) {
                tentacle.userData.segments.forEach((segment, segIndex) => {
                    const segmentRatio = (segIndex + 1) / tentacle.userData.segments.length; // 0到1的比例
                    const segmentTime = time + segIndex * 0.35; // 波浪传播延迟
                    
                    // 多重波浪叠加，越靠近末端幅度越大，加入相位偏移
                    const wave1 = Math.sin(segmentTime * waveSpeed + phaseOffset) * segmentRatio * 0.35 * intensity;
                    const wave2 = Math.cos(segmentTime * waveSpeed * 0.6 + phaseOffset * 1.2) * segmentRatio * 0.25 * intensity;
                    const wave3 = Math.sin(segmentTime * waveSpeed * 1.4 + phaseOffset * 0.7) * segmentRatio * 0.18 * intensity;
                    
                    // 三个轴向的自然弯曲
                    segment.rotation.x = wave1;
                    segment.rotation.z = wave2;
                    segment.rotation.y = wave3 * 0.6;
                    
                    // 增强的扭转效果，模拟真实触手的螺旋运动
                    const twist = Math.sin(segmentTime * waveSpeed * 0.4 + phaseOffset) * segmentRatio * 0.15;
                    segment.rotation.y += twist;
                    
                    // 添加轻微的随机扰动，模拟水流 - 使用相位偏移让每个触手独特
                    const turbulencePhase = phaseOffset + segIndex * 0.7;
                    const turbulence = (Math.sin(segmentTime * 4.2 + turbulencePhase) + 
                                     Math.cos(segmentTime * 3.1 + turbulencePhase * 1.4)) * 0.025 * segmentRatio;
                    segment.rotation.x += turbulence;
                    segment.rotation.z += turbulence * 0.8;
                    
                    // 末端段额外的飘逸效果
                    if (segmentRatio > 0.7) {
                        const tipFloat = Math.sin(segmentTime * waveSpeed * 0.5 + phaseOffset) * (segmentRatio - 0.7) * 0.3;
                        segment.rotation.x += tipFloat;
                        segment.rotation.z += tipFloat * 0.6;
                    }
                });
            }
        });
    }
    
    updateEyes(deltaTime) {
        if (!this.eyes) return;
        
        // 眨眼动画
        const blinkTime = Math.sin(deltaTime * 0.3);
        if (blinkTime > 0.95) {
            this.eyes.left.scale.y = 0.1;
            this.eyes.right.scale.y = 0.1;
        } else {
            this.eyes.left.scale.y = 1;
            this.eyes.right.scale.y = 1;
        }
        
        // 瞳孔跟随运动
        if (this.isMoving) {
            const pupilOffset = 0.1;
            if (this.movementDirection === 'left') {
                this.eyes.leftPupil.position.x = this.eyes.left.position.x - pupilOffset;
                this.eyes.rightPupil.position.x = this.eyes.right.position.x - pupilOffset;
            } else if (this.movementDirection === 'right') {
                this.eyes.leftPupil.position.x = this.eyes.left.position.x + pupilOffset;
                this.eyes.rightPupil.position.x = this.eyes.right.position.x + pupilOffset;
            }
        } else {
            // 重置瞳孔位置
            this.eyes.leftPupil.position.x = this.eyes.left.position.x;
            this.eyes.rightPupil.position.x = this.eyes.right.position.x;
        }
    }
    
    getPosition() {
        return this.octopus ? this.octopus.position : new THREE.Vector3(0, 0, 0);
    }
    
    getOctopus() {
        return this.octopus;
    }
}

// 注册模块
if (window.moduleManager) {
    window.moduleManager.registerModule('OctopusModel', OctopusModel);
}