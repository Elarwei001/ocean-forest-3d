// 海洋生物行为系统 - 真实海洋生物行为模拟
// Marine Life Behavior System - Realistic marine animal behavior simulation

class MarineLifeBehavior {
    constructor() {
        this.behaviors = new Map();
        this.flockingRules = {
            separationDistance: 3.0,
            alignmentDistance: 5.0,
            cohesionDistance: 8.0,
            separationWeight: 1.5,
            alignmentWeight: 1.0,
            cohesionWeight: 1.0,
            maxSpeed: 2.0,
            maxForce: 0.5
        };
        
        // 环境感知
        this.environmentFactors = {
            currentFlow: new THREE.Vector3(0.1, 0, 0.05),
            temperature: 18, // 开普敦海水温度
            lightLevel: 0.7,
            predatorPresence: false
        };
        
        this.time = 0;
    }
    
    // 注册生物及其行为类型
    registerMarineLife(animal, behaviorType, species) {
        const behaviorData = {
            type: behaviorType,
            species: species,
            position: animal.position.clone(),
            velocity: new THREE.Vector3(),
            acceleration: new THREE.Vector3(),
            maxSpeed: this.getSpeciesMaxSpeed(species),
            energy: 100,
            state: 'normal', // normal, feeding, resting, escaping
            lastStateChange: 0,
            personalityFactor: Math.random(), // 0-1，个体差异
            age: Math.random(), // 0-1，影响行为
            neighbors: [],
            targetFood: null,
            homePosition: animal.position.clone()
        };
        
        this.behaviors.set(animal.id, behaviorData);
        return behaviorData;
    }
    
    getSpeciesMaxSpeed(species) {
        const speeds = {
            'Cape Fur Seal': 0.3,    // 降低海豹速度
            'African Penguin': 0.4,   // 降低企鹅速度
            'Great White Shark': 0.6, // 降低鲨鱼速度
            'Yellowtail': 0.5,        // 降低黄尾鰤鱼速度
            'Hottentot': 0.3,         // 降低霍屯督鱼速度
            'Steentjie': 0.2          // 降低石头鱼速度
        };
        return speeds[species] || 0.2;
    }
    
    // 主更新函数
    update(animals, deltaTime) {
        this.time += deltaTime;
        
        // 为每个动物更新行为
        animals.forEach(animal => {
            if (this.behaviors.has(animal.id)) {
                const behavior = this.behaviors.get(animal.id);
                this.updateAnimalBehavior(animal, behavior, animals, deltaTime);
            }
        });
    }
    
    updateAnimalBehavior(animal, behavior, allAnimals, deltaTime) {
        // 重置加速度
        behavior.acceleration.set(0, 0, 0);
        
        // 更新邻居列表
        this.updateNeighbors(animal, behavior, allAnimals);
        
        // 根据物种类型应用不同行为
        switch (behavior.type) {
            case 'schooling':
                this.applySchoolingBehavior(animal, behavior);
                break;
            case 'hunting':
                this.applyHuntingBehavior(animal, behavior, allAnimals);
                break;
            case 'territorial':
                this.applyTerritorialBehavior(animal, behavior);
                break;
            case 'bottom_dwelling':
                this.applyBottomDwellingBehavior(animal, behavior);
                break;
        }
        
        // 应用环境影响
        this.applyEnvironmentalForces(behavior);
        
        // 应用物理约束
        this.applyPhysicalConstraints(behavior);
        
        // 更新位置和旋转
        this.updateMovement(animal, behavior, deltaTime);
        
        // 更新动画状态
        this.updateAnimationState(animal, behavior);
        
        // 状态管理
        this.updateBehaviorState(behavior, deltaTime);
    }
    
    // 群体游动行为（鱼群）
    applySchoolingBehavior(animal, behavior) {
        if (behavior.neighbors.length === 0) return;
        
        // 分离 - 避免过度拥挤
        const separation = this.separation(behavior);
        
        // 对齐 - 与邻居方向一致
        const alignment = this.alignment(behavior);
        
        // 凝聚 - 向群体中心移动
        const cohesion = this.cohesion(behavior);
        
        // 应用权重
        separation.multiplyScalar(this.flockingRules.separationWeight);
        alignment.multiplyScalar(this.flockingRules.alignmentWeight);
        cohesion.multiplyScalar(this.flockingRules.cohesionWeight);
        
        // 合并所有力
        behavior.acceleration.add(separation);
        behavior.acceleration.add(alignment);
        behavior.acceleration.add(cohesion);
        
        // 避障行为
        const avoidance = this.obstacleAvoidance(animal, behavior);
        behavior.acceleration.add(avoidance);
        
        // 添加一些随机性，模拟个体差异
        const randomForce = new THREE.Vector3(
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.05,
            (Math.random() - 0.5) * 0.1
        ).multiplyScalar(behavior.personalityFactor);
        
        behavior.acceleration.add(randomForce);
    }
    
    // 狩猎行为（鲨鱼）
    applyHuntingBehavior(animal, behavior, allAnimals) {
        // 寻找猎物
        const prey = this.findPrey(animal, behavior, allAnimals);
        
        if (prey && behavior.state === 'hunting') {
            // 追捕行为
            const pursue = this.pursue(animal, behavior, prey);
            behavior.acceleration.add(pursue);
            
            // 增加能量消耗
            behavior.energy -= 0.1;
        } else {
            // 巡游行为
            const patrol = this.patrol(animal, behavior);
            behavior.acceleration.add(patrol);
            
            // 缓慢恢复能量
            behavior.energy = Math.min(100, behavior.energy + 0.05);
        }
        
        // 根据能量调整状态
        if (behavior.energy < 30 && behavior.state !== 'resting') {
            behavior.state = 'resting';
            behavior.lastStateChange = this.time;
        } else if (behavior.energy > 70 && behavior.state === 'resting') {
            behavior.state = 'hunting';
            behavior.lastStateChange = this.time;
        }
    }
    
    // 领域行为（海豹）
    applyTerritorialBehavior(animal, behavior) {
        // 保持在领域范围内
        const homeDistance = animal.position.distanceTo(behavior.homePosition);
        
        if (homeDistance > 15) {
            // 返回领域中心
            const homeward = behavior.homePosition.clone().sub(animal.position).normalize();
            homeward.multiplyScalar(0.3);
            behavior.acceleration.add(homeward);
        } else {
            // 在领域内巡游
            const wander = this.wander(behavior);
            behavior.acceleration.add(wander);
        }
        
        // 呼吸行为 - 定期上浮
        if (this.time % 30 < 5 && animal.position.y < -5) {
            const surface = new THREE.Vector3(0, 1, 0).multiplyScalar(0.2);
            behavior.acceleration.add(surface);
        }
    }
    
    // 底栖行为（某些鱼类）
    applyBottomDwellingBehavior(animal, behavior) {
        // 保持靠近海底
        const targetDepth = -20;
        const depthForce = new THREE.Vector3(0, (targetDepth - animal.position.y) * 0.1, 0);
        behavior.acceleration.add(depthForce);
        
        // 在底部觅食
        const forage = this.forage(behavior);
        behavior.acceleration.add(forage);
    }
    
    // === 核心行为函数 ===
    
    separation(behavior) {
        const separationForce = new THREE.Vector3();
        let count = 0;
        
        behavior.neighbors.forEach(neighbor => {
            const distance = behavior.position.distanceTo(neighbor.position);
            if (distance > 0 && distance < this.flockingRules.separationDistance) {
                const diff = behavior.position.clone().sub(neighbor.position);
                diff.normalize();
                diff.divideScalar(distance); // 距离越近，力越大
                separationForce.add(diff);
                count++;
            }
        });
        
        if (count > 0) {
            separationForce.divideScalar(count);
            separationForce.normalize();
            separationForce.multiplyScalar(behavior.maxSpeed);
            separationForce.sub(behavior.velocity);
            separationForce.clampLength(0, this.flockingRules.maxForce);
        }
        
        return separationForce;
    }
    
    alignment(behavior) {
        const alignmentForce = new THREE.Vector3();
        let count = 0;
        
        behavior.neighbors.forEach(neighbor => {
            const distance = behavior.position.distanceTo(neighbor.position);
            if (distance > 0 && distance < this.flockingRules.alignmentDistance) {
                alignmentForce.add(neighbor.velocity);
                count++;
            }
        });
        
        if (count > 0) {
            alignmentForce.divideScalar(count);
            alignmentForce.normalize();
            alignmentForce.multiplyScalar(behavior.maxSpeed);
            alignmentForce.sub(behavior.velocity);
            alignmentForce.clampLength(0, this.flockingRules.maxForce);
        }
        
        return alignmentForce;
    }
    
    cohesion(behavior) {
        const cohesionForce = new THREE.Vector3();
        let count = 0;
        
        behavior.neighbors.forEach(neighbor => {
            const distance = behavior.position.distanceTo(neighbor.position);
            if (distance > 0 && distance < this.flockingRules.cohesionDistance) {
                cohesionForce.add(neighbor.position);
                count++;
            }
        });
        
        if (count > 0) {
            cohesionForce.divideScalar(count);
            cohesionForce.sub(behavior.position);
            cohesionForce.normalize();
            cohesionForce.multiplyScalar(behavior.maxSpeed);
            cohesionForce.sub(behavior.velocity);
            cohesionForce.clampLength(0, this.flockingRules.maxForce);
        }
        
        return cohesionForce;
    }
    
    // 避障
    obstacleAvoidance(animal, behavior) {
        const avoidanceForce = new THREE.Vector3();
        
        // 检查边界
        const margin = 30;
        
        if (animal.position.x < -50 + margin) {
            avoidanceForce.x += 0.5;
        }
        if (animal.position.x > 50 - margin) {
            avoidanceForce.x -= 0.5;
        }
        if (animal.position.y < -25 + margin) {
            avoidanceForce.y += 0.3;
        }
        if (animal.position.y > 15 - margin) {
            avoidanceForce.y -= 0.3;
        }
        if (animal.position.z < -50 + margin) {
            avoidanceForce.z += 0.5;
        }
        if (animal.position.z > 50 - margin) {
            avoidanceForce.z -= 0.5;
        }
        
        return avoidanceForce;
    }
    
    // 游荡行为
    wander(behavior) {
        const wanderForce = new THREE.Vector3(
            Math.sin(this.time * 0.5 + behavior.personalityFactor * 10) * 0.1,
            Math.sin(this.time * 0.3 + behavior.personalityFactor * 15) * 0.05,
            Math.cos(this.time * 0.4 + behavior.personalityFactor * 12) * 0.1
        );
        
        return wanderForce;
    }
    
    // 觅食行为
    forage(behavior) {
        const forageForce = new THREE.Vector3(
            Math.sin(this.time * 0.2 + behavior.personalityFactor * 5) * 0.05,
            0,
            Math.cos(this.time * 0.25 + behavior.personalityFactor * 7) * 0.05
        );
        
        return forageForce;
    }
    
    // === 辅助函数 ===
    
    updateNeighbors(animal, behavior, allAnimals) {
        behavior.neighbors = [];
        const detectionRadius = 10;
        
        allAnimals.forEach(other => {
            if (other.id !== animal.id && 
                animal.position.distanceTo(other.position) < detectionRadius) {
                
                const otherBehavior = this.behaviors.get(other.id);
                if (otherBehavior) {
                    behavior.neighbors.push({
                        position: other.position,
                        velocity: otherBehavior.velocity
                    });
                }
            }
        });
    }
    
    findPrey(predator, behavior, allAnimals) {
        const huntingRadius = 20;
        let closestPrey = null;
        let closestDistance = huntingRadius;
        
        allAnimals.forEach(animal => {
            if (animal.id !== predator.id && this.isPrey(behavior.species, animal)) {
                const distance = predator.position.distanceTo(animal.position);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestPrey = animal;
                }
            }
        });
        
        return closestPrey;
    }
    
    isPrey(predatorSpecies, preyAnimal) {
        // 简化的捕食关系
        if (predatorSpecies === 'Great White Shark') {
            return true; // 鲨鱼捕食所有小型海洋生物
        }
        return false;
    }
    
    pursue(predator, behavior, prey) {
        const pursuitForce = prey.position.clone().sub(predator.position);
        pursuitForce.normalize();
        pursuitForce.multiplyScalar(0.3);
        return pursuitForce;
    }
    
    patrol(animal, behavior) {
        const patrolForce = new THREE.Vector3(
            Math.sin(this.time * 0.1) * 0.1,
            Math.sin(this.time * 0.05) * 0.05,
            Math.cos(this.time * 0.08) * 0.1
        );
        return patrolForce;
    }
    
    applyEnvironmentalForces(behavior) {
        // 海流影响
        const currentInfluence = this.environmentFactors.currentFlow.clone();
        currentInfluence.multiplyScalar(0.1);
        behavior.acceleration.add(currentInfluence);
        
        // 温度影响活动性
        const temperatureEffect = (this.environmentFactors.temperature - 15) / 10;
        behavior.acceleration.multiplyScalar(0.8 + temperatureEffect * 0.4);
    }
    
    applyPhysicalConstraints(behavior) {
        // 限制加速度
        behavior.acceleration.clampLength(0, this.flockingRules.maxForce);
    }
    
    updateMovement(animal, behavior, deltaTime) {
        // 更新速度（降低速度倍数，让海洋生物游得更慢更自然）
        behavior.velocity.add(behavior.acceleration.clone().multiplyScalar(deltaTime * 2));
        behavior.velocity.clampLength(0, behavior.maxSpeed);
        
        // 更新位置
        const displacement = behavior.velocity.clone().multiplyScalar(deltaTime * 2);
        animal.position.add(displacement);
        behavior.position.copy(animal.position);
        
        // 更新朝向
        if (behavior.velocity.length() > 0.1) {
            const targetRotation = Math.atan2(behavior.velocity.x, behavior.velocity.z);
            
            // 平滑旋转
            let angleDiff = targetRotation - animal.rotation.y;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            
            animal.rotation.y += angleDiff * 0.1;
        }
    }
    
    updateAnimationState(animal, behavior) {
        // 根据速度调整动画强度
        const speedRatio = behavior.velocity.length() / behavior.maxSpeed;
        
        if (animal.userData.animationIntensity !== undefined) {
            animal.userData.animationIntensity = 0.3 + speedRatio * 0.7;
        }
        
        // 根据状态调整颜色或其他视觉效果
        if (animal.material && animal.material.color) {
            switch (behavior.state) {
                case 'hunting':
                    // 稍微偏红，表示兴奋
                    animal.material.color.lerp(new THREE.Color(1.1, 0.9, 0.9), 0.02);
                    break;
                case 'resting':
                    // 稍微暗淡
                    animal.material.color.lerp(new THREE.Color(0.8, 0.8, 0.8), 0.02);
                    break;
                default:
                    // 恢复原色
                    const originalColor = animal.userData.originalColor || new THREE.Color(1, 1, 1);
                    animal.material.color.lerp(originalColor, 0.05);
            }
        }
    }
    
    updateBehaviorState(behavior, deltaTime) {
        const stateTime = this.time - behavior.lastStateChange;
        
        // 状态转换逻辑
        if (behavior.state === 'normal' && stateTime > 10 + Math.random() * 10) {
            // 随机切换到其他状态
            if (Math.random() < 0.3) {
                behavior.state = 'feeding';
                behavior.lastStateChange = this.time;
            }
        } else if (behavior.state === 'feeding' && stateTime > 5 + Math.random() * 5) {
            behavior.state = 'normal';
            behavior.lastStateChange = this.time;
        }
        
        // 能量管理
        behavior.energy = Math.max(0, Math.min(100, behavior.energy));
    }
}

// 注册模块
if (window.moduleManager) {
    window.moduleManager.registerModule('MarineLifeBehavior', MarineLifeBehavior);
}