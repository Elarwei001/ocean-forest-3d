// 海洋动物模块 - 南非海洋生物模型
// Marine Animals Module - South African marine life models

class MarineAnimals {
    constructor(scene) {
        this.scene = scene;
        this.capeFurSeals = [];
        this.greatWhiteSharks = [];
        this.africanPenguins = [];
        this.capeReefFish = [];
        this.seaUrchinFields = [];
        this.seaAnemones = [];
    }
    
    createCapeFurSeals() {
        const sealCount = 6;
        
        for (let i = 0; i < sealCount; i++) {
            const seal = this.createSingleCapeFurSeal();
            
            // 随机位置
            seal.position.set(
                (Math.random() - 0.5) * 80,
                -15 + Math.random() * 8,
                (Math.random() - 0.5) * 80
            );
            
            // 随机方向
            seal.rotation.y = Math.random() * Math.PI * 2;
            
            // 游泳动画属性
            seal.userData.swimSpeed = 0.005 + Math.random() * 0.003; // 进一步降低海豹速度
            seal.userData.swimDirection = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                0,
                (Math.random() - 0.5) * 2
            ).normalize();
            // 原始Y位置将在第一次更新时设置
            
            this.scene.add(seal);
            this.capeFurSeals.push(seal);
        }
        
        return this.capeFurSeals;
    }
    
    createSingleCapeFurSeal() {
        const group = new THREE.Group();
        
        // 身体 - 流线型设计
        const bodyGeometry = new THREE.SphereGeometry(1, 16, 12);
        bodyGeometry.scale(2.8, 1.1, 1.3);
        
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0x5d4037,
            shininess: 80,
            specular: 0x333333
        });
        
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        group.add(body);
        
        // 头部
        const headGeometry = new THREE.SphereGeometry(0.8, 12, 10);
        headGeometry.scale(1.2, 1, 1.3);
        
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.set(3.2, 0.2, 0);
        head.castShadow = true;
        group.add(head);
        
        // 眼睛
        const eyeGeometry = new THREE.SphereGeometry(0.15, 8, 6);
        const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(3.8, 0.4, 0.3);
        group.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(3.8, 0.4, -0.3);
        group.add(rightEye);
        
        // 鼻子
        const noseGeometry = new THREE.SphereGeometry(0.1, 6, 4);
        const noseMaterial = new THREE.MeshPhongMaterial({ color: 0x2e2e2e });
        
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.set(4.0, 0, 0);
        group.add(nose);
        
        // 胡须
        this.addWhiskers(group);
        
        // 前鳍
        this.addSealFlippers(group, bodyMaterial);
        
        // 尾鳍
        const tailGeometry = new THREE.ConeGeometry(0.8, 1.5, 8);
        const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
        tail.position.set(-3.5, 0, 0);
        tail.rotation.z = Math.PI / 2;
        tail.castShadow = true;
        group.add(tail);
        
        // 教育标签数据
        group.userData.species = {
            name: "南非海狗",
            englishName: "Cape Fur Seal",
            photo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMDA0NDY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmaWxsPSIjODdDRUVCIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPkNhcGUgRnVyIFNlYWw8L3RleHQ+CjxjaXJjbGUgY3g9IjE1MCIgY3k9IjEyMCIgcj0iMjAiIGZpbGw9IiM2NjVBNDgiLz4KPC9zdmc+",
            facts: [
                "体长可达2.5米 / Body length up to 2.5 meters",
                "擅长游泳和潜水 / Excellent swimmers and divers", 
                "群居动物 / Social animals living in colonies",
                "以鱼类为食 / Feed primarily on fish",
                "寿命可达25年 / Lifespan up to 25 years"
            ]
        };
        
        return group;
    }
    
    addWhiskers(group) {
        const whiskerMaterial = new THREE.MeshBasicMaterial({ color: 0x444444 });
        
        for (let i = 0; i < 6; i++) {
            const whiskerGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.8);
            const whisker = new THREE.Mesh(whiskerGeometry, whiskerMaterial);
            
            const side = i < 3 ? 1 : -1;
            const index = i % 3;
            
            whisker.position.set(
                3.9,
                0.1 - index * 0.1,
                side * (0.2 + index * 0.1)
            );
            whisker.rotation.z = side * (Math.PI / 6 + index * 0.2);
            
            group.add(whisker);
        }
    }
    
    addSealFlippers(group, material) {
        // 前鳍
        const frontFlipperGeometry = new THREE.ConeGeometry(0.4, 1.2, 6);
        
        const frontFlipperL = new THREE.Mesh(frontFlipperGeometry, material);
        frontFlipperL.position.set(1.5, -0.8, 1.2);
        frontFlipperL.rotation.z = -Math.PI / 4;
        frontFlipperL.rotation.x = Math.PI / 6;
        group.add(frontFlipperL);
        
        const frontFlipperR = new THREE.Mesh(frontFlipperGeometry, material);
        frontFlipperR.position.set(1.5, -0.8, -1.2);
        frontFlipperR.rotation.z = -Math.PI / 4;
        frontFlipperR.rotation.x = -Math.PI / 6;
        group.add(frontFlipperR);
        
        // 后鳍
        const backFlipperGeometry = new THREE.ConeGeometry(0.3, 1.0, 6);
        
        const backFlipperL = new THREE.Mesh(backFlipperGeometry, material);
        backFlipperL.position.set(-1.8, -0.6, 0.8);
        backFlipperL.rotation.z = -Math.PI / 3;
        group.add(backFlipperL);
        
        const backFlipperR = new THREE.Mesh(backFlipperGeometry, material);
        backFlipperR.position.set(-1.8, -0.6, -0.8);
        backFlipperR.rotation.z = -Math.PI / 3;
        group.add(backFlipperR);
    }
    
    createAfricanPenguins() {
        const penguinCount = 4;
        
        for (let i = 0; i < penguinCount; i++) {
            const penguin = this.createSingleAfricanPenguin();
            
            penguin.position.set(
                (Math.random() - 0.5) * 60,
                -12 + Math.random() * 6,
                (Math.random() - 0.5) * 60
            );
            
            penguin.rotation.y = Math.random() * Math.PI * 2;
            penguin.userData.swimSpeed = 0.1 + Math.random() * 0.05; // 大幅降低企鹅速度
            penguin.userData.swimDirection = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                0,
                (Math.random() - 0.5) * 2
            ).normalize();
            
            this.scene.add(penguin);
            this.africanPenguins.push(penguin);
        }
        
        return this.africanPenguins;
    }
    
    createSingleAfricanPenguin() {
        const group = new THREE.Group();
        
        // 身体 - 黑色背部
        const bodyGeometry = new THREE.SphereGeometry(1, 12, 10);
        bodyGeometry.scale(1.2, 1.8, 1);
        
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0x2c2c2c,
            shininess: 70
        });
        
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        group.add(body);
        
        // 腹部 - 白色
        const bellyGeometry = new THREE.SphereGeometry(0.8, 10, 8);
        bellyGeometry.scale(1, 1.6, 0.9);
        
        const bellyMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            shininess: 80
        });
        
        const belly = new THREE.Mesh(bellyGeometry, bellyMaterial);
        belly.position.set(0.2, 0, 0);
        group.add(belly);
        
        // 头部
        const headGeometry = new THREE.SphereGeometry(0.7, 10, 8);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.set(0, 2.2, 0);
        head.castShadow = true;
        group.add(head);
        
        // 眼睛
        const eyeGeometry = new THREE.SphereGeometry(0.1, 6, 4);
        const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.25, 2.4, 0.5);
        group.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.25, 2.4, 0.5);
        group.add(rightEye);
        
        // 橙色喙
        const beakGeometry = new THREE.ConeGeometry(0.08, 0.35, 6);
        const beakMaterial = new THREE.MeshPhongMaterial({
            color: 0xff8c00,
            shininess: 70
        });
        const beak = new THREE.Mesh(beakGeometry, beakMaterial);
        beak.position.set(0, 2.2, 0.7);
        beak.rotation.x = Math.PI / 2;
        group.add(beak);
        
        // 翅膀
        this.addPenguinFlippers(group, bodyMaterial);
        
        // 脚
        this.addPenguinFeet(group);
        
        group.userData.species = {
            name: "非洲企鹅",
            englishName: "African Penguin",
            photo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMDA0NDY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iOTAiIGZpbGw9IiM4N0NFRUIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCI+QWZyaWNhbiBQZW5ndWluPC90ZXh0Pgo8ZWxsaXBzZSBjeD0iMTUwIiBjeT0iMTMwIiByeD0iMjUiIHJ5PSIzNSIgZmlsbD0iIzMzMzMzMyIvPgo8ZWxsaXBzZSBjeD0iMTUwIiBjeT0iMTM1IiByeD0iMTUiIHJ5PSIyNSIgZmlsbD0iI0ZGRkZGRiIvPgo8Y2lyY2xlIGN4PSIxNDUiIGN5PSIxMjAiIHI9IjMiIGZpbGw9IiMwMDAwMDAiLz4KPGJ1cmNsZSBjeD0iMTU1IiBjeT0iMTIwIiByPSIzIiBmaWxsPSIjMDAwMDAwIi8+CjxyZWN0IHg9IjE0NyIgeT0iMTI1IiB3aWR0aD0iNiIgaGVpZ2h0PSI0IiBmaWxsPSIjRkY4QzAwIi8+Cjwvc3ZnPgo=",
            facts: [
                "又称斑嘴环企鹅 / Also known as Black-footed Penguin",
                "游泳速度可达20公里/小时 / Swimming speed up to 20 km/h",
                "能潜水到130米深 / Can dive to depths of 130 meters",
                "以小鱼和乌贼为食 / Feed on small fish and squid",
                "濒危物种，需要保护 / Endangered species requiring protection"
            ]
        };
        
        return group;
    }
    
    addPenguinFlippers(group, material) {
        const flipperGeometry = new THREE.BoxGeometry(0.2, 1.5, 0.8);
        
        const flipperL = new THREE.Mesh(flipperGeometry, material);
        flipperL.position.set(-1.0, 0.5, 0);
        flipperL.rotation.z = -Math.PI / 6;
        group.add(flipperL);
        
        const flipperR = new THREE.Mesh(flipperGeometry, material);
        flipperR.position.set(1.0, 0.5, 0);
        flipperR.rotation.z = Math.PI / 6;
        group.add(flipperR);
        
        group.userData.flippers = { left: flipperL, right: flipperR };
    }
    
    addPenguinFeet(group) {
        const footGeometry = new THREE.BoxGeometry(0.3, 0.1, 0.5);
        const footMaterial = new THREE.MeshPhongMaterial({ color: 0xff8c00 });
        
        const leftFoot = new THREE.Mesh(footGeometry, footMaterial);
        leftFoot.position.set(-0.3, -1.8, 0.2);
        group.add(leftFoot);
        
        const rightFoot = new THREE.Mesh(footGeometry, footMaterial);
        rightFoot.position.set(0.3, -1.8, 0.2);
        group.add(rightFoot);
    }
    
    // 更新动物动画
    updateCapeFurSeals(deltaTime) {
        this.capeFurSeals.forEach((seal, index) => {
            if (!seal.userData) return;
            
            // 使用全局时间而不是累积时间，避免越来越快
            const globalTime = performance.now() * 0.001; // 转换为秒
            const individualOffset = index * 0.5; // 每个海豹有不同的动画偏移
            const animationTime = (globalTime + individualOffset) * 0.15; // 非常慢的动画频率
            
            // 确保原始Y位置只设置一次
            if (!seal.userData.originalY) {
                seal.userData.originalY = seal.position.y;
            }
            
            // 轻柔的上下浮动 - 使用固定的原始位置
            seal.position.y = seal.userData.originalY + Math.sin(animationTime) * 0.2;
            
            // 身体轻微摆动 - 频率更低，幅度更小
            seal.rotation.z = Math.sin(animationTime * 1.2) * 0.01;
            seal.rotation.x = Math.sin(animationTime * 0.8) * 0.005;
            
            // 缓慢巡游运动 - 使用固定速度避免deltaTime问题
            const direction = seal.userData.swimDirection;
            if (direction) {
                // 使用非常小的固定移动距离
                const fixedMoveDistance = 0.008; // 极慢的固定移动速度
                seal.position.add(direction.clone().multiplyScalar(fixedMoveDistance));
                
                // 边界检查和平滑转向
                if (Math.abs(seal.position.x) > 35 || Math.abs(seal.position.z) > 35) {
                    // 平滑转向 - 直接修改方向向量
                    seal.userData.swimDirection.x *= -1;
                    seal.userData.swimDirection.z *= -1;
                    seal.userData.swimDirection.normalize();
                    
                    // 面向新方向
                    const newDirection = seal.userData.swimDirection;
                    const targetRotation = Math.atan2(newDirection.z, newDirection.x);
                    seal.rotation.y = targetRotation + Math.PI;
                }
            }
        });
    }
    
    updateAfricanPenguins(deltaTime) {
        this.africanPenguins.forEach((penguin, index) => {
            if (!penguin.userData) return;
            
            const time = deltaTime + index * Math.PI / 2;
            
            // 翻滚游泳动画 - 降低速度
            penguin.rotation.x = Math.sin(time * 2) * 0.15;
            penguin.position.y += Math.sin(time * 1.5) * 0.03;
            
            // 翅膀拍打
            if (penguin.userData.flippers) {
                const flapIntensity = Math.sin(time * 3) * 0.5;
                penguin.userData.flippers.left.rotation.z = -Math.PI / 6 + flapIntensity;
                penguin.userData.flippers.right.rotation.z = Math.PI / 6 - flapIntensity;
            }
        });
    }
    
    // Getter方法
    getCapeFurSeals() { return this.capeFurSeals; }
    getAfricanPenguins() { return this.africanPenguins; }
    getGreatWhiteSharks() { return this.greatWhiteSharks; }
    getCapeReefFish() { return this.capeReefFish; }
}

// 注册模块
if (window.moduleManager) {
    window.moduleManager.registerModule('MarineAnimals', MarineAnimals);
}