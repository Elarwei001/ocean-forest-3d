// 海洋环境模块 - 海床、海带森林等环境元素
// Ocean Environment Module - Ocean floor, kelp forest and environmental elements

class OceanEnvironment {
    constructor(scene) {
        this.scene = scene;
    }
    
    createOceanFloor() {
        const geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
        
        // 为海底添加高度变化
        const vertices = geometry.attributes.position.array;
        for (let i = 2; i < vertices.length; i += 3) {
            vertices[i] = Math.random() * 2 - 1; // 随机高度变化
        }
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
        
        const material = new THREE.MeshLambertMaterial({
            color: 0x8b7355,
            transparent: true,
            opacity: 0.8
        });
        
        const oceanFloor = new THREE.Mesh(geometry, material);
        oceanFloor.rotation.x = -Math.PI / 2;
        oceanFloor.position.y = -30;
        oceanFloor.receiveShadow = true;
        
        this.scene.add(oceanFloor);
        return oceanFloor;
    }
    
    createKelpForest() {
        const kelpGroup = new THREE.Group();
        const kelpPositions = [
            { x: -30, z: -20, height: 25, scale: 1.2 },
            { x: -15, z: -35, height: 30, scale: 1.0 },
            { x: 5, z: -25, height: 28, scale: 1.1 },
            { x: 20, z: -40, height: 32, scale: 0.9 },
            { x: 35, z: -15, height: 26, scale: 1.3 },
            { x: -25, z: 10, height: 29, scale: 0.8 },
            { x: 10, z: 15, height: 27, scale: 1.1 },
            { x: 30, z: 5, height: 31, scale: 1.0 },
            { x: -40, z: -5, height: 24, scale: 1.2 },
            { x: 0, z: -50, height: 33, scale: 0.9 },
            { x: -10, z: 25, height: 28, scale: 1.1 },
            { x: 25, z: -10, height: 30, scale: 1.0 }
        ];
        
        kelpPositions.forEach((pos, index) => {
            const kelp = this.createSingleKelp(pos.height, pos.scale);
            kelp.position.set(pos.x, -30, pos.z);
            
            // 添加随机旋转
            kelp.rotation.y = Math.random() * Math.PI * 2;
            
            // 添加动画延迟
            kelp.userData.animationDelay = index * 0.2;
            
            kelpGroup.add(kelp);
        });
        
        this.scene.add(kelpGroup);
        return kelpGroup;
    }
    
    createSingleKelp(height = 25, scale = 1) {
        const kelpGroup = new THREE.Group();
        
        // 主茎
        const stemGeometry = new THREE.CylinderGeometry(0.3, 0.8, height, 8);
        const stemMaterial = new THREE.MeshPhongMaterial({
            color: 0x2d5016,
            shininess: 30
        });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = height / 2;
        stem.castShadow = true;
        kelpGroup.add(stem);
        
        // 叶片
        const leafCount = Math.floor(height / 4);
        for (let i = 0; i < leafCount; i++) {
            const leafGeometry = new THREE.PlaneGeometry(2, 4);
            const leafMaterial = new THREE.MeshPhongMaterial({
                color: 0x4a7c59,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8
            });
            
            const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
            leaf.position.set(
                (Math.random() - 0.5) * 2,
                i * (height / leafCount),
                (Math.random() - 0.5) * 2
            );
            leaf.rotation.y = Math.random() * Math.PI;
            leaf.rotation.z = (Math.random() - 0.5) * 0.5;
            
            kelpGroup.add(leaf);
        }
        
        kelpGroup.scale.setScalar(scale);
        kelpGroup.userData.originalScale = scale;
        return kelpGroup;
    }
    
    createBubbleSystem() {
        const bubbles = [];
        const bubbleCount = 20;
        
        for (let i = 0; i < bubbleCount; i++) {
            const bubble = this.createSingleBubble();
            bubbles.push(bubble);
            this.scene.add(bubble);
        }
        
        return bubbles;
    }
    
    createSingleBubble() {
        const geometry = new THREE.SphereGeometry(
            0.1 + Math.random() * 0.3,
            8,
            6
        );
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3
        });
        
        const bubble = new THREE.Mesh(geometry, material);
        
        // 随机初始位置
        bubble.position.set(
            (Math.random() - 0.5) * 100,
            -30 + Math.random() * 10,
            (Math.random() - 0.5) * 100
        );
        
        // 运动属性
        bubble.userData.speed = 0.5 + Math.random() * 1.0;
        bubble.userData.wobble = Math.random() * 0.02;
        bubble.userData.time = Math.random() * Math.PI * 2;
        
        return bubble;
    }
    
    createLightRays() {
        const rayGroup = new THREE.Group();
        const rayCount = 6;
        
        for (let i = 0; i < rayCount; i++) {
            const rayGeometry = new THREE.PlaneGeometry(3, 50);
            const rayMaterial = new THREE.MeshBasicMaterial({
                color: 0x87ceeb,
                transparent: true,
                opacity: 0.1,
                side: THREE.DoubleSide
            });
            
            const ray = new THREE.Mesh(rayGeometry, rayMaterial);
            ray.position.set(
                (i - rayCount/2) * 15,
                0,
                -10
            );
            ray.rotation.x = Math.PI / 6;
            
            // 添加轻微摆动
            ray.userData.swayAmount = 0.02 + Math.random() * 0.01;
            ray.userData.swaySpeed = 1 + Math.random() * 0.5;
            ray.userData.phase = i * Math.PI / 3;
            
            rayGroup.add(ray);
        }
        
        this.scene.add(rayGroup);
        return rayGroup;
    }
    
    updateKelp(kelpGroup, deltaTime) {
        if (!kelpGroup || !kelpGroup.children) return;
        
        kelpGroup.children.forEach((kelp, index) => {
            if (!kelp.userData.animationDelay) return;
            
            const time = deltaTime + kelp.userData.animationDelay;
            
            // 海带摆动
            const swayX = Math.sin(time * 0.5) * 0.1;
            const swayZ = Math.cos(time * 0.3) * 0.05;
            
            kelp.rotation.x = swayX;
            kelp.rotation.z = swayZ;
            
            // 轻微的伸缩效果
            const breathe = 1 + Math.sin(time * 0.8) * 0.02;
            kelp.scale.setScalar(kelp.userData.originalScale * breathe);
        });
    }
    
    updateBubbles(bubbles, deltaTime) {
        if (!bubbles) return;
        
        bubbles.forEach(bubble => {
            bubble.userData.time += deltaTime;
            
            // 向上移动
            bubble.position.y += bubble.userData.speed * deltaTime;
            
            // 左右摆动
            bubble.position.x += Math.sin(bubble.userData.time * 2) * bubble.userData.wobble;
            bubble.position.z += Math.cos(bubble.userData.time * 1.5) * bubble.userData.wobble;
            
            // 到达顶部时重置
            if (bubble.position.y > 20) {
                bubble.position.y = -30;
                bubble.position.x = (Math.random() - 0.5) * 100;
                bubble.position.z = (Math.random() - 0.5) * 100;
            }
            
            // 透明度变化
            const alpha = Math.sin(bubble.userData.time) * 0.1 + 0.3;
            bubble.material.opacity = Math.max(0.1, alpha);
        });
    }
    
    updateLightRays(rayGroup, deltaTime) {
        if (!rayGroup || !rayGroup.children) return;
        
        rayGroup.children.forEach(ray => {
            const time = deltaTime + ray.userData.phase;
            
            // 光线摆动
            ray.rotation.z = Math.sin(time * ray.userData.swaySpeed) * ray.userData.swayAmount;
            
            // 透明度变化
            const opacity = 0.05 + Math.sin(time * 0.5) * 0.05;
            ray.material.opacity = opacity;
        });
    }
    
    updateCausticLights(causticLights, deltaTime) {
        if (!causticLights) return;
        
        causticLights.forEach((light, index) => {
            const time = deltaTime + index * Math.PI / 4;
            
            // 光线强度变化
            light.intensity = 0.2 + Math.sin(time * 0.8) * 0.1;
            
            // 轻微位置变化
            const originalX = light.position.x;
            const originalZ = light.position.z;
            
            light.position.x = originalX + Math.sin(time * 0.3) * 2;
            light.position.z = originalZ + Math.cos(time * 0.4) * 2;
        });
    }
}

// 注册模块
if (window.moduleManager) {
    window.moduleManager.registerModule('OceanEnvironment', OceanEnvironment);
}