// 珊瑚鱼模型 - 南非珊瑚礁鱼类3D模型和行为
// Reef Fish Model - South African Coral Reef Fish 3D models and behaviors

class ReefFishModel {
    constructor(scene) {
        this.scene = scene;
        this.capeReefFish = [];
    }
    
    createCapeReefFish() {
        const fishCount = 15;
        const fishTypes = [
            // 根据真实照片更新的鱼类特征
            { name: "黄尾鰤鱼", englishName: "Yellowtail", 
              bodyColor: 0xc0c0c0, finColor: 0xffd700, 
              stripeColor: 0xffa500, pattern: 'yellowtail' },
            { name: "霍屯督鱼", englishName: "Hottentot", 
              bodyColor: 0xa0a0a0, finColor: 0x808080, 
              stripeColor: 0x606060, pattern: 'hottentot' },
            { name: "石头鱼", englishName: "Steentjie", 
              bodyColor: 0x8b4513, finColor: 0x654321, 
              stripeColor: 0xa0522d, pattern: 'steentjie' },
            { name: "罗马鱼", englishName: "Roman", color: 0xff69b4, stripColor: 0xd1477a, pattern: 'spots' },
            { name: "天使鱼", englishName: "Angelfish", color: 0xffffff, stripColor: 0xffc107, pattern: 'bands' },
            { name: "蝴蝶鱼", englishName: "Butterflyfish", color: 0xffd54f, stripColor: 0xff8f00, pattern: 'eyespots' }
        ];
        
        for (let i = 0; i < fishCount; i++) {
            const fishType = fishTypes[Math.floor(Math.random() * fishTypes.length)];
            const fish = this.createSingleReefFish(fishType);
            
            fish.position.set(
                (Math.random() - 0.5) * 70,
                -20 + Math.random() * 15,
                (Math.random() - 0.5) * 70
            );
            
            fish.rotation.y = Math.random() * Math.PI * 2;
            fish.userData.schoolSpeed = 0.05 + Math.random() * 0.03; // 大幅降低鱼类游动速度
            fish.userData.swimPattern = Math.random() * Math.PI * 2;
            
            this.scene.add(fish);
            this.capeReefFish.push(fish);
        }
        
        return this.capeReefFish;
    }
    
    createSingleReefFish(fishType) {
        try {
            console.log('🐟 ReefFishModel: Creating single reef fish for type:', fishType.englishName);
            const group = new THREE.Group();
        
        // 根据鱼类类型调整大小
        let size;
        switch(fishType.englishName) {
            case 'Yellowtail':
                size = 0.8 + Math.random() * 0.4; // 较大的鱼
                break;
            case 'Hottentot':
                size = 0.5 + Math.random() * 0.3; // 中等大小
                break;
            case 'Steentjie':
                size = 0.3 + Math.random() * 0.2; // 较小，伪装性
                break;
            default:
                size = 0.3 + Math.random() * 0.4;
        }
        
        // 根据鱼类特征创建特定的身体形状
        if (fishType.englishName === 'Yellowtail') {
            return this.createYellowtailFish(fishType, size, group);
        } else if (fishType.englishName === 'Hottentot') {
            return this.createHottentotFish(fishType, size, group);
        } else if (fishType.englishName === 'Steentjie') {
            return this.createSteentjieFish(fishType, size, group);
        } else {
            return this.createGenericFish(fishType, size, group);
        }
        } catch (error) {
            console.error('❌ Error in createSingleReefFish:', error);
            console.error('Fish type was:', fishType);
            return null;
        }
    }
    
    createYellowtailFish(fishType, size, group) {
        // 流线型身体 - 黄尾鰤鱼
        const bodyGeometry = new THREE.SphereGeometry(size, 16, 12);
        bodyGeometry.scale(2.2, 1.0, 0.9); // 更加流线型
        
        // 电影级黄尾鰤鱼材质 - 带兼容性检查（修复透明度问题）
        const bodyMaterial = window.THREE.MeshPhysicalMaterial ? 
            new THREE.MeshPhysicalMaterial({
                color: fishType.bodyColor,
                roughness: 0.3,
                metalness: 0.05,
                clearcoat: 0.3, // 降低clearcoat避免过度反射
                clearcoatRoughness: 0.2,
                iridescence: 0.2, // 降低彩虹效果
                iridescenceIOR: 1.2,
                reflectivity: 0.4,
                transmission: 0, // 确保不透明
                opacity: 1.0,
                transparent: false
            }) :
            new THREE.MeshPhongMaterial({
                color: fishType.bodyColor,
                shininess: 140,
                specular: 0x888888,
                opacity: 1.0,
                transparent: false
            });
        
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        group.add(body);
        
        // 黄色尾鳍 - 叉形
        const tailGeometry = new THREE.ConeGeometry(size * 0.8, size * 1.5, 8);
        const tailMaterial = new THREE.MeshPhongMaterial({
            color: fishType.finColor,
            shininess: 100
        });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.x = -size * 2.2;
        tail.rotation.z = Math.PI / 2;
        group.add(tail);
        
        // 背鳍和胸鳍
        this.addYellowtailFins(group, size, tailMaterial);
        
        // 大眼睛
        this.addFishEyes(group, size, 0x000000, size * 0.25);
        
        // 侧线条纹
        const stripeGeometry = new THREE.PlaneGeometry(size * 1.8, size * 0.1);
        const stripeMaterial = new THREE.MeshPhongMaterial({
            color: fishType.stripeColor,
            transparent: true,
            opacity: 0.8
        });
        const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
        stripe.position.set(0, 0, size * 0.95);
        group.add(stripe);
        
        // 存储引用和数据
        group.userData.tail = tail;
        group.userData.species = {
            name: fishType.name,
            englishName: fishType.englishName,
            photo: "assets/profiles/Yellowtail_profile.png",
            facts: this.getFishFacts(fishType.englishName)
        };
        
        return group;
    }
    
    createHottentotFish(fishType, size, group) {
        // 中等椭圆形身体 - 霍屯督鱼
        const bodyGeometry = new THREE.SphereGeometry(size, 14, 10);
        bodyGeometry.scale(1.6, 1.1, 0.8);
        
        // 电影级霍屯督鱼材质 - 带兼容性检查
        const bodyMaterial = window.THREE.MeshPhysicalMaterial ?
            new THREE.MeshPhysicalMaterial({
                color: fishType.bodyColor,
                roughness: 0.4,
                metalness: 0.05,
                clearcoat: 0.2, // 降低clearcoat
                clearcoatRoughness: 0.3,
                iridescence: 0.2, // 降低彩虹效果
                reflectivity: 0.4,
                transmission: 0, // 确保不透明
                opacity: 1.0,
                transparent: false
            }) :
            new THREE.MeshPhongMaterial({
                color: fishType.bodyColor,
                shininess: 110,
                specular: 0x666666,
                opacity: 1.0,
                transparent: false
            });
        
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        group.add(body);
        
        // 细密条纹
        this.addHottentotStripes(group, size, fishType.stripeColor);
        
        // 普通尾鳍
        const tailGeometry = new THREE.ConeGeometry(size * 0.5, size * 1.0, 6);
        const tailMaterial = new THREE.MeshPhongMaterial({
            color: fishType.finColor,
            shininess: 80
        });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.x = -size * 1.8;
        tail.rotation.z = Math.PI / 2;
        group.add(tail);
        
        // 眼睛
        this.addFishEyes(group, size, 0x000000, size * 0.2);
        
        // 存储引用和数据
        group.userData.tail = tail;
        group.userData.species = {
            name: fishType.name,
            englishName: fishType.englishName,
            photo: "assets/profiles/hottentot_profile.webp",
            facts: this.getFishFacts(fishType.englishName)
        };
        
        return group;
    }
    
    createSteentjieFish(fishType, size, group) {
        // 扁平伪装身体 - 石头鱼
        const bodyGeometry = new THREE.SphereGeometry(size, 12, 8);
        bodyGeometry.scale(1.3, 0.8, 0.7); // 更扁平
        
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: fishType.bodyColor,
            shininess: 30, // 低光泽，伪装效果
            specular: 0x333333
        });
        
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        group.add(body);
        
        // 伪装斑点
        this.addSteentjieSpots(group, size, fishType.stripeColor);
        
        // 小而不显眼的鳍
        const tailGeometry = new THREE.ConeGeometry(size * 0.4, size * 0.8, 6);
        const tailMaterial = new THREE.MeshPhongMaterial({
            color: fishType.finColor,
            shininess: 30
        });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.x = -size * 1.5;
        tail.rotation.z = Math.PI / 2;
        group.add(tail);
        
        // 小眼睛
        this.addFishEyes(group, size, 0x000000, size * 0.15);
        
        // 存储引用和数据
        group.userData.tail = tail;
        group.userData.species = {
            name: fishType.name,
            englishName: fishType.englishName,
            photo: "assets/profiles/Steentjie_profile.png",
            facts: this.getFishFacts(fishType.englishName)
        };
        
        return group;
    }
    
    createGenericFish(fishType, size, group) {
        // 通用鱼类（保持原有设计）
        const bodyGeometry = new THREE.SphereGeometry(size, 12, 8);
        bodyGeometry.scale(1.5, 1, 0.8);
        
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: fishType.color || fishType.bodyColor,
            shininess: 80,
            specular: 0x444444
        });
        
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        group.add(body);
        
        // 尾鳍
        const tailGeometry = new THREE.ConeGeometry(size * 0.6, size * 1.2, 6);
        const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
        tail.position.x = -size * 2;
        tail.rotation.z = Math.PI / 2;
        group.add(tail);
        
        // 眼睛
        this.addFishEyes(group, size, 0x000000, size * 0.2);
        
        // 嘴
        const mouthGeometry = new THREE.SphereGeometry(size * 0.1, 4, 3);
        const mouthMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouth.position.set(size * 1.2, 0, 0);
        group.add(mouth);
        
        // 添加图案
        this.addFishPattern(group, fishType, size);
        
        // 存储引用
        group.userData.tail = tail;
        group.userData.species = {
            name: fishType.name,
            englishName: fishType.englishName,
            photo: this.getFishPhoto(fishType.englishName),
            facts: this.getFishFacts(fishType.englishName)
        };
        
        return group;
    }
    
    addFishEyes(group, size, eyeColor, eyeSize) {
        const eyeGeometry = new THREE.SphereGeometry(eyeSize, 8, 6);
        const eyeMaterial = new THREE.MeshPhongMaterial({ color: eyeColor });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(size * 0.8, size * 0.3, size * 0.5);
        group.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(size * 0.8, size * 0.3, -size * 0.5);
        group.add(rightEye);
    }
    
    addYellowtailFins(group, size, material) {
        const dorsalFin = new THREE.Mesh(new THREE.ConeGeometry(size * 0.4, size * 1.2, 6), material);
        dorsalFin.position.set(0, size * 1.2, 0);
        dorsalFin.rotation.x = Math.PI;
        group.add(dorsalFin);
        
        const pectoralGeometry = new THREE.PlaneGeometry(size * 0.8, size * 0.4);
        const leftPectoral = new THREE.Mesh(pectoralGeometry, material);
        leftPectoral.position.set(size * 0.5, 0, size * 0.8);
        leftPectoral.rotation.y = Math.PI / 4;
        group.add(leftPectoral);
        
        const rightPectoral = leftPectoral.clone();
        rightPectoral.position.z = -size * 0.8;
        rightPectoral.rotation.y = -Math.PI / 4;
        group.add(rightPectoral);
    }
    
    addHottentotStripes(group, size, stripeColor) {
        const stripeMaterial = new THREE.MeshPhongMaterial({
            color: stripeColor, transparent: true, opacity: 0.6
        });
        for (let i = 0; i < 8; i++) {
            const stripe = new THREE.Mesh(new THREE.PlaneGeometry(size * 0.05, size * 1.4), stripeMaterial);
            stripe.position.set(size * (0.8 - i * 0.2), 0, size * 0.85);
            group.add(stripe);
        }
    }
    
    addSteentjieSpots(group, size, spotColor) {
        const spotMaterial = new THREE.MeshPhongMaterial({
            color: spotColor, transparent: true, opacity: 0.7
        });
        for (let i = 0; i < 6; i++) {
            const spot = new THREE.Mesh(new THREE.SphereGeometry(size * (0.1 + Math.random() * 0.1), 6, 4), spotMaterial);
            const angle = (i / 6) * Math.PI * 2;
            spot.position.set(
                Math.cos(angle) * size * 0.7,
                (Math.random() - 0.5) * size * 0.5,
                size * 0.8 + Math.sin(angle) * size * 0.3
            );
            group.add(spot);
        }
    }
    
    addFishPattern(group, fishType, size) {
        const patternMaterial = new THREE.MeshPhongMaterial({
            color: fishType.stripColor,
            shininess: 80,
            transparent: true,
            opacity: 0.6
        });
        
        switch(fishType.pattern) {
            case 'stripes':
                for (let i = 0; i < 4; i++) {
                    const stripeGeometry = new THREE.PlaneGeometry(size * 0.1, size * 1.5);
                    const stripe = new THREE.Mesh(stripeGeometry, patternMaterial);
                    stripe.position.set(size * (0.8 - i * 0.4), 0, size * 1.01);
                    group.add(stripe);
                }
                break;
            case 'spots':
                for (let i = 0; i < 6; i++) {
                    const spotGeometry = new THREE.SphereGeometry(size * 0.15, 8, 6);
                    const spot = new THREE.Mesh(spotGeometry, patternMaterial);
                    const angle = (i / 6) * Math.PI * 2;
                    spot.position.set(
                        Math.cos(angle) * size * 0.8,
                        Math.sin(angle) * size * 0.5,
                        size * 0.9
                    );
                    group.add(spot);
                }
                break;
        }
    }
    
    getFishFacts(englishName) {
        const facts = {
            'Yellowtail': [
                "游泳速度很快 / Fast swimmers",
                "群体觅食 / Group feeding behavior", 
                "体长可达1米 / Can grow up to 1 meter",
                "银灰色身体黄色尾鳍 / Silver body with yellow tail"
            ],
            'Hottentot': [
                "蓝灰色条纹美丽 / Beautiful blue-gray stripes",
                "岩礁区常见 / Common in rocky reefs",
                "以小型甲壳动物为食 / Feeds on small crustaceans",
                "南非特有种 / Endemic to South Africa"
            ],
            'Steentjie': [
                "棕色伪装保护色 / Brown camouflage coloring",
                "藏身岩石间 / Hides among rocks",
                "以藻类为食 / Feeds on algae",
                "小型底栖鱼类 / Small bottom-dwelling fish"
            ]
        };
        
        return facts[englishName] || ["美丽的珊瑚礁鱼类 / Beautiful coral reef fish"];
    }
    
    getFishPhoto(englishName) {
        const photos = {
            'Yellowtail': "assets/profiles/Yellowtail_profile.png",
            'Hottentot': "assets/profiles/hottentot_profile.webp",
            'Steentjie': "assets/profiles/Steentjie_profile.png"
        };
        return photos[englishName] || this.getDefaultPhoto();
    }
    
    getDefaultPhoto() {
        return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMDA0NDY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmaWxsPSIjODdDRUVCIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPkNvcmFsIFJlZWYgRmlzaDwvdGV4dD4KPC9zdmc+";
    }
    
    updateCapeReefFish(deltaTime) {
        this.capeReefFish.forEach((fish, index) => {
            if (!fish.userData) return;
            
            const time = deltaTime + fish.userData.swimPattern;
            
            // 群体游泳 - 降低速度
            fish.position.x += Math.sin(time * 0.8) * 0.1;
            fish.position.y += Math.cos(time * 1.2) * 0.05;
            fish.position.z += Math.sin(time * 0.6) * 0.08;
            
            // 尾鳍摆动
            if (fish.userData.tail) {
                fish.userData.tail.rotation.y = Math.sin(time * 4) * 0.3;
            }
            
            // 身体轻微倾斜
            fish.rotation.z = Math.sin(time * 2) * 0.1;
        });
    }
    
    getCapeReefFish() {
        return this.capeReefFish;
    }
}

// 注册模块
if (window.moduleManager) {
    window.moduleManager.registerModule('ReefFishModel', ReefFishModel);
}