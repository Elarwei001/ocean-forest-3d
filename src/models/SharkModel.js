// 鲨鱼模型 - 大白鲨3D模型和行为
// Shark Model - Great White Shark 3D model and behaviors

class SharkModel {
    constructor(scene) {
        this.scene = scene;
        this.greatWhiteSharks = [];
    }
    
    createGreatWhiteSharks() {
        const sharkCount = 2;
        
        for (let i = 0; i < sharkCount; i++) {
            const shark = this.createSingleGreatWhiteShark();
            
            shark.position.set(
                (Math.random() - 0.5) * 100,
                -8 + Math.random() * 10,
                (Math.random() - 0.5) * 100
            );
            
            shark.rotation.y = Math.random() * Math.PI * 2;
            shark.userData.cruiseSpeed = 1.5 + Math.random() * 0.5;
            shark.userData.patrolRadius = 30 + Math.random() * 20;
            shark.userData.center = shark.position.clone();
            
            this.scene.add(shark);
            this.greatWhiteSharks.push(shark);
        }
        
        return this.greatWhiteSharks;
    }
    
    createSingleGreatWhiteShark() {
        const group = new THREE.Group();
        
        // 身体 - 流线型鲨鱼身形
        const bodyGeometry = new THREE.SphereGeometry(1, 16, 12);
        bodyGeometry.scale(4.5, 1.2, 1.8);
        
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0x708090,
            shininess: 100,
            specular: 0x444444
        });
        
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        group.add(body);
        
        // 腹部 - 白色
        const bellyGeometry = new THREE.SphereGeometry(0.8, 12, 10);
        bellyGeometry.scale(4.0, 1.0, 1.5);
        
        const bellyMaterial = new THREE.MeshPhongMaterial({
            color: 0xf5f5f5,
            shininess: 80
        });
        
        const belly = new THREE.Mesh(bellyGeometry, bellyMaterial);
        belly.position.set(0, -0.5, 0);
        group.add(belly);
        
        // 头部和嘴部
        const headGeometry = new THREE.ConeGeometry(1, 2.5, 12);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.set(5.5, 0, 0);
        head.rotation.z = Math.PI / 2;
        head.castShadow = true;
        group.add(head);
        
        // 眼睛
        const eyeGeometry = new THREE.SphereGeometry(0.2, 8, 6);
        const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(5.2, 0.8, 0.6);
        group.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(5.2, 0.8, -0.6);
        group.add(rightEye);
        
        // 牙齿
        this.addSharkTeeth(group);
        
        // 鳍
        this.addSharkFins(group, bodyMaterial);
        
        // 鳃裂
        this.addGillSlits(group);
        
        // 尾鳍
        const tailGeometry = new THREE.BoxGeometry(0.3, 3, 2);
        const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
        tail.position.set(-5.5, 0.5, 0);
        tail.castShadow = true;
        group.add(tail);
        
        // 教育数据
        group.userData.species = {
            name: "大白鲨",
            englishName: "Great White Shark",
            photo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMDA0NDY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMzAiIGZpbGw9IiM4N0NFRUIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCI+R3JlYXQgV2hpdGUgU2hhcms8L3RleHQ+CjxlbGxpcHNlIGN4PSIxNTAiIGN5PSIxMDAiIHJ4PSI4MCIgcnk9IjMwIiBmaWxsPSIjNzc3Nzc3Ii8+CjxlbGxpcHNlIGN4PSIxNTAiIGN5PSIxMTAiIHJ4PSI2MCIgcnk9IjIwIiBmaWxsPSIjRkZGRkZGIi8+Cjx0cmlhbmdsZSBjeD0iMjMwIiBjeT0iMTAwIiByPSIyMCIgZmlsbD0iIzc3Nzc3NyIvPgo8Y2lyY2xlIGN4PSIxMzAiIGN5PSI5MCIgcj0iNSIgZmlsbD0iIzAwMDAwMCIvPgo8cGF0aCBkPSJNMTIwIDEwNSBMMTgwIDEwNSBMMTgwIDExNSBMMTIwIDExNSBaIiBmaWxsPSIjMzMzMzMzIi8+Cjwvc3ZnPgo=",
            facts: [
                "海洋顶级掠食者 / Top ocean predator",
                "体长可达6米 / Body length up to 6 meters",
                "拥有300颗牙齿 / Has about 300 teeth",
                "游泳速度可达56公里/小时 / Swimming speed up to 56 km/h",
                "对海洋生态平衡很重要 / Important for marine ecosystem balance",
                "实际上很少攻击人类 / Actually rarely attacks humans"
            ]
        };
        
        return group;
    }
    
    addSharkTeeth(group) {
        const toothGeometry = new THREE.ConeGeometry(0.05, 0.2, 4);
        const toothMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            shininess: 100
        });
        
        // 上排牙齿
        for (let i = 0; i < 12; i++) {
            const tooth = new THREE.Mesh(toothGeometry, toothMaterial);
            const angle = (i / 12) * Math.PI - Math.PI / 2;
            tooth.position.set(
                6 + Math.cos(angle) * 0.8,
                0.2 + Math.sin(angle) * 0.3,
                (i - 6) * 0.15
            );
            tooth.rotation.z = angle;
            group.add(tooth);
        }
        
        // 下排牙齿
        for (let i = 0; i < 10; i++) {
            const tooth = new THREE.Mesh(toothGeometry, toothMaterial);
            const angle = (i / 10) * Math.PI - Math.PI / 2;
            tooth.position.set(
                6 + Math.cos(angle) * 0.7,
                -0.2 + Math.sin(angle) * 0.2,
                (i - 5) * 0.15
            );
            tooth.rotation.z = angle + Math.PI;
            group.add(tooth);
        }
    }
    
    addSharkFins(group, material) {
        // 背鳍
        const dorsalFinGeometry = new THREE.ConeGeometry(0.5, 2, 8);
        const dorsalFin = new THREE.Mesh(dorsalFinGeometry, material);
        dorsalFin.position.set(0, 2, 0);
        dorsalFin.castShadow = true;
        group.add(dorsalFin);
        
        // 胸鳍
        const pectoralFinGeometry = new THREE.BoxGeometry(1.5, 0.2, 1);
        
        const leftPectoral = new THREE.Mesh(pectoralFinGeometry, material);
        leftPectoral.position.set(2, 0, 1.5);
        leftPectoral.rotation.z = -Math.PI / 6;
        group.add(leftPectoral);
        
        const rightPectoral = new THREE.Mesh(pectoralFinGeometry, material);
        rightPectoral.position.set(2, 0, -1.5);
        rightPectoral.rotation.z = Math.PI / 6;
        group.add(rightPectoral);
        
        group.userData.fins = { dorsal: dorsalFin };
    }
    
    addGillSlits(group) {
        const slitMaterial = new THREE.MeshBasicMaterial({ color: 0x2c2c2c });
        
        for (let i = 0; i < 5; i++) {
            const slitGeometry = new THREE.PlaneGeometry(0.1, 0.8);
            const slit = new THREE.Mesh(slitGeometry, slitMaterial);
            slit.position.set(
                3 - i * 0.3,
                0.3,
                1.2
            );
            slit.rotation.y = Math.PI / 2;
            group.add(slit);
            
            // 右侧鳃裂
            const rightSlit = slit.clone();
            rightSlit.position.z = -1.2;
            group.add(rightSlit);
        }
    }
    
    updateGreatWhiteSharks(deltaTime) {
        this.greatWhiteSharks.forEach((shark, index) => {
            if (!shark.userData) return;
            
            const time = deltaTime + index * Math.PI;
            
            // 缓慢巡游 - 进一步降低速度
            const angle = time * 0.05;
            const radius = shark.userData.patrolRadius;
            
            shark.position.x = shark.userData.center.x + Math.cos(angle) * radius;
            shark.position.z = shark.userData.center.z + Math.sin(angle) * radius;
            
            // 朝向运动方向
            shark.lookAt(
                shark.userData.center.x + Math.cos(angle + 0.1) * radius,
                shark.position.y,
                shark.userData.center.z + Math.sin(angle + 0.1) * radius
            );
            
            // 身体摆动 - 减少摆动幅度
            shark.rotation.z = Math.sin(time * 2) * 0.05;
            shark.position.y += Math.sin(time * 1.5) * 0.1;
        });
    }
    
    getGreatWhiteSharks() {
        return this.greatWhiteSharks;
    }
}

// 注册模块
if (window.moduleManager) {
    window.moduleManager.registerModule('SharkModel', SharkModel);
}